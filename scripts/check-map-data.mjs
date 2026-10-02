// node scripts/check-map-data.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MapData, publicPoi, cellFor, visibleCells, features, routeKinds, huBounds, insidePolygon, safeWebsite, validateManifest, searchPlaces } from '../src/lib/map-data.ts';

const poi = publicPoi({ id: 'test', kind: 'bikerack', longitude: 19.04, latitude: 47.5, user_id: 'private', email: 'private', website: 'javascript:alert(1)' });
assert.equal(poi.website, null); assert.ok(!('user_id' in poi)); assert.ok(!('email' in poi)); assert.equal(poi.verifiedAt, null);
assert.throws(() => publicPoi({ ...poi, latitude: NaN }));
assert.throws(() => publicPoi({ ...poi, longitude: 181 }));
assert.throws(() => publicPoi({ ...poi, latitude: 90 }));
assert.equal(publicPoi({ ...poi, longitude: 16.3738, latitude: 48.2082 }).longitude, 16.3738);
assert.equal(safeWebsite('https://user:pass@example.com'), null);
assert.equal(cellFor(19.04, 47.5), '566/358');
assert.throws(() => visibleCells(huBounds), /zoom/);
assert.deepEqual(routeKinds.service, ['service', 'repair']);
const boundary = JSON.parse(await readFile(new URL('./map-hu-boundary.geojson', import.meta.url), 'utf8')).features[0].geometry;
assert.equal(insidePolygon(19.04, 47.5, boundary), true);
assert.equal(insidePolygon(16.37, 48.2, boundary), false);
const keys = ['566/358', '567/358', '568/358', '569/358'];
const manifest = { schemaVersion: 1, version: 'test', status: 'ready', countryCode: 'HU', cellZoom: 10, cells: Object.fromEntries(keys.map(k => [k, { bytes: 10, gzipBytes: 10 }])) };
let requests = 0, active = 0, peak = 0;
const cache = new MapData(async url => {
    requests++; active++; peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, 5));
    active--;
    const [x, y] = url.match(/10\/(\d+)\/(\d+)\.geojson/).slice(1).map(Number);
    const longitude = (x + .5) / 1024 * 360 - 180;
    const latitude = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + .5) / 1024))) * 180 / Math.PI;
    return features([publicPoi({ ...poi, id: url, longitude, latitude })]);
});
await Promise.all([...keys, keys[0]].map(key => cache.cell(manifest, key)));
assert.equal(peak, 3); assert.equal(requests, 4); assert.equal(cache.cache.size, 4);
await cache.cell(manifest, keys[0]); assert.equal(requests, 4, 'cached pan/category makes zero new requests');
await cache.cell(manifest, '0/0'); assert.equal(requests, 4, 'missing cells do not request');
const failing = new MapData(async () => { throw new Error('network'); });
await assert.rejects(failing.cell(manifest, keys[0])); assert.equal(failing.inFlight.size, 0);
const duplicate = new MapData(async () => features([poi, poi]));
await assert.rejects(duplicate.cell(manifest, keys[0]), /Duplicate/);
const realManifest = validateManifest(JSON.parse(await readFile(new URL('../public/map-data/manifest.json', import.meta.url), 'utf8')));
const realData = new MapData(async url => JSON.parse(await readFile(new URL(`../public${url}`, import.meta.url), 'utf8')));
const realIds = new Set(), counts = { bikerack: 0, service: 0, repair: 0, water: 0 };
for (const key of Object.keys(realManifest.cells)) {
    for (const point of await realData.cell(realManifest, key)) {
        assert.equal(realIds.has(point.id), false, 'globally duplicate ID'); realIds.add(point.id);
        if (realManifest.countryCode === 'HU') assert.equal(insidePolygon(point.longitude, point.latitude, boundary), true, 'outside HU');
        else { const b = realManifest.coverageBounds; assert.ok(point.longitude >= b.west && point.longitude <= b.east && point.latitude >= b.south && point.latitude <= b.north, 'outside export coverage'); }
        counts[point.kind]++;
    }
    assert.ok(realData.cache.size <= 64);
    assert.ok([...realData.cache.values()].reduce((sum, value) => sum + value.bytes, 0) <= 20_000_000);
}
assert.equal(realIds.size, realManifest.count);
assert.ok(Object.values(counts).every(count => count > 0));
const places = await realData.places(realManifest);
if (realManifest.countryCode === 'CE') {
    for (const name of ['Bécs', 'Wien', 'Vienna']) assert.equal(searchPlaces(places, name)[0].name, 'Vienna');
    for (const name of ['Prága', 'Praha', 'Prague']) assert.equal(searchPlaces(places, name)[0].name, 'Prague');
    assert.equal(searchPlaces(places, 'Budapest')[0].name, 'Budapest');
    const vienna = searchPlaces(places, 'Bécs')[0];
    assert.ok((await realData.cell(realManifest, cellFor(vienna.longitude, vienna.latitude, realManifest.cellZoom))).length > 0, 'Vienna has real POIs');
}
console.log('PASS: coordinates, coverage, multilingual town search, explicit fields, URLs, cells, active types, 3-request limit, dedup, bounded cache and error cleanup');
console.log(JSON.stringify(counts));
