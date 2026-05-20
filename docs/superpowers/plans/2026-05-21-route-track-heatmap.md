# Route Track Heatmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin route-heatmap's point-density view with a Strava-style additive heatmap of actual cyclist ride tracks.

**Architecture:** A new admin-only Postgres RPC `admin_get_route_tracks` returns each ride's (optionally downsampled) polyline. The existing Leaflet base map in `RouteHeatmapTab.tsx` renders all polylines onto a single 2D canvas overlay (`TrackHeatLayer`) using additive (`'lighter'`) compositing so busy corridors glow. No WebGL anywhere.

**Tech Stack:** Next.js 16 (App Router, `'use client'`), Leaflet (vanilla, dynamically imported), Supabase Postgres RPC (`plpgsql`), TypeScript.

---

## Project constraints (read first)

- **No test runner exists** (no vitest/jest/playwright, no `test` script). Do **not** introduce one. Verification per task = `npx tsc --noEmit`, `npx eslint <file>`, `npm run build`, an SQL smoke test, and a manual browser check.
- **Migrations are not tracked in the repo.** DB changes are applied through the Supabase MCP tools. The canonical SQL lives in this plan.
- **Dual Supabase:** every DB change must be applied to **both** instances — self-hosted (`mcp__parksafe-self__*`) **and** hosted (`mcp__claude_ai_Supabase__*`). (Memory: `supabase-dual-instance`.)
- **Branch:** work is on `feat/route-track-heatmap`. The design spec is already committed there (`docs/superpowers/specs/2026-05-21-route-track-heatmap-design.md`).
- **Starting working-tree state (uncommitted):** `RouteHeatmapTab.tsx` (Leaflet + `leaflet.heat` point version), `InteractiveRouteMap.tsx` (MapLibre WebGL hardening), `package.json`/`package-lock.json` (added `leaflet`, `leaflet.heat`, `@types/leaflet`, `@types/leaflet.heat`). The task order below keeps the on-disk tree buildable at every commit.

---

## File Structure

- **DB (via MCP, not a repo file):** `public.admin_get_route_tracks(...)` — new RPC. Reads `public.ride_summaries.track_points`.
- **Create:** `src/components/admin/trackHeatLayer.ts` — the additive canvas overlay layer (factory + `Track` type). One responsibility: draw tracks. No data fetching, no React.
- **Modify:** `src/components/admin/RouteHeatmapTab.tsx` — fetch tracks via the new RPC, render via `TrackHeatLayer`, update stats + legend. Drops all `leaflet.heat` usage.
- **Modify (commit only):** `src/components/admin/InteractiveRouteMap.tsx` — already-edited MapLibre WebGL cleanup hardening; just needs committing.
- **Modify:** `package.json` / `package-lock.json` — end state: `leaflet` + `@types/leaflet` only (remove `leaflet.heat` + `@types/leaflet.heat`).

---

## Task 1: Create the `admin_get_route_tracks` RPC on BOTH Supabase instances

**Files:** none in repo. DB only (self-hosted + hosted), via MCP.

- [ ] **Step 1: Apply the function to the self-hosted instance**

Use `mcp__parksafe-self__apply_migration` with name `admin_get_route_tracks` and this exact SQL:

