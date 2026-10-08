import MapPageContent from '@/components/map/MapPageContent';
import { publicPageMetadata } from '@/lib/seo';
export const metadata = publicPageMetadata('/service', 'Kerékpárszervizek és javítópontok térképe – ParkSafe', 'Keress kerékpárszervizt vagy önkiszolgáló javítópontot Magyarországon és Közép-Európában. Műhelyek és javítópontok külön jelöléssel az ingyenes térképen.');
export default function Page() { return <MapPageContent route="service" />; }
