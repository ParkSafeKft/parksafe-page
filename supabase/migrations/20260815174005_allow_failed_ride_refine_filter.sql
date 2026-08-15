-- Admin-only, audited ride diagnostics for support investigations.
-- The history RPC omits route coordinates. Exact recorded/refined tracks are
-- returned only by the separate purpose-gated RPC below.

create or replace function public.admin_get_user_ride_diagnostics(
    p_user_id uuid,
    p_limit integer default 25,
    p_offset integer default 0,
    p_query text default null,
    p_refine_status text default null
)
returns table(
    total_count bigint,
    ride_id uuid,
    client_ride_id text,
    started_at timestamptz,
    created_at timestamptz,
    favorite_name text,
    kind text,
    distance_meters integer,
    raw_distance_meters integer,
    duration_seconds integer,
    moving_time_seconds integer,
    average_speed_kmh numeric,
    refine_status text,
    refine_started_at timestamptz,
    refined_at timestamptz,
    refine_attempts integer,
    refine_next_retry_at timestamptz,
    refine_reason text,
    distance_status text,
    elevation_status text,
    valhalla_match_ratio double precision,
    open_elevation_chunks integer,
    recorded_point_count integer,
    snapped_point_count integer,
    raw_sample_count integer,
    gps_accuracy_avg_m double precision,
    gps_accuracy_p95_m double precision,
    gps_accuracy_max_m double precision,
    telemetry_created_at timestamptz,
    os text,
    os_version text,
    manufacturer text,
    model text,
    app_version text,
    sample_count_total integer,
    sample_count_accepted integer,
    sample_count_rejected jsonb,
    background_kills integer,
    heartbeat_gap_count integer,
    bg_permission text,
    battery_saver_on boolean,
    doze_whitelisted boolean,
    precise_location_on boolean
)
language plpgsql
volatile
security definer
set search_path = pg_catalog, public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_limit integer := least(greatest(coalesce(p_limit, 25), 1), 100);
    v_offset integer := least(greatest(coalesce(p_offset, 0), 0), 10000);
    v_query text := nullif(left(trim(coalesce(p_query, '')), 100), '');
    v_status text := nullif(trim(coalesce(p_refine_status, '')), '');
begin
    if v_admin_id is null or not public.is_admin() then
        raise exception 'Admin privileges required' using errcode = '42501';
    end if;

    if p_user_id is null then
        raise exception 'User id is required' using errcode = '22023';
    end if;

    if v_status is not null and v_status not in ('success', 'partial', 'pending', 'running', 'skipped', 'failed', 'legacy') then
        raise exception 'Unsupported refinement status' using errcode = '22023';
    end if;

    insert into public.admin_audit_log(admin_id, action, target_type, target_id, notes)
    values (
        v_admin_id,
        'view_user_ride_diagnostics',
        'user',
        p_user_id,
        format('limit=%s; offset=%s; status=%s; query=%s', v_limit, v_offset, coalesce(v_status, 'all'), case when v_query is null then 'no' else 'yes' end)
    );

    return query
    with filtered as (
        select rs.*
        from public.ride_summaries rs
        where rs.user_id = p_user_id
          and (
              v_status is null
              or (v_status = 'legacy' and rs.refine_status is null)
              or rs.refine_status = v_status
          )
          and (
              v_query is null
              or rs.id::text ilike '%' || v_query || '%'
              or coalesce(rs.client_ride_id, '') ilike '%' || v_query || '%'
              or coalesce(rs.favorite_name, '') ilike '%' || v_query || '%'
          )
    ), selected as (
        select f.*, count(*) over()::bigint as filtered_count
        from filtered f
        order by coalesce(f.started_at, f.created_at) desc, f.id
        offset v_offset
        limit v_limit
    )
    select
        s.filtered_count,
        s.id,
        s.client_ride_id,
        s.started_at,
        s.created_at,
        s.favorite_name,
        s.kind,
        s.distance_meters,
        s.raw_distance_meters,
        s.duration_seconds,
        s.moving_time_seconds,
        s.average_speed_kmh,
        s.refine_status,
        s.refine_started_at,
        s.refined_at,
        s.refine_attempts,
        s.refine_next_retry_at,
        left(s.refine_error ->> 'reason', 500),
        s.refine_error ->> 'distance_status',
        s.refine_error ->> 'elevation_status',
        case
            when coalesce(s.refine_error ->> 'valhalla_match_ratio', '') ~ '^[0-9]+([.][0-9]+)?$'
                then (s.refine_error ->> 'valhalla_match_ratio')::double precision
            else null
        end,
        case
            when coalesce(s.refine_error ->> 'open_elevation_chunks', '') ~ '^[0-9]+$'
                then (s.refine_error ->> 'open_elevation_chunks')::integer
            else null
        end,
        case when jsonb_typeof(s.track_points) = 'array' then jsonb_array_length(s.track_points) else 0 end,
        case when jsonb_typeof(s.track_points_snapped) = 'array' then jsonb_array_length(s.track_points_snapped) else 0 end,
        case when jsonb_typeof(s.track_samples) = 'array' then jsonb_array_length(s.track_samples) else 0 end,
        gps.accuracy_avg_m,
        gps.accuracy_p95_m,
        gps.accuracy_max_m,
        rt.created_at,
        rt.os,
        rt.os_version,
        rt.manufacturer,
        rt.model,
        rt.app_version,
        rt.sample_count_total,
        rt.sample_count_accepted,
        coalesce(rt.sample_count_rejected, '{}'::jsonb),
        rt.background_kills,
        case when jsonb_typeof(rt.heartbeat_gaps) = 'array' then jsonb_array_length(rt.heartbeat_gaps) else 0 end,
        rt.bg_permission,
        rt.battery_saver_on,
        rt.doze_whitelisted,
        rt.precise_location_on
    from selected s
    left join lateral (
        select telemetry.*
        from public.ride_telemetry telemetry
        where telemetry.ride_id = s.id
        order by telemetry.created_at desc
        limit 1
    ) rt on true
    left join lateral (
        select
            avg((sample.value ->> 4)::double precision)::double precision as accuracy_avg_m,
            percentile_cont(0.95) within group (order by (sample.value ->> 4)::double precision)::double precision as accuracy_p95_m,
            max((sample.value ->> 4)::double precision)::double precision as accuracy_max_m
        from jsonb_array_elements(
            case when jsonb_typeof(s.track_samples) = 'array' then s.track_samples else '[]'::jsonb end
        ) sample(value)
        where jsonb_typeof(sample.value) = 'array'
          and jsonb_array_length(sample.value) >= 5
          and jsonb_typeof(sample.value -> 4) = 'number'
          and (sample.value ->> 4)::double precision between 0 and 10000
    ) gps on true
    order by coalesce(s.started_at, s.created_at) desc, s.id;
