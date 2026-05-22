# Region Export + Fullscreen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin drag a rectangle on the route heatmap to export that region as a PNG plus a CSV/table of the top streets cyclists use (with approximate ride counts), and toggle the map to fullscreen.

**Architecture:** All client-side. A pure-logic module matches the already-loaded ride tracks to OpenStreetMap streets (Overpass API, nearest-segment within 30 m) and counts distinct rides per street. The map region is captured with `html-to-image` and cropped to the drawn rectangle. Results show in an in-wrapper overlay panel (so it stays visible in fullscreen). Fullscreen uses the browser Fullscreen API on the map wrapper.

**Tech Stack:** Next.js 16 (`'use client'`), Leaflet (lazy-imported), `html-to-image`, Overpass API, TypeScript.

---

## Project constraints (read first)

- **No test runner** (no vitest/jest). Do NOT add one. Verify with `npx tsc --noEmit`, `npx eslint <files>`, `npm run build`, and manual checks.
- Branch: `feat/route-track-heatmap` (NOT main; already pushed). Spec: `docs/superpowers/specs/2026-05-21-region-export-fullscreen-design.md`.
- Commit messages MUST end with: `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`
- Coordinate convention across the codebase: track points are `[lng, lat]`.
- `Track` type (`{ points: [number, number][] }`), `createTrackHeatLayer`, `TrackHeatLayer` are exported from `src/components/admin/trackHeatLayer.ts`.
- The Supabase client is untyped; the existing RPC call stays unchanged.

---

## File Structure

- **Create `src/components/admin/regionExport.ts`** — pure logic (no React, no DOM capture): bounds helper, Overpass fetch, nearest-street matching → top streets, CSV serialization.
- **Create `src/components/admin/RegionExportPanel.tsx`** — presentational overlay panel (image preview, streets table, download buttons, loading/error states). No data fetching.
- **Modify `src/components/admin/RouteHeatmapTab.tsx`** — region-select button + rectangle draw, fullscreen toggle, orchestration (capture + match), render the panel. Adds `crossOrigin` to tiles. Contains the `html-to-image` capture helper.
- **Modify `package.json` / `package-lock.json`** — add `html-to-image`.

---

## Task 1: Add the `html-to-image` dependency

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install**

Run: `npm install html-to-image`
Expected: adds 1 package; updates `package.json` (dependencies) + `package-lock.json`.

- [ ] **Step 2: Confirm**

Run: `node -e "console.log(require('html-to-image/package.json').version)"`
Expected: prints a version (e.g. `1.x.x`), exit 0.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add html-to-image for region PNG export" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: Create the region-export logic module

**Files:**
- Create: `src/components/admin/regionExport.ts`

- [ ] **Step 1: Create the file with EXACTLY this content:**

