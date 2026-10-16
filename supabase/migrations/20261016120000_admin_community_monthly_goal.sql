-- Admin-only configuration; the mobile aggregate and table grants stay unchanged.
begin;

create function public.admin_get_community_monthly_goal(p_month date)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
begin
    if auth.uid() is null or not exists (
        select 1 from public.profiles where id = auth.uid() and role = 'admin'
    ) then
        raise exception 'Admin access required' using errcode = '42501';
    end if;
    if p_month is null or not isfinite(p_month) or extract(day from p_month) <> 1
       or p_month < date '2000-01-01' or p_month > date '2099-12-01' then
        raise exception 'Invalid month' using errcode = '22023';
    end if;
    return (select to_jsonb(g) from public.community_monthly_goals g where month_start = p_month);
end;
$$;

create function public.admin_set_community_monthly_goal(
    p_month date, p_target_meters bigint, p_enabled boolean, p_expected_updated_at timestamptz
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
    v_before public.community_monthly_goals%rowtype;
    v_after public.community_monthly_goals%rowtype;
begin
    if auth.uid() is null or not exists (
        select 1 from public.profiles where id = auth.uid() and role = 'admin'
    ) then
        raise exception 'Admin access required' using errcode = '42501';
    end if;
    if p_month is null or not isfinite(p_month) or extract(day from p_month) <> 1
       or p_month < date_trunc('month', statement_timestamp() at time zone 'Europe/Budapest')::date
       or p_month > date '2099-12-01' or p_target_meters is null
       or p_target_meters not between 1 and 9007199254740991 or p_enabled is null then
        raise exception 'Invalid goal configuration' using errcode = '22023';
    end if;

    -- Serialize creation as well as updates; timestamps detect stale editor sessions.
    perform pg_advisory_xact_lock(135, p_month - date '2000-01-01');
    select * into v_before from public.community_monthly_goals where month_start = p_month for update;
    if v_before.updated_at is distinct from p_expected_updated_at then
        raise exception 'Goal changed; reload before saving' using errcode = '40001';
    end if;
    insert into public.community_monthly_goals (month_start, target_meters, enabled)
    values (p_month, p_target_meters, p_enabled)
    on conflict (month_start) do update set target_meters = excluded.target_meters, enabled = excluded.enabled
    returning * into v_after;

    insert into public.admin_audit_log (admin_id, action, target_type, target_id, notes)
    values (auth.uid(), 'set_community_monthly_goal', 'community_monthly_goal',
        md5('community_monthly_goal:' || p_month::text)::uuid,
        jsonb_build_object('month_start', p_month, 'before', to_jsonb(v_before), 'after', to_jsonb(v_after))::text);
    return to_jsonb(v_after);
end;
$$;

revoke all on function public.admin_get_community_monthly_goal(date) from public, anon, authenticated;
revoke all on function public.admin_set_community_monthly_goal(date, bigint, boolean, timestamptz) from public, anon, authenticated;
grant execute on function public.admin_get_community_monthly_goal(date) to authenticated;
grant execute on function public.admin_set_community_monthly_goal(date, bigint, boolean, timestamptz) to authenticated;
notify pgrst, 'reload schema';
commit;
