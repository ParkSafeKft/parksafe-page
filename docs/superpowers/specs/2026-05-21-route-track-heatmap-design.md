# Strava-style Route Track Heatmap — Design

- **Date:** 2026-05-21
- **Status:** Design approved; implementation plan pending
- **Component:** `src/components/admin/RouteHeatmapTab.tsx` (admin tab `/admin/route-heatmap`)

## Context

The admin "Útvonal hőtérkép" tab showed a point-density heatmap built on MapLibre's
WebGL `heatmap` layer. On the user's machine the WebGL context was repeatedly lost
("WebGL context was lost") in **both dev and prod**. As a first fix the map was migrated
to **Leaflet + leaflet.heat** (2D canvas + raster tiles, zero WebGL), which stopped the crash.

The user now wants the map to answer a different question for **city-development
stakeholders**: *where do cyclists actually ride?* — a Strava-style route heatmap of the
recorded tracks, not point blobs. Sharing/export to the city is explicitly deferred.

## Goal

Replace the point-density heatmap with a **Strava-style additive track heatmap**: render the
actual recorded ride polylines so frequently-ridden corridors glow brighter. Stay on the
existing non-WebGL Leaflet base. Free, no external services.

## Non-goals (deferred)

- Export / sharing to the city (GeoJSON / CSV / shareable link).
- Privacy aggregation / k-anonymity — raw tracks are shown; admin-only for now.
- OSM map-matching to real streets.
- Removing the old `admin_get_route_heatmap_points` RPC (left in place, just unused).

## Data source

`public.ride_summaries`:
- `id`, `user_id`, `started_at`, `track_points` (JSONB ordered array of `[lng, lat]` pairs).
- Volume (2026-05): 781 rides, 715 with usable tracks, ~55k total points, avg 77 / max 683
  points per ride, spanning 2026-02 → 2026-05.

This volume is trivially renderable client-side on a 2D canvas.

## Backend — new RPC `admin_get_route_tracks`

Applied to **both** Supabase instances (self-hosted `parksafe-self` and hosted `claude.ai`),
kept in parity.

```
admin_get_route_tracks(
  p_start_at   timestamptz default null,
  p_end_at     timestamptz default null,
  p_limit      integer default 2000,   -- max rides returned
  p_max_points integer default 300     -- per-track downsample cap
) returns table(track_id text, points jsonb)
```

Behaviour:
- `is_admin()` guard (raise `42501` if not), `STABLE`, `SET search_path = public` — mirrors
  the existing `admin_get_route_heatmap_points` security model.
- Clamp `p_limit` to `[1, 5000]` and `p_max_points` to `[20, 1000]`.
- Select rides whose `track_points` is an array of length ≥ 2 and whose `started_at` is in
  `[p_start_at, p_end_at)`, newest first, limited to `p_limit`.
- For tracks longer than `p_max_points`, keep every Nth point (`stride = ceil(n / p_max_points)`)
  and always keep the last point — caps payload for the few long tracks.
- Validate each coordinate (array len ≥ 2, `|lng| ≤ 180`, `|lat| ≤ 90`).
- Output one row per ride: `track_id` = anonymous ordinal (`row_number()`),
  `points` = `[[lng,lat], …]`. **No `user_id` / real `id` returned.**

Representative SQL (final form in the implementation plan):

```sql
with base as (
  select rs.id, rs.started_at, rs.track_points,
         jsonb_array_length(rs.track_points) as n
  from public.ride_summaries rs
  where jsonb_typeof(rs.track_points) = 'array'
    and jsonb_array_length(rs.track_points) >= 2
    and (p_start_at is null or rs.started_at >= p_start_at)
    and (p_end_at   is null or rs.started_at <  p_end_at)
  order by rs.started_at desc
  limit v_limit
),
expanded as (
  select b.id, b.started_at, b.n,
         greatest(1, ceil(b.n::numeric / v_max_points))::int as stride,
         elem.value, elem.ord
  from base b
  cross join lateral jsonb_array_elements(b.track_points) with ordinality as elem(value, ord)
),
kept as (
  select id, started_at, value, ord
  from expanded
  where (((ord - 1) % stride) = 0 or ord = n)
    and jsonb_typeof(value) = 'array'
    and jsonb_array_length(value) >= 2
    and abs((value->>0)::double precision) <= 180
    and abs((value->>1)::double precision) <= 90
),
agg as (
  select id, started_at,
         jsonb_agg(jsonb_build_array((value->>0)::double precision,
                                     (value->>1)::double precision) order by ord) as points
  from kept group by id, started_at
)
select row_number() over (order by started_at desc)::text as track_id, points
from agg
where jsonb_array_length(points) >= 2
order by started_at desc;
```

## Frontend — `RouteHeatmapTab.tsx`

Reuse the Leaflet base added in the WebGL fix. Replace the `leaflet.heat` point layer with a
custom additive canvas overlay.

### Data loading
- Effect calls `supabase.rpc('admin_get_route_tracks', { p_start_at: startForRange(range),
  p_end_at: null, p_limit: 2000, p_max_points: 300 })`.
- Parse defensively into `Track[] = { points: [number, number][] }[]` (mirror the existing
  `asPoints` validation style: drop malformed rows/coords).
- Keep the 30/90/365/all range buttons, loading and empty states.

### Rendering — `TrackHeatLayer extends L.Layer`
A small custom layer in its own file (e.g. `src/components/admin/trackHeatLayer.ts`):
- `onAdd`: create a `<canvas>` in the map's `overlayPane`; size to `map.getSize()`; bind redraw
  to `zoomend`, `moveend`, `resize` (and reposition on `zoomanim`); draw once.
- Draw in **layer coordinates**; during an active pan the `overlayPane` transform keeps the
  drawn content geographically aligned without per-frame work. Redraw on `zoomend` / `moveend` /
  `resize` only (never per animation frame), repositioning the canvas to the viewport on
  `moveend`. Smooth on weak hardware.
- For each track: project points with `map.latLngToLayerPoint`, stroke as one polyline.
- **Additive glow:** `ctx.globalCompositeOperation = 'lighter'`. Two passes for depth — a wide,
  very-low-alpha halo + a narrow brighter core — so overlapping tracks accumulate toward
  white-hot.
- `onRemove`: unbind events, remove canvas. `setTracks(tracks)` triggers a redraw.
- Options: `{ color, haloWidth, coreWidth, alpha }` with sensible defaults.

### Colour & legend
- Single-hue additive glow on the dark CARTO basemap (default a warm/cyan tone that builds to
  white).
- Legend bar changes from the multi-hue ramp to a single-hue **"ritka → gyakori"** brightness
  gradient.

### Stats cards
Adapt the three cards to track semantics:
- **Ride-ok** — number of tracks rendered.
- **Nyomvonal pontok** — total points across tracks.
- **Időszak** — selected range label (e.g. "90 nap").

## Performance & privacy
- ~715 polylines / ~55k segments on a 2D canvas; redraw only on zoom. No WebGL anywhere.
- Admin-only RPC; raw tracks exposed to admins only. Privacy must be revisited before any
  external sharing (non-goal here).

## Testing / verification
- `tsc --noEmit`, `eslint`, `next build` all clean.
- RPC smoke test on **both** DBs: returns rows for a known range; rejects non-admins.
- Manual: open `/admin/route-heatmap`, confirm tracks render and glow on busy corridors, range
  switching works, no WebGL errors in console.

## Future / open
- Export to city (GeoJSON) → likely needs the segment-aggregation approach with a privacy floor.
- Optional multi-hue line heatmap via offscreen alpha-accumulation + colormap.
