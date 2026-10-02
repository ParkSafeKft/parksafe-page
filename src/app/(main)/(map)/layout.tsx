import MapExperience from '@/components/map/MapExperience';
import './map.css';

export default function MapLayout({ children }: { children: React.ReactNode }) {
    return <div className="web-map-page">{children}<MapExperience /></div>;
}
