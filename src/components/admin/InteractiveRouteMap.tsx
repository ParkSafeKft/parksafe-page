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
}

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const LINE_SOURCE_ID = 'route-line';
const LINE_LAYER_CASE_ID = 'route-line-case';
const LINE_LAYER_ID = 'route-line-main';

export default function InteractiveRouteMap({ points, height = 360, lineColor = '#22c55e' }: InteractiveRouteMapProps) {
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

            if (points.length < 1) return;

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
            // Update color in case it changed
            if (map.getLayer(LINE_LAYER_ID)) {
                map.setPaintProperty(LINE_LAYER_ID, 'line-color', lineColor);
            }

            // Markers: A start (green), B end (blue/red)
            const start = points[0];
            const end = points[points.length - 1];

            const makePin = (label: string, bg: string) => {
                const el = document.createElement('div');
                el.style.cssText = `width:24px;height:24px;border-radius:50%;background:${bg};color:#0a0a0a;font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center;border:2px solid #0a0a0a;box-shadow:0 0 0 2px ${bg}66`;
                el.textContent = label;
                return el;
            };

            const startMarker = new maplibregl.Marker({ element: makePin('A', '#22c55e') }).setLngLat(start).addTo(map);
            markersRef.current.push(startMarker);
            if (points.length > 1) {
                const endMarker = new maplibregl.Marker({ element: makePin('B', '#3b82f6') }).setLngLat(end).addTo(map);
                markersRef.current.push(endMarker);
            }

            // Fit bounds to the route
            if (points.length >= 2) {
                const bounds = points.reduce<maplibregl.LngLatBounds>(
                    (b, p) => b.extend(p),
                    new maplibregl.LngLatBounds(points[0], points[0])
                );
                map.fitBounds(bounds, { padding: 40, duration: 400, maxZoom: 16 });
            } else {
                map.flyTo({ center: start, zoom: 14, duration: 400 });
            }
        };

        if (map.isStyleLoaded()) apply();
        else map.once('load', apply);
    }, [points, lineColor]);

    return (
        <div ref={containerRef} style={{ height }} className="w-full bg-zinc-900" />
    );
}