```sql
create or replace function public.admin_get_route_tracks(
    p_start_at timestamptz default null,
    p_end_at timestamptz default null,
    p_limit integer default 2000,
    p_max_points integer default 300
)
returns table(track_id text, points jsonb)
language plpgsql
stable
set search_path to 'public'
as $function$
declare
    v_limit integer := least(greatest(coalesce(p_limit, 2000), 1), 5000);
    v_max_points integer := least(greatest(coalesce(p_max_points, 300), 20), 1000);
begin
    if not public.is_admin() then
        raise exception 'Admin privileges required' using errcode = '42501';
    end if;

    return query
    with base as (
        select
            rs.id,
            rs.started_at,
            rs.track_points,
            jsonb_array_length(rs.track_points) as n
        from public.ride_summaries rs
        where rs.track_points is not null
          and jsonb_typeof(rs.track_points) = 'array'
          and jsonb_array_length(rs.track_points) >= 2
          and (p_start_at is null or rs.started_at >= p_start_at)
          and (p_end_at is null or rs.started_at < p_end_at)
        order by rs.started_at desc
        limit v_limit
    ), expanded as (
        select
            b.id,
            b.started_at,
            b.n,
            greatest(1, ceil(b.n::numeric / v_max_points))::int as stride,
            elem.value,
            elem.ord
        from base b
        cross join lateral jsonb_array_elements(b.track_points) with ordinality as elem(value, ord)
    ), kept as (
        select id, started_at, value, ord
        from expanded
        where (((ord - 1) % stride) = 0 or ord = n)
          and jsonb_typeof(value) = 'array'
          and jsonb_array_length(value) >= 2
          and (value ->> 0) is not null
          and (value ->> 1) is not null
          and abs((value ->> 0)::double precision) <= 180
          and abs((value ->> 1)::double precision) <= 90
    ), agg as (
        select
            id,
            started_at,
            jsonb_agg(
                jsonb_build_array((value ->> 0)::double precision, (value ->> 1)::double precision)
                order by ord
            ) as points
        from kept
        group by id, started_at
    )
    select
        row_number() over (order by started_at desc)::text as track_id,
        points
    from agg
    where jsonb_array_length(points) >= 2
    order by started_at desc;
end;
$function$;

grant execute on function public.admin_get_route_tracks(timestamptz, timestamptz, integer, integer) to authenticated;
```

- [ ] **Step 2: Apply the identical function to the hosted instance**

Load the hosted migration tool first: `ToolSearch` query `select:mcp__claude_ai_Supabase__apply_migration`, then call it with the **same** name and SQL as Step 1.

- [ ] **Step 3: Smoke-test the query logic on both instances (guard-free)**

`is_admin()` is false under the MCP service role, so test the inner logic directly. Run on `mcp__parksafe-self__execute_sql` and again on `mcp__claude_ai_Supabase__execute_sql`:

```sql
with base as (
    select rs.id, rs.started_at, rs.track_points, jsonb_array_length(rs.track_points) as n
    from public.ride_summaries rs
    where jsonb_typeof(rs.track_points) = 'array' and jsonb_array_length(rs.track_points) >= 2
      and rs.started_at >= now() - interval '90 days'
    order by rs.started_at desc limit 2000
), expanded as (
    select b.id, b.started_at, b.n,
           greatest(1, ceil(b.n::numeric / 300))::int as stride, elem.value, elem.ord
    from base b
    cross join lateral jsonb_array_elements(b.track_points) with ordinality as elem(value, ord)
), kept as (
    select id, started_at, value, ord from expanded
    where (((ord - 1) % stride) = 0 or ord = n)
      and jsonb_typeof(value) = 'array' and jsonb_array_length(value) >= 2
), agg as (
    select id, jsonb_agg(jsonb_build_array((value->>0)::double precision,(value->>1)::double precision) order by ord) as points
    from kept group by id, started_at
)
select count(*) as track_count, coalesce(sum(jsonb_array_length(points)),0) as total_points
from agg where jsonb_array_length(points) >= 2;
```

Expected: `track_count` > 0 (≈ hundreds for 90 days on self-hosted), `total_points` > 0. On both instances.

- [ ] **Step 4: Confirm the function exists on both instances**

Run on both `execute_sql`:

```sql
select proname, pg_get_function_identity_arguments(oid) as args
from pg_proc where proname = 'admin_get_route_tracks';
```

Expected: one row, args `p_start_at timestamp with time zone, p_end_at timestamp with time zone, p_limit integer, p_max_points integer`.

---

## Task 2: Add the `TrackHeatLayer` canvas overlay

