'use client';

import { useEffect, useRef } from 'react';
import maplibregl, { Map as MlMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type Pt = [number, number]; // [lng, lat]

interface InteractiveRouteMapProps {
    points: Pt[];
    height?: number;
    /** Polyline color in hex; defaults to green. */
    lineColor?: string;
    /** Optional user-dropped pins (yellow numbered markers) shown on top of the polyline. */
    pinPoints?: Pt[];
}

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const LINE_SOURCE_ID = 'route-line';
const LINE_LAYER_CASE_ID = 'route-line-case';
const LINE_LAYER_ID = 'route-line-main';

export default function InteractiveRouteMap({ points, height = 360, lineColor = '#22c55e', pinPoints }: InteractiveRouteMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MlMap | null>(null);
    const markersRef = useRef<Marker[]>([]);

    // Initialize map once
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        const map = new maplibregl.Map({
            container: containerRef.current,
            style: STYLE_URL,
            center: points.length ? points[0] : [19.0402, 47.4979],
            zoom: 12,
            attributionControl: { compact: true },
        });
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
        mapRef.current = map;
        return () => {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            map.remove();
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update line + markers when points or color change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const apply = () => {
            // Clear old markers
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];

            const hasLine = points.length >= 1;
            const pins = pinPoints ?? [];

            // Polyline source/layers — only when we have a routed line
            if (hasLine) {
                const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
                    type: 'Feature',
                    properties: {},
                    geometry: { type: 'LineString', coordinates: points },
                };

                const existing = map.getSource(LINE_SOURCE_ID);
                if (existing) {
                    (existing as maplibregl.GeoJSONSource).setData(geojson);
                } else {
                    map.addSource(LINE_SOURCE_ID, { type: 'geojson', data: geojson });
                    map.addLayer({
                        id: LINE_LAYER_CASE_ID,
                        type: 'line',
                        source: LINE_SOURCE_ID,
                        layout: { 'line-cap': 'round', 'line-join': 'round' },
                        paint: { 'line-color': '#000000', 'line-opacity': 0.35, 'line-width': 7 },
                    });
                    map.addLayer({
                        id: LINE_LAYER_ID,
                        type: 'line',
                        source: LINE_SOURCE_ID,
                        layout: { 'line-cap': 'round', 'line-join': 'round' },
                        paint: { 'line-color': lineColor, 'line-width': 4 },
                    });
                }
                if (map.getLayer(LINE_LAYER_ID)) {
                    map.setPaintProperty(LINE_LAYER_ID, 'line-color', lineColor);
                }
            }

            const makeBadge = (label: string, bg: string, fg: string = '#0a0a0a') => {
                const el = document.createElement('div');
                el.style.cssText = `width:24px;height:24px;border-radius:50%;background:${bg};color:${fg};font-weight:900;font-size:11px;display:flex;align-items:center;justify-content:center;border:2px solid #0a0a0a;box-shadow:0 0 0 2px ${bg}66`;
                el.textContent = label;
                return el;
            };

            // User-dropped pins — numbered yellow markers, drawn first so A/B sit on top.
            pins.forEach((p, i) => {
                const m = new maplibregl.Marker({ element: makeBadge(String(i + 1), '#facc15') }).setLngLat(p).addTo(map);
                markersRef.current.push(m);
            });

            // A/B markers on the routed polyline endpoints (if a routed line exists)
            if (hasLine) {
                const start = points[0];
                const end = points[points.length - 1];
                const startMarker = new maplibregl.Marker({ element: makeBadge('A', '#22c55e') }).setLngLat(start).addTo(map);
                markersRef.current.push(startMarker);
                if (points.length > 1) {
                    const endMarker = new maplibregl.Marker({ element: makeBadge('B', '#3b82f6') }).setLngLat(end).addTo(map);
                    markersRef.current.push(endMarker);
                }
            }

            // Fit bounds across whichever set of points we actually drew
            const all: Pt[] = hasLine ? [...points, ...pins] : pins;
            if (all.length >= 2) {
                const bounds = all.reduce<maplibregl.LngLatBounds>(
                    (b, p) => b.extend(p),
                    new maplibregl.LngLatBounds(all[0], all[0])
                );
                map.fitBounds(bounds, { padding: 40, duration: 400, maxZoom: 16 });
            } else if (all.length === 1) {
                map.flyTo({ center: all[0], zoom: 14, duration: 400 });
            }
        };

        if (map.isStyleLoaded()) apply();
        else map.once('load', apply);
    }, [points, lineColor, pinPoints]);

    return (
        <div ref={containerRef} style={{ height }} className="w-full bg-zinc-900" />
    );
}
