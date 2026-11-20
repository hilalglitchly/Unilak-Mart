-- UnilakMart Rilis 1 (siap Rilis 2 Opsi 1) Initial Database Schema, RLS, & Storage
-- Mengikuti DECISIONS.md & SRS.md v1.1

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- 1. Referensi Kategori, Fakultas, dan Titik COD Kampus
create table if not exists public.categories (
  slug text primary key,
  name text not null,
  active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.faculties (
  slug text primary key,
  name text not null unique,
  active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.cod_spots (
  id text primary key,
  name text not null,
  location text not null,
  hours text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2. Profil Pengguna (PII disimpan privat; kolom generik siap ekspansi Rilis 2)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  civitas_role text not null default 'mahasiswa'
    check (civitas_role in ('mahasiswa', 'dosen', 'tendik', 'alumni')),
  identifier_type text not null default 'nim'
    check (identifier_type in ('nim', 'nidn', 'npk', 'nip')),
  identifier_number text unique,
  name text not null,
  unit_or_prodi text not null default '',
  faculty text not null default '',
  graduation_year integer,
  email text not null default '',
  wa text not null default '',
  campus_email_verified boolean not null default false,
  pdp_consent boolean not null default false,
  pdp_consent_at timestamptz,
  is_umkm boolean not null default false,
  ktm_status text not null default 'Belum Verifikasi'
    check (ktm_status in ('Belum Verifikasi', 'Menunggu', 'Terverifikasi', 'Ditolak')),
  ktm_reason text,
  ktm_photo_path text,
  system_role text not null default 'user'
    check (system_role in ('user', 'admin')),
  is_suspended boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_ktm_status_idx on public.profiles (ktm_status);
create index if not exists profiles_faculty_idx on public.profiles (faculty);

-- Tampilan profil publik tanpa PII (tidak memuat NIM/email/WhatsApp; FR-07 & NFR-10)
create table if not exists public.public_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  unit_or_prodi text not null default '',
  faculty text not null default '',
  verified boolean not null default false,
  is_umkm boolean not null default false,
  is_deleted boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Helper non-rekursif pengecekan admin di schema privat (tidak diekspos via Data API)
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and system_role = 'admin'
      and deleted_at is null
      and is_suspended = false
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated, service_role;

create or replace function private.is_verified_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and ktm_status = 'Terverifikasi'
      and deleted_at is null
      and is_suspended = false
  );
$$;

revoke all on function private.is_verified_user() from public, anon;
grant execute on function private.is_verified_user() to authenticated, service_role;

-- Lookup email dari NIM hanya untuk pemanggilan server terpercaya (service_role) agar status NIM tidak bocor ke publik (FR-06)
create or replace function private.lookup_email_by_identifier(p_identifier text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select email
  from public.profiles
  where lower(identifier_number) = lower(trim(p_identifier))
    and deleted_at is null
    and is_suspended = false
  limit 1;
$$;

revoke all on function private.lookup_email_by_identifier(text) from public, anon, authenticated;
grant execute on function private.lookup_email_by_identifier(text) to service_role;

-- Sinkronisasi profil publik & proteksi eskalasi hak akses kolom istimewa
create or replace function public.sync_public_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.public_profiles (
    id, display_name, unit_or_prodi, faculty, verified, is_umkm, is_deleted, updated_at
  ) values (
    new.id,
    case when new.deleted_at is not null then 'Akun Mahasiswa Terhapus' else new.name end,
    case when new.deleted_at is not null then '-' else new.unit_or_prodi end,
    case when new.deleted_at is not null then '-' else new.faculty end,
    (new.ktm_status = 'Terverifikasi' and new.deleted_at is null and new.is_suspended = false),
    (new.is_umkm and new.deleted_at is null),
    (new.deleted_at is not null),
    now()
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    unit_or_prodi = excluded.unit_or_prodi,
    faculty = excluded.faculty,
    verified = excluded.verified,
    is_umkm = excluded.is_umkm,
    is_deleted = excluded.is_deleted,
    updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_profiles_sync_public
  after insert or update on public.profiles
  for each row execute function public.sync_public_profile();

create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  jwt_role text := coalesce((select auth.jwt() ->> 'role'), '');
  caller_admin boolean := (select private.is_admin());
begin
  new.updated_at := now();
  if jwt_role <> 'service_role' and not caller_admin and current_user not in ('postgres', 'supabase_admin') then
    new.system_role := old.system_role;
    new.ktm_status := old.ktm_status;
    new.ktm_reason := old.ktm_reason;
    new.is_umkm := old.is_umkm;
    new.is_suspended := old.is_suspended;
    new.deleted_at := old.deleted_at;
    new.campus_email_verified := old.campus_email_verified;
  end if;
  return new;
end;
$$;

create or replace trigger trg_profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_columns();

-- Buat profil awal otomatis saat user mendaftar via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  raw_nim text := nullif(trim(meta ->> 'identifier_number'), '');
begin
  insert into public.profiles (
    id,
    civitas_role,
    identifier_type,
    identifier_number,
    name,
    unit_or_prodi,
    faculty,
    email,
    wa,
    pdp_consent,
    pdp_consent_at,
    ktm_status,
    system_role
  ) values (
    new.id,
    'mahasiswa',
    'nim',
    raw_nim,
    coalesce(nullif(trim(meta ->> 'name'), ''), split_part(coalesce(new.email, 'mahasiswa'), '@', 1)),
    coalesce(trim(meta ->> 'unit_or_prodi'), ''),
    coalesce(trim(meta ->> 'faculty'), 'Fasilkom'),
    coalesce(new.email, ''),
    coalesce(trim(meta ->> 'wa'), ''),
    coalesce((meta ->> 'pdp_consent')::boolean, false),
    case when coalesce((meta ->> 'pdp_consent')::boolean, false) then now() else null end,
    'Belum Verifikasi',
    'user'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Antrean Verifikasi KTM (FR-02, FR-03, NFR-07)
create table if not exists public.ktm_verifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  identifier_type text not null default 'nim',
  identifier_number text not null,
  photo_path text not null,
  status text not null default 'Menunggu'
    check (status in ('Menunggu', 'Terverifikasi', 'Ditolak')),
  rejection_reason text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  photo_delete_due_at timestamptz,
  photo_deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ktm_verif_user_idx on public.ktm_verifications (user_id);
create index if not exists ktm_verif_status_idx on public.ktm_verifications (status, created_at desc);

-- 4. Listing Barang, UMKM, dan Jasa (FR-09 s.d. FR-15)
create table if not exists public.listings (
  id bigint generated always as identity primary key,
  slug text not null unique,
  seller_id uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(trim(title)) >= 5),
  description text not null default '',
  price integer not null default 0 check (price >= 0),
  condition text not null check (condition in ('Baru', 'Bekas Seperti Baru', 'Bekas Layak Pakai')),
  stock integer not null default 1 check (stock >= 0),
  always_available boolean not null default false,
  category text not null check (category in ('buku', 'elektronik', 'kos', 'pakaian', 'produk-umkm', 'jasa', 'jajanan')),
  faculty text not null,
  is_umkm boolean not null default false,
  cod_spot_ids text[] not null default '{}',
  photos text[] not null default '{}' check (coalesce(array_length(photos, 1), 0) <= 5),
  illustration text not null default 'bag',
  badge text not null default '',
  badge_tone text not null default 'green' check (badge_tone in ('yellow', 'green')),
  card_bg text not null default '#DCFCE7',
  status text not null default 'Aktif' check (status in ('Aktif', 'Nonaktif', 'Terjual', 'Disembunyikan')),
  seed_seller_name text,
  seed_seller_prodi text,
  seed_cod_spot_labels text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_seller_idx on public.listings (seller_id);
create index if not exists listings_catalog_idx on public.listings (status, is_umkm, created_at desc);
create index if not exists listings_cat_fac_idx on public.listings (category, faculty) where status = 'Aktif';

-- Batasi maksimal 20 listing aktif per akun non-UMKM (FR-09)
create or replace function public.enforce_active_listing_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  active_count integer;
  seller_umkm boolean := false;
begin
  if new.seller_id is not null and new.status = 'Aktif' then
    select coalesce(is_umkm, false) into seller_umkm
    from public.profiles where id = new.seller_id;

    if not seller_umkm then
      select count(*) into active_count
      from public.listings
      where seller_id = new.seller_id
        and status = 'Aktif'
        and (tg_op = 'INSERT' or id <> new.id);

      if active_count >= 20 then
        raise exception 'Batas maksimal 20 listing aktif per akun tercapai.'
          using errcode = 'P0001';
      end if;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace trigger trg_listings_limit
  before insert or update on public.listings
  for each row execute function public.enforce_active_listing_limit();

-- 5. Listing Disimpan (Bookmark)
create table if not exists public.saved_listings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id bigint not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists saved_listings_listing_idx on public.saved_listings (listing_id);

-- 6. Pesanan & Jadwal Spot COD (FR-17 s.d. FR-26)
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  code text not null unique,
  listing_id bigint not null references public.listings(id) on delete restrict,
  listing_title text not null,
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  quantity integer not null check (quantity >= 1),
  unit_price integer not null check (unit_price >= 0),
  cod_spot_id text not null references public.cod_spots(id),
  cod_spot_name text not null,
  proposed_time text not null,
  note text not null default '',
  status text not null default 'Menunggu'
    check (status in ('Menunggu', 'Dijadwalkan', 'Sudah Diserahkan', 'Selesai', 'Dibatalkan', 'Kedaluwarsa')),
  cancel_reason text,
  payment_method text not null default 'COD' check (payment_method in ('COD', 'QRIS')),
  handed_over_at timestamptz,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  auto_complete_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_buyer_idx on public.orders (buyer_id, created_at desc);
create index if not exists orders_seller_idx on public.orders (seller_id, created_at desc);
create index if not exists orders_listing_idx on public.orders (listing_id);
create index if not exists orders_cod_spot_idx on public.orders (cod_spot_id);
create index if not exists orders_status_idx on public.orders (status);

-- 7. Ulasan Pasca Transaksi Selesai (FR-24)
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  listing_id bigint not null references public.listings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (order_id, reviewer_id)
);

create index if not exists reviews_listing_idx on public.reviews (listing_id, created_at desc);
create index if not exists reviews_target_user_idx on public.reviews (target_user_id);

-- 8. Laporan Pelanggaran / Kendala COD / No-Show (FR-16, FR-46)
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('Listing', 'Pengguna', 'Pesanan')),
  target_id text not null,
  target_title text not null,
  reason text not null,
  status text not null default 'Baru' check (status in ('Baru', 'Disembunyikan', 'Selesai')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_reporter_idx on public.reports (reporter_id);
create index if not exists reports_status_idx on public.reports (status, created_at desc);

-- 9. Notifikasi In-App (FR-25)
create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  href text not null default '/',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- 10. Pengaturan Privileges Eksplisit & Aktifkan Row Level Security (RLS)
grant usage on schema public to anon, authenticated;

grant select on public.categories, public.faculties, public.cod_spots,
  public.public_profiles, public.listings, public.reviews to anon, authenticated;

grant select, insert, update, delete on public.profiles, public.ktm_verifications,
  public.listings, public.saved_listings, public.orders, public.reviews,
  public.reports, public.notifications to authenticated;

grant insert, update, delete on public.categories, public.faculties, public.cod_spots to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter table public.categories enable row level security;
alter table public.faculties enable row level security;
alter table public.cod_spots enable row level security;
alter table public.profiles enable row level security;
alter table public.public_profiles enable row level security;
alter table public.ktm_verifications enable row level security;
alter table public.listings enable row level security;
alter table public.saved_listings enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;

-- Kebijakan RLS: Referensi (dibaca publik, dikelola admin)
create policy "categories_public_read" on public.categories
  for select to anon, authenticated using (active = true or (select private.is_admin()));
create policy "categories_admin_write" on public.categories
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "faculties_public_read" on public.faculties
  for select to anon, authenticated using (active = true or (select private.is_admin()));
create policy "faculties_admin_write" on public.faculties
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "cod_spots_public_read" on public.cod_spots
  for select to anon, authenticated using (active = true or (select private.is_admin()));
create policy "cod_spots_admin_write" on public.cod_spots
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- Kebijakan RLS: public_profiles (bebas PII, publik bisa melihat lencana verifikasi penjual)
create policy "public_profiles_read" on public.public_profiles
  for select to anon, authenticated using (true);

-- Kebijakan RLS: profiles (privat: hanya pemilik & admin)
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()));

create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()))
  with check ((select auth.uid()) = id or (select private.is_admin()));

