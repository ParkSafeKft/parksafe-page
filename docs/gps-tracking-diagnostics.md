# GPS tracking diagnostics (PARKS-328)

`UserRideDiagnostics` now expands a coordinate-free sample-gap/state-history panel for saved rides. It reuses the existing diagnostic panel styles and keeps exact-route access in its existing separately audited flow. The user-facing mobile screens do not change.

Required backend migration lives in the sibling mobile repository:
`../parksafe/supabase/migrations/20261028150000_ride_tracking_diagnostics.sql`.
It adds `ride_telemetry.tracking_diagnostics` and the audited, admin-only `admin_get_ride_tracking_diagnostics(uuid)` RPC. The existing paginated diagnostic RPC is unchanged. The mobile `record-ride-telemetry` Edge Function must then be deployed with its shared validator before new evidence will be available.

These backend artifacts are local and unapplied. A missing RPC gives a load error, not a false zero. Legacy NULL metadata gives “Nincs mért mintakimaradási adat”; measured empty gaps are scoped to the observed coverage. A nullable background-kill count is displayed as “Nem ismert”.

The panel shows gaps longer than 15 seconds between raw GPS timestamps, durations, observed app/permission/pause/recovery events, partial coverage and dropped-detail counts. A gap alone does not establish why GPS sampling stopped. No new coordinates or free text are collected for this feature. PARKS-329's aggregate OS/device dashboard remains separate.

Validation: `node --test scripts/tests/rideTrackingDiagnostics.test.mjs`, `npx tsc --noEmit`, and targeted ESLint for the two diagnostic components. The rendering test mocks Supabase and does not make production calls. Live ingestion/admin end-to-end and browser visual checks are not claimed.
