-- PARKS-144: aggregate-only, read-only admin analytics over existing data.
create or replace function public.admin_get_activation_metrics(
    p_from date,
    p_to date,
    p_cutoff timestamptz default statement_timestamp()
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_from timestamptz := p_from::timestamp at time zone 'Europe/Budapest';
    v_to timestamptz := (p_to + 1)::timestamp at time zone 'Europe/Budapest';
begin
    if auth.uid() is null or not exists (
        select 1 from public.profiles where id = auth.uid() and role = 'admin'
    ) then
        raise exception 'Admin access required' using errcode = '42501';
    end if;
    if p_from is null or p_to is null or p_from > p_to
       or p_cutoff is null or not isfinite(p_cutoff)
       or p_cutoff > statement_timestamp() then
        raise exception 'Invalid registration period or cutoff' using errcode = '22023';
    end if;

    return (
        with cohort as (
            select p.id, p.created_at as registered_at
            from public.profiles p
            join auth.users u on u.id = p.id
            where p.created_at >= v_from and p.created_at < v_to
              and p.created_at <= p_cutoff
              and u.is_anonymous is not true and u.deleted_at is null
              and coalesce(u.raw_app_meta_data ->> 'analytics_exclude', 'false') <> 'true'
        ), valid_rides as (
            -- Missing client IDs use the row UUID; distinct legacy rides stay distinct.
            select distinct on (r.user_id, nullif(btrim(r.client_ride_id), ''),
                case when nullif(btrim(r.client_ride_id), '') is null then r.id end)
                r.user_id, r.started_at
            from public.ride_summaries r
            join cohort c on c.id = r.user_id
            where r.distance_meters > 0 and r.duration_seconds > 0
              and r.started_at >= c.registered_at and r.started_at <= p_cutoff
              and r.created_at <= p_cutoff
              and lower(coalesce(r.kind, '')) not in ('test', 'import', 'imported', 'seed', 'demo', 'synthetic')
              and coalesce(r.client_ride_id, '') !~* '^(test|import|imported|seed|demo|synthetic)[:_-]'
            order by r.user_id, nullif(btrim(r.client_ride_id), ''),
                case when nullif(btrim(r.client_ride_id), '') is null then r.id end,
                r.started_at, r.created_at, r.id
        ), first_rides as (
            select user_id, min(started_at) as first_at from valid_rides group by user_id
        ), observations as (
            select c.registered_at, f.first_at,
                exists (
                    select 1 from valid_rides r
                    where r.user_id = c.id
                      and r.started_at > f.first_at
                      and r.started_at <= f.first_at + interval '168 hours'
                      and (r.started_at at time zone 'Europe/Budapest')::date
                          > (f.first_at at time zone 'Europe/Budapest')::date
                ) as returned
            from cohort c left join first_rides f on f.user_id = c.id
        ), totals as (
            select count(*) as cohort_users,
                count(*) filter (where registered_at + interval '168 hours' <= p_cutoff) as activation_denominator,
                count(*) filter (where registered_at + interval '168 hours' <= p_cutoff
                    and first_at <= registered_at + interval '168 hours') as activation_numerator,
                count(*) filter (where first_at + interval '168 hours' <= p_cutoff) as return_denominator,
                count(*) filter (where first_at + interval '168 hours' <= p_cutoff and returned) as return_numerator,
                count(first_at) as median_sample,
                percentile_cont(0.5) within group (order by extract(epoch from (first_at - registered_at)))
                    filter (where first_at is not null) as median_seconds
            from observations
        )
        select jsonb_build_object(
            'registration_from', p_from, 'registration_to', p_to,
            'cutoff', p_cutoff, 'timezone', 'Europe/Budapest', 'window_hours', 168,
            'cohort_users', cohort_users,
            'activation', jsonb_build_object('numerator', activation_numerator, 'denominator', activation_denominator,
                'percent', round(100.0 * activation_numerator / nullif(activation_denominator, 0), 1)),
            'return', jsonb_build_object('numerator', return_numerator, 'denominator', return_denominator,
                'percent', round(100.0 * return_numerator / nullif(return_denominator, 0), 1)),
            'first_ride', jsonb_build_object('median_seconds', median_seconds, 'sample_users', median_sample)
        ) from totals
    );
end;
$$;

comment on function public.admin_get_activation_metrics(date, date, timestamptz)
is 'PARKS-144: profile registration cohorts, 168 elapsed hours (inclusive), Budapest calendar days, valid saved rides deduplicated by user/client ID; legacy UUID fallback. Aggregate only, admin required.';

revoke all on function public.admin_get_activation_metrics(date, date, timestamptz) from public, anon;
grant execute on function public.admin_get_activation_metrics(date, date, timestamptz) to authenticated;
