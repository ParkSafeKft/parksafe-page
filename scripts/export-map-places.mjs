// GeoNames cities500.txt (CC BY 4.0), downloaded manually; no per-visitor geocoding.
import { readFile, writeFile } from 'node:fs/promises';
if (!process.argv[2] || !process.argv[3]) throw new Error('Usage: node scripts/export-map-places.mjs <cities500.txt> <places.json>');
const manifest = JSON.parse(await readFile('public/map-data/manifest.json', 'utf8'));
const previous = JSON.parse(await readFile(`public${manifest.places}`, 'utf8'));
const places = new Map(previous.filter(p => !p.countryCode || p.countryCode === 'HU').map(p => [p.id, { ...p, countryCode: 'HU' }]));
const codes = new Set(['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC']);
for (const line of (await readFile(process.argv[2], 'utf8')).split('\n')) {
    const [id, name, ascii, alternatives, lat, lon, feature, code, countryCode] = line.split('\t');
    const longitude = Number(lon), latitude = Number(lat);
    if (feature !== 'P' || !codes.has(code) || longitude < 8 || longitude > 25 || latitude < 45 || latitude > 55) continue;
    places.set(id, { id, name, longitude, latitude, countryCode, aliases: [...new Set([ascii, ...(alternatives || '').split(',')])].filter(alias => alias && alias !== name).slice(0, 200) });
}
await writeFile(process.argv[3], JSON.stringify([...places.values()]));
console.log(`${places.size} searchable places`);