-- Kebijakan RLS: ktm_verifications (pemilik & admin)
create policy "ktm_verif_select" on public.ktm_verifications
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "ktm_verif_insert_own" on public.ktm_verifications
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "ktm_verif_update_admin" on public.ktm_verifications
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Kebijakan RLS: listings (baca-saja publik untuk aktif/terjual; kelola oleh pemilik terverifikasi & admin)
create policy "listings_public_read" on public.listings
  for select to anon, authenticated
  using (
    status in ('Aktif', 'Terjual')
    or seller_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "listings_verified_insert" on public.listings
  for insert to authenticated
  with check (
    seller_id = (select auth.uid())
    and (select private.is_verified_user())
  );

create policy "listings_owner_or_admin_update" on public.listings
  for update to authenticated
  using (seller_id = (select auth.uid()) or (select private.is_admin()))
  with check (seller_id = (select auth.uid()) or (select private.is_admin()));

create policy "listings_owner_or_admin_delete" on public.listings
  for delete to authenticated
  using (seller_id = (select auth.uid()) or (select private.is_admin()));

-- Kebijakan RLS: saved_listings
create policy "saved_own_all" on public.saved_listings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Kebijakan RLS: orders (pembeli, penjual, & admin)
create policy "orders_participant_or_admin_select" on public.orders
  for select to authenticated
  using (
    buyer_id = (select auth.uid())
    or seller_id = (select auth.uid())
    or (select private.is_admin())
  );

-- Kebijakan RLS: reviews
create policy "reviews_public_read" on public.reviews
  for select to anon, authenticated using (true);

create policy "reviews_verified_insert" on public.reviews
  for insert to authenticated
  with check (
    reviewer_id = (select auth.uid())
    and (select private.is_verified_user())
    and exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.status = 'Selesai'
        and ((select auth.uid()) in (o.buyer_id, o.seller_id))
    )
  );

