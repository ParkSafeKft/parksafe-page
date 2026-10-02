import MapPageContent from '@/components/map/MapPageContent';
import { publicPageMetadata } from '@/lib/seo';
export const metadata = publicPageMetadata('/service', 'Kerékpárszervizek és javítópontok – ParkSafe', 'Kerékpárszervizek és önkiszolgáló javítópontok a közép-európai térség térképén, külön jelöléssel. Keress települést és böngészd a valódi helyadatokat.');
export default function Page() { return <MapPageContent route="service" />; }
