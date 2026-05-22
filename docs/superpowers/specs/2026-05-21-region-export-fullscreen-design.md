# Region Export + Fullscreen — Design

- **Date:** 2026-05-21
- **Status:** Design approved; implementation plan pending
- **Builds on:** the Strava-style route track heatmap (`RouteHeatmapTab.tsx`, `trackHeatLayer.ts`, RPC `admin_get_route_tracks`).

## Context

The admin route-heatmap tab renders cyclist ride tracks (Leaflet, dark CARTO tiles, additive
green `TrackHeatLayer`). The tracks come from `admin_get_route_tracks`, which trims a 300 m
privacy radius off each track's start/end. For sharing with city-development stakeholders, the
user wants to (a) select a region, (b) export it as an image, (c) get a data sheet of the top
streets cyclists use in that region with approximate ride counts, and (d) be able to fullscreen
the map.

## Goal

Add to `RouteHeatmapTab`:
1. **Region selection** — drag a rectangle on the map.
2. **Export panel** — shows a PNG preview of the region and a table of top streets (name + ride
   count); separate **Download PNG** and **Download CSV** buttons.
3. **Street data sheet** — client-side approximate street attribution via OpenStreetMap.
4. **Fullscreen** — toggle the map (and its overlays) to fullscreen.

## Non-goals

- True map-matching (OSRM/Valhalla), server-side PostGIS, user-level counts.
- A persistent/shareable export; exports are ad-hoc downloads.

## UX flow

- A **"Régió kijelölése"** button sits with the range buttons. Clicking it enters draw mode
  (map dragging temporarily disabled; crosshair cursor).
- The user drags a rectangle. On mouseup, draw mode ends and the **export panel** opens.
- The panel (an absolutely-positioned overlay **inside the map wrapper** — see Fullscreen) shows:
  - Left: a PNG **preview** of the selected region.
  - Right: a **table** of top streets (`Utca` + `Ride-ok`), and a "computing…" state while OSM
    data loads.
  - Footer: **PNG letöltése** and **CSV letöltése** buttons, plus a close button.
- A **fullscreen toggle** button (Maximize/Minimize icon) sits in the map corner.

## Architecture / files

- **Create `src/components/admin/regionExport.ts`** — pure logic, no React:
  - `pointsInBounds(tracks, bounds)` → per-track points within the bbox (keeps track index).
  - `fetchOsmStreets(bounds)` → Overpass API call, returns named street polylines.
  - `topStreets(tracks, bounds, streets, opts)` → nearest-street match + distinct-ride counts →
    sorted `{ name: string; rides: number }[]`.
  - `toCsv(rows)` → CSV string.
- **Create `src/components/admin/RegionExportPanel.tsx`** — the overlay panel UI (preview image,
  streets table, download buttons, loading/empty/error states). Receives the PNG blob/URL and the
  computed rows; owns no data fetching.
- **Modify `src/components/admin/RouteHeatmapTab.tsx`** — region-select button, rectangle draw
  handler, fullscreen toggle, orchestration (run matching + image capture, open panel).
- **Modify `package.json`** — add `html-to-image` (image capture).

## Street matching (client-side, free, approximate)

- Uses the **already-loaded** `tracks` state (endpoint-trimmed + downsampled ≤300 pts/track).
- `fetchOsmStreets(bounds)`: POST to `https://overpass-api.de/api/interpreter` with
  `[out:json][timeout:25];way["highway"]({s},{w},{n},{e});out geom;`. Parse `elements` →
  `{ name: tags.name, line: [[lng,lat],…] }`, keeping only ways that have a `name`.
- `topStreets`: for each in-bbox track point, find the nearest street **segment** (point-to-
  segment distance in meters via equirectangular approximation) within a **30 m** threshold; record
  the point's track index against that street name. Per street, count **distinct track indices**
  → ride count. Sort desc, take **top 15**.
- Performance: in-region, downsampled points (~hundreds–few thousand) × bbox street segments. A
  coarse prefilter (segment bbox vs point) keeps it well under a second for an on-demand action.
- **Approximation is expected and accepted:** nearest-street snapping (not true map-matching),
  downsampled points, and trimmed ends (near-home streets are intentionally absent). Counts are
  **distinct rides** (no user-level data, for privacy).
- Unnamed ways are skipped.

## Image export

- Add `crossOrigin: 'anonymous'` to the CARTO `tileLayer` so tiles are CORS-capturable.
- On export, capture the map wrapper with **`html-to-image`** (`toCanvas`), then crop to the
  rectangle's pixel bounds (rectangle corners → `map.latLngToContainerPoint`) into a new canvas;
  `canvas.toBlob('image/png')` → object URL for the preview and the download.
- **CORS risk + fallback:** if the capture throws a tainted-canvas `SecurityError` (CARTO not
  sending CORS headers), catch it, show a toast ("a térkép-csempe nem engedi a képmentést"), and
  still deliver the CSV + table. Implementation will verify CARTO CORS; if it fails, fall back to a
  CORS-enabled tile source or export heat-on-solid-background.

## Fullscreen

- A `wrapperRef` wraps the existing `div.relative.flex-1` that contains the map container **and**
  all overlays (legend, loading, region panel).
- Toggle button calls `wrapperRef.requestFullscreen()` / `document.exitFullscreen()`.
- A `fullscreenchange` listener updates an `isFullscreen` state (for the icon) and schedules
  `requestAnimationFrame(() => map.invalidateSize())` so Leaflet re-renders at the new size.
- Because the export panel is an overlay **inside** `wrapperRef` (not a body-portal Dialog), it
  remains visible in fullscreen. (A portaled Radix Dialog would be invisible while the wrapper is
  the fullscreen element — hence the in-wrapper overlay.)

## Testing / verification

- `tsc --noEmit`, `eslint`, `next build` clean.
- Manual: draw a rectangle over a busy area → panel opens; table lists plausible top streets with
  ride counts; PNG preview matches the region; both downloads work; fullscreen toggles and the map
  resizes correctly; panel is usable in fullscreen.
- No test runner in this project (verification is static checks + manual).

## Open / risks

- CARTO tile CORS (image export) — see fallback above.
- Overpass public API rate limits / latency — occasional slowness on large bboxes; the panel shows
  a loading state. Could add a 25 s timeout and a friendly error.