**Files:**
- Create: `src/components/admin/trackHeatLayer.ts`
- Modify (commit only): `src/components/admin/InteractiveRouteMap.tsx`

- [ ] **Step 1: Create `src/components/admin/trackHeatLayer.ts`**

```ts
'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Leaflet from 'leaflet';

/** A single ride track as an ordered list of [lng, lat] pairs. */
export type Track = { points: [number, number][] };

export interface TrackHeatLayerOptions {
    /** Base hue of the additive glow. */
    color?: string;
    /** Width (px) of the soft halo pass. */
    haloWidth?: number;
    /** Width (px) of the bright core pass. */
    coreWidth?: number;
    /** Alpha of the halo pass (additive accumulation). */
    haloAlpha?: number;
    /** Alpha of the core pass (additive accumulation). */
    coreAlpha?: number;
}

/** Public shape of the layer returned by the factory. */
export interface TrackHeatLayer extends Leaflet.Layer {
    setTracks(tracks: Track[]): void;
}

/**
 * Build a Strava-style additive track-heat layer bound to the runtime Leaflet
 * instance `L`. Leaflet is import()-ed lazily on the client (it touches `window`
 * at import), so the layer class is created here rather than at module load.
 *
 * All tracks are stroked onto a single 2D canvas in the map's overlayPane using
 * `globalCompositeOperation = 'lighter'`, so overlapping rides accumulate toward
 * white-hot. No WebGL is used. The canvas redraws only on zoom/move/resize end;
 * during a pan the overlayPane transform keeps it aligned. The canvas is hidden
 * during the zoom animation and redrawn (at the new scale) on zoomend.
 */
export function createTrackHeatLayer(
    L: typeof Leaflet,
    tracks: Track[],
    options: TrackHeatLayerOptions = {}
): TrackHeatLayer {
    const opts = {
        color: options.color ?? '#16f2c8',
        haloWidth: options.haloWidth ?? 6,
        coreWidth: options.coreWidth ?? 1.5,
        haloAlpha: options.haloAlpha ?? 0.06,
        coreAlpha: options.coreAlpha ?? 0.18,
    };

    const Impl = L.Layer.extend({
        initialize(this: any, initial: Track[]) {
            this._tracks = initial;
        },

        onAdd(this: any, map: Leaflet.Map) {
            this._leafletMap = map;
            const size = map.getSize();
            const canvas = L.DomUtil.create('canvas', 'parksafe-track-heat') as HTMLCanvasElement;
            canvas.width = size.x;
            canvas.height = size.y;
            canvas.style.position = 'absolute';
            canvas.style.left = '0';
            canvas.style.top = '0';
            canvas.style.pointerEvents = 'none';
            this._canvas = canvas;
            map.getPane('overlayPane')!.appendChild(canvas);

            this._boundReset = () => this._reset();
            this._boundHide = () => { if (this._canvas) this._canvas.style.visibility = 'hidden'; };
            this._boundResize = () => this._onResize();

            map.on('moveend', this._boundReset);
            map.on('zoomstart', this._boundHide);
            map.on('zoomend', this._boundReset);
            map.on('resize', this._boundResize);
            this._reset();
            return this;
        },

        onRemove(this: any, map: Leaflet.Map) {
            map.off('moveend', this._boundReset);
            map.off('zoomstart', this._boundHide);
            map.off('zoomend', this._boundReset);
            map.off('resize', this._boundResize);
            if (this._canvas) { this._canvas.remove(); this._canvas = null; }
            this._leafletMap = null;
            return this;
        },

        setTracks(this: any, next: Track[]) {
            this._tracks = next;
            if (this._leafletMap) this._reset();
        },

        _onResize(this: any) {
            const map = this._leafletMap as Leaflet.Map | null;
            const canvas = this._canvas as HTMLCanvasElement | null;
            if (!map || !canvas) return;
            const size = map.getSize();
            canvas.width = size.x;
            canvas.height = size.y;
            this._reset();
        },

        _reset(this: any) {
            const map = this._leafletMap as Leaflet.Map | null;
            const canvas = this._canvas as HTMLCanvasElement | null;
            if (!map || !canvas) return;
            const topLeft = map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(canvas, topLeft);
            canvas.style.visibility = 'visible';
            this._redraw();
        },

        _redraw(this: any) {
            const map = this._leafletMap as Leaflet.Map | null;
            const canvas = this._canvas as HTMLCanvasElement | null;
            if (!map || !canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const origin = map.containerPointToLayerPoint([0, 0]);
            const tracksList = this._tracks as Track[];

            const pass = (width: number, alpha: number) => {
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = opts.color;
                ctx.lineWidth = width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                for (const track of tracksList) {
                    const pts = track.points;
                    if (pts.length < 2) continue;
                    ctx.beginPath();
                    for (let i = 0; i < pts.length; i++) {
                        const p = map.latLngToLayerPoint([pts[i][1], pts[i][0]]).subtract(origin);
                        if (i === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    }
                    ctx.stroke();
                }
            };

            pass(opts.haloWidth, opts.haloAlpha);
            pass(opts.coreWidth, opts.coreAlpha);
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        },
    });

    return new Impl(tracks) as unknown as TrackHeatLayer;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (`leaflet` + `@types/leaflet` are already installed; `leaflet.heat` is still installed and `RouteHeatmapTab.tsx` still builds.)

- [ ] **Step 3: Lint the new file**

Run: `npx eslint src/components/admin/trackHeatLayer.ts`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/trackHeatLayer.ts src/components/admin/InteractiveRouteMap.tsx
git commit -m "feat(admin): add Leaflet TrackHeatLayer; harden InteractiveRouteMap WebGL cleanup" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: Rewire `RouteHeatmapTab.tsx` to the track heatmap

**Files:**
- Modify (full replace): `src/components/admin/RouteHeatmapTab.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Activity, CalendarDays, Loader2, MapPinned, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { createTrackHeatLayer, type Track, type TrackHeatLayer } from './trackHeatLayer';

