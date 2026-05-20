'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { Map as MlMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Activity, CalendarDays, Loader2, MapPinned, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

type Pt = [number, number];
type RangeKey = '30d' | '90d' | '365d' | 'all';

interface HeatmapPoint {
    point_id: string;
    longitude: number;
    latitude: number;
    sample_count: number;
    ride_count: number;
    user_count: number;
    intensity: number;
}

const SOURCE_ID = 'admin-ride-heatmap-points';
const HEAT_LAYER_ID = 'admin-ride-heatmap';
const STYLE: maplibregl.StyleSpecification = {
    version: 8,
    sources: {
        carto: {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', 'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', 'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        },
    },
    layers: [
        {
            id: 'carto-light',
            type: 'raster',
            source: 'carto',
            paint: {
                'raster-opacity': 0.76,
                'raster-saturation': -0.15,
                'raster-brightness-min': 0.08,
                'raster-brightness-max': 0.95,
            },
        },
    ],
};

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

const asPoints = (data: unknown): HeatmapPoint[] => {
    if (!Array.isArray(data)) return [];

    return data.flatMap((row) => {
        const item = row as Partial<HeatmapPoint>;
        const lng = Number(item.longitude);
        const lat = Number(item.latitude);
        const sampleCount = Number(item.sample_count ?? 0);
        const rideCount = Number(item.ride_count ?? 0);
        const userCount = Number(item.user_count ?? 0);
        const intensity = Number(item.intensity ?? 0);

        if (!item.point_id) return [];
        if (![lng, lat, sampleCount, rideCount, userCount, intensity].every(Number.isFinite)) return [];
        if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return [];

        return [{
            point_id: item.point_id,
            longitude: lng,
            latitude: lat,
            sample_count: sampleCount,
            ride_count: rideCount,
            user_count: userCount,
            intensity: Math.max(0, Math.min(1, intensity)),
        }];
    });
};

export default function RouteHeatmapTab() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MlMap | null>(null);
    const [points, setPoints] = useState<HeatmapPoint[]>([]);
    const [range, setRange] = useState<RangeKey>('90d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: STYLE,
            center: [20.1414, 46.253],
            zoom: 12,
            attributionControl: { compact: true },
        });

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
        map.once('load', () => window.requestAnimationFrame(() => map.resize()));
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase.rpc('admin_get_route_heatmap_points', {
                    p_start_at: startForRange(range),
                    p_end_at: null,
                    p_grid_precision: 4,
                    p_limit: 20000,
                });

                if (error) throw error;
                if (!cancelled) setPoints(asPoints(data));
            } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                    const message = err instanceof Error ? err.message : 'Route heatmap RPC failed';
                    console.warn(message);
                }
                if (!cancelled) {
                    setPoints([]);
                    toast.error('Hiba az útvonal hőtérkép betöltésekor');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [range]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const featureCollection: GeoJSON.FeatureCollection<GeoJSON.Point> = {
            type: 'FeatureCollection',
            features: points.map((point) => ({
                type: 'Feature',
                id: point.point_id,
                properties: {
                    sample_count: point.sample_count,
                    ride_count: point.ride_count,
                    user_count: point.user_count,
                    intensity: Math.max(0.05, point.intensity),
                },
                geometry: {
                    type: 'Point',
                    coordinates: [point.longitude, point.latitude],
                },
            })),
        };

        const apply = () => {
            map.resize();

            const source = map.getSource(SOURCE_ID);
            if (source) {
                (source as maplibregl.GeoJSONSource).setData(featureCollection);
            } else {
                map.addSource(SOURCE_ID, { type: 'geojson', data: featureCollection });
                map.addLayer({
                    id: HEAT_LAYER_ID,
                    type: 'heatmap',
                    source: SOURCE_ID,
                    maxzoom: 18,
                    paint: {
                        'heatmap-weight': [
                            'interpolate',
                            ['linear'],
                            ['coalesce', ['get', 'intensity'], 0],
                            0, 0,
                            0.18, 0.35,
                            0.45, 0.78,
                            1, 1.25,
                        ],
                        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 0.9, 13, 2.2, 16, 3.6],
                        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 12, 12, 24, 15, 42, 17, 58],
                        'heatmap-opacity': 0.9,
                        'heatmap-color': [
                            'interpolate',
                            ['linear'],
                            ['heatmap-density'],
                            0, 'rgba(0,0,255,0)',
                            0.08, 'rgba(66,82,255,0.42)',
                            0.22, 'rgba(0,229,255,0.64)',
                            0.38, 'rgba(0,255,108,0.72)',
                            0.56, 'rgba(255,242,0,0.84)',
                            0.74, 'rgba(255,112,0,0.9)',
                            1, 'rgba(255,0,0,0.96)',
                        ],
                    },
                });
            }

            if (points.length > 0) {
                const bounds = points.reduce(
                    (b, point) => b.extend([point.longitude, point.latitude]),
                    new maplibregl.LngLatBounds([points[0].longitude, points[0].latitude], [points[0].longitude, points[0].latitude])
                );
                map.fitBounds(bounds, { padding: 48, duration: 450, maxZoom: 14 });
            }
        };

        if (map.isStyleLoaded()) apply();
        else map.once('load', apply);
    }, [points]);

    const stats = useMemo(() => {
        const sampleTotal = points.reduce((sum, point) => sum + point.sample_count, 0);
        const maxRideCount = points.reduce((max, point) => Math.max(max, point.ride_count), 0);
        const maxUserCount = points.reduce((max, point) => Math.max(max, point.user_count), 0);
        return { sampleTotal, maxRideCount, maxUserCount };
    }, [points]);

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
                    minden rögzített ride mintapont megjelenik
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Stat label="Heatmap pontok" value={points.length.toLocaleString('hu-HU')} icon={MapPinned} />
                <Stat label="Mintapont súly" value={stats.sampleTotal.toLocaleString('hu-HU')} icon={Activity} />
                <Stat label="Legerősebb cella" value={`${stats.maxRideCount} út / ${stats.maxUserCount} user`} icon={ShieldCheck} />
            </div>

            <div className="relative flex-1 min-h-[560px] overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
                <div ref={containerRef} className="absolute inset-0" />
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45">
                        <Loader2 className="w-7 h-7 animate-spin text-green-400" />
                    </div>
                )}
                {!loading && points.length === 0 && (
                    <div className="absolute inset-x-4 top-4 z-10 rounded-xl border border-white/10 bg-[#111111]/95 p-4 shadow-xl">
                        <p className="text-sm font-semibold text-white">Nincs megjeleníthető hőtérkép adat</p>
                        <p className="mt-1 text-xs text-zinc-400">A kiválasztott időszakban nincs rögzített útvonalpont.</p>
                    </div>
                )}
                <div className="absolute bottom-4 left-4 z-10 w-56 rounded-xl border border-white/10 bg-[#111111]/95 p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        <span>Ritka</span>
                        <span>Gyakori</span>
                    </div>
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 via-green-400 via-yellow-300 via-orange-500 to-red-600" />
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
