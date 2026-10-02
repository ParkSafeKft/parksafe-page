export type PoiKind = 'bikerack' | 'service' | 'repair' | 'water';
export type MapRoute = 'map' | 'bikerack' | 'service' | 'water';
export type PublicPoi = {
    id: string; kind: PoiKind; longitude: number; latitude: number;
    name: string | null; city: string | null; address: string | null;
    covered: boolean | null; access: string | null; website: string | null;
    phone: string | null; source: string | null; sourceUpdatedAt: string | null; verifiedAt: string | null;
};
export type Place = { id: string; name: string; longitude: number; latitude: number; countryCode?: string; aliases?: string[] };
export type Manifest = {
    schemaVersion: 1; version: string; generatedAt: string | null; status: 'ready' | 'unavailable';
    source: string | null; license: string | null; attribution: string | null;
    countryCode: 'HU' | 'CE'; coverageBounds?: typeof huBounds; cellZoom: number; cells: Record<string, { bytes: number; gzipBytes: number }>;
    places: string; samples: string | null; count: number;
};
export const kinds: PoiKind[] = ['bikerack', 'service', 'repair', 'water'];
export const routeKinds: Record<MapRoute, PoiKind[]> = { map: kinds, bikerack: ['bikerack'], service: ['service', 'repair'], water: ['water'] };
export const huBounds = { west: 16.1, south: 45.7, east: 22.9, north: 48.7 };

export function validCoordinate(longitude: unknown, latitude: unknown): boolean {
    return typeof longitude === 'number' && typeof latitude === 'number' && Number.isFinite(longitude) && Number.isFinite(latitude)
        && longitude >= -180 && longitude <= 180 && latitude >= -85.05112878 && latitude <= 85.05112878;
}
export const normalizePlace = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('hu');
export function searchPlaces(places: Place[], query: string): Place[] {
    const term = normalizePlace(query.trim());
    if (!term) return [];
    const scored = places.map(place => {
        const names = [place.name, ...(place.aliases || [])].map(normalizePlace);
        return { place, rank: names.includes(term) ? 0 : names.some(name => name.startsWith(term)) ? 1 : names.some(name => name.includes(term)) ? 2 : 3 };
    });
    return scored.filter(hit => hit.rank < 3).sort((a, b) => a.rank - b.rank).slice(0, 8).map(hit => hit.place);
}
export function cellFor(longitude: number, latitude: number, zoom = 10): string {
    const n = 2 ** zoom, rad = latitude * Math.PI / 180;
    return `${Math.floor((longitude + 180) / 360 * n)}/${Math.floor((1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2 * n)}`;
}
export function visibleCells(bounds: typeof huBounds, zoom = 10): string[] {
    const [left, top] = cellFor(bounds.west, bounds.north, zoom).split('/').map(Number);
    const [right, bottom] = cellFor(bounds.east, bounds.south, zoom).split('/').map(Number);
    if ((right - left + 1) * (bottom - top + 1) > 16) throw new Error('zoom');
    const cells = [];
    for (let x = left; x <= right; x++) for (let y = top; y <= bottom; y++) cells.push(`${x}/${y}`);
    return cells;
}
export function publicPoi(raw: Record<string, unknown>): PublicPoi {
    if (typeof raw.id !== 'string' || !raw.id || !kinds.includes(raw.kind as PoiKind) || !validCoordinate(raw.longitude, raw.latitude)) throw new Error('Invalid public POI');
    const str = (key: string) => typeof raw[key] === 'string' && (raw[key] as string).trim() ? (raw[key] as string).trim().slice(0, 500) : null;
    const date = (key: string) => { const value = str(key); return value && Number.isFinite(Date.parse(value)) ? value : null; };
    return { id: raw.id, kind: raw.kind as PoiKind, longitude: raw.longitude as number, latitude: raw.latitude as number,
        name: str('name'), city: str('city'), address: str('address'), covered: typeof raw.covered === 'boolean' ? raw.covered : null,
        access: str('access'), website: safeWebsite(str('website')), phone: safePhone(str('phone')),
        source: str('source'), sourceUpdatedAt: date('sourceUpdatedAt'), verifiedAt: date('verifiedAt') };
}
export function safeWebsite(value: string | null): string | null {
    try { const url = new URL(value || ''); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function safePhone(value: string | null): string | null { return value && /^\+?[\d ()-]{5,30}$/.test(value) ? value : null; }
export function validateManifest(raw: Manifest): Manifest {
    if (raw.schemaVersion !== 1 || !/^[a-zA-Z0-9_-]{1,80}$/.test(raw.version) || !['HU', 'CE'].includes(raw.countryCode)
        || !Number.isInteger(raw.cellZoom) || raw.cellZoom < 10 || raw.cellZoom > 14
        || !['ready', 'unavailable'].includes(raw.status) || !raw.cells || typeof raw.cells !== 'object'
        || !/^\/map-data\/[a-zA-Z0-9_/-]+\.json$/.test(raw.places)) throw new Error('Invalid manifest');
    for (const [key, value] of Object.entries(raw.cells)) if (!/^\d{1,5}\/\d{1,5}$/.test(key) || !Number.isFinite(value.bytes) || value.bytes < 0 || value.bytes > 5_000_000) throw new Error('Invalid cell');
    return raw;
}
export function inView(poi: PublicPoi, bounds: typeof huBounds): boolean { return poi.longitude >= bounds.west && poi.longitude <= bounds.east && poi.latitude >= bounds.south && poi.latitude <= bounds.north; }
export function insidePolygon(longitude: number, latitude: number, geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): boolean {
    const inRing = (ring: number[][]) => {
        let inside = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const [x, y] = ring[i], [previousX, previousY] = ring[j];
            if ((y > latitude) !== (previousY > latitude) && longitude < (previousX - x) * (latitude - y) / (previousY - y) + x) inside = !inside;
        }
        return inside;
    };
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    return polygons.some(rings => inRing(rings[0]) && !rings.slice(1).some(inRing));
}
export function features(pois: PublicPoi[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
    return { type: 'FeatureCollection', features: pois.map(p => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] }, properties: p })) };
}

