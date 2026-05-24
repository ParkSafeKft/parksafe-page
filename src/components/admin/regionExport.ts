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
    const query = `[out:json][timeout:25];way["highway"]["name"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});out geom;`;
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
    // Pad the per-segment bbox prefilter by ~1.5× the threshold, computed separately per axis
    // (a degree of longitude is fewer metres than a degree of latitude away from the equator).
    const midLat = (bounds.south + bounds.north) / 2;
    const degPadLat = (threshold / M_PER_DEG_LAT) * 1.5;
    const degPadLng = (threshold / mPerDegLng(midLat)) * 1.5;

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
                if (lng < s.minLng - degPadLng || lng > s.maxLng + degPadLng || lat < s.minLat - degPadLat || lat > s.maxLat + degPadLat) continue;
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
