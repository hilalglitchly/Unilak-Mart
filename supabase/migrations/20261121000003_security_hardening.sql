-- Hardening hak eksekusi SECURITY DEFINER terhadap role anon & indeks foreign key yang kurang
revoke execute on function public.sync_public_profile() from public, anon, authenticated;
revoke execute on function public.guard_profile_privileged_columns() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.create_cod_order(bigint, integer, text, text, text) from public, anon;
revoke execute on function public.update_cod_order_status(bigint, text, text) from public, anon;
revoke execute on function public.get_order_counterparty_wa(bigint) from public, anon;
revoke execute on function public.submit_ktm_request(text, text, text, text, text, boolean, text) from public, anon;
revoke execute on function public.review_ktm_request(bigint, text, text) from public, anon;
revoke execute on function public.delete_own_account() from public, anon;

grant execute on function public.create_cod_order(bigint, integer, text, text, text) to authenticated, service_role;
grant execute on function public.update_cod_order_status(bigint, text, text) to authenticated, service_role;
grant execute on function public.get_order_counterparty_wa(bigint) to authenticated, service_role;
grant execute on function public.submit_ktm_request(text, text, text, text, text, boolean, text) to authenticated, service_role;
grant execute on function public.review_ktm_request(bigint, text, text) to authenticated, service_role;
grant execute on function public.delete_own_account() to authenticated, service_role;

create index if not exists ktm_verif_reviewed_by_idx on public.ktm_verifications (reviewed_by);
create index if not exists reviews_reviewer_idx on public.reviews (reviewer_id);