```ts
import type { Track } from './trackHeatLayer';

/** Geographic bounding box. */
export interface Bounds {
    south: number;
    west: number;
    north: number;
    east: number;
}

/** A named OSM street as an ordered list of [lng, lat] points. */
export interface OsmStreet {
    name: string;
    line: [number, number][];
}

/** A street with its distinct-ride count in the selected region. */
export interface StreetCount {
    name: string;
    rides: number;
}

const M_PER_DEG_LAT = 111320;
const mPerDegLng = (lat: number) => 111320 * Math.cos((lat * Math.PI) / 180);

/** Build a Bounds from two corner points. */
export function boundsFromCorners(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number }
): Bounds {
    return {
        south: Math.min(a.lat, b.lat),
        north: Math.max(a.lat, b.lat),
        west: Math.min(a.lng, b.lng),
        east: Math.max(a.lng, b.lng),
    };
}

/** Distance in metres from point P to segment AB (all [lng, lat]); local equirectangular approximation. */
function pointToSegmentMeters(p: [number, number], a: [number, number], b: [number, number]): number {
    const kx = mPerDegLng(p[1]);
    const ky = M_PER_DEG_LAT;
    const px = p[0] * kx, py = p[1] * ky;
    const ax = a[0] * kx, ay = a[1] * ky;
    const bx = b[0] * kx, by = b[1] * ky;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let t = len2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx, cy = ay + t * dy;
    return Math.hypot(px - cx, py - cy);
}

/** Fetch named OSM streets (highways) inside the bounds via the Overpass API. */
export async function fetchOsmStreets(bounds: Bounds, signal?: AbortSignal): Promise<OsmStreet[]> {
    const query = `[out:json][timeout:25];way["highway"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});out geom;`;
    const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal,
    });
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    const json = (await res.json()) as {
        elements?: Array<{ type: string; tags?: { name?: string }; geometry?: Array<{ lat: number; lon: number }> }>;
    };
    const out: OsmStreet[] = [];
    for (const el of json.elements ?? []) {
        if (el.type !== 'way' || !el.tags?.name || !Array.isArray(el.geometry)) continue;
        const line = el.geometry.map((g) => [g.lon, g.lat] as [number, number]);
        if (line.length >= 2) out.push({ name: el.tags.name, line });
    }
    return out;
}

/**
 * Match each in-bounds track point to its nearest street segment (within `thresholdMeters`)
 * and count DISTINCT rides per street. Returns the top `limit` streets, busiest first.
 */
export function topStreets(
    tracks: Track[],
    bounds: Bounds,
    streets: OsmStreet[],
    opts: { thresholdMeters?: number; limit?: number } = {}
): StreetCount[] {
    const threshold = opts.thresholdMeters ?? 30;
    const limit = opts.limit ?? 15;
    const degPad = (threshold / M_PER_DEG_LAT) * 1.5;

    interface Seg {
        name: string;
        a: [number, number];
        b: [number, number];
        minLng: number; maxLng: number; minLat: number; maxLat: number;
    }
    const segs: Seg[] = [];
    for (const st of streets) {
        for (let i = 0; i < st.line.length - 1; i++) {
            const a = st.line[i], b = st.line[i + 1];
            segs.push({
                name: st.name, a, b,
                minLng: Math.min(a[0], b[0]), maxLng: Math.max(a[0], b[0]),
                minLat: Math.min(a[1], b[1]), maxLat: Math.max(a[1], b[1]),
            });
        }
    }

    const ridesByStreet = new Map<string, Set<number>>();
    tracks.forEach((track, idx) => {
        for (const pt of track.points) {
            const [lng, lat] = pt;
            if (lat < bounds.south || lat > bounds.north || lng < bounds.west || lng > bounds.east) continue;
            let best = threshold;
            let bestName: string | null = null;
            for (const s of segs) {
                if (lng < s.minLng - degPad || lng > s.maxLng + degPad || lat < s.minLat - degPad || lat > s.maxLat + degPad) continue;
                const d = pointToSegmentMeters(pt, s.a, s.b);
                if (d < best) { best = d; bestName = s.name; }
            }
            if (bestName) {
                let set = ridesByStreet.get(bestName);
                if (!set) { set = new Set(); ridesByStreet.set(bestName, set); }
                set.add(idx);
            }
        }
    });

    return [...ridesByStreet.entries()]
        .map(([name, set]) => ({ name, rides: set.size }))
        .sort((x, y) => y.rides - x.rides || x.name.localeCompare(y.name, 'hu'))
        .slice(0, limit);
}

/** Serialize street counts to CSV (Hungarian header). */
export function toCsv(rows: StreetCount[]): string {
    const escape = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
    const body = rows.map((r) => `${escape(r.name)},${r.rides}`).join('\n');
    return `Utca,Ride-ok\n${body}\n`;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/components/admin/regionExport.ts`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/regionExport.ts
git commit -m "feat(admin): region-export logic (Overpass street match + CSV)" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: Create the export panel UI

**Files:**
- Create: `src/components/admin/RegionExportPanel.tsx`

- [ ] **Step 1: Create the file with EXACTLY this content:**

