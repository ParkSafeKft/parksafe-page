import MapPageContent from '@/components/map/MapPageContent';
import { publicPageMetadata } from '@/lib/seo';
export const metadata = publicPageMetadata('/map', 'Kerékpáros térkép: tárolók, szervizek és ivókutak – ParkSafe', 'Keress kerékpártárolót, szervizt vagy ivókutat Magyarországon és Közép-Európában. Ingyenes kerékpáros térkép településkeresővel, bejelentkezés nélkül.');
export default function Page() { return <MapPageContent route="map" />; }
