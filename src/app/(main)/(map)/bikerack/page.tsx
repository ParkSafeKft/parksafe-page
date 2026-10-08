import MapPageContent from '@/components/map/MapPageContent';
import { publicPageMetadata } from '@/lib/seo';
export const metadata = publicPageMetadata('/bikerack', 'Kerékpártárolók és bicikliparkolók térképe – ParkSafe', 'Keress kerékpártárolót a célod közelében Magyarországon és Közép-Európában. Nézd meg a helyét és ismert adatait az ingyenes térképen, regisztráció nélkül.');
export default function Page() { return <MapPageContent route="bikerack" />; }
