import MapPageContent from '@/components/map/MapPageContent';
import { publicPageMetadata } from '@/lib/seo';
export const metadata = publicPageMetadata('/map', 'Bringás helyek térképe – ParkSafe', 'Kerékpártárolók, szervizek, javítópontok és ivókutak a közép-európai térség térképén. Településkereső és helyadatok, bejelentkezés nélkül.');
export default function Page() { return <MapPageContent route="map" />; }
