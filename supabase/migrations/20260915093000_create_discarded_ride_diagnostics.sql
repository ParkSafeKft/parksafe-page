-- Admin ride diagnostics source. Safe to run on installations where the table
-- has not been provisioned yet; the client must never receive service_role.
create table if not exists public.discarded_ride_diagnostics (
    id uuid primary key default gen_random_uuid(),
    client_ride_id text,
    user_id uuid,
    started_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    duration_seconds integer,
    moving_time_seconds integer,
    distance_meters integer,
    coordinate_count integer,
    first_offset integer,
    last_offset integer,
    raw_sample_count integer,
    rejection_counts jsonb not null default '{}'::jsonb,
    reason text,
    model text
);

alter table public.discarded_ride_diagnostics enable row level security;
drop policy if exists "Admins can read discarded ride diagnostics" on public.discarded_ride_diagnostics;
create policy "Admins can read discarded ride diagnostics"
    on public.discarded_ride_diagnostics for select to authenticated
    using ((select public.is_admin()));

grant select on public.discarded_ride_diagnostics to authenticated;

-- One deliberately synthetic row for staging/admin UI verification.
insert into public.discarded_ride_diagnostics
    (client_ride_id, user_id, started_at, duration_seconds, moving_time_seconds,
     distance_meters, coordinate_count, first_offset, last_offset,
     raw_sample_count, rejection_counts, reason, model)
values
    ('mock-ride-diagnostic-001', null, now() - interval '18 minutes', 742, 501,
     1840, 37, 12, 738, 64,
     '{"poor_accuracy": 11, "stale_gap": 7, "stationary": 5}'::jsonb,
     'A mentés küszöbe alatt maradt: túl sok pontatlan GPS-minta.', 'Mock Android GPS');