end;
$$;

comment on function public.admin_get_user_ride_diagnostics(uuid, integer, integer, text, text)
is 'Audited admin-only ride/refinement/GPS diagnostics. Does not return route coordinates.';

revoke all on function public.admin_get_user_ride_diagnostics(uuid, integer, integer, text, text) from public, anon;
grant execute on function public.admin_get_user_ride_diagnostics(uuid, integer, integer, text, text) to authenticated;


create or replace function public.admin_get_ride_diagnostic_track(
    p_ride_id uuid,
    p_purpose text
)
returns table(
    ride_id uuid,
    recorded_points jsonb,
    refined_points jsonb
)
language plpgsql
volatile
security definer
set search_path = pg_catalog, public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_purpose text := left(trim(coalesce(p_purpose, '')), 500);
begin
    if v_admin_id is null or not public.is_admin() then
        raise exception 'Admin privileges required' using errcode = '42501';
    end if;

    if p_ride_id is null then
        raise exception 'Ride id is required' using errcode = '22023';
    end if;

    if char_length(v_purpose) < 10 then
        raise exception 'A support purpose of at least 10 characters is required' using errcode = '22023';
    end if;

    if not exists (select 1 from public.ride_summaries rs where rs.id = p_ride_id) then
        raise exception 'Ride not found' using errcode = 'P0002';
    end if;

    insert into public.admin_audit_log(admin_id, action, target_type, target_id, notes)
    values (v_admin_id, 'view_ride_location', 'ride', p_ride_id, v_purpose);

    return query
    select
        rs.id,
        case when jsonb_typeof(rs.track_points) = 'array' then rs.track_points else '[]'::jsonb end,
        case when jsonb_typeof(rs.track_points_snapped) = 'array' then rs.track_points_snapped else '[]'::jsonb end
    from public.ride_summaries rs
    where rs.id = p_ride_id;
end;
$$;

comment on function public.admin_get_ride_diagnostic_track(uuid, text)
is 'Purpose-gated, audited admin-only access to a ride recorded/refined route.';

revoke all on function public.admin_get_ride_diagnostic_track(uuid, text) from public, anon;
grant execute on function public.admin_get_ride_diagnostic_track(uuid, text) to authenticated;