type RangeKey = '30d' | '90d' | '365d' | 'all';

const rangeLabels: Record<RangeKey, string> = {
    '30d': '30 nap',
    '90d': '90 nap',
    '365d': '12 hónap',
    all: 'Minden adat',
};

const startForRange = (range: RangeKey) => {
    if (range === 'all') return null;
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
};

/** Parse the admin_get_route_tracks RPC result into validated [lng,lat] tracks. */
const asTracks = (data: unknown): Track[] => {
    if (!Array.isArray(data)) return [];
    return data.flatMap((row) => {
        const raw = (row as { points?: unknown }).points;
        if (!Array.isArray(raw)) return [];
        const points: [number, number][] = [];
        for (const pair of raw) {
            if (!Array.isArray(pair) || pair.length < 2) continue;
            const lng = Number(pair[0]);
            const lat = Number(pair[1]);
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
            if (Math.abs(lng) > 180 || Math.abs(lat) > 90) continue;
            points.push([lng, lat]);
        }
        return points.length >= 2 ? [{ points }] : [];
    });
};

export default function RouteHeatmapTab() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<Leaflet.Map | null>(null);
    // Leaflet touches `window` at import time, so it can't be SSR'd — import()-ed
    // lazily on the client and kept in refs for the layer effect.
    const LRef = useRef<typeof Leaflet | null>(null);
    const layerRef = useRef<TrackHeatLayer | null>(null);
    const [ready, setReady] = useState(false);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [range, setRange] = useState<RangeKey>('90d');
    const [loading, setLoading] = useState(true);

    // Initialise the map once, client-side only.
    useEffect(() => {
        let cancelled = false;

        (async () => {
            const mod = await import('leaflet');
            const L = ((mod as unknown as { default?: typeof Leaflet }).default ?? mod) as typeof Leaflet;

            if (cancelled || !containerRef.current || mapRef.current) return;

            const map = L.map(containerRef.current, {
                center: [46.253, 20.1414],
                zoom: 12,
                zoomControl: false,
                preferCanvas: true,
            });
            L.control.zoom({ position: 'topright' }).addTo(map);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
                subdomains: 'abcd',
                maxZoom: 19,
                opacity: 0.95,
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            }).addTo(map);

            LRef.current = L;
            mapRef.current = map;
            window.requestAnimationFrame(() => map.invalidateSize());
            setReady(true);
        })();

        return () => {
            cancelled = true;
            layerRef.current = null;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            LRef.current = null;
            setReady(false);
        };
    }, []);

    // Load tracks whenever the range changes.
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase.rpc('admin_get_route_tracks', {
                    p_start_at: startForRange(range),
                    p_end_at: null,
                    p_limit: 2000,
                    p_max_points: 300,
                });
                if (error) throw error;
                if (!cancelled) setTracks(asTracks(data));
            } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn(err instanceof Error ? err.message : 'Route tracks RPC failed');
                }
                if (!cancelled) {
                    setTracks([]);
                    toast.error('Hiba az útvonal hőtérkép betöltésekor');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [range]);

    // Draw / update the track layer whenever tracks (or map readiness) change.
    useEffect(() => {
        const L = LRef.current;
        const map = mapRef.current;
        if (!L || !map) return;

        if (layerRef.current) {
            layerRef.current.setTracks(tracks);
        } else {
            layerRef.current = createTrackHeatLayer(L, tracks);
            layerRef.current.addTo(map);
        }

        // Fit to the bounding box of all points (min/max avoids a huge array).
        let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
        for (const t of tracks) {
            for (const [lng, lat] of t.points) {
                if (lat < minLat) minLat = lat;
                if (lat > maxLat) maxLat = lat;
                if (lng < minLng) minLng = lng;
                if (lng > maxLng) maxLng = lng;
            }
        }
        if (Number.isFinite(minLat) && Number.isFinite(minLng)) {
            map.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [48, 48], maxZoom: 14 });
        }
    }, [tracks, ready]);

    const stats = useMemo(() => {
        const totalPoints = tracks.reduce((sum, t) => sum + t.points.length, 0);
        return { rides: tracks.length, totalPoints };
    }, [tracks]);

    return (
        <div className="flex flex-col gap-4 h-full min-h-[720px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    {(Object.keys(rangeLabels) as RangeKey[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => setRange(key)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${range === key
                                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                                }`}
                        >
                            <CalendarDays className="w-3.5 h-3.5" />
                            {rangeLabels[key]}
                        </button>
                    ))}
                </div>

                <div className="inline-flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    minden rögzített ride nyomvonala megjelenik
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Stat label="Ride-ok" value={stats.rides.toLocaleString('hu-HU')} icon={MapPinned} />
                <Stat label="Nyomvonal pontok" value={stats.totalPoints.toLocaleString('hu-HU')} icon={Activity} />
                <Stat label="Időszak" value={rangeLabels[range]} icon={CalendarDays} />
            </div>

            <div className="relative flex-1 min-h-[560px] overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
                <div ref={containerRef} className="absolute inset-0 z-0" />
                {loading && (
                    <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/45">
                        <Loader2 className="w-7 h-7 animate-spin text-green-400" />
                    </div>
                )}
                {!loading && tracks.length === 0 && (
                    <div className="absolute inset-x-4 top-4 z-[1100] rounded-xl border border-white/10 bg-[#111111]/95 p-4 shadow-xl">
                        <p className="text-sm font-semibold text-white">Nincs megjeleníthető nyomvonal</p>
                        <p className="mt-1 text-xs text-zinc-400">A kiválasztott időszakban nincs rögzített útvonal.</p>
                    </div>
                )}
                <div className="absolute bottom-4 left-4 z-[1100] w-56 rounded-xl border border-white/10 bg-[#111111]/95 p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        <span>Ritka</span>
                        <span>Gyakori</span>
                    </div>
                    <div className="h-2 rounded-full bg-gradient-to-r from-zinc-700 via-[#16f2c8] to-white" />
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Activity }) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#111111] p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
                    <p className="mt-1 text-xl font-bold text-white">{value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10">
                    <Icon className="h-5 w-5 text-green-400" />
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (`asTracks` is pure; the RPC call compiles because the Supabase client is untyped — `createBrowserClient(url, key)` with no `<Database>` generic.)

- [ ] **Step 3: Lint**

Run: `npx eslint src/components/admin/RouteHeatmapTab.tsx`
Expected: no errors. (No more `leaflet.heat` import; no unused symbols.)

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/RouteHeatmapTab.tsx
git commit -m "feat(admin): render cyclist route tracks as a Strava-style heatmap" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: Drop the now-unused `leaflet.heat` dependency and verify the build

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Confirm `leaflet.heat` is no longer referenced**

Run: `npx eslint --no-eslintrc --rule '{}' /dev/null` is not needed — instead grep:
Run: `git grep -n "leaflet.heat" -- src` (PowerShell: `Select-String -Path src -Pattern "leaflet.heat" -Recurse`)
Expected: **no matches** in `src/`.

- [ ] **Step 2: Uninstall the package and its types**

Run: `npm uninstall leaflet.heat @types/leaflet.heat`
Expected: removes 2 packages; updates `package.json` + `package-lock.json`.

- [ ] **Step 3: Full typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, static pages generated, `/admin/[[...slug]]` listed, exit 0, no `window is not defined`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(admin): drop unused leaflet.heat after track-heatmap switch" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: Manual verification (browser)

**Files:** none.

- [ ] **Step 1: Run the app and open the tab**

Run: `npm run dev`, log in as admin (`admin@parksafe.hu`), open `http://localhost:3000/admin/route-heatmap`.

