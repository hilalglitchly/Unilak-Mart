-- Tahap 3: Otomatisasi lifecycle pesanan (FR-18, FR-22) via pg_cron

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;

-- Fungsi pemeliharaan otomatis: auto-kedaluwarsa 24 jam (FR-18) & auto-selesai 48 jam (FR-22)
create or replace function public.run_marketplace_maintenance()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  ord public.orders%rowtype;
  item public.listings%rowtype;
  expired_count integer := 0;
  completed_count integer := 0;
begin
  -- Auto-kedaluwarsa pesanan Menunggu melewati batas expires_at (24 jam)
  for ord in
    select * from public.orders
    where status = 'Menunggu' and expires_at <= now()
    for update skip locked
  loop
    update public.orders
    set
      status = 'Kedaluwarsa',
      cancel_reason = coalesce(
        cancel_reason,
        'Otomatis kedaluwarsa karena penjual tidak merespons dalam 24 jam.'
      ),
      updated_at = now()
    where id = ord.id;

    select * into item from public.listings where id = ord.listing_id for update;
    if found and not item.always_available then
      update public.listings
      set
        stock = stock + ord.quantity,
        status = case when status = 'Terjual' then 'Aktif' else status end,
        updated_at = now()
      where id = item.id;
    end if;

    insert into public.notifications (user_id, title, message, href) values
      (ord.buyer_id, 'Pesanan Kedaluwarsa (' || ord.code || ')',
        'Penjual belum merespons dalam 24 jam. Kuota stok telah dikembalikan ke katalog.', '/pesanan'),
      (ord.seller_id, 'Pesanan Kedaluwarsa (' || ord.code || ')',
        'Permintaan COD tidak direspons dalam 24 jam dan ditutup otomatis.', '/pesanan');

    expired_count := expired_count + 1;
  end loop;

  -- Auto-selesai pesanan Sudah Diserahkan melewati auto_complete_at (48 jam) jika tidak ada laporan Baru
  for ord in
    select * from public.orders o
    where o.status = 'Sudah Diserahkan'
      and o.auto_complete_at is not null
      and o.auto_complete_at <= now()
      and not exists (
        select 1 from public.reports r
        where r.target_type = 'Pesanan'
          and r.target_id in (o.id::text, o.code)
          and r.status = 'Baru'
      )
    for update skip locked
  loop
    update public.orders
    set status = 'Selesai', updated_at = now()
    where id = ord.id;

    insert into public.notifications (user_id, title, message, href) values
      (ord.buyer_id, 'Pesanan Selesai Otomatis (' || ord.code || ')',
        'Konfirmasi 48 jam selesai. Anda kini dapat saling memberi ulasan transaksi COD.', '/pesanan'),
      (ord.seller_id, 'Transaksi Selesai Otomatis (' || ord.code || ')',
        'Pesanan otomatis selesai setelah 48 jam tanpa kendala. Silakan beri ulasan.', '/pesanan');

    completed_count := completed_count + 1;
  end loop;

  return jsonb_build_object(
    'expired_orders', expired_count,
    'completed_orders', completed_count
  );
end;
$$;

revoke all on function public.run_marketplace_maintenance() from public, anon, authenticated;
grant execute on function public.run_marketplace_maintenance() to service_role;

-- Jadwalkan pemeliharaan otomatis setiap 30 menit melalui pg_cron
select cron.schedule(
  'unilakmart-lifecycle-maintenance',
  '*/30 * * * *',
  $$select public.run_marketplace_maintenance();$$
);
