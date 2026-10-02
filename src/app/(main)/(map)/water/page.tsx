import MapPageContent from '@/components/map/MapPageContent';
import { publicPageMetadata } from '@/lib/seo';
export const metadata = publicPageMetadata('/water', 'Ivókutak térképe – ParkSafe', 'Ivókutak Magyarországon és a közép-európai térségben, a ParkSafe ingyenes publikus térképén. Településkereső, helylista és forrásadatok a bringás utadhoz.');
export default function Page() { return <MapPageContent route="water" />; }
