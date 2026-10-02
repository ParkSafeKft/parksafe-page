import MapPageContent from '@/components/map/MapPageContent';
import { publicPageMetadata } from '@/lib/seo';
export const metadata = publicPageMetadata('/bikerack', 'Kerékpártárolók térképe – ParkSafe', 'Keress kerékpártárolót Magyarországon és a közép-európai térségben a ParkSafe publikus térképén. Nézd meg a tároló helyét és ismert adatait, regisztráció nélkül.');
export default function Page() { return <MapPageContent route="bikerack" />; }