-- Kebijakan RLS: reports
create policy "reports_own_or_admin_select" on public.reports
  for select to authenticated
  using (reporter_id = (select auth.uid()) or (select private.is_admin()));

create policy "reports_verified_insert" on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()) and (select private.is_verified_user()));

create policy "reports_admin_update" on public.reports
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Kebijakan RLS: notifications
create policy "notifications_own_select_update" on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "notifications_own_update" on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- 11. Storage Buckets & Kebijakan RLS Storage (NFR-03, NFR-07)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('listing-photos', 'listing-photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('ktm-documents', 'ktm-documents', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "listing_photos_public_get" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'listing-photos');

create policy "listing_photos_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "listing_photos_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "listing_photos_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'listing-photos'
    and ((storage.foldername(name))[1] = (select auth.uid()::text) or (select private.is_admin()))
  );

create policy "ktm_docs_owner_or_admin_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'ktm-documents'
    and (
      ((storage.foldername(name))[1] = (select auth.uid()::text) and storage.allow_any_operation(array['object.get_authenticated', 'object.get_authenticated_info']))
      or (select private.is_admin())
    )
  );

create policy "ktm_docs_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'ktm-documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "ktm_docs_owner_or_admin_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'ktm-documents'
    and ((storage.foldername(name))[1] = (select auth.uid()::text) or (select private.is_admin()))
  );
