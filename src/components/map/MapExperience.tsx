'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, MapPinned, List, X, ChevronRight, RotateCcw, Plus, Minus } from 'lucide-react';
import type { Map as LibreMap, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapData, features, huBounds, inView, routeKinds, visibleCells, safeWebsite, safePhone, searchPlaces, type PoiKind, type MapRoute, type Manifest, type Place, type PublicPoi } from '@/lib/map-data';

const iconPaths = { bikerack: '/branding/icons/app_bike_park_icon.png', service: '/branding/icons/app_bike_store_icon.png', repair: '/branding/icons/app_bike_repair_icon.png', water: '/branding/icons/app_drinking_fountain.png' };
const colors = { bikerack: '#008d75', service: '#ed7712', repair: '#1c4dd0', water: '#156e97' };
function PoiIcon({ kind, size = 22 }: { kind: PoiKind; size?: number }) {
    // Static app artwork; no image optimisation endpoint is needed for these small assets.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={iconPaths[kind]} width={size} height={size} alt="" aria-hidden="true" />;
}
type View = { pois: PublicPoi[]; state: 'zoom' | 'loading' | 'ready' | 'network' | 'unavailable' | 'tooMany' };

export default function MapExperience() {
    const { t, language } = useLanguage();
    const pathname = usePathname();
    const route = (pathname.slice(1) in routeKinds ? pathname.slice(1) : 'map') as MapRoute;
    const container = useRef<HTMLDivElement>(null), mapRef = useRef<LibreMap | null>(null);
    const [data] = useState(() => new MapData());
    const [manifest, setManifest] = useState<Manifest | null>(null);
    const manifestRef = useRef<Manifest | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [search, setSearch] = useState('');
    const [view, setView] = useState<View>({ pois: [], state: 'loading' });
    const [selected, setSelected] = useState<PublicPoi | null>(null);
    const [limit, setLimit] = useState(50);
    const [listOpen, setListOpen] = useState(false);
    const [ready, setReady] = useState(false);
    const [mapError, setMapError] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);
    const detailOrigin = useRef<{ map: boolean; scrollY: number; listTop: number } | null>(null);
    const restoreDetail = useRef<typeof detailOrigin.current>(null);
    const generation = useRef(0), alive = useRef(false);
    const updateRef = useRef<() => void>(() => {});
    const fallbackBounds = useRef(huBounds);
    const fallbackZoom = useRef(6);
    const activePois = useMemo(() => view.pois.filter(p => routeKinds[route].includes(p.kind)), [view.pois, route]);
    const selection = selected && routeKinds[route].includes(selected.kind) ? selected : null;
    const matches = useMemo(() => searchPlaces(places, search), [places, search]);
    const closeDetails = () => {
        restoreDetail.current = detailOrigin.current;
        if (detailOrigin.current?.map) setListOpen(false);
        detailOrigin.current = null;
        setSelected(null);
    };
    useLayoutEffect(() => {
        if (selected) { if (listRef.current) listRef.current.scrollTop = 0; return; }
        detailOrigin.current = null;
        const origin = restoreDetail.current;
        if (!origin) return;
        restoreDetail.current = null;
        if (listRef.current) listRef.current.scrollTop = origin.listTop;
        window.scrollTo({ top: origin.scrollY, behavior: 'instant' });
        if (origin.map) { mapRef.current?.resize(); mapRef.current?.getCanvas().focus({ preventScroll: true }); }
        else listRef.current?.focus({ preventScroll: true });
    }, [selected]);

    useEffect(() => {
        alive.current = true;
        let map: LibreMap | null = null, disposed = false;
        let observer: ResizeObserver | null = null;
        let debounce: ReturnType<typeof setTimeout>, timeout: ReturnType<typeof setTimeout>;
        const loadView = async (refresh = false) => {
            const token = ++generation.current;
            const current = () => alive.current && token === generation.current;
            const bounds = map ? map.getBounds() : null;
            const area = bounds ? { west: bounds.getWest(), south: bounds.getSouth(), east: bounds.getEast(), north: bounds.getNorth() } : fallbackBounds.current;
            const zoom = map ? map.getZoom() : fallbackZoom.current;
            try {
                const m = manifestRef.current && !refresh ? manifestRef.current : await data.manifest(refresh);
                if (!current()) return;
                if (manifestRef.current?.version !== m.version) { data.cache.clear(); setSelected(null); }
                manifestRef.current = m; setManifest(m);
                // The small local settlement index is shared across all categories.
                data.places(m).then(p => { if (alive.current) setPlaces(p); }).catch(() => { if (alive.current) setView({ pois: [], state: 'network' }); });
                if (m.status !== 'ready') { setView({ pois: [], state: 'unavailable' }); return; }
                if (zoom < 11) { setView({ pois: [], state: 'zoom' }); return; }
                let keys: string[];
                try { keys = visibleCells(area, m.cellZoom); } catch { setView({ pois: [], state: 'tooMany' }); return; }
                setView({ pois: [], state: 'loading' });
                const results = await Promise.all(keys.map(key => data.cell(m, key)));
                if (!current()) return;
                const pois = [...new Map(results.flat().filter(p => inView(p, area)).map(p => [p.id, p])).values()];
                setView(pois.length > 20000 ? { pois: [], state: 'tooMany' } : { pois, state: 'ready' });
                setLimit(50);
            } catch (error) {
                if (!current()) return;
                if ((error as Error).message === 'snapshot-missing' && !refresh) { manifestRef.current = null; data.cache.clear(); await loadView(true); }
                else setView({ pois: [], state: 'network' });
            }
        };
        updateRef.current = () => { void loadView(); };
        const onMove = () => { generation.current++; clearTimeout(debounce); debounce = setTimeout(() => { void loadView(); }, 300); };
        void loadView();
        import('maplibre-gl').then(({ default: libre }) => {
            if (disposed || !container.current) return;
            try {
                map = new libre.Map({ container: container.current, style: 'https://tiles.openfreemap.org/styles/liberty',
                    bounds: [[huBounds.west, huBounds.south], [huBounds.east, huBounds.north]], fitBoundsOptions: { padding: 28, duration: 0 },
                    minZoom: 5, maxZoom: 19, attributionControl: { compact: false }, cooperativeGestures: true });
                mapRef.current = map;
                observer = new ResizeObserver(entries => { if (entries[0].contentRect.width && entries[0].contentRect.height) map?.resize(); });
                observer.observe(container.current);
                map.on('moveend', onMove);
                map.on('error', () => { if (!disposed) setMapError(true); });
                map.on('load', async () => {
                    if (!map || disposed) return;
                    clearTimeout(timeout); setReady(true); setMapError(false);
                    map.addSource('places', { type: 'geojson', data: features([]), cluster: true, clusterMaxZoom: 14, clusterRadius: 45 });
                    map.addLayer({ id: 'clusters', type: 'circle', source: 'places', filter: ['has', 'point_count'], paint: { 'circle-color': '#237d40', 'circle-radius': ['step', ['get', 'point_count'], 16, 100, 20], 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
                    map.addLayer({ id: 'cluster-count', type: 'symbol', source: 'places', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Noto Sans Regular'], 'text-size': 12 }, paint: { 'text-color': '#fff' } });
                    map.addLayer({ id: 'points', type: 'circle', source: 'places', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': ['match', ['get', 'kind'], 'service', colors.service, 'repair', colors.repair, 'water', colors.water, colors.bikerack], 'circle-radius': ['case', ['boolean', ['get', 'selected'], false], 8, 5], 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
                    await Promise.all(Object.entries(iconPaths).map(async ([kind, path]) => {
                        try { const image = await map!.loadImage(path); if (!disposed) map!.addImage(`app-${kind}`, image.data, { pixelRatio: image.data.width / 500 }); } catch { /* Circles and list labels remain usable if an icon fails to load. */ }
                    }));
                    if (disposed) return;
                    map.addLayer({ id: 'app-points', type: 'symbol', source: 'places', filter: ['!', ['has', 'point_count']],
                        layout: { 'icon-image': ['concat', 'app-', ['get', 'kind']], 'icon-size': ['case', ['boolean', ['get', 'selected'], false], .058, .045], 'icon-allow-overlap': true } });
                    map.on('click', 'clusters', async event => {
                        const feature = event.features?.[0]; if (!feature || !map) return;
                        try { const zoom = await (map.getSource('places') as GeoJSONSource).getClusterExpansionZoom(feature.properties.cluster_id);
                            if (!disposed) map.easeTo({ center: (feature.geometry as GeoJSON.Point).coordinates as [number, number], zoom, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300 }); } catch { /* Source may be replaced while switching category. */ }
                    });
                    const selectPoint = (event: import('maplibre-gl').MapLayerMouseEvent) => {
                        const raw = event.features?.[0]?.properties;
                        if (!raw) return;
                        const coords = (event.features![0].geometry as GeoJSON.Point).coordinates;
                        detailOrigin.current = { map: true, scrollY: window.scrollY, listTop: listRef.current?.scrollTop || 0 };
                        setSelected({ ...raw, longitude: coords[0], latitude: coords[1], covered: typeof raw.covered === 'boolean' ? raw.covered : null } as PublicPoi);
                        setListOpen(true);
                    };
                    map.on('click', 'points', selectPoint);
                    map.on('click', 'app-points', selectPoint);
                    for (const layer of ['clusters', 'points', 'app-points']) {
                        map.on('mouseenter', layer, () => { if (map) map.getCanvas().style.cursor = 'pointer'; });
                        map.on('mouseleave', layer, () => { if (map) map.getCanvas().style.cursor = ''; });
                    }
                    void loadView();
                });
                timeout = setTimeout(() => { if (!disposed) setMapError(true); }, 20000);
            } catch { setMapError(true); }
        }).catch(() => { if (!disposed) setMapError(true); });
        const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') closeDetails(); };
        window.addEventListener('keydown', escape);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- Invalidates pending viewport promises, not a DOM ref.
        return () => { disposed = true; alive.current = false; generation.current++; clearTimeout(timeout); clearTimeout(debounce); observer?.disconnect(); window.removeEventListener('keydown', escape); map?.remove(); mapRef.current = null; };
    }, [data]);

    useEffect(() => {
        const source = mapRef.current?.getSource('places') as GeoJSONSource | undefined;
        if (source) { const collection = features(activePois); collection.features.forEach(f => { f.properties!.selected = f.properties!.id === selection?.id; }); source.setData(collection); }
    }, [activePois, ready, selection]);

    const choosePlace = (place: Place) => {
        setSearch(''); setSelected(null);
        const zoom = Math.max(12, manifestRef.current?.cellZoom || 10);
        fallbackZoom.current = zoom;
        fallbackBounds.current = { west: place.longitude - .04, east: place.longitude + .04, south: place.latitude - .03, north: place.latitude + .03 };
        if (mapRef.current) mapRef.current.jumpTo({ center: [place.longitude, place.latitude], zoom }); else updateRef.current();
    };
    const choosePoi = (poi: PublicPoi) => { detailOrigin.current = { map: false, scrollY: window.scrollY, listTop: listRef.current?.scrollTop || 0 }; setSelected(poi); setListOpen(true); };
    const date = manifest?.generatedAt ? new Date(manifest.generatedAt).toLocaleDateString(language === 'hu' ? 'hu-HU' : 'en-GB', { timeZone: 'UTC' }) : null;
    const stateKey = view.state === 'ready' ? (activePois.length ? null : 'empty') : view.state;
    return <section className="web-map-experience" aria-label={t('webMap.map')}>
        <div className="web-map-toolbar">
            <nav aria-label={t('webMap.categories')} className="web-map-tabs">{(['map', 'bikerack', 'service', 'water'] as const).map(r => {
                return <Link href={`/${r}`} scroll={false} key={r} aria-current={r === route ? 'page' : undefined} onClick={() => { setSelected(null); setLimit(50); }}>{r === 'map' ? <MapPinned size={20} aria-hidden="true" /> : <PoiIcon kind={r} />}{t(`webMap.tab.${r}`)}</Link>;
            })}</nav>
            <button className="web-map-country" aria-label={t('webMap.countryView')} title={t('webMap.countryView')} onClick={() => { setSearch(''); setSelected(null); fallbackZoom.current = 6; fallbackBounds.current = huBounds; if (mapRef.current) mapRef.current.fitBounds([[huBounds.west, huBounds.south], [huBounds.east, huBounds.north]], { padding: 28, duration: 0 }); else updateRef.current(); }}><RotateCcw size={16} aria-hidden="true" /><span>{t('webMap.countryView')}</span></button>
        </div>
        <div className="web-map-workspace" data-list-open={listOpen}>
            <aside className="web-map-sidebar">
                <div className="web-map-search">
                    <label htmlFor="town-search">{t('webMap.search')}</label>
                    <div className="web-map-search-input"><Search size={18} aria-hidden="true" /><input id="town-search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('webMap.searchHint')} aria-controls="town-results" onKeyDown={event => { if (event.key === 'Escape') setSearch(''); if (event.key === 'Enter' && matches[0]) choosePlace(matches[0]); }} autoComplete="off" /></div>
                    {search.trim() && <ul id="town-results" className="web-map-search-results">{matches.length ? matches.map(p => <li key={p.id}><button onClick={() => choosePlace(p)}><span>{p.name}{p.countryCode && <small> · {p.countryCode}</small>}</span><ChevronRight size={16} aria-hidden="true" /></button></li>) : <li>{t('webMap.noPlace')}</li>}</ul>}
                </div>
                <div className="web-map-mobile-toggle"><button aria-pressed={!listOpen} onClick={() => setListOpen(false)}><MapPinned size={18} />{t('webMap.map')}</button><button aria-pressed={listOpen} onClick={() => setListOpen(true)}><List size={18} />{t('webMap.list')}{activePois.length > 0 && <span>{activePois.length}</span>}</button></div>
                <div ref={listRef} className="web-map-list" tabIndex={-1} aria-busy={view.state === 'loading'}>
                    {selection ? <div className="web-map-detail">
                        <button className="web-map-close" onClick={closeDetails}><X size={18} aria-hidden="true" />{t('webMap.close')}</button>
                        <p className="web-map-kind" style={{ color: colors[selection.kind] }}>{t(`webMap.kind.${selection.kind}`)}</p>
                        <h2>{selection.name || t(`webMap.kind.${selection.kind}`)}</h2>
                        <p>{[selection.city, selection.address].filter(Boolean).join(', ') || t('webMap.unknown')}</p>
                        <dl>
                            {selection.kind === 'bikerack' && <><dt>{t('webMap.covered')}</dt><dd>{t(`webMap.${selection.covered === null ? 'unknown' : selection.covered ? 'yes' : 'no'}`)}</dd></>}
                            {selection.access && <><dt>{t('webMap.access')}</dt><dd>{selection.access}</dd></>}
                            <dt>{t('webMap.verified')}</dt><dd>{selection.verifiedAt || t('webMap.unknown')}</dd>
                            <dt>{t('webMap.source')}</dt><dd>{selection.source || t('webMap.unknown')}</dd>
                            <dt>{t('webMap.snapshot')}</dt><dd>{date || t('webMap.unknown')}</dd></dl>
                        {safeWebsite(selection.website) && <a href={safeWebsite(selection.website)!} target="_blank" rel="noopener noreferrer">{t('webMap.website')}</a>}
                        {safePhone(selection.phone) && <a href={`tel:${safePhone(selection.phone)!.replace(/[ ()-]/g, '')}`}>{selection.phone}</a>}
                        <Link href="/contact">{t('webMap.report')}<ChevronRight size={16} aria-hidden="true" /></Link>
                    </div> : <>
                        <div className="web-map-list-heading"><h2>{t('webMap.area')}</h2>{view.state === 'ready' && <span>{activePois.length} {t('webMap.results')}</span>}</div>
                        {stateKey && <div className="web-map-state" role="status"><MapPinned size={28} aria-hidden="true" /><p>{t(`webMap.${stateKey}`)}</p>{view.state === 'network' && <button onClick={() => updateRef.current()}>{t('webMap.retry')}</button>}</div>}
                        <ul className="web-map-pois">{activePois.slice(0, limit).map(p => <li key={p.id}><button onClick={() => choosePoi(p)}><span className="web-map-poi-icon" style={{ color: colors[p.kind] }}><PoiIcon kind={p.kind} size={26} /></span><span><strong>{p.name || t(`webMap.kind.${p.kind}`)}</strong><small>{t(`webMap.kind.${p.kind}`)}{p.city ? ` · ${p.city}` : ''}</small></span><ChevronRight size={16} aria-hidden="true" /></button></li>)}</ul>
                        {activePois.length > limit && <button className="web-map-more" onClick={() => setLimit(value => value + 50)}>{t('webMap.more')}</button>}
                    </>}
                </div>
                <p className="web-map-date">{date ? `${t('webMap.snapshot')}: ${date}` : t('webMap.loading')}</p>
            </aside>
            <div className="web-map-canvas-wrap">
                <div ref={container} className="web-map-canvas" aria-label={t('webMap.map')} />
                {!ready && !mapError && <div className="web-map-map-loading" role="status">{t('webMap.mapLoading')}</div>}
                {mapError && <div className="web-map-basemap-error" role="status">{t('webMap.mapError')}</div>}
                <div className="web-map-zoom"><button aria-label={t('webMap.zoomIn')} onClick={() => mapRef.current?.zoomIn({ duration: 0 })}><Plus size={20} /></button><button aria-label={t('webMap.zoomOut')} onClick={() => mapRef.current?.zoomOut({ duration: 0 })}><Minus size={20} /></button></div>
                <div className="web-map-legend" aria-label={t('webMap.legend')}>{routeKinds[route].map(kind => <span key={kind}><PoiIcon kind={kind} size={24} />{t(`webMap.kind.${kind}`)}</span>)}</div>
            </div>
        </div>
    </section>;
}
