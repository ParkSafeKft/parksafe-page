import MapPageContent from '@/components/map/MapPageContent';
import { publicPageMetadata } from '@/lib/seo';
export const metadata = publicPageMetadata('/water', 'Ivókutak térképe Magyarországon és Közép-Európában – ParkSafe', 'Találj ivókutat a kerékpáros utad közelében. Ingyenes térkép településkeresővel és helyadatokkal Magyarországon és Közép-Európában, bejelentkezés nélkül.');
export default function Page() { return <MapPageContent route="water" />; }
