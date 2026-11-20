-- Ubah guard_profile_privileged_columns menjadi SECURITY INVOKER agar current_user mencerminkan role pemanggil asli (blokir eskalasi hak akses user)
create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  jwt_role text := coalesce((select auth.jwt() ->> 'role'), '');
  pg_role text := coalesce(current_setting('role', true), '');
  caller_admin boolean := (select private.is_admin());
begin
  new.updated_at := now();
  if jwt_role <> 'service_role'
     and pg_role <> 'service_role'
     and not caller_admin
     and current_user not in ('postgres', 'supabase_admin', 'service_role') then
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