- [ ] **Step 2: Confirm behaviour**

Check:
- Ride tracks render as glowing lines on the dark map; busy corridors are brighter/whiter.
- The three stat cards show **Ride-ok**, **Nyomvonal pontok**, **Időszak** with sane numbers.
- Switching 30/90/365/all reloads and the map re-fits.
- Pan and zoom: tracks stay aligned (brief hide during the zoom animation, then redraw — expected).
- **Console has no `WebGL context was lost` and no errors.**

---

## Self-Review

**Spec coverage:**
- New RPC `admin_get_route_tracks` → Task 1. ✓ (params, downsample, is_admin guard, anonymised output)
- Both Supabase instances → Task 1 Steps 1–4. ✓
- Reuse Leaflet base; replace heat layer with additive overlay → Tasks 2–3. ✓
- `TrackHeatLayer` own file, additive two-pass, pane-aligned redraw → Task 2. ✓
- Defensive parsing (`asTracks`) → Task 3. ✓
- Stats cards (Ride-ok / Nyomvonal pontok / Időszak) + single-hue legend → Task 3. ✓
- Verification (tsc/eslint/build/manual) → Tasks 2–5. ✓
- Non-goals (export, privacy aggregation, OSM matching, deleting old RPC) → not implemented, as intended. ✓

**Placeholder scan:** No TBD/TODO; all code blocks complete; all commands explicit. The Step-1 grep alternative for PowerShell is given. ✓

**Type consistency:** `Track = { points: [number, number][] }` (lng,lat) defined in `trackHeatLayer.ts` and imported in `RouteHeatmapTab.tsx`. `createTrackHeatLayer(L, tracks, options?)` and `TrackHeatLayer.setTracks(tracks)` names match across both files. RPC param names (`p_start_at`, `p_end_at`, `p_limit`, `p_max_points`) match between SQL and the `supabase.rpc` call. Coordinate order is consistent: RPC emits `[lng, lat]`; `asTracks` keeps `[lng, lat]`; the layer reads `pts[i][1], pts[i][0]` for `[lat, lng]` into `latLngToLayerPoint`. ✓
