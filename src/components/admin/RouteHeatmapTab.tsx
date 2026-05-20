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