```tsx
'use client';

import { Download, Loader2, X } from 'lucide-react';
import type { StreetCount } from './regionExport';

interface RegionExportPanelProps {
    loading: boolean;
    imageUrl: string | null;
    rows: StreetCount[];
    error: 'image' | 'streets' | null;
    onClose: () => void;
    onDownloadPng: () => void;
    onDownloadCsv: () => void;
}

export default function RegionExportPanel({
    loading, imageUrl, rows, error, onClose, onDownloadPng, onDownloadCsv,
}: RegionExportPanelProps) {
    return (
        <div className="absolute inset-0 z-[1200] flex items-center justify-center bg-black/60 p-4">
            <div className="flex w-full max-w-3xl max-h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 p-4">
                    <h3 className="text-sm font-bold text-white">Régió export</h3>
                    <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Bezárás">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-col gap-4 overflow-auto p-4 md:flex-row">
                    <div className="md:w-1/2">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Kép</p>
                        <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
                            {imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imageUrl} alt="Régió előnézet" className="h-auto w-full" />
                            ) : (
                                <div className="flex h-40 items-center justify-center px-4 text-center text-xs text-zinc-500">
                                    {error === 'image' ? 'A kép mentése nem sikerült (csempe CORS).' : 'Nincs kép.'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:w-1/2">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Top utcák</p>
                        <div className="rounded-lg border border-white/10">
                            {loading ? (
                                <div className="flex h-40 items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-green-400" />
                                </div>
                            ) : rows.length === 0 ? (
                                <div className="flex h-40 items-center justify-center px-4 text-center text-xs text-zinc-500">
                                    {error === 'streets' ? 'Az utcaadatok lekérése nem sikerült.' : 'Nincs utca a kijelölt régióban.'}
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                                            <th className="p-2 font-bold">Utca</th>
                                            <th className="p-2 text-right font-bold">Ride-ok</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((r) => (
                                            <tr key={r.name} className="border-b border-white/5 last:border-0">
                                                <td className="p-2 text-zinc-200">{r.name}</td>
                                                <td className="p-2 text-right font-bold text-green-400">{r.rides.toLocaleString('hu-HU')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-white/10 p-4">
                    <button
                        onClick={onDownloadCsv}
                        disabled={loading || rows.length === 0}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-40"
                    >
                        <Download className="h-3.5 w-3.5" /> CSV letöltése
                    </button>
                    <button
                        onClick={onDownloadPng}
                        disabled={!imageUrl}
                        className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/15 px-3 py-2 text-xs font-bold text-green-400 hover:bg-green-500/25 disabled:opacity-40"
                    >
                        <Download className="h-3.5 w-3.5" /> PNG letöltése
                    </button>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/components/admin/RegionExportPanel.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/RegionExportPanel.tsx
git commit -m "feat(admin): region export panel (preview + top-streets table)" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: Wire region select, capture, fullscreen, and panel into RouteHeatmapTab

**Files:**
- Modify (full replace): `src/components/admin/RouteHeatmapTab.tsx`

- [ ] **Step 1: Replace the ENTIRE file with EXACTLY this content:**

```tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toCanvas } from 'html-to-image';
import { Activity, CalendarDays, Crop, Loader2, MapPinned, Maximize, Minimize } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { createTrackHeatLayer, type Track, type TrackHeatLayer } from './trackHeatLayer';
import RegionExportPanel from './RegionExportPanel';
import { boundsFromCorners, fetchOsmStreets, topStreets, toCsv, type StreetCount } from './regionExport';

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

/** Capture a DOM element with html-to-image and crop to a pixel rectangle → PNG blob. */
async function captureRegionPng(
    el: HTMLElement,
    rect: { x: number; y: number; w: number; h: number }
): Promise<Blob | null> {
    const full = await toCanvas(el, { pixelRatio: 1, cacheBust: true });
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(rect.w));
    out.height = Math.max(1, Math.round(rect.h));
    const ctx = out.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(full, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    return await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/png'));
}