async function fetchJson(url: string, refresh = false): Promise<unknown> {
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const response = await fetch(url, { cache: refresh ? 'reload' : 'default', signal: AbortSignal.timeout(15000) });
            if (response.status === 404) throw new Error('snapshot-missing');
            if (!response.ok) throw new Error('network');
            return await response.json();
        } catch (error) { if (attempt || (error as Error).message === 'snapshot-missing') throw error; }
    }
    throw new Error('network');
}

// One bounded cache per mounted map family. No database client or global provider.
export class MapData {
    cache = new Map<string, { pois: PublicPoi[]; bytes: number }>();
    inFlight = new Map<string, Promise<PublicPoi[]>>();
    private active = 0;
    private waiting: (() => void)[] = [];
    private manifestPromise?: Promise<Manifest>;
    private placesPromise?: Promise<Place[]>;
    private placesUrl = '';
    private request: (url: string, refresh?: boolean) => Promise<unknown>;
    constructor(request: (url: string, refresh?: boolean) => Promise<unknown> = fetchJson) { this.request = request; }
    manifest(refresh = false): Promise<Manifest> {
        if (!this.manifestPromise || refresh) {
            const promise = this.request('/map-data/manifest.json', refresh).then(value => validateManifest(value as Manifest));
            this.manifestPromise = promise;
            promise.catch(() => { if (this.manifestPromise === promise) this.manifestPromise = undefined; });
        }
        return this.manifestPromise;
    }
    places(manifest: Manifest): Promise<Place[]> {
        if (!this.placesPromise || this.placesUrl !== manifest.places) {
            this.placesUrl = manifest.places;
            const promise = this.request(manifest.places).then(raw => {
                if (!Array.isArray(raw)) throw new Error('Invalid places');
                return raw.filter(p => typeof p.id === 'string' && typeof p.name === 'string' && validCoordinate(p.longitude, p.latitude)).map(p => ({
                    id: p.id, name: p.name, longitude: p.longitude, latitude: p.latitude,
                    countryCode: typeof p.countryCode === 'string' && /^[A-Z]{2}$/.test(p.countryCode) ? p.countryCode : undefined,
                    aliases: Array.isArray(p.aliases) ? p.aliases.filter((name: unknown) => typeof name === 'string' && name.length <= 200).slice(0, 200) : [],
                })) as Place[];
            });
            this.placesPromise = promise;
            promise.catch(() => { if (this.placesPromise === promise) this.placesPromise = undefined; });
        }
        return this.placesPromise;
    }
    cell(manifest: Manifest, key: string): Promise<PublicPoi[]> {
        if (!manifest.cells[key]) return Promise.resolve([]);
        const url = `/map-data/${manifest.version}/cells/${manifest.cellZoom}/${key}.geojson`;
        const hit = this.cache.get(url);
        if (hit) { this.cache.delete(url); this.cache.set(url, hit); return Promise.resolve(hit.pois); }
        const pending = this.inFlight.get(url); if (pending) return pending;
        const promise = (async () => {
            if (this.active >= 3) await new Promise<void>(resolve => this.waiting.push(resolve)); else this.active++;
            try {
                const raw = await this.request(url) as GeoJSON.FeatureCollection<GeoJSON.Point>;
                if (raw.type !== 'FeatureCollection' || !Array.isArray(raw.features) || raw.features.length > 100000) throw new Error('Invalid cell');
                const pois = raw.features.map(f => {
                    const p = publicPoi(f.properties || {});
                    if (f.geometry.type !== 'Point' || f.geometry.coordinates[0] !== p.longitude || f.geometry.coordinates[1] !== p.latitude || cellFor(p.longitude, p.latitude, manifest.cellZoom) !== key) throw new Error('Invalid geometry');
                    return p;
                });
                if (new Set(pois.map(p => p.id)).size !== pois.length) throw new Error('Duplicate POI');
                // ponytail: conservative 3x JSON memory estimate; profile heap before raising the 20 MB budget.
                const bytes = JSON.stringify(raw).length * 6;
                this.cache.set(url, { pois, bytes });
                while (this.cache.size > 64 || [...this.cache.values()].reduce((sum, c) => sum + c.bytes, 0) > 20_000_000) this.cache.delete(this.cache.keys().next().value!);
                return pois;
            } finally { const next = this.waiting.shift(); if (next) next(); else this.active--; }
        })();
        this.inFlight.set(url, promise);
        promise.finally(() => this.inFlight.delete(url)).catch(() => {});
        return promise;
    }
}
