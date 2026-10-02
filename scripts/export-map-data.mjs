// Node 22+; local files only. The source is fetched separately with read-only parksafe-self MCP.
import { readFile, readdir, mkdir, writeFile, rename, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { publicPoi, cellFor, features, kinds, validCoordinate, insidePolygon } from '../src/lib/map-data.ts';

const input = resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('Usage: node scripts/export-map-data.mjs <complete MCP export directory>');
const info = JSON.parse(await readFile(join(input, 'export-info.json'), 'utf8'));
if (info.complete !== true || info.license !== 'ODbL-1.0' || !info.source || !Number.isFinite(Date.parse(info.generatedAt))) throw new Error('Source, licence and complete export evidence required');
let pois = [];
const ids = new Set();
for (const file of (await readdir(input)).filter(file => /^(bikerack|service|repair|water)-\d+\.json$/.test(file)).sort()) {
    const rows = JSON.parse(await readFile(join(input, file), 'utf8'));
    for (const raw of rows) {
        if (raw.source !== null && !/^OpenStreetMap\/(node|way|relation)\/\d+$/.test(raw.source || '')) throw new Error('Unproven OSM source');
        // All input rows have a verified non-null osm_id. Older imports lack osm_type; keep that type unknown.
        const poi = publicPoi({ ...raw, source: raw.source || 'OpenStreetMap' });
        if (ids.has(poi.id)) throw new Error('Duplicate ID');
        ids.add(poi.id); pois.push(poi);
    }
}
for (const entry of info.counts) if (pois.filter(p => p.kind === entry.kind).length !== entry.count) throw new Error('Incomplete export');
if (info.countryCode === 'CE') {
    const b = info.coverageBounds;
    if (!b || !validCoordinate(b.west, b.south) || !validCoordinate(b.east, b.north) || b.west >= b.east || b.south >= b.north) throw new Error('Invalid coverage');
    if (pois.some(p => p.longitude < b.west || p.longitude > b.east || p.latitude < b.south || p.latitude > b.north)) throw new Error('POI outside export coverage');
} else {
    const boundary = JSON.parse(await readFile(new URL('./map-hu-boundary.geojson', import.meta.url), 'utf8')).features[0].geometry;
    pois = pois.filter(p => insidePolygon(p.longitude, p.latitude, boundary));
}
if (!pois.length || kinds.some(kind => !pois.some(p => p.kind === kind))) throw new Error('All real POI kinds required');
const places = JSON.parse(await readFile(join(input, 'places.json'), 'utf8'));
if (!Array.isArray(places) || !places.length || places.some(p => typeof p.name !== 'string' || !p.name || typeof p.id !== 'string' || !p.id || !validCoordinate(p.longitude, p.latitude)
    || (p.aliases && (!Array.isArray(p.aliases) || p.aliases.some(alias => typeof alias !== 'string' || alias.length > 200))))) throw new Error('Invalid places');
const version = `${info.generatedAt.slice(0, 10)}-${createHash('sha256').update(JSON.stringify({ pois, places })).digest('hex').slice(0, 12)}`;
const root = resolve('public/map-data'), staging = join(root, `.staging-${version}`), destination = join(root, version);
await mkdir(staging, { recursive: true });
let cellZoom = 10, cells, index;
for (; cellZoom <= 14; cellZoom++) {
    cells = new Map(); index = {};
    for (const poi of pois) { const key = cellFor(poi.longitude, poi.latitude, cellZoom); if (!cells.has(key)) cells.set(key, []); cells.get(key).push(poi); }
    for (const [key, values] of cells) { const body = JSON.stringify(features(values)); index[key] = { bytes: Buffer.byteLength(body), gzipBytes: gzipSync(body).length }; }
    if (Object.values(index).every(cell => cell.gzipBytes <= 250000)) break;
}
if (cellZoom > 14) throw new Error('Cell budget exceeded');
for (const [key, values] of cells) { const path = join(staging, 'cells', String(cellZoom), `${key}.geojson`); await mkdir(resolve(path, '..'), { recursive: true }); await writeFile(path, JSON.stringify(features(values))); }
const samples = Object.fromEntries(kinds.map(kind => [kind, pois.filter(p => p.kind === kind && p.name && p.city).slice(0, 4)]));
await writeFile(join(staging, 'places.json'), JSON.stringify(places));
await writeFile(join(staging, 'seo-samples.json'), JSON.stringify(samples));
await writeFile(join(staging, 'LICENSE.txt'), 'POI database: Open Database License 1.0\nhttps://opendatacommons.org/licenses/odbl/1-0/\n© OpenStreetMap contributors https://www.openstreetmap.org/copyright\nSettlement index: GeoNames CC BY 4.0 https://www.geonames.org/about.html\nHU boundary: geoBoundaries HUN-ADM0-27208725; CC0 1.0; https://www.geoboundaries.org/\n');
const manifest = { schemaVersion: 1, version, generatedAt: info.generatedAt, status: 'ready', source: info.source, license: info.license,
    attribution: info.attribution, countryCode: info.countryCode || 'HU', coverageBounds: info.coverageBounds, cellZoom, cells: index, places: `/map-data/${version}/places.json`, samples: `/map-data/${version}/seo-samples.json`, count: pois.length };
try { await access(destination); } catch { await rename(staging, destination); }
// Existing versions are retained. Publish only after every asset is written and validated.
await writeFile(join(root, 'manifest.next.json'), JSON.stringify(manifest));
await rename(join(root, 'manifest.next.json'), join(root, 'manifest.json'));
console.log(JSON.stringify({ version, generatedAt: info.generatedAt, points: pois.length, places: places.length, cellZoom, cells: cells.size,
    rawBytes: Object.values(index).reduce((sum, c) => sum + c.bytes, 0), gzipBytes: Object.values(index).reduce((sum, c) => sum + c.gzipBytes, 0),
    maxCellGzip: Math.max(...Object.values(index).map(c => c.gzipBytes)) }, null, 2));