function triggerDownload(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

interface ExportState {
    open: boolean;
    loading: boolean;
    imageUrl: string | null;
    rows: StreetCount[];
    error: 'image' | 'streets' | null;
}

const CLOSED_EXPORT: ExportState = { open: false, loading: false, imageUrl: null, rows: [], error: null };

export default function RouteHeatmapTab() {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<Leaflet.Map | null>(null);
    // Leaflet touches `window` at import time, so it can't be SSR'd — import()-ed
    // lazily on the client and kept in refs for the layer/draw effects.
    const LRef = useRef<typeof Leaflet | null>(null);
    const layerRef = useRef<TrackHeatLayer | null>(null);
    const tracksRef = useRef<Track[]>([]);
    const [ready, setReady] = useState(false);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [range, setRange] = useState<RangeKey>('90d');
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [exportState, setExportState] = useState<ExportState>(CLOSED_EXPORT);

    tracksRef.current = tracks;

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
                crossOrigin: 'anonymous',
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
                    // No ride cap — the RPC trims a 300 m privacy radius off each
                    // track's start/end, so every ride can safely go into the heatmap.
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

    // Run the export for a drawn rectangle: capture PNG, fetch OSM streets, match, open panel.
    const runRegionExport = useCallback(
        async (c1: { lat: number; lng: number }, c2: { lat: number; lng: number }) => {
            const map = mapRef.current;
            const container = containerRef.current;
            if (!map || !container) return;

            const p1 = map.latLngToContainerPoint([c1.lat, c1.lng]);
            const p2 = map.latLngToContainerPoint([c2.lat, c2.lng]);
            const rectPx = {
                x: Math.min(p1.x, p2.x),
                y: Math.min(p1.y, p2.y),
                w: Math.abs(p1.x - p2.x),
                h: Math.abs(p1.y - p2.y),
            };
            const bounds = boundsFromCorners(c1, c2);

            const toastId = toast.loading('Régió exportálása…');

            let imageUrl: string | null = null;
            try {
                const blob = await captureRegionPng(container, rectPx);
                if (blob) imageUrl = URL.createObjectURL(blob);
            } catch {
                imageUrl = null;
            }

            setExportState({ open: true, loading: true, imageUrl, rows: [], error: imageUrl ? null : 'image' });

            try {
                const streets = await fetchOsmStreets(bounds);
                const rows = topStreets(tracksRef.current, bounds, streets);
                setExportState((prev) => ({ ...prev, loading: false, rows, error: imageUrl ? null : 'image' }));
                toast.success('Régió kész', { id: toastId });
            } catch {
                setExportState((prev) => ({ ...prev, loading: false, rows: [], error: 'streets' }));
                toast.error('Az utcaadatok lekérése nem sikerült', { id: toastId });
            }
        },
        []
    );

    // Rectangle-draw mode: drag on the map to select a region.
    useEffect(() => {
        const map = mapRef.current;
        const L = LRef.current;
        if (!map || !L || !selecting) return;

        map.dragging.disable();
        map.getContainer().style.cursor = 'crosshair';

        let start: Leaflet.LatLng | null = null;
        let rect: Leaflet.Rectangle | null = null;

        const finish = () => {
            setSelecting(false);
            map.dragging.enable();
            map.getContainer().style.cursor = '';
            start = null;
        };

        const onDown = (e: Leaflet.LeafletMouseEvent) => {
            start = e.latlng;
            rect = L.rectangle([[e.latlng.lat, e.latlng.lng], [e.latlng.lat, e.latlng.lng]], {
                color: '#22c55e', weight: 2, fillOpacity: 0.1,
            }).addTo(map);
        };
        const onMove = (e: Leaflet.LeafletMouseEvent) => {
            if (start && rect) rect.setBounds(L.latLngBounds(start, e.latlng));
        };
        const onUp = (e: Leaflet.LeafletMouseEvent) => {
            const startLatLng = start;
            const p1 = startLatLng ? map.latLngToContainerPoint(startLatLng) : null;
            const p2 = map.latLngToContainerPoint(e.latlng);
            if (rect) { map.removeLayer(rect); rect = null; }
            finish();
            if (!startLatLng || !p1) return;
            if (Math.abs(p1.x - p2.x) < 12 || Math.abs(p1.y - p2.y) < 12) return; // ignore tiny/click
            void runRegionExport(
                { lat: startLatLng.lat, lng: startLatLng.lng },
                { lat: e.latlng.lat, lng: e.latlng.lng }
            );
        };

        map.on('mousedown', onDown);
        map.on('mousemove', onMove);
        map.on('mouseup', onUp);
        return () => {
            map.off('mousedown', onDown);
            map.off('mousemove', onMove);
            map.off('mouseup', onUp);
            if (rect) map.removeLayer(rect);
            map.dragging.enable();
            map.getContainer().style.cursor = '';
        };
    }, [selecting, runRegionExport]);

    // Keep the React fullscreen flag in sync and resize the map after the transition.
    useEffect(() => {
        const onFsChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
            const map = mapRef.current;
            if (map) window.requestAnimationFrame(() => map.invalidateSize());
        };
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    const toggleFullscreen = () => {
        const el = wrapperRef.current;
        if (!el) return;
        if (document.fullscreenElement) {
            void document.exitFullscreen();
        } else {
            void el.requestFullscreen?.();
        }
    };

    const closeExport = () => {
        setExportState((prev) => {
            if (prev.imageUrl) URL.revokeObjectURL(prev.imageUrl);
            return CLOSED_EXPORT;
        });
    };

    const downloadPng = () => {
        if (exportState.imageUrl) triggerDownload(exportState.imageUrl, `regio-heatmap-${range}.png`);
    };

    const downloadCsv = () => {
        const csv = toCsv(exportState.rows);
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        triggerDownload(url, `regio-utcak-${range}.csv`);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

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

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setSelecting((s) => !s)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${selecting
                            ? 'bg-green-500/15 text-green-400 border-green-500/30'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                            }`}
                    >
                        <Crop className="w-3.5 h-3.5" />
                        {selecting ? 'Húzz egy téglalapot…' : 'Régió kijelölése'}
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-bold text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                        {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                        {isFullscreen ? 'Kilépés' : 'Teljes képernyő'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Stat label="Ride-ok" value={stats.rides.toLocaleString('hu-HU')} icon={MapPinned} />
                <Stat label="Nyomvonal pontok" value={stats.totalPoints.toLocaleString('hu-HU')} icon={Activity} />
                <Stat label="Időszak" value={rangeLabels[range]} icon={CalendarDays} />
            </div>

            <div ref={wrapperRef} className="relative flex-1 min-h-[560px] overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
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
                    <div className="h-2 rounded-full bg-gradient-to-r from-zinc-800 via-[#22c55e] to-white" />
                </div>
                {exportState.open && (
                    <RegionExportPanel
                        loading={exportState.loading}
                        imageUrl={exportState.imageUrl}
                        rows={exportState.rows}
                        error={exportState.error}
                        onClose={closeExport}
                        onDownloadPng={downloadPng}
                        onDownloadCsv={downloadCsv}
                    />
                )}
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
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/components/admin/RouteHeatmapTab.tsx`
Expected: no errors. (`useCallback` is imported; no unused icons — `ShieldCheck` removed; `selecting`/`runRegionExport` are the draw effect's deps.)

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, `/admin/[[...slug]]` in the route table, exit 0, no `window is not defined`.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/RouteHeatmapTab.tsx
git commit -m "feat(admin): region export (rectangle → PNG + top-streets) and map fullscreen" -m "Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: Manual verification (browser)

**Files:** none.

- [ ] **Step 1: Run and exercise**

Run: `npm run dev`, log in as admin, open `/admin/route-heatmap`.

- [ ] **Step 2: Confirm**

- Heatmap renders green (from the previous work).
- Click **Teljes képernyő** → the map fills the screen and re-renders correctly; **Kilépés** restores it.
- Click **Régió kijelölése** → cursor becomes crosshair, map panning is disabled.
- Drag a rectangle over a busy area → a toast appears, then the **panel** opens with a PNG preview and a top-streets table (plausible street names + ride counts).
- **PNG letöltése** downloads a cropped image of the region; **CSV letöltése** downloads `Utca,Ride-ok` rows.
- Repeat the region export **while in fullscreen** — the panel is visible and works.
- Console: no errors. If the PNG preview is blank and a "CORS" message shows, note it (see plan's CORS fallback in the spec).

---

## Self-Review

**Spec coverage:**
- Region selection (drag rectangle) → Task 4 draw effect. ✓
- Export panel (preview + top-streets table + PNG/CSV buttons), in-wrapper overlay → Task 3 + Task 4 render. ✓
- Street data sheet (Overpass nearest-street, distinct rides, top 15, client-side, loaded tracks) → Task 2 `topStreets`/`fetchOsmStreets`. ✓
- Image export (`html-to-image` + crop, `crossOrigin` tiles, CORS try/catch fallback → `error:'image'`) → Task 1 + Task 4 `captureRegionPng`. ✓
- Fullscreen (Fullscreen API on wrapper, `invalidateSize`, panel-in-wrapper) → Task 4. ✓
- Privacy/approx (distinct rides, no users; trimmed/downsampled tracks) → inherited from RPC + `topStreets` counts distinct track indices. ✓

**Placeholder scan:** No TBD/TODO; all code complete; commands explicit. ✓

**Type consistency:** `Track` (`{points:[number,number][]}`) shared via `trackHeatLayer`. `StreetCount` (`{name,rides}`) defined in `regionExport`, consumed in `RegionExportPanel` and `RouteHeatmapTab`. `Bounds`/`boundsFromCorners`/`fetchOsmStreets`/`topStreets`/`toCsv` signatures match call sites. `ExportState.error` is `'image'|'streets'|null`, matching `RegionExportPanelProps.error`. Coordinate order `[lng,lat]` consistent (RPC → asTracks → topStreets bbox filter & segment match; draw passes `{lat,lng}` corners to `boundsFromCorners`/`latLngToContainerPoint`). ✓
