---
status: resolved
trigger: "admin oldalon a fo uldal picik nem ertheto tehat 2028 ismert eszkoz de 2207 et regisztarlt felhasznalo es 0 vendeg fiok"
created: 2026-08-12
updated: 2026-08-12
---

## Symptoms

- expected: The admin dashboard counts should use consistent definitions and reflect the Supabase data.
- actual: The dashboard shows 2028 known devices, 2207 registered users, and 0 guest accounts.
- errors: No visible error reported.
- timeline: Unknown.
- reproduction: Open the admin dashboard home page.

## Current Focus

- hypothesis: Confirmed: the API overwrites device-scoped RPC values with the global profile count and derives guests by subtracting unlike populations.
- test: Traced the API/RPC and compared aggregate-only read-only counts in Supabase.
- expecting: Confirmed.
- next_action: Await user approval before changing dashboard semantics or code.
- reasoning_checkpoint: This is a presentation/aggregation bug, not evidence of missing Supabase records.
- tdd_checkpoint:

## Evidence

- timestamp: 2026-08-12
  finding: public.devices contains 2028 distinct devices: 1735 linked devices and 293 devices with null user_id.
- timestamp: 2026-08-12
  finding: auth.users and public.profiles both contain 2207 records; auth.users contains 0 anonymous Auth accounts.
- timestamp: 2026-08-12
  finding: 1634 distinct registered users have a linked device, while 573 registered users have no linked device record.
- timestamp: 2026-08-12
  finding: get_device_stats correctly derives guest_devices from devices.user_id IS NULL.
- timestamp: 2026-08-12
  finding: src/app/api/device-stats/route.ts overwrites registered_users with profiles count and guest_users with max(0, total_devices - profiles).

## Eliminated


## Resolution

- root_cause: The endpoint mixes account counts with device counts. Since 2207 profiles exceeds 2028 devices, Math.max(0, 2028 - 2207) returns 0 and hides the 293 actual guest devices.
- fix: Added an explicit total_users metric defined as registered profiles plus guest devices, while retaining total_devices for device/platform statistics.
- verification: ESLint and TypeScript checks passed; read-only Supabase aggregation confirms 2207 registered users + 293 guest devices = 2500 total users.
- files_changed: src/app/api/device-stats/route.ts, src/components/admin/DeviceStatsOverview.tsx
