-- Pisahkan kebijakan SELECT role anon dari pemanggilan private.is_admin() agar pengunjung anonim tidak terkena permission denied

alter policy "categories_public_read" on public.categories
  to anon using (active = true);
create policy "categories_auth_read" on public.categories
  for select to authenticated using (active = true or (select private.is_admin()));

alter policy "faculties_public_read" on public.faculties
  to anon using (active = true);
create policy "faculties_auth_read" on public.faculties
  for select to authenticated using (active = true or (select private.is_admin()));

alter policy "cod_spots_public_read" on public.cod_spots
  to anon using (active = true);
create policy "cod_spots_auth_read" on public.cod_spots
  for select to authenticated using (active = true or (select private.is_admin()));

alter policy "listings_public_read" on public.listings
  to anon using (status in ('Aktif', 'Terjual'));
create policy "listings_auth_read" on public.listings
  for select to authenticated
  using (
    status in ('Aktif', 'Terjual')
    or seller_id = (select auth.uid())
    or (select private.is_admin())
  );
