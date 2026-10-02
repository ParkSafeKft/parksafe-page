import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import MapPageCopy from './MapPageCopy';
import { validateManifest, type Manifest, type MapRoute } from '@/lib/map-data';

export default async function MapPageContent({ route }: { route: MapRoute }) {
    const manifest = validateManifest(JSON.parse(await readFile(join(process.cwd(), 'public/map-data/manifest.json'), 'utf8')) as Manifest);
    return <MapPageCopy route={route} date={manifest.generatedAt} />;
}
