-- PARKS-329: distinguish ride volume from distinct contributing accounts.
create or replace function public.admin_get_gps_device_diagnostics(p_days integer default 30)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare v_result jsonb;
begin
  if auth.uid() is null or public.is_admin() is not true then
    raise exception 'Admin privileges required' using errcode = '42501';
  end if;
  if p_days is null or p_days not in (7, 30, 90) then
    raise exception 'Invalid period' using errcode = '22023';
  end if;
  insert into public.admin_audit_log(admin_id, action, target_type, target_id, notes)
  values (auth.uid(), 'view_gps_device_diagnostics', 'gps_aggregate', auth.uid(), 'GPS quality aggregate, days=' || p_days);

  with rides as (
    select r.id, r.track_samples from public.ride_summaries r
    where r.started_at >= statement_timestamp() - make_interval(days => p_days)
      and r.started_at <= statement_timestamp()
  ), observations as (
    select t.*,
      case when jsonb_typeof(r.track_samples) = 'array' then jsonb_array_length(r.track_samples) end as stored_count,
      (t.tracking_diagnostics->>'schema_version' = '1'
        and t.tracking_diagnostics->>'observed_interval_count' ~ '^[1-9][0-9]*$'
        and jsonb_typeof(t.tracking_diagnostics->'sample_gaps') = 'array'
        and t.tracking_diagnostics->>'coverage' in ('complete', 'partial')) is true as measured,
      (case when jsonb_typeof(t.tracking_diagnostics->'sample_gaps') = 'array'
        then jsonb_array_length(t.tracking_diagnostics->'sample_gaps') > 0 else false end
        or coalesce(t.tracking_diagnostics->>'dropped_gaps', '0') ~ '^[1-9][0-9]*$') as sample_gap,
      case when jsonb_typeof(t.heartbeat_gaps) = 'array' then jsonb_array_length(t.heartbeat_gaps) > 0 else false end as legacy_gap
    from rides r join public.ride_telemetry t on t.ride_id = r.id
  ), groups as (
    select coalesce(nullif(btrim(manufacturer), ''), 'Ismeretlen') as manufacturer,
      coalesce(nullif(btrim(model), ''), 'Ismeretlen') as model,
      coalesce(nullif(btrim(os), ''), 'Ismeretlen') as os,
      coalesce(nullif(btrim(os_version), ''), 'Ismeretlen') as os_version,
      coalesce(nullif(btrim(app_version), ''), 'Ismeretlen') as app_version,
      battery_saver_on, doze_whitelisted,
      count(*) as rides,
      count(distinct user_id) as users,
      count(distinct user_id) filter (where measured) as measured_users,
      count(distinct user_id) filter (where measured and sample_gap) as gap_users,
      count(*) filter (where measured) as measured_rides,
      count(*) filter (where measured and tracking_diagnostics->>'coverage' = 'partial') as partial_rides,
      count(*) filter (where measured and sample_gap) as gap_rides,
      count(*) filter (where not measured and legacy_gap) as legacy_gap_rides,
      count(*) filter (where sample_count_total > 0 and sample_count_accepted between 0 and sample_count_total) as count_rides,
      sum(sample_count_total) filter (where sample_count_total > 0 and sample_count_accepted between 0 and sample_count_total) as raw_samples,
      sum(sample_count_accepted) filter (where sample_count_total > 0 and sample_count_accepted between 0 and sample_count_total) as accepted_samples,
      count(*) filter (where stored_count is not null and sample_count_accepted >= 0) as storage_measured_rides,
      count(*) filter (where stored_count is not null and sample_count_accepted >= 0 and stored_count <> sample_count_accepted) as storage_mismatch_rides,
      count(*) filter (where sample_count_rejected is not null) as rejection_measured_rides,
      sum(case when sample_count_rejected->>'poor_accuracy' ~ '^[0-9]{1,7}$' then (sample_count_rejected->>'poor_accuracy')::bigint end) as poor_accuracy,
      sum(case when sample_count_rejected->>'stale_gap' ~ '^[0-9]{1,7}$' then (sample_count_rejected->>'stale_gap')::bigint end) as stale_gap,
      sum(case when sample_count_rejected->>'teleport' ~ '^[0-9]{1,7}$' then (sample_count_rejected->>'teleport')::bigint end) as teleport
    from observations group by 1,2,3,4,5,6,7
  )
  select jsonb_build_object('days', p_days, 'total_rides', (select count(*) from rides),
    'telemetry_rides', (select count(*) from observations),
    'groups', coalesce((select jsonb_agg(to_jsonb(g) || jsonb_build_object(
      'gap_percent', round(100.0 * gap_rides / nullif(measured_rides, 0), 1),
      'accepted_percent', round(100.0 * accepted_samples / nullif(raw_samples, 0), 1)))
      from groups g), '[]'::jsonb)) into v_result;
  return v_result;
end;
$$;
revoke all on function public.admin_get_gps_device_diagnostics(integer) from public, anon;
grant execute on function public.admin_get_gps_device_diagnostics(integer) to authenticated;
