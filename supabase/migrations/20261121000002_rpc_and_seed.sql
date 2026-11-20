-- RPC Transaksional COD, Privasi Kontak, Hapus Akun Mandiri (UU PDP), & Data Awal Kampus

-- 1. Buat Pesanan COD Atomik dengan penguncian kuota stok (FR-17, FR-20)
create or replace function public.create_cod_order(
  p_listing_id bigint,
  p_quantity integer,
  p_cod_spot_id text,
  p_proposed_time text,
  p_note text default ''
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  caller_verified boolean;
  item public.listings%rowtype;
  spot public.cod_spots%rowtype;
  new_order public.orders%rowtype;
  order_code text;
begin
  if uid is null then
    raise exception 'Anda harus masuk untuk membuat pesanan.' using errcode = '42501';
  end if;

  select (ktm_status = 'Terverifikasi' and deleted_at is null and not is_suspended)
  into caller_verified
  from public.profiles where id = uid;

  if not coalesce(caller_verified, false) then
    raise exception 'Akun Anda harus berstatus Terverifikasi KTM untuk memesan.' using errcode = '42501';
  end if;

  if p_quantity is null or p_quantity < 1 then
    raise exception 'Jumlah pesanan minimal 1.' using errcode = '22023';
  end if;

  select * into item from public.listings where id = p_listing_id for update;
  if not found or item.status <> 'Aktif' then
    raise exception 'Listing ini tidak tersedia untuk dipesan.' using errcode = 'P0001';
  end if;

  if item.seller_id is null then
    raise exception 'Listing contoh pratinjau tidak dapat dipesan sebagai transaksi nyata.' using errcode = 'P0001';
  end if;

  if item.seller_id = uid then
    raise exception 'Anda tidak dapat memesan listing milik sendiri.' using errcode = 'P0001';
  end if;

  if not item.always_available and item.stock < p_quantity then
    raise exception 'Stok listing tidak mencukupi jumlah pesanan.' using errcode = 'P0001';
  end if;

  select * into spot from public.cod_spots where id = p_cod_spot_id and active = true;
  if not found then
    raise exception 'Spot COD yang dipilih tidak aktif.' using errcode = 'P0001';
  end if;

  if not item.always_available then
    update public.listings
    set
      stock = stock - p_quantity,
      status = case when (stock - p_quantity) <= 0 then 'Terjual' else status end,
      updated_at = now()
    where id = item.id;
  end if;

  order_code := 'COD-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));

  insert into public.orders (
    code, listing_id, listing_title, buyer_id, seller_id,
    quantity, unit_price, cod_spot_id, cod_spot_name, proposed_time, note, status
  ) values (
    order_code, item.id, item.title, uid, item.seller_id,
    p_quantity, item.price, spot.id, spot.name, trim(p_proposed_time), coalesce(trim(p_note), ''), 'Menunggu'
  ) returning * into new_order;

  insert into public.notifications (user_id, title, message, href) values
    (item.seller_id, 'Pesanan COD Baru ' || order_code,
      'Ada permintaan COD untuk "' || item.title || '" di ' || spot.name || '.', '/pesanan'),
    (uid, 'Pesanan ' || order_code || ' Terkirim',
      'Menunggu konfirmasi penjual untuk jadwal di ' || spot.name || '.', '/pesanan');

  return new_order;
end;
$$;

-- 2. Pembaruan Status Pesanan COD (FR-18, FR-20 s.d. FR-23)
create or replace function public.update_cod_order_status(
  p_order_id bigint,
  p_next_status text,
  p_cancel_reason text default null
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  ord public.orders%rowtype;
  item public.listings%rowtype;
  updated_ord public.orders%rowtype;
  caller_admin boolean := (select private.is_admin());
begin
  if uid is null then
    raise exception 'Sesi tidak ditemukan.' using errcode = '42501';
  end if;

  select * into ord from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Pesanan tidak ditemukan.' using errcode = 'P0001';
  end if;

  if uid <> ord.buyer_id and uid <> ord.seller_id and not caller_admin then
    raise exception 'Anda tidak memiliki akses ke pesanan ini.' using errcode = '42501';
  end if;

  if ord.status in ('Selesai', 'Dibatalkan', 'Kedaluwarsa') then
    raise exception 'Pesanan yang sudah selesai atau berakhir tidak dapat diubah.' using errcode = 'P0001';
  end if;

  if p_next_status = 'Dijadwalkan' then
    if uid <> ord.seller_id then
      raise exception 'Hanya penjual yang dapat menyetujui jadwal COD.' using errcode = '42501';
    end if;
    if ord.status <> 'Menunggu' then
      raise exception 'Status saat ini tidak dapat diubah ke Dijadwalkan.' using errcode = 'P0001';
    end if;
  elsif p_next_status = 'Sudah Diserahkan' then
    if uid <> ord.seller_id then
      raise exception 'Hanya penjual yang dapat menandai Sudah Diserahkan.' using errcode = '42501';
    end if;
    if ord.status <> 'Dijadwalkan' then
      raise exception 'Pesanan harus Dijadwalkan terlebih dahulu.' using errcode = 'P0001';
    end if;
  elsif p_next_status = 'Selesai' then
    if uid <> ord.buyer_id and not caller_admin then
      raise exception 'Hanya pembeli yang mengonfirmasi barang diterima.' using errcode = '42501';
    end if;
    if ord.status not in ('Dijadwalkan', 'Sudah Diserahkan') then
      raise exception 'Pesanan harus berstatus Dijadwalkan atau Sudah Diserahkan.' using errcode = 'P0001';
    end if;
  elsif p_next_status = 'Dibatalkan' then
    if ord.status in ('Sudah Diserahkan', 'Selesai') then
      raise exception 'Pesanan yang sudah diserahkan tidak dapat dibatalkan sepihak.' using errcode = 'P0001';
    end if;
    if coalesce(trim(p_cancel_reason), '') = '' then
      raise exception 'Alasan pembatalan wajib diisi.' using errcode = '22023';
    end if;
  else
    raise exception 'Transisi status tidak didukung.' using errcode = '22023';
  end if;

  update public.orders
  set
    status = p_next_status,
    cancel_reason = coalesce(nullif(trim(p_cancel_reason), ''), cancel_reason),
    handed_over_at = case when p_next_status = 'Sudah Diserahkan' then now() else handed_over_at end,
    auto_complete_at = case when p_next_status = 'Sudah Diserahkan' then now() + interval '48 hours' else auto_complete_at end,
    updated_at = now()
  where id = ord.id
  returning * into updated_ord;

  if p_next_status = 'Dibatalkan' then
    select * into item from public.listings where id = ord.listing_id for update;
    if found and not item.always_available then
      update public.listings
      set
        stock = stock + ord.quantity,
        status = case when status = 'Terjual' then 'Aktif' else status end,
        updated_at = now()
      where id = item.id;
    end if;
  end if;

  if p_next_status = 'Dijadwalkan' then
    insert into public.notifications (user_id, title, message, href) values
      (ord.buyer_id, 'Jadwal COD Disetujui (' || ord.code || ')',
        'Silakan temui penjual di ' || ord.cod_spot_name || ' (' || ord.proposed_time || '). Tombol WhatsApp kini terbuka.', '/pesanan');
  elsif p_next_status = 'Sudah Diserahkan' then
    insert into public.notifications (user_id, title, message, href) values
      (ord.buyer_id, 'Barang Diserahkan (' || ord.code || ')',
        'Konfirmasi Selesai bila barang sudah diterima dengan baik (auto-selesai 48 jam).', '/pesanan');
  elsif p_next_status = 'Selesai' then
    insert into public.notifications (user_id, title, message, href) values
      (ord.seller_id, 'Transaksi Selesai (' || ord.code || ')',
        'Pembeli mengonfirmasi pesanan selesai. Anda sekarang dapat saling memberi ulasan.', '/pesanan');
  elsif p_next_status = 'Dibatalkan' then
    insert into public.notifications (user_id, title, message, href) values
      (case when uid = ord.buyer_id then ord.seller_id else ord.buyer_id end,
        'Pesanan Dibatalkan (' || ord.code || ')',
        'Alasan: ' || trim(p_cancel_reason), '/pesanan');
  end if;

  return updated_ord;
end;
$$;

-- 3. Buka Nomor WhatsApp Lawan Transaksi HANYA setelah status Dijadwalkan/Sudah Diserahkan (NFR-10, FR-20)
create or replace function public.get_order_counterparty_wa(p_order_id bigint)
returns table (counterparty_name text, counterparty_wa text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  ord public.orders%rowtype;
  target_id uuid;
begin
  if uid is null then
    return;
  end if;

  select * into ord from public.orders where id = p_order_id;
  if not found or uid not in (ord.buyer_id, ord.seller_id) then
    return;
  end if;

  if ord.status not in ('Dijadwalkan', 'Sudah Diserahkan') then
    return;
  end if;

  target_id := case when uid = ord.buyer_id then ord.seller_id else ord.buyer_id end;
  return query
  select p.name, p.wa
  from public.profiles p
  where p.id = target_id and p.deleted_at is null;
end;
$$;

-- 4. Pengajuan & Moderasi Verifikasi KTM (FR-02, FR-03, NFR-07)
create or replace function public.submit_ktm_request(
  p_identifier_number text,
  p_name text,
  p_unit_or_prodi text,
  p_faculty text,
  p_wa text,
  p_pdp_consent boolean,
  p_photo_path text
)
returns public.ktm_verifications
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  rec public.ktm_verifications%rowtype;
begin
  if uid is null then
    raise exception 'Sesi pengguna tidak ditemukan.' using errcode = '42501';
  end if;
  if not coalesce(p_pdp_consent, false) then
    raise exception 'Persetujuan UU PDP wajib dicentang.' using errcode = '22023';
  end if;

  update public.profiles
  set
    identifier_number = trim(p_identifier_number),
    name = trim(p_name),
    unit_or_prodi = trim(p_unit_or_prodi),
    faculty = trim(p_faculty),
    wa = trim(p_wa),
    pdp_consent = true,
    pdp_consent_at = coalesce(pdp_consent_at, now()),
    ktm_status = 'Menunggu',
    ktm_reason = null,
    ktm_photo_path = trim(p_photo_path),
    updated_at = now()
  where id = uid;

  insert into public.ktm_verifications (user_id, identifier_type, identifier_number, photo_path, status)
  values (uid, 'nim', trim(p_identifier_number), trim(p_photo_path), 'Menunggu')
  returning * into rec;

  insert into public.notifications (user_id, title, message, href) values
    (uid, 'Dokumen KTM Diterima',
      'Foto KTM disimpan di bucket privat dan masuk antrean verifikasi administrator.', '/profil');

  return rec;
end;
$$;

create or replace function public.review_ktm_request(
  p_verification_id bigint,
  p_decision text,
  p_reason text default null
)
returns public.ktm_verifications
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  rec public.ktm_verifications%rowtype;
begin
  if not (select private.is_admin()) then
    raise exception 'Hanya administrator yang dapat memproses verifikasi KTM.' using errcode = '42501';
  end if;
  if p_decision not in ('Terverifikasi', 'Ditolak') then
    raise exception 'Keputusan verifikasi tidak valid.' using errcode = '22023';
  end if;

  update public.ktm_verifications
  set
    status = p_decision,
    rejection_reason = case when p_decision = 'Ditolak' then trim(coalesce(p_reason, 'Foto KTM tidak terbaca.')) else null end,
    reviewed_by = uid,
    reviewed_at = now(),
    photo_delete_due_at = case when p_decision = 'Terverifikasi' then now() else now() + interval '7 days' end,
    photo_deleted_at = case when p_decision = 'Terverifikasi' then now() else null end
  where id = p_verification_id
  returning * into rec;

  if not found then
    raise exception 'Antrean verifikasi tidak ditemukan.' using errcode = 'P0001';
  end if;

  update public.profiles
  set
    ktm_status = p_decision,
    ktm_reason = rec.rejection_reason,
    ktm_photo_path = case when p_decision = 'Terverifikasi' then null else ktm_photo_path end,
    updated_at = now()
  where id = rec.user_id;

  insert into public.notifications (user_id, title, message, href) values
    (rec.user_id,
      case when p_decision = 'Terverifikasi' then 'Verifikasi KTM Disetujui' else 'Verifikasi KTM Ditolak' end,
      case when p_decision = 'Terverifikasi'
        then 'Akun Anda kini berstatus Terverifikasi dan foto KTM dijadwalkan hapus segera.'
        else coalesce(rec.rejection_reason, 'Silakan unggah ulang foto KTM yang jelas.')
      end,
      '/profil');

  return rec;
end;
$$;

-- 5. Hapus Akun Mandiri UU PDP (FR-08, NFR-10) dengan guard pesanan aktif
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  has_active boolean;
begin
  if uid is null then
    raise exception 'Sesi pengguna tidak ditemukan.' using errcode = '42501';
  end if;

  select exists (
    select 1 from public.orders
    where (buyer_id = uid or seller_id = uid)
      and status in ('Menunggu', 'Dijadwalkan', 'Sudah Diserahkan')
  ) into has_active;

  if has_active then
    raise exception 'Hapus akun ditahan sementara karena Anda masih memiliki pesanan aktif.'
      using errcode = 'P0001';
  end if;

  update public.listings
  set status = 'Nonaktif', updated_at = now()
  where seller_id = uid and status = 'Aktif';

  update public.profiles
  set
    identifier_number = null,
    name = 'Akun Mahasiswa Terhapus',
    unit_or_prodi = '-',
    faculty = '-',
    email = 'deleted-' || substr(uid::text, 1, 8) || '@anonim.local',
    wa = '',
    pdp_consent = false,
    is_umkm = false,
    ktm_status = 'Belum Verifikasi',
    ktm_photo_path = null,
    deleted_at = now(),
    updated_at = now()
  where id = uid;
end;
$$;

grant execute on function public.create_cod_order(bigint, integer, text, text, text) to authenticated;
grant execute on function public.update_cod_order_status(bigint, text, text) to authenticated;
grant execute on function public.get_order_counterparty_wa(bigint) to authenticated;
grant execute on function public.submit_ktm_request(text, text, text, text, text, boolean, text) to authenticated;
grant execute on function public.review_ktm_request(bigint, text, text) to authenticated;
grant execute on function public.delete_own_account() to authenticated;

-- 6. Seed Referensi Kategori, Fakultas, 6 Titik COD, dan 15 Katalog Pratinjau
insert into public.categories (slug, name, active, sort_order) values
  ('buku', 'Buku & Modul', true, 1),
  ('elektronik', 'Elektronik', true, 2),
  ('kos', 'Perabot Kos', true, 3),
  ('pakaian', 'Pakaian', true, 4),
  ('produk-umkm', 'Produk UMKM', true, 5),
  ('jasa', 'Jasa', true, 6),
  ('jajanan', 'Jajanan Kampus', true, 7)
on conflict (slug) do nothing;

insert into public.faculties (slug, name, active, sort_order) values
  ('fasilkom', 'Fasilkom', true, 1),
  ('teknik', 'Teknik', true, 2),
  ('feb', 'FEB', true, 3),
  ('fkip', 'FKIP', true, 4),
  ('kehutanan', 'Kehutanan', true, 5),
  ('fib', 'FIB', true, 6),
  ('fh', 'FH', true, 7),
  ('faperta', 'Faperta', true, 8)
on conflict (slug) do nothing;

insert into public.cod_spots (id, name, location, hours, active, sort_order) values
  ('perpus-pusat', 'Perpustakaan Pusat Unilak', 'Teras Lobby Utama Lantai 1', '08.00 - 16.30 WIB', true, 1),
  ('gazebo-fasilkom', 'Lobi Fasilkom Unilak', 'Selasar Gedung Fakultas Ilmu Komputer', '08.30 - 17.00 WIB', true, 2),
  ('kantin-utama', 'Kantin Utama Unilak', 'Area Meja Sisi Utara', '07.30 - 17.30 WIB', true, 3),
  ('taman-danau', 'Taman Danau Unilak', 'Pendopo Depan Masjid Kampus', '09.00 - 17.30 WIB', true, 4),
  ('lobi-teknik', 'Lobi Fakultas Teknik', 'Selasar Depan Ruang Tata Usaha', '08.00 - 16.30 WIB', true, 5),
  ('gor-kampus', 'GOR Kampus Unilak', 'Area Parkir & Pintu Utama Lapangan', '09.00 - 18.00 WIB', true, 6)
on conflict (id) do nothing;

insert into public.listings (
  slug, seller_id, title, description, price, condition, stock, always_available,
  category, faculty, is_umkm, cod_spot_ids, seed_cod_spot_labels, photos,
  illustration, badge, badge_tone, card_bg, status, seed_seller_name, seed_seller_prodi
) values
  ('kopi-risol-umkm', null, 'Paket Kopi Susu Botol & Risol Mayo Kampus',
    'Menu racikan harian UMKM mahasiswa FEB Unilak. Dibuat segar setiap pagi menjelang kuliah jam pertama. Tanpa bahan pengawet.',
    15000, 'Baru', 25, true, 'jajanan', 'FEB', true,
    array['kantin-utama', 'perpus-pusat', 'gazebo-fasilkom'],
    array['Kantin Utama Unilak', 'Perpustakaan Pusat Unilak', 'Lobi Fasilkom Unilak'],
    '{}', 'umkm-coffee', 'UMKM', 'yellow', '#FEF9C3', 'Aktif', 'Lapak Kopi FEB', 'Manajemen'),
  ('jasa-desain-ppt', null, 'Jasa Rapikan Format Skripsi & Slide Seminar',
    'Bantu tata letak daftar isi otomatis, margin pedoman Unilak, serta desain slide presentasi seminar proposal maupun sidang.',
    25000, 'Baru', 99, true, 'jasa', 'FIB', true,
    array['perpus-pusat', 'gazebo-fasilkom'],
    array['Perpustakaan Pusat Unilak', 'Lobi Fasilkom Unilak'],
    '{}', 'headphone', 'UMKM', 'yellow', '#FEF9C3', 'Aktif', 'Studio Slide FIB', 'Sastra Inggris'),
  ('merch-unilak-umkm', null, 'Paket Gantungan Kunci & Stiker Vinyl Kampus UMKM',
    'Merchandise karya desain mahasiswa Fasilkom. Cocok untuk laptop mahasiswa, binder kuliah, maupun helm harian.',
    18000, 'Baru', 15, true, 'produk-umkm', 'Fasilkom', true,
    array['gazebo-fasilkom', 'kantin-utama', 'taman-danau'],
    array['Lobi Fasilkom Unilak', 'Kantin Utama Unilak', 'Taman Danau Unilak'],
    '{}', 'bag', 'UMKM', 'yellow', '#DCFCE7', 'Aktif', 'Kriya Fasilkom', 'Sistem Informasi'),
  ('tas-lipat-kos', null, 'Tas Organizer Lipat Serbaguna Anak Kos',
    'Cocok untuk simpan buku kuliah, perlengkapan mandi, atau kabel laptop saat pindah kamar kos. Kondisi bersih terawat.',
    45000, 'Bekas Seperti Baru', 1, false, 'kos', 'Fasilkom', false,
    array['perpus-pusat', 'taman-danau'],
    array['Perpustakaan Pusat Unilak', 'Taman Danau Unilak'],
    '{}', 'bag', '', 'green', '#DCFCE7', 'Aktif', 'Kos Rumbai #01', 'Teknik Informatika'),
  ('sepatu-kampus-41', null, 'Sepatu Sneakers Kampus Ukuran 41 Mulus',
    'Pemakaian pribadi 3 bulan ke kampus, sol masih tebal dan sudah dicuci bersih. Pas dipakai acara praktik atau kuliah reguler.',
    95000, 'Bekas Layak Pakai', 1, false, 'pakaian', 'Teknik', false,
    array['lobi-teknik', 'kantin-utama'],
    array['Lobi Fakultas Teknik', 'Kantin Utama Unilak'],
    '{}', 'sneaker', '', 'green', '#FEF9C3', 'Aktif', 'Penjual Teknik #02', 'Teknik Sipil'),
  ('headphone-coding', null, 'Headphone Bluetooth Bass Belajar & Coding',
    'Dipakai ngerjain tugas akhir di perpustakaan. Baterai awet kurang lebih 14 jam, bantalan telinga masih empuk, lengkap kabel cas.',
    120000, 'Bekas Seperti Baru', 1, false, 'elektronik', 'Fasilkom', false,
    array['gazebo-fasilkom', 'perpus-pusat'],
    array['Lobi Fasilkom Unilak', 'Perpustakaan Pusat Unilak'],
    '{}', 'headphone', '', 'green', '#DCFCE7', 'Aktif', 'Penjual Fasilkom #03', 'Teknik Informatika'),
  ('bucket-hat-lapangan', null, 'Bucket Hat Hitam Praktikum Lapangan Unilak',
    'Pelindung kepala berbahan kanvas adem untuk kegiatan survei lapangan Kehutanan maupun KKN.',
    35000, 'Baru', 4, false, 'pakaian', 'Kehutanan', false,
    array['taman-danau', 'kantin-utama'],
    array['Taman Danau Unilak', 'Kantin Utama Unilak'],
    '{}', 'hat', '', 'green', '#FEF9C3', 'Aktif', 'Penjual Kehutanan #04', 'Kehutanan'),
  ('bola-voli-ukm', null, 'Bola Voli Latihan UKM Olahraga Mahasiswa',
    'Kondisi kulit masih bagus, tidak bocor, siap dipakai latihan sore di GOR Unilak.',
    75000, 'Bekas Layak Pakai', 1, false, 'kos', 'FKIP', false,
    array['gor-kampus', 'taman-danau'],
    array['GOR Kampus Unilak', 'Taman Danau Unilak'],
    '{}', 'volleyball', '', 'green', '#15803D', 'Aktif', 'Penjual FKIP #05', 'Pendidikan Jasmani'),
  ('modul-algoritma-gratis', null, 'Bundel Catatan & Modul Algoritma Semester 1-2',
    'Hibah gratis Rp0 khusus adik tingkat Fasilkom atau mahasiswa yang sedang ambil mata kuliah Struktur Data. Boleh ambil 1 bundel.',
    0, 'Bekas Layak Pakai', 2, false, 'buku', 'Fasilkom', false,
    array['perpus-pusat', 'gazebo-fasilkom'],
    array['Perpustakaan Pusat Unilak', 'Lobi Fasilkom Unilak'],
    '{}', 'bag', 'Gratis Rp0', 'green', '#DCFCE7', 'Aktif', 'Senior Fasilkom', 'Teknik Informatika'),
  ('kitab-kuhp-fh', null, 'Kitab UU Hukum Pidana & Perdata (KUHP/KUHPer)',
    'Buku referensi wajib mahasiswa Ilmu Hukum semester awal. Halaman utuh dan tidak ada yang robek.',
    40000, 'Bekas Seperti Baru', 1, false, 'buku', 'FH', false,
    array['perpus-pusat', 'kantin-utama'],
    array['Perpustakaan Pusat Unilak', 'Kantin Utama Unilak'],
    '{}', 'bag', '', 'green', '#FEF9C3', 'Aktif', 'Penjual Hukum #06', 'Ilmu Hukum'),
  ('mouse-wireless-silent', null, 'Mouse Wireless Silent Click Kuliah & Presentasi',
    'Klik senyap aman dipakai di Perpustakaan Pusat. Receiver USB lengkap, gratis 1 baterai AA baru.',
    55000, 'Bekas Seperti Baru', 1, false, 'elektronik', 'Faperta', false,
    array['taman-danau', 'perpus-pusat'],
    array['Taman Danau Unilak', 'Perpustakaan Pusat Unilak'],
    '{}', 'headphone', '', 'green', '#DCFCE7', 'Aktif', 'Penjual Faperta #07', 'Agroteknologi'),
  ('jas-hujan-lapangan', null, 'Jas Hujan Setelan Tebal Praktikum Kebun',
    'Bahan PVC lentur tidak mudah sobek, ukuran XL muat tas punggung. Siap stok 3 setel.',
    65000, 'Baru', 3, false, 'pakaian', 'Faperta', false,
    array['taman-danau', 'lobi-teknik'],
    array['Taman Danau Unilak', 'Lobi Fakultas Teknik'],
    '{}', 'hat', '', 'green', '#FEF9C3', 'Aktif', 'Kopma Faperta', 'Agribisnis'),
  ('lampu-belajar-kos', null, 'Lampu Meja Belajar LED Lipat USB Anak Kos',
    '3 tingkat kecerahan sentuh, bisa pakai powerbank saat listrik kos padam.',
    30000, 'Bekas Layak Pakai', 2, false, 'kos', 'FEB', false,
    array['kantin-utama', 'perpus-pusat'],
    array['Kantin Utama Unilak', 'Perpustakaan Pusat Unilak'],
    '{}', 'bag', '', 'green', '#DCFCE7', 'Aktif', 'Penjual FEB #08', 'Akuntansi'),
  ('dimsum-mentai-umkm', null, 'Dimsum Ayam Mentai Box Isi 6 Siap COD',
    'Homemade tanpa pengawet, saus mentai gurih dibuat fresh menjelang jam istirahat kuliah siang.',
    15000, 'Baru', 20, true, 'jajanan', 'FKIP', true,
    array['kantin-utama', 'gor-kampus'],
    array['Kantin Utama Unilak', 'GOR Kampus Unilak'],
    '{}', 'umkm-coffee', 'UMKM', 'yellow', '#FEF9C3', 'Aktif', 'Dapur Mentai FKIP', 'Pendidikan Bahasa Inggris'),
  ('jasa-print-laporan', null, 'Jasa Cetak Warna & Jilid Laporan Praktikum',
    'Antar langsung di Lobi Fakultas Teknik tanpa perlu keluar gerbang kampus. Terima file PDF via WhatsApp setelah dijadwalkan.',
    10000, 'Baru', 99, true, 'jasa', 'Teknik', true,
    array['lobi-teknik', 'perpus-pusat'],
    array['Lobi Fakultas Teknik', 'Perpustakaan Pusat Unilak'],
    '{}', 'bag', 'UMKM', 'yellow', '#DCFCE7', 'Aktif', 'Karya Teknik Print', 'Teknik Elektro')
on conflict (slug) do nothing;
