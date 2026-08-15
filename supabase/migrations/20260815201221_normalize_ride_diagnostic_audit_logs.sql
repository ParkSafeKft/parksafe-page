-- Keep ride-diagnostic audit entries human-readable and avoid logging every
-- pagination/filter request as a separate access event.

create or replace function public.normalize_ride_diagnostic_audit_entry()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
    if new.action = 'view_user_ride_diagnostics' then
        -- A diagnostics session can issue the same RPC repeatedly while the admin
        -- searches, filters, or pages. Record one access per admin/user/10 minutes.
        if exists (
            select 1
            from public.admin_audit_log existing
            where existing.admin_id = new.admin_id
              and existing.target_type = 'user'
              and existing.target_id = new.target_id
              and existing.action in ('view_user_ride_diagnostics', 'view_user_ride_metrics')
              and existing.created_at >= pg_catalog.now() - interval '10 minutes'
        ) then
            return null;
        end if;

        new.action := 'view_user_ride_metrics';
        new.notes := 'Ride-előzmények és GPS/refinement metrikák megtekintve. Pontos útvonal nem lett lekérve.';
    elsif new.action = 'view_ride_location' then
        new.action := 'view_exact_ride_route';
        new.notes := format(
            'Pontos rögzített és finomított GPS-útvonal megtekintve. Admin indoklása: %s',
            coalesce(nullif(trim(new.notes), ''), 'nincs megadva')
        );
    end if;

    return new;
end;
$$;

comment on function public.normalize_ride_diagnostic_audit_entry()
is 'Normalizes ride diagnostic audit actions and suppresses duplicate metric reads within a 10-minute investigation window.';

revoke all on function public.normalize_ride_diagnostic_audit_entry() from public, anon, authenticated;

drop trigger if exists normalize_ride_diagnostic_audit_entry on public.admin_audit_log;
create trigger normalize_ride_diagnostic_audit_entry
before insert on public.admin_audit_log
for each row
execute function public.normalize_ride_diagnostic_audit_entry();
