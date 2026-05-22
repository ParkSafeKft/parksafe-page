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

            setExportState((prev) => {
                if (prev.imageUrl) URL.revokeObjectURL(prev.imageUrl);
                return { open: true, loading: true, imageUrl, rows: [], error: imageUrl ? null : 'image' };
            });

            try {
                const streets = await fetchOsmStreets(bounds);
                const rows = topStreets(tracksRef.current, bounds, streets);
                setExportState((prev) => ({ ...prev, loading: false, rows, error: imageUrl ? null : 'image' }));
                toast.success('Régió kész', { id: toastId });
            } catch {
                setExportState((prev) => ({ ...prev, loading: false, rows: [], error: prev.error === 'image' ? 'image' : 'streets' }));
                toast.error('Az utcaadatok lekérése nem sikerült', { id: toastId });
            }
        },
        []
    );

    // Rectangle-draw mode: drag on the map to select a region. Uses NATIVE DOM
    // events (container `mousedown` + document `mousemove`/`mouseup`) instead of
    // Leaflet's synthetic map events, so it fires reliably regardless of overlay
    // panes/renderers and works even when the mouse is released outside the map.
    useEffect(() => {
        const map = mapRef.current;
        const L = LRef.current;
        if (!map || !L || !selecting) return;

        // Non-null locals: control-flow narrowing of `map`/`L` does not reach the
        // hoisted handler functions below, so capture them as non-null consts.
        const m = map;
        const l = L;
        const containerEl = m.getContainer();
        m.dragging.disable();
        containerEl.style.cursor = 'crosshair';

        let start: Leaflet.LatLng | null = null;
        let rect: Leaflet.Rectangle | null = null;

        function finish() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            m.dragging.enable();
            containerEl.style.cursor = '';
            start = null;
            setSelecting(false);
        }
        function onMove(ev: MouseEvent) {
            if (!start || !rect) return;
            rect.setBounds(l.latLngBounds(start, m.mouseEventToLatLng(ev)));
        }
        function onUp(ev: MouseEvent) {
            const s = start;
            if (rect) { m.removeLayer(rect); rect = null; }
            if (!s) { finish(); return; }
            const end = m.mouseEventToLatLng(ev);
            const p1 = m.latLngToContainerPoint(s);
            const p2 = m.latLngToContainerPoint(end);
            finish();
            if (Math.abs(p1.x - p2.x) < 12 && Math.abs(p1.y - p2.y) < 12) return; // ignore tiny/click
            void runRegionExport({ lat: s.lat, lng: s.lng }, { lat: end.lat, lng: end.lng });
        }
        function onDown(ev: MouseEvent) {
            if (ev.button !== 0) return;
            ev.preventDefault();
            start = m.mouseEventToLatLng(ev);
            rect = l.rectangle(l.latLngBounds(start, start), {
                color: '#ffffff', weight: 2, dashArray: '6 4', fillColor: '#ffffff', fillOpacity: 0.08,
            }).addTo(m);
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        }

        containerEl.addEventListener('mousedown', onDown);
        return () => {
            containerEl.removeEventListener('mousedown', onDown);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            if (rect) m.removeLayer(rect);
            m.dragging.enable();
            containerEl.style.cursor = '';
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
