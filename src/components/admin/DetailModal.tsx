import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Dialog,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ImagePreview from './ImagePreview';
import {
    AdminModalBody,
    AdminModalContent,
    AdminModalFrame,
    AdminModalHeader,
    AdminModalRelations,
    AdminRelationCard,
    AdminModalSection,
} from './AdminModal';
import { toast } from 'sonner';
import {
    Users,
    Shield,
    Mail,
    Phone,
    Calendar,
    CheckCircle,
    XCircle,
    Eye,
    MapPin,
    Clock,
    Camera,
    Star,
    Edit,
    MessageSquare,
    ChevronDown,
    AlertCircle,
    Check,
    Flag,
    Store,
    Wrench,
    User,
    Copy,
    ExternalLink,
    Droplet,
    Globe,
    DollarSign,
    Database,
    Languages,
    RefreshCw,
    Hash,
    Activity,
    Bike,
    Gauge,
    Mountain,
    Timer,
    Trophy,
    Flame,
    Award,
    Zap,
    Route as RouteIcon,
    Loader2,
} from 'lucide-react';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEdit: (item: any, type: string) => void;
    onStatusChange?: (id: string, newStatus: string) => void;
    /** POI flags only: open the reported POI in this same detail modal, no tab switch */
    onOpenPoiDetail?: (poiId: string, poiType: string) => void;
    /** Open another record in this same detail modal — enables cross-navigation between linked entities */
    onOpenUser?: (userId: string) => void;
    onOpenParkingSpot?: (spotId: string) => void;
    /** Parking-image submissions only: hard delete the submission + image */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDeleteSubmission?: (submission: any) => void;
    /** When set, render a back arrow in the header — pops the cross-nav history one step */
    onBack?: () => void;
}

function copyId(id: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(id).then(
            () => toast.success('ID vágólapra másolva'),
            () => toast.error('Másolás sikertelen')
        );
    }
}

interface UserActivityProgress {
    xp: number | null;
    current_streak: number | null;
    longest_streak: number | null;
    challenge_completions: number | null;
    challenge_cities: number | null;
    badge_first_ride: number | null;
    badge_commuter: number | null;
    badge_night_rider: number | null;
    badge_supporter: number | null;
    badge_community_hero: number | null;
    badge_marathon_rider: number | null;
    badge_speedster: number | null;
    badge_long_ride: number | null;
    badge_early_bird: number | null;
    badge_weekend_warrior: number | null;
    badge_streak_7: number | null;
    badge_streak_30: number | null;
    badge_explorer: number | null;
    badge_map_scout: number | null;
    badge_challenger: number | null;
    badge_city_racer: number | null;
    badge_globe_trotter: number | null;
}

interface UserActivityRide {
    id: string;
    distance_meters: number | null;
    duration_seconds: number | null;
    average_speed_kmh: number | string | null;
    max_speed_kmh: number | string | null;
    elevation_gain_meters: number | null;
    started_at: string | null;
    challenge_completed: boolean | null;
    favorite_name: string | null;
    is_favorite: boolean | null;
    kind: string | null;
}

interface UserActivityStats {
    totalRides: number;
    totalDistanceKm: number;
    totalDurationSec: number;
    avgSpeedKmh: number;
    maxSpeedKmh: number;
    totalElevationM: number;
    longestRideKm: number;
    fastestAttemptSec: number | null;
    challengeRides: number;
}

const ACTIVITY_BADGE_KEYS: (keyof UserActivityProgress)[] = [
    'badge_first_ride',
    'badge_commuter',
    'badge_night_rider',
    'badge_supporter',
    'badge_community_hero',
    'badge_marathon_rider',
    'badge_speedster',
    'badge_long_ride',
    'badge_early_bird',
    'badge_weekend_warrior',
    'badge_streak_7',
    'badge_streak_30',
    'badge_explorer',
    'badge_map_scout',
    'badge_challenger',
    'badge_city_racer',
    'badge_globe_trotter',
];

const BADGE_LABELS: Record<string, string> = {
    badge_first_ride: 'Első túra',
    badge_commuter: 'Ingázó',
    badge_night_rider: 'Éjszakai lovas',
    badge_supporter: 'Támogató',
    badge_community_hero: 'Közösségi hős',
    badge_marathon_rider: 'Maratoni',
    badge_speedster: 'Gyorsulás',
    badge_long_ride: 'Hosszú túra',
    badge_early_bird: 'Korán kelő',
    badge_weekend_warrior: 'Hétvégi harcos',
    badge_streak_7: '7-napos sorozat',
    badge_streak_30: '30-napos sorozat',
    badge_explorer: 'Felfedező',
    badge_map_scout: 'Térkép-felderítő',
    badge_challenger: 'Kihívó',
    badge_city_racer: 'Városi versenyző',
    badge_globe_trotter: 'Világjáró',
};

function formatActivityDuration(totalSec: number): string {
    if (!totalSec || totalSec <= 0) return '0p';
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    if (h > 0) return `${h}ó ${m}p`;
    return `${m}p`;
}

function formatActivityShort(sec: number | null | undefined): string {
    if (!sec || sec <= 0) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}


export default function DetailModal({
    isOpen,
    onClose,
    item,
    type,
    onEdit,
    onStatusChange,
    onOpenPoiDetail,
    onOpenUser,
    onOpenParkingSpot,
    onDeleteSubmission,
    onBack,
}: DetailModalProps) {
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);
    const [poiCoords, setPoiCoords] = useState<{ lat: number; lon: number; name: string } | null>(null);
    const [poiCoordsLoading, setPoiCoordsLoading] = useState(false);

    // User activity data (loaded only when type === 'user')
    const [activityLoading, setActivityLoading] = useState(false);
    const [activityProgress, setActivityProgress] = useState<UserActivityProgress | null>(null);
    const [activityStats, setActivityStats] = useState<UserActivityStats | null>(null);
    const [activityRecent, setActivityRecent] = useState<UserActivityRide[]>([]);
    const [activityHomeCity, setActivityHomeCity] = useState<string | null>(null);
    const [activitySupporter, setActivitySupporter] = useState<{ is_supporter: boolean; supporter_since: string | null } | null>(null);

    useEffect(() => {
        if (item?.status) {
            setCurrentStatus(item.status);
        }
    }, [item]);

    const fetchPoiCoords = useCallback(async () => {
        if (type !== 'poi_flags' || !item?.poi_id || !item?.poi_type) {
            setPoiCoords(null);
            return;
        }
        const tableMap: Record<string, string> = {
            parking: 'parkingSpots',
            bicycleService: 'bicycleService',
            repairStation: 'repairStation',
            drinkingFountain: 'drinkingFountain',
        };
        const tableName = tableMap[item.poi_type];
        if (!tableName) return;

        setPoiCoordsLoading(true);
        try {
            const { data, error } = await supabase
                .from(tableName)
                .select('name, coordinate')
                .eq('id', item.poi_id)
                .single();
            if (error || !data) {
                setPoiCoords(null);
                return;
            }
            const coord = data.coordinate;
            let lat: number | null = null;
            let lon: number | null = null;
            if (coord && typeof coord === 'object' && coord.type === 'Point' && Array.isArray(coord.coordinates)) {
                [lon, lat] = coord.coordinates;
            } else if (typeof coord === 'string' && coord.length >= 50) {
                try {
                    const coordsHex = coord.substring(18);
                    if (coordsHex.length >= 32) {
                        const lonHex = coordsHex.substring(0, 16);
                        const latHex = coordsHex.substring(16, 32);
                        const lonBuf = new ArrayBuffer(8);
                        const lonView = new DataView(lonBuf);
                        for (let i = 0; i < 8; i++) lonView.setUint8(i, parseInt(lonHex.substr(i * 2, 2), 16));
                        lon = lonView.getFloat64(0, true);
                        const latBuf = new ArrayBuffer(8);
                        const latView = new DataView(latBuf);
                        for (let i = 0; i < 8; i++) latView.setUint8(i, parseInt(latHex.substr(i * 2, 2), 16));
                        lat = latView.getFloat64(0, true);
                    }
                } catch { /* ignore parse errors */ }
            }
            if (lat != null && lon != null) {
                setPoiCoords({ lat, lon, name: data.name || '' });
            } else {
                setPoiCoords(null);
            }
        } catch {
            setPoiCoords(null);
        } finally {
            setPoiCoordsLoading(false);
        }
    }, [type, item?.poi_id, item?.poi_type]);

    useEffect(() => {
        fetchPoiCoords();
    }, [fetchPoiCoords]);

    useEffect(() => {
        let cancelled = false;
        const loadActivity = async () => {
            if (!isOpen || type !== 'user' || !item?.id) {
                setActivityProgress(null);
                setActivityStats(null);
                setActivityRecent([]);
                setActivityHomeCity(null);
                setActivitySupporter(null);
                return;
            }
            setActivityLoading(true);
            try {
                const userId = item.id as string;
                const [
                    { data: profileExtra },
                    { data: progressData },
                    { data: rideRows },
                    { data: bestAttempt },
                ] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('home_city_id, is_supporter, supporter_since')
                        .eq('id', userId)
                        .maybeSingle(),
                    supabase
                        .from('user_progress')
                        .select('xp, current_streak, longest_streak, challenge_completions, challenge_cities, badge_first_ride, badge_commuter, badge_night_rider, badge_supporter, badge_community_hero, badge_marathon_rider, badge_speedster, badge_long_ride, badge_early_bird, badge_weekend_warrior, badge_streak_7, badge_streak_30, badge_explorer, badge_map_scout, badge_challenger, badge_city_racer, badge_globe_trotter')
                        .eq('user_id', userId)
                        .maybeSingle(),
                    supabase
                        .from('ride_summaries')
                        .select('id, distance_meters, duration_seconds, average_speed_kmh, max_speed_kmh, elevation_gain_meters, started_at, challenge_completed, favorite_name, is_favorite, kind')
                        .eq('user_id', userId)
                        .order('started_at', { ascending: false, nullsFirst: false }),
                    supabase
                        .from('challenge_attempts')
                        .select('duration_seconds')
                        .eq('user_id', userId)
                        .eq('status', 'completed')
                        .order('duration_seconds', { ascending: true, nullsFirst: false })
                        .limit(1)
                        .maybeSingle(),
                ]);

                if (cancelled) return;

                if (profileExtra) {
                    setActivitySupporter({
                        is_supporter: !!profileExtra.is_supporter,
                        supporter_since: profileExtra.supporter_since ?? null,
                    });
                    if (profileExtra.home_city_id) {
                        const { data: cityData } = await supabase
                            .from('cities')
                            .select('name')
                            .eq('id', profileExtra.home_city_id)
                            .maybeSingle();
                        if (!cancelled) setActivityHomeCity(cityData?.name ?? null);
                    } else {
                        setActivityHomeCity(null);
                    }
                }

                setActivityProgress(progressData ? (progressData as UserActivityProgress) : null);

                const rides = (rideRows || []) as UserActivityRide[];
                if (rides.length > 0) {
                    let totalDistance = 0;
                    let totalDuration = 0;
                    let speedSum = 0;
                    let speedSamples = 0;
                    let maxSpeed = 0;
                    let totalElev = 0;
                    let longestKm = 0;
                    let challengeRides = 0;
                    for (const r of rides) {
                        const distM = Number(r.distance_meters ?? 0);
                        const durS = Number(r.duration_seconds ?? 0);
                        const avgKmh = Number(r.average_speed_kmh ?? 0);
                        const maxKmh = Number(r.max_speed_kmh ?? 0);
                        const elev = Number(r.elevation_gain_meters ?? 0);
                        totalDistance += distM;
                        totalDuration += durS;
                        if (avgKmh > 0) {
                            speedSum += avgKmh;
                            speedSamples += 1;
                        }
                        if (maxKmh > maxSpeed) maxSpeed = maxKmh;
                        totalElev += elev;
                        const km = distM / 1000;
                        if (km > longestKm) longestKm = km;
                        if (r.challenge_completed) challengeRides += 1;
                    }
                    setActivityStats({
                        totalRides: rides.length,
                        totalDistanceKm: totalDistance / 1000,
                        totalDurationSec: totalDuration,
                        avgSpeedKmh: speedSamples > 0 ? speedSum / speedSamples : 0,
                        maxSpeedKmh: maxSpeed,
                        totalElevationM: totalElev,
                        longestRideKm: longestKm,
                        fastestAttemptSec: bestAttempt?.duration_seconds ?? null,
                        challengeRides,
                    });
                    setActivityRecent(rides.slice(0, 5));
                } else {
                    setActivityStats({
                        totalRides: 0,
                        totalDistanceKm: 0,
                        totalDurationSec: 0,
                        avgSpeedKmh: 0,
                        maxSpeedKmh: 0,
                        totalElevationM: 0,
                        longestRideKm: 0,
                        fastestAttemptSec: bestAttempt?.duration_seconds ?? null,
                        challengeRides: 0,
                    });
                    setActivityRecent([]);
                }
            } catch (err) {
                console.error('Error loading user activity:', err);
            } finally {
                if (!cancelled) setActivityLoading(false);
            }
        };
        loadActivity();
        return () => { cancelled = true; };
    }, [isOpen, type, item?.id]);

    const handleStatusChange = (newStatus: string) => {
        setCurrentStatus(newStatus);
        if (onStatusChange && item) {
            onStatusChange(item.id, newStatus);
        }
    };

    if (!item) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parseWKBPoint = (wkb: any) => {
        if (!wkb) return null;
        if (typeof wkb === 'object' && wkb.type === 'Point' && Array.isArray(wkb.coordinates)) {
            const [lon, lat] = wkb.coordinates;
            return { lat, lon };
        }
        if (typeof wkb !== 'string') return null;
        try {
            const coordsHex = wkb.substring(18);
            if (coordsHex.length < 32) return null;
            const lonHex = coordsHex.substring(0, 16);
            const latHex = coordsHex.substring(16, 32);
            const lonBuffer = new ArrayBuffer(8);
            const lonView = new DataView(lonBuffer);
            for (let i = 0; i < 8; i++) {
                lonView.setUint8(i, parseInt(lonHex.substr(i * 2, 2), 16));
            }
            const lon = lonView.getFloat64(0, true);
            const latBuffer = new ArrayBuffer(8);
            const latView = new DataView(latBuffer);
            for (let i = 0; i < 8; i++) {
                latView.setUint8(i, parseInt(latHex.substr(i * 2, 2), 16));
            }
            const lat = latView.getFloat64(0, true);
            return { lat, lon };
        } catch (error) {
            console.error('Error parsing WKB:', error);
            return null;
        }
    };

    const getCoordinates = () => {
        if (item.lat && item.lon) {
            return { lat: item.lat, lon: item.lon };
        }
        if (item.coordinate) {
            return parseWKBPoint(item.coordinate);
        }
        return null;
    };

    const coords = getCoordinates();

    if (type === 'parking_image') {
        const submissionCoords = parseWKBPoint(item.parking_coordinate);
        const parkingOsmEditUrl = submissionCoords
            ? `https://www.openstreetmap.org/edit?#map=19/${submissionCoords.lat}/${submissionCoords.lon}`
            : null;

        const submissionStatuses = [
            { value: 'pending', label: 'Függőben', color: 'bg-yellow-500' },
            { value: 'approved', label: 'Jóváhagyva', color: 'bg-green-500' },
            { value: 'rejected', label: 'Elutasítva', color: 'bg-red-500' },
        ];
        const currentSubmissionStatus = submissionStatuses.find(s => s.value === currentStatus) || submissionStatuses[0];
        const uploaderDisplayName = item.reporter_username || item.reporter_full_name || (item.user_id ? `${String(item.user_id).slice(0, 8)}…` : 'Ismeretlen');
        const uploaderInitial = (item.reporter_username || item.reporter_full_name || item.reporter_email || 'U').charAt(0).toUpperCase();

        return (
            <>
                <Dialog open={isOpen} onOpenChange={onClose}>
                    <AdminModalContent variant="inspector">
                        <AdminModalFrame>
                            <AdminModalHeader
                                eyebrow="Képmoderáció"
                                title="Parkolókép ellenőrzése"
                                subtitle={item.parking_name || 'Felhasználó által beküldött kép'}
                                icon={Camera}
                                onBack={onBack}
                                backLabel="Vissza az előző rekordhoz"
                                meta={(
                                    <>
                                        <code>#{item.id?.substring(0, 8)}</code>
                                        <button type="button" className="admin-modal-meta-action" onClick={() => copyId(item.id)} aria-label="ID másolása" title="ID másolása">
                                            <Copy />
                                        </button>
                                        <span>{new Date(item.created_at).toLocaleDateString('hu-HU')}</span>
                                        <span className="admin-modal-state" data-tone={currentStatus === 'approved' ? 'success' : currentStatus === 'rejected' ? 'danger' : 'warning'}>
                                            <i className={currentSubmissionStatus.color} />
                                            {currentSubmissionStatus.label}
                                        </span>
                                    </>
                                )}
                            />

                            <AdminModalBody className="space-y-6">
                                    {/* Image — click to enlarge */}
                                    {item.image_url && (
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                                <Eye className="h-4 w-4" />
                                                Beküldött kép
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => setImagePreviewUrl(item.image_url)}
                                                className="block w-full rounded-xl overflow-hidden border border-white/10 bg-zinc-950 group relative"
                                                title="Kattints a nagyításhoz"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={item.image_url}
                                                    alt="Parkoló kép"
                                                    className="w-full max-h-[420px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                                                />
                                                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Nagyítás
                                                </div>
                                            </button>
                                        </div>
                                    )}

                                    <AdminModalRelations>
                                        <AdminRelationCard
                                            label="Feltöltő"
                                            title={uploaderDisplayName}
                                            description={item.reporter_email || item.user_id || 'Nincs kapcsolt profil'}
                                            icon={(
                                                <Avatar>
                                                    <AvatarImage src={item.reporter_avatar_url} alt={uploaderDisplayName} />
                                                    <AvatarFallback>{uploaderInitial}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            onClick={onOpenUser && item.user_id ? () => onOpenUser(item.user_id) : undefined}
                                        />
                                        <AdminRelationCard
                                            label="Érintett parkoló"
                                            title={item.parking_name || 'Ismeretlen parkoló'}
                                            description={item.parking_osm_id ? `${item.parking_city || 'Nincs város'} · OSM ${item.parking_osm_id}` : (item.parking_city || 'Nincs város megadva')}
                                            icon={<MapPin />}
                                            onClick={onOpenParkingSpot && item.parking_spot_id ? () => onOpenParkingSpot(item.parking_spot_id) : undefined}
                                            action={parkingOsmEditUrl ? (
                                                <a href={parkingOsmEditUrl} target="_blank" rel="noopener noreferrer" title="Parkoló megnyitása az OSM szerkesztőben">
                                                    <Edit />
                                                    <span>OSM szerkesztő</span>
                                                </a>
                                            ) : undefined}
                                        />
                                    </AdminModalRelations>

                                    {/* Map — only when we have coordinates */}
                                    {submissionCoords && (
                                        <div>
                                            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                                                <MapPin className="h-4 w-4" />
                                                Hely a térképen
                                            </h3>
                                            <div className="flex gap-6 mb-3">
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground mb-0.5">Szélesség (Latitude)</p>
                                                    <p className="text-sm font-mono font-semibold text-white">{submissionCoords.lat.toFixed(6)}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground mb-0.5">Hosszúság (Longitude)</p>
                                                    <p className="text-sm font-mono font-semibold text-white">{submissionCoords.lon.toFixed(6)}</p>
                                                </div>
                                            </div>
                                            <div className="rounded-lg overflow-hidden border border-border mb-3">
                                                <iframe
                                                    width="100%"
                                                    height="250"
                                                    frameBorder="0"
                                                    style={{ border: 0, pointerEvents: 'none' }}
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(submissionCoords.lon - 0.002).toFixed(6)},${(submissionCoords.lat - 0.002).toFixed(6)},${(submissionCoords.lon + 0.002).toFixed(6)},${(submissionCoords.lat + 0.002).toFixed(6)}&layer=mapnik&marker=${submissionCoords.lat.toFixed(6)},${submissionCoords.lon.toFixed(6)}`}
                                                    title="Parking Spot Map"
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                size="sm"
                                                onClick={() => window.open(`https://www.google.com/maps?q=${submissionCoords.lat},${submissionCoords.lon}`, '_blank')}
                                            >
                                                <MapPin className="h-3.5 w-3.5 mr-2" />
                                                Megnyitás Google Maps-en
                                            </Button>
                                        </div>
                                    )}

                                    {/* Review trail */}
                                    {item.reviewed_at && (
                                        <>
                                            <Separator className="bg-border" />
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                                    Áttekintés
                                                </h3>
                                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-200 rounded-lg text-sm">
                                                    {new Date(item.reviewed_at).toLocaleDateString('hu-HU', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}
                            </AdminModalBody>

                            {/* Footer — full action bar so admin doesn't have to exit and reopen the dropdown */}
                            <div className="admin-modal-footer justify-between flex-wrap">
                                <div className="flex gap-2">
                                    {onDeleteSubmission && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                            onClick={() => {
                                                onDeleteSubmission(item);
                                                onClose();
                                            }}
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Kérelem és kép törlése
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {onStatusChange && currentStatus !== 'rejected' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                            onClick={() => handleStatusChange('rejected')}
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Elutasítás
                                        </Button>
                                    )}
                                    {onStatusChange && currentStatus !== 'approved' && (
                                        <Button
                                            size="sm"
                                            className="gap-2 bg-green-600 hover:bg-green-500 text-white"
                                            onClick={() => handleStatusChange('approved')}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Jóváhagyás
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </AdminModalFrame>
                    </AdminModalContent>
                </Dialog>
                {imagePreviewUrl && (
                    <ImagePreview src={imagePreviewUrl} alt="Parkoló kép" onClose={() => setImagePreviewUrl(null)} />
                )}
            </>
        );
    }

    if (type === 'poi_flags') {
        const getPoiTypeLabel = (poiType: string) => {
            switch (poiType) {
                case 'parking': return 'Parkoló';
                case 'bicycleService': return 'Szerviz';
                case 'repairStation': return 'Javító állomás';
                case 'drinkingFountain': return 'Ivókút';
                default: return poiType;
            }
        };

        const getPoiTypeIcon = (poiType: string) => {
            switch (poiType) {
                case 'parking': return <MapPin className="h-5 w-5 text-green-400" />;
                case 'bicycleService': return <Store className="h-5 w-5 text-blue-400" />;
                case 'repairStation': return <Wrench className="h-5 w-5 text-orange-400" />;
                case 'drinkingFountain': return <Droplet className="h-5 w-5 text-cyan-400" />;
                default: return <MapPin className="h-5 w-5 text-zinc-400" />;
            }
        };

        const getReasonLabel = (reason: string) => {
            const labels: Record<string, string> = {
                wrong_location: 'Rossz helyen van',
                doesnt_exist: 'Nem létezik',
                incorrect_info: 'Hibás információ',
                duplicate: 'Duplikált',
                other: 'Egyéb',
            };
            return labels[reason] || reason;
        };

        const poiFlagStatuses = [
            { value: 'pending', label: 'Függőben', color: 'bg-yellow-500', hoverShadow: 'group-hover:shadow-[0_0_8px_rgba(234,179,8,0.6)]' },
            { value: 'reviewed', label: 'Áttekintve', color: 'bg-blue-500', hoverShadow: 'group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)]' },
            { value: 'resolved', label: 'Megoldva', color: 'bg-green-500', hoverShadow: 'group-hover:shadow-[0_0_8px_rgba(34,197,94,0.6)]' },
            { value: 'dismissed', label: 'Elutasítva', color: 'bg-zinc-500', hoverShadow: 'group-hover:shadow-[0_0_8px_rgba(113,113,122,0.6)]' },
        ];

        const currentStatusObj = poiFlagStatuses.find(s => s.value === currentStatus) || poiFlagStatuses[0];

        const reporterDisplayName = item.reporter_username || item.reporter_full_name || (item.user_id ? `${String(item.user_id).slice(0, 8)}…` : 'Ismeretlen');
        const reporterInitial = (item.reporter_username || item.reporter_full_name || 'U').charAt(0).toUpperCase();
        const poiName = poiCoords?.name || getPoiTypeLabel(item.poi_type);

        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <AdminModalContent variant="inspector">
                    <AdminModalFrame>
                        <AdminModalHeader
                            eyebrow="POI moderáció"
                            title={getReasonLabel(item.reason)}
                            subtitle={poiName}
                            icon={Flag}
                            onBack={onBack}
                            backLabel="Vissza az előző rekordhoz"
                            meta={(
                                <>
                                    <code>#{item.id.substring(0, 8)}</code>
                                    <button type="button" className="admin-modal-meta-action" onClick={() => copyId(item.id)} aria-label="ID másolása" title="ID másolása">
                                        <Copy />
                                    </button>
                                    <span>{new Date(item.created_at).toLocaleDateString('hu-HU')}</span>
                                    <span className="admin-modal-state" data-tone={currentStatus === 'resolved' ? 'success' : currentStatus === 'dismissed' ? 'neutral' : currentStatus === 'reviewed' ? 'info' : 'warning'}>
                                        <i className={currentStatusObj.color} />
                                        {currentStatusObj.label}
                                    </span>
                                </>
                            )}
                        />

                        <AdminModalBody className="space-y-6">
                                <AdminModalRelations>
                                    <AdminRelationCard
                                        label="Érintett POI"
                                        title={poiName}
                                        description={`${getPoiTypeLabel(item.poi_type)} · ${item.poi_id || 'Nincs azonosító'}`}
                                        icon={getPoiTypeIcon(item.poi_type)}
                                        onClick={onOpenPoiDetail && item.poi_id && item.poi_type ? () => onOpenPoiDetail(item.poi_id, item.poi_type) : undefined}
                                    />
                                    <AdminRelationCard
                                        label="Bejelentő"
                                        title={reporterDisplayName}
                                        description={item.reporter_email || item.user_id || 'Nincs kapcsolt profil'}
                                        icon={(
                                            <Avatar>
                                                <AvatarImage src={item.reporter_avatar_url} alt={reporterDisplayName} />
                                                <AvatarFallback>{reporterInitial}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        onClick={onOpenUser && item.user_id ? () => onOpenUser(item.user_id) : undefined}
                                    />
                                </AdminModalRelations>

                                {/* Reason + comment */}
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Bejelentés oka
                                    </h3>
                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                                        <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border-zinc-700">
                                            {getReasonLabel(item.reason)}
                                        </Badge>
                                        {item.comment && (
                                            <div className="text-sm text-zinc-300 whitespace-pre-wrap pt-1 border-t border-white/5">
                                                {item.comment}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Map — only when we have coordinates */}
                                {poiCoordsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
                                        <span className="ml-3 text-sm text-zinc-500">Térkép betöltése…</span>
                                    </div>
                                ) : poiCoords ? (
                                    <div>
                                        <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                                            <MapPin className="h-4 w-4" />
                                            Hely a térképen
                                        </h3>
                                        <div className="flex gap-6 mb-3">
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground mb-0.5">Szélesség (Latitude)</p>
                                                <p className="text-sm font-mono font-semibold text-white">{poiCoords.lat.toFixed(6)}</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground mb-0.5">Hosszúság (Longitude)</p>
                                                <p className="text-sm font-mono font-semibold text-white">{poiCoords.lon.toFixed(6)}</p>
                                            </div>
                                        </div>
                                        <div className="rounded-lg overflow-hidden border border-border mb-3">
                                            <iframe
                                                width="100%"
                                                height="250"
                                                frameBorder="0"
                                                style={{ border: 0, pointerEvents: 'none' }}
                                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(poiCoords.lon - 0.002).toFixed(6)},${(poiCoords.lat - 0.002).toFixed(6)},${(poiCoords.lon + 0.002).toFixed(6)},${(poiCoords.lat + 0.002).toFixed(6)}&layer=mapnik&marker=${poiCoords.lat.toFixed(6)},${poiCoords.lon.toFixed(6)}`}
                                                title="POI Location Map"
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            size="sm"
                                            onClick={() => window.open(`https://www.google.com/maps?q=${poiCoords.lat},${poiCoords.lon}`, '_blank')}
                                        >
                                            <MapPin className="h-3.5 w-3.5 mr-2" />
                                            Megnyitás Google Maps-en
                                        </Button>
                                    </div>
                                ) : null}

                                {/* Reported coordinates — only if user submitted them with the flag */}
                                {item.reported_latitude && item.reported_longitude && (
                                    <>
                                        <Separator className="bg-border" />
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                                Bejelentett koordináták
                                            </h3>
                                            <div className="flex gap-6">
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground mb-0.5">Szélesség</p>
                                                    <p className="text-sm font-mono font-semibold text-white">{item.reported_latitude.toFixed(6)}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground mb-0.5">Hosszúság</p>
                                                    <p className="text-sm font-mono font-semibold text-white">{item.reported_longitude.toFixed(6)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Review trail */}
                                {item.reviewed_at && (
                                    <>
                                        <Separator className="bg-border" />
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                                Áttekintés
                                            </h3>
                                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-200 rounded-lg text-sm">
                                                {new Date(item.reviewed_at).toLocaleDateString('hu-HU', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                        </AdminModalBody>

                        {/* Footer — quick status actions, same shape as parking_image accept/reject */}
                        <div className="admin-modal-footer flex-wrap">
                            {onStatusChange && currentStatus !== 'dismissed' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 border-zinc-500/30 text-zinc-300 hover:bg-zinc-500/10"
                                    onClick={() => handleStatusChange('dismissed')}
                                >
                                    <XCircle className="w-4 h-4" />
                                    Elutasítás
                                </Button>
                            )}
                            {onStatusChange && currentStatus !== 'reviewed' && currentStatus !== 'resolved' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                                    onClick={() => handleStatusChange('reviewed')}
                                >
                                    <Eye className="w-4 h-4" />
                                    Áttekintve
                                </Button>
                            )}
                            {onStatusChange && currentStatus !== 'resolved' && (
                                <Button
                                    size="sm"
                                    className="gap-2 bg-green-600 hover:bg-green-500 text-white"
                                    onClick={() => handleStatusChange('resolved')}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Megoldva
                                </Button>
                            )}
                        </div>
                    </AdminModalFrame>
                </AdminModalContent>
            </Dialog>
        );
    }

    if (type === 'feedback') {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <AdminModalContent variant="inspector">
                    <AdminModalFrame>
                        <AdminModalHeader
                            eyebrow="Visszajelzés"
                            title={item.title || 'Visszajelzés részletei'}
                            subtitle="Bejelentés áttekintése és feldolgozása"
                            icon={MessageSquare}
                            onBack={onBack}
                            backLabel="Vissza az előző rekordhoz"
                            meta={(
                                <>
                                    <code title={item.id}>#{item.id.substring(0, 8)}</code>
                                    <button
                                        type="button"
                                        onClick={() => copyId(item.id)}
                                        className="ops-icon-action"
                                        title="ID másolása"
                                        aria-label="ID másolása"
                                    >
                                        <Copy />
                                    </button>
                                    <span>·</span>
                                    <span>{new Date(item.created_at).toLocaleDateString('hu-HU')}</span>
                                </>
                            )}
                        />

                        <AdminModalBody className="space-y-6">
                                {/* Title & Description */}
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                        Cím
                                    </h3>
                                    <p className="text-lg font-semibold text-white">{item.title}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                        Leírás
                                    </h3>
                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-zinc-300 whitespace-pre-wrap">
                                        {item.description}
                                    </div>
                                </div>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <Shield className="w-3 h-3" /> Típus
                                        </h3>
                                        <div className="flex items-center">
                                            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium capitalize bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border-zinc-700">
                                                {item.type}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" /> Prioritás
                                        </h3>
                                        <div className="flex items-center">
                                            <Badge
                                                className={`px-3 py-1 text-sm font-medium capitalize border-0 ${item.priority === 'high' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                                                    item.priority === 'medium' ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' :
                                                        'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                                    }`}
                                            >
                                                {item.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <Users className="w-3 h-3" /> Kategória
                                        </h3>
                                        <p className="text-sm font-medium text-zinc-200 capitalize pl-1">
                                            {item.category?.replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <CheckCircle className="w-3 h-3" /> Státusz
                                        </h3>
                                        {onStatusChange ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`w-full justify-between border-white/10 bg-zinc-900/50 hover:bg-zinc-900 hover:text-white capitalize font-normal ${currentStatus === 'resolved' ? 'text-green-400 border-green-900/50' :
                                                            currentStatus === 'closed' ? 'text-zinc-400' :
                                                                currentStatus === 'in_progress' ? 'text-blue-400 border-blue-900/50' :
                                                                    'text-zinc-200'
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${currentStatus === 'open' ? 'bg-yellow-500' :
                                                                currentStatus === 'in_progress' ? 'bg-blue-500' :
                                                                    currentStatus === 'resolved' ? 'bg-green-500' :
                                                                        currentStatus === 'closed' ? 'bg-zinc-500' :
                                                                            'bg-purple-500'
                                                                }`} />
                                                            {currentStatus === 'open' ? 'Nyitott' :
                                                                currentStatus === 'in_progress' ? 'Folyamatban' :
                                                                    currentStatus === 'resolved' ? 'Megoldva' :
                                                                        currentStatus === 'closed' ? 'Lezárt' :
                                                                            currentStatus === 'duplicate' ? 'Duplikált' :
                                                                                currentStatus?.replace(/_/g, ' ')}
                                                        </span>
                                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-[180px] bg-zinc-900 border-zinc-800">
                                                    <DropdownMenuItem onClick={() => handleStatusChange('open')} className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 group-hover:shadow-[0_0_8px_rgba(234,179,8,0.6)] transition-shadow" />
                                                        Nyitott
                                                        {currentStatus === 'open' && <Check className="ml-auto h-3 w-3" />}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange('in_progress')} className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-shadow" />
                                                        Folyamatban
                                                        {currentStatus === 'in_progress' && <Check className="ml-auto h-3 w-3" />}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange('resolved')} className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 group-hover:shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-shadow" />
                                                        Megoldva
                                                        {currentStatus === 'resolved' && <Check className="ml-auto h-3 w-3" />}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange('duplicate')} className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                        <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 group-hover:shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-shadow" />
                                                        Duplikált
                                                        {currentStatus === 'duplicate' && <Check className="ml-auto h-3 w-3" />}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange('closed')} className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                        <span className="w-2 h-2 rounded-full bg-zinc-500 mr-2 group-hover:shadow-[0_0_8px_rgba(113,113,122,0.6)] transition-shadow" />
                                                        Lezárt
                                                        {currentStatus === 'closed' && <Check className="ml-auto h-3 w-3" />}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <div className="flex items-center gap-2 text-white capitalize pl-1">
                                                <span className={`w-2 h-2 rounded-full ${item.status === 'open' ? 'bg-yellow-500' :
                                                    item.status === 'in_progress' ? 'bg-blue-500' :
                                                        item.status === 'resolved' ? 'bg-green-500' :
                                                            item.status === 'closed' ? 'bg-zinc-500' :
                                                                'bg-purple-500'
                                                    }`} />
                                                {item.status?.replace(/_/g, ' ')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            <Separator className="bg-border" />

                            <AdminModalRelations>
                                <AdminRelationCard
                                    label="Email írása"
                                    title={item.contact_email || 'Nincs megadva elérhetőség'}
                                    description={item.contact_email ? 'Közvetlen válasz a levelezőben' : undefined}
                                    icon={item.contact_email ? <Mail /> : <XCircle />}
                                    href={item.contact_email ? `mailto:${item.contact_email}?subject=${encodeURIComponent(`ParkSafe: ${item.title || 'visszajelzés'}`)}` : undefined}
                                />
                                {item.user_id ? (
                                    <AdminRelationCard
                                        label="Beküldő profilja"
                                        title={item.reporter_username || item.reporter_full_name || 'Felhasználói profil'}
                                        description={item.user_id}
                                        icon={<User />}
                                        onClick={onOpenUser ? () => onOpenUser(item.user_id) : undefined}
                                    />
                                ) : null}
                            </AdminModalRelations>
                            {/* Admin Notes */}
                            {item.admin_notes && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                        Admin Jegyzetek
                                    </h3>
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 rounded-lg text-sm">
                                        {item.admin_notes}
                                    </div>
                                </div>
                            )}
                        </AdminModalBody>
                    </AdminModalFrame>
                </AdminModalContent>
            </Dialog >
        );
    }

    if (type === 'user') {
        const profileName = item.username || item.full_name || 'Nincs megadva';
        const profileInitial = (item.username || item.full_name || item.email || 'U').charAt(0).toUpperCase();
        const registeredAt = item.created_at
            ? new Date(item.created_at).toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
            : 'Ismeretlen';
        const xpVal = activityProgress?.xp ?? 0;
        const currentStreak = activityProgress?.current_streak ?? 0;
        const longestStreak = activityProgress?.longest_streak ?? 0;
        const challengeCompletions = activityProgress?.challenge_completions ?? 0;
        const challengeCities = activityProgress?.challenge_cities ?? 0;
        const unlockedBadges = activityProgress
            ? ACTIVITY_BADGE_KEYS.filter(k => Number(activityProgress[k] ?? 0) > 0)
            : [];
        const stats = activityStats;
        const hasAnyActivity = (stats?.totalRides ?? 0) > 0 || challengeCompletions > 0 || xpVal > 0;

        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <AdminModalContent variant="inspector">
                    <AdminModalFrame>
                        <AdminModalHeader
                            eyebrow="Felhasználói profil"
                            title={profileName}
                            subtitle={item.full_name && item.full_name !== profileName ? item.full_name : (item.email || 'Profil és aktivitás')}
                            icon={Users}
                            onBack={onBack}
                            backLabel="Vissza az előző rekordhoz"
                            meta={(
                                <>
                                    <span className="admin-modal-state" data-tone={item.role === 'admin' ? 'info' : 'neutral'}>
                                        <i />
                                        {item.role === 'admin' ? 'Adminisztrátor' : 'Felhasználó'}
                                    </span>
                                    {item.id ? <code>#{String(item.id).substring(0, 8)}</code> : null}
                                    {item.id ? (
                                        <button type="button" className="admin-modal-meta-action" onClick={() => copyId(item.id)} aria-label="ID másolása" title="ID másolása">
                                            <Copy />
                                        </button>
                                    ) : null}
                                </>
                            )}
                        />

                        <AdminModalBody className="admin-user-profile">
                            <section className="admin-profile-identity" aria-label="Profil összefoglaló">
                                <Avatar className="admin-profile-avatar">
                                    <AvatarImage src={item.avatar_url} alt={profileName} />
                                    <AvatarFallback>{profileInitial}</AvatarFallback>
                                </Avatar>
                                <div className="admin-profile-identity-copy">
                                    <p className="admin-profile-kicker">ParkSafe tag</p>
                                    <h2>{profileName}</h2>
                                    <p>{item.email || 'Nincs email cím megadva'}</p>
                                    <div className="admin-profile-tags">
                                        {activityHomeCity ? <span><MapPin />{activityHomeCity}</span> : null}
                                        {activitySupporter?.is_supporter ? (
                                            <span data-tone="supporter">
                                                <Star />Támogató
                                                {activitySupporter.supporter_since ? ` · ${new Date(activitySupporter.supporter_since).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })}` : ''}
                                            </span>
                                        ) : null}
                                        {xpVal > 0 ? <span data-tone="xp"><Zap />{xpVal.toLocaleString('hu-HU')} XP</span> : null}
                                    </div>
                                </div>
                                <div className="admin-profile-identity-actions">
                                    {item.email ? (
                                        <a href={`mailto:${item.email}`}>
                                            <Mail />
                                            Email írása
                                        </a>
                                    ) : null}
                                    {item.id ? (
                                        <button type="button" onClick={() => copyId(item.id)}>
                                            <Copy />
                                            UUID másolása
                                        </button>
                                    ) : null}
                                </div>
                            </section>

                            <div className="admin-profile-facts">
                                <div>
                                    <Mail />
                                    <span>Email cím</span>
                                    {item.email ? <a href={`mailto:${item.email}`}>{item.email}</a> : <strong>Nincs megadva</strong>}
                                </div>
                                <div>
                                    <Phone />
                                    <span>Telefonszám</span>
                                    {item.phone ? <a href={`tel:${item.phone}`}>{item.phone}</a> : <strong>Nincs megadva</strong>}
                                </div>
                                <div>
                                    <Calendar />
                                    <span>Regisztráció</span>
                                    <strong>{registeredAt}</strong>
                                </div>
                            </div>

                            <AdminModalSection title="Aktivitás" icon={Activity} description={activityHomeCity || undefined}>
                                {activityLoading ? (
                                    <div className="admin-profile-empty" role="status">
                                        <Loader2 className="animate-spin" />
                                        <span>Aktivitás betöltése…</span>
                                    </div>
                                ) : !hasAnyActivity ? (
                                    <div className="admin-profile-empty">
                                        <Bike />
                                        <div>
                                            <strong>Még nincs rögzített aktivitás</strong>
                                            <span>A felhasználó első túrája után itt jelennek meg az adatok.</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="admin-profile-stat-strip">
                                            <div><Bike /><span>Túrák</span><strong>{(stats?.totalRides ?? 0).toLocaleString('hu-HU')}</strong></div>
                                            <div><RouteIcon /><span>Össztáv</span><strong>{(stats?.totalDistanceKm ?? 0).toFixed(1)} <small>km</small></strong></div>
                                            <div><Gauge /><span>Átlagsebesség</span><strong>{(stats?.avgSpeedKmh ?? 0).toFixed(1)} <small>km/h</small></strong></div>
                                            <div><Zap /><span>XP</span><strong>{xpVal.toLocaleString('hu-HU')}</strong></div>
                                        </div>

                                        <div className="admin-profile-columns">
                                            <section className="admin-profile-data-section">
                                                <header><Bike /><h3>Kerékpározás</h3></header>
                                                <dl>
                                                    <div><dt><Gauge />Max. sebesség</dt><dd>{(stats?.maxSpeedKmh ?? 0).toFixed(1)} km/h</dd></div>
                                                    <div><dt><Timer />Összes idő</dt><dd>{formatActivityDuration(stats?.totalDurationSec ?? 0)}</dd></div>
                                                    <div><dt><RouteIcon />Leghosszabb túra</dt><dd>{(stats?.longestRideKm ?? 0).toFixed(2)} km</dd></div>
                                                    <div><dt><Mountain />Szintemelkedés</dt><dd>{Math.round(stats?.totalElevationM ?? 0).toLocaleString('hu-HU')} m</dd></div>
                                                </dl>
                                            </section>
                                            <section className="admin-profile-data-section">
                                                <header><Trophy /><h3>Kihívások &amp; sorozatok</h3></header>
                                                <dl>
                                                    <div><dt><Trophy />Teljesítések</dt><dd>{challengeCompletions.toLocaleString('hu-HU')}</dd></div>
                                                    <div><dt><MapPin />Városok</dt><dd>{challengeCities.toLocaleString('hu-HU')}</dd></div>
                                                    <div><dt><Timer />Legjobb idő</dt><dd>{formatActivityShort(stats?.fastestAttemptSec)}</dd></div>
                                                    <div><dt><Flame />Sorozat</dt><dd>{currentStreak} / {longestStreak} nap</dd></div>
                                                </dl>
                                            </section>
                                        </div>
                                    </>
                                )}
                            </AdminModalSection>

                            {!activityLoading && hasAnyActivity ? (
                                <AdminModalSection
                                    title="Jelvények"
                                    icon={Award}
                                    description={`${unlockedBadges.length} / ${ACTIVITY_BADGE_KEYS.length} megszerezve`}
                                >
                                    {unlockedBadges.length === 0 ? (
                                        <p className="admin-profile-muted">Nincs megszerzett jelvény.</p>
                                    ) : (
                                        <div className="admin-profile-badges" role="list">
                                            {unlockedBadges.map(k => (
                                                <span key={k} role="listitem" title={`${BADGE_LABELS[k] || k} — szint ${activityProgress?.[k] ?? 0}`}>
                                                    <Award />
                                                    {BADGE_LABELS[k] || k}
                                                    {Number(activityProgress?.[k] ?? 0) > 1 ? <b>×{activityProgress?.[k]}</b> : null}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </AdminModalSection>
                            ) : null}

                            {activityRecent.length > 0 ? (
                                <AdminModalSection title="Legutóbbi túrák" icon={Clock} description={`${activityRecent.length} legutóbbi rekord`}>
                                    <div className="admin-profile-rides" role="list">
                                        {activityRecent.map(r => {
                                            const km = ((r.distance_meters ?? 0) / 1000).toFixed(1);
                                            const date = r.started_at
                                                ? new Date(r.started_at).toLocaleDateString('hu-HU', { year: '2-digit', month: 'short', day: 'numeric' })
                                                : '—';
                                            const avg = Number(r.average_speed_kmh ?? 0).toFixed(1);
                                            return (
                                                <article key={r.id} role="listitem">
                                                    <span className="admin-profile-ride-icon">{r.challenge_completed ? <Trophy /> : <Bike />}</span>
                                                    <div><strong>{r.favorite_name || date}</strong>{r.favorite_name ? <span>{date}</span> : null}</div>
                                                    <dl>
                                                        <div><dt>Táv</dt><dd>{km} km</dd></div>
                                                        <div><dt>Idő</dt><dd>{formatActivityShort(r.duration_seconds)}</dd></div>
                                                        <div><dt>Átlag</dt><dd>{avg} km/h</dd></div>
                                                    </dl>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </AdminModalSection>
                            ) : null}
                        </AdminModalBody>
                    </AdminModalFrame>
                </AdminModalContent>
            </Dialog>
        );
    }

    // Location Details (Parking, Service, Repair, Drinking Fountain)
    const locationIcon = type === 'parking' ? MapPin : type === 'service' ? Store : type === 'drinking_fountain' ? Droplet : Wrench;
    const LocationIcon = locationIcon;
    const locationTypeLabel = type === 'parking' ? 'Bicikliparkoló' : type === 'service' ? 'Szerviz vagy bolt' : type === 'drinking_fountain' ? 'Ivókút' : 'Javítóállomás';

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <AdminModalContent variant="inspector">
                    <AdminModalFrame>
                        <AdminModalHeader
                            eyebrow={locationTypeLabel}
                            title={item.name || 'Névtelen helyszín'}
                            subtitle={item.city || 'Nincs város megadva'}
                            icon={LocationIcon}
                            onBack={onBack}
                            backLabel="Vissza az előző rekordhoz"
                            meta={(
                                <>
                                    <span className="admin-modal-state" data-tone={item.available ? 'success' : 'danger'}>
                                        <i />
                                        {item.available ? 'Aktív' : 'Inaktív'}
                                    </span>
                                    <code>#{String(item.id).substring(0, 8)}</code>
                                    <button type="button" className="admin-modal-meta-action" onClick={() => copyId(item.id)} aria-label="ID másolása" title="ID másolása">
                                        <Copy />
                                    </button>
                                </>
                            )}
                        />

                        {/* Scrollable Content */}
                        <AdminModalBody className="space-y-6">
                                {/* Image Gallery */}
                                {item.picture_url && item.picture_url.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            Képek ({item.picture_url.length})
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {item.picture_url.map((url: string, index: number) => (
                                                <div
                                                    key={index}
                                                    className="relative w-28 h-28 rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors group"
                                                    onClick={() => setImagePreviewUrl(url)}
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`${item.name} - ${index + 1}`}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Alapadatok */}
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Alapadatok</h3>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex-1 min-w-[200px]">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                    <MapPin className="h-3 w-3" />
                                                    Város
                                                </p>
                                                <p className="text-sm font-medium">{item.city}</p>
                                            </div>

                                            {(type === 'parking' || type === 'repair') && item.covered !== undefined && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                        <Shield className="h-3 w-3" />
                                                        Fedett
                                                    </p>
                                                    <p className="text-sm font-medium">{item.covered ? 'Igen' : 'Nem'}</p>
                                                </div>
                                            )}

                                            {type === 'parking' && item.is_open_24h !== undefined && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        24 órás
                                                    </p>
                                                    <p className="text-sm font-medium">{item.is_open_24h ? 'Igen' : 'Nem'}</p>
                                                </div>
                                            )}

                                            {type === 'parking' && item.has_camera !== undefined && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                        <Camera className="h-3 w-3" />
                                                        Kamera
                                                    </p>
                                                    <p className="text-sm font-medium">{item.has_camera ? 'Igen' : 'Nem'}</p>
                                                </div>
                                            )}

                                            {type === 'parking' && item.capacity_level && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                        <Users className="h-3 w-3" />
                                                        Kapacitás
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {item.capacity_level === 'small' ? 'Kis (1-10 hely)' :
                                                            item.capacity_level === 'medium' ? 'Közepes (11-50 hely)' :
                                                                item.capacity_level === 'large' ? 'Nagy (50+ hely)' :
                                                                    item.capacity_level}
                                                    </p>
                                                </div>
                                            )}

                                            {type === 'repair' && item.free !== undefined && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                        <Star className="h-3 w-3" />
                                                        Ingyenes
                                                    </p>
                                                    <p className="text-sm font-medium">{item.free ? 'Igen' : 'Nem'}</p>
                                                </div>
                                            )}

                                            {type === 'service' && item.phone && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                        <Phone className="h-3 w-3" />
                                                        Telefonszám
                                                    </p>
                                                    <p className="text-sm font-medium">{item.phone}</p>
                                                </div>
                                            )}

                                            {type === 'service' && item.website && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                        <Globe className="h-3 w-3" />
                                                        Weboldal
                                                    </p>
                                                    <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline break-all">
                                                        {item.website}
                                                    </a>
                                                </div>
                                            )}

                                            {type === 'service' && item.opening_hours && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        Nyitvatartás
                                                    </p>
                                                    <p className="text-sm font-medium">{item.opening_hours}</p>
                                                </div>
                                            )}

                                            {type === 'service' && item.rating && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                        <Star className="h-3 w-3" />
                                                        Értékelés
                                                    </p>
                                                    <p className="text-sm font-medium">{item.rating} / 5</p>
                                                </div>
                                            )}

                                            {type === 'service' && item.price_range && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                        <DollarSign className="h-3 w-3" />
                                                        Árkategória
                                                    </p>
                                                    <p className="text-sm font-medium">{item.price_range}</p>
                                                </div>
                                            )}
                                        </div>

                                        {type === 'service' && Array.isArray(item.services) && item.services.length > 0 && (
                                            <div className="w-full">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
                                                    <Wrench className="h-3 w-3" />
                                                    Szolgáltatások
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.services.map((s: string, idx: number) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">{s}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {item.description && (
                                            <div className="w-full">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                    <Eye className="h-3 w-3" />
                                                    Leírás
                                                </p>
                                                <p className="text-sm whitespace-pre-wrap">{item.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Name translations */}
                                {item.name_translations && typeof item.name_translations === 'object' && Object.keys(item.name_translations).length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <Languages className="h-4 w-4" />
                                            Fordítások
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {Object.entries(item.name_translations as Record<string, string>).map(([lang, name]) => (
                                                <div key={lang} className="flex-1 min-w-[160px]">
                                                    <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider">{lang}</p>
                                                    <p className="text-sm font-medium">{name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* OSM information — present on parking, service, repair, drinking_fountain */}
                                {(item.osm_id !== undefined && item.osm_id !== null) || item.osm_type || item.osm_version || item.last_synced_at || item.osm_deleted ? (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <Database className="h-4 w-4" />
                                            OSM információk
                                        </h3>
                                        <div className="flex flex-wrap gap-4">
                                            {item.osm_id !== undefined && item.osm_id !== null && (
                                                <div className="flex-1 min-w-[150px]">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                        <Hash className="h-3 w-3" />
                                                        OSM ID
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-mono text-foreground break-all">{String(item.osm_id)}</p>
                                                        {item.osm_type && (
                                                            <a
                                                                href={`https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors shrink-0"
                                                                title="Megnyitás OpenStreetMap-en"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {item.osm_type && (
                                                <div className="flex-1 min-w-[150px]">
                                                    <p className="text-xs text-muted-foreground mb-0.5">OSM típus</p>
                                                    <p className="text-sm font-medium capitalize">{item.osm_type}</p>
                                                </div>
                                            )}
                                            {item.osm_version !== undefined && item.osm_version !== null && (
                                                <div className="flex-1 min-w-[150px]">
                                                    <p className="text-xs text-muted-foreground mb-0.5">OSM verzió</p>
                                                    <p className="text-sm font-medium">v{item.osm_version}</p>
                                                </div>
                                            )}
                                            {item.last_synced_at && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                        <RefreshCw className="h-3 w-3" />
                                                        Utolsó szinkronizálás
                                                    </p>
                                                    <p className="text-xs font-medium">
                                                        {new Date(item.last_synced_at).toLocaleDateString('hu-HU', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                            {item.osm_deleted !== undefined && item.osm_deleted !== null && (
                                                <div className="flex-1 min-w-[150px]">
                                                    <p className="text-xs text-muted-foreground mb-0.5">OSM-ben törölve</p>
                                                    <Badge variant={item.osm_deleted ? 'destructive' : 'secondary'} className="text-xs">
                                                        {item.osm_deleted ? 'Igen' : 'Nem'}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : null}

                                {/* Coordinates & Map */}
                                {coords ? (
                                    <>
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Koordináták</h3>
                                            <div className="flex gap-6">
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground mb-0.5">Szélesség (Latitude)</p>
                                                    <p className="text-sm font-mono font-semibold">{coords.lat.toFixed(6)}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground mb-0.5">Hosszúság (Longitude)</p>
                                                    <p className="text-sm font-mono font-semibold">{coords.lon.toFixed(6)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Térkép
                                            </h3>
                                            <div className="rounded-lg overflow-hidden border border-border mb-3">
                                                <iframe
                                                    width="100%"
                                                    height="350"
                                                    frameBorder="0"
                                                    style={{ border: 0, pointerEvents: 'none' }}
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(coords.lon - 0.002).toFixed(6)},${(coords.lat - 0.002).toFixed(6)},${(coords.lon + 0.002).toFixed(6)},${(coords.lat + 0.002).toFixed(6)}&layer=mapnik&marker=${coords.lat.toFixed(6)},${coords.lon.toFixed(6)}`}
                                                    title="Location Map"
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                size="sm"
                                                onClick={() => window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lon}`, '_blank')}
                                            >
                                                <MapPin className="h-3.5 w-3.5 mr-2" />
                                                Megnyitás Google Maps-en
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Koordináták</h3>
                                        <p className="text-sm text-muted-foreground">Koordináták nem érhetők el</p>
                                    </div>
                                )}

                                {/* Database Info */}
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Adatbázis információk</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex-1 min-w-[150px]">
                                            <p className="text-xs text-muted-foreground mb-0.5">ID</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-mono text-foreground break-all">{item.id}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => copyId(item.id)}
                                                    className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors shrink-0"
                                                    title="ID másolása"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <p className="text-xs text-muted-foreground mb-0.5">Létrehozva</p>
                                            <p className="text-xs font-medium">
                                                {new Date(item.created_at).toLocaleDateString('hu-HU', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <p className="text-xs text-muted-foreground mb-0.5">Módosítva</p>
                                            <p className="text-xs font-medium">
                                                {new Date(item.updated_at).toLocaleDateString('hu-HU', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                        </AdminModalBody>

                        {/* Footer - same as other modals */}
                        <div className="admin-modal-footer">
                            <Button
                                onClick={() => {
                                    onEdit(item, type);
                                    onClose();
                                }}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Szerkesztés
                            </Button>
                        </div>
                    </AdminModalFrame>
                </AdminModalContent>
            </Dialog>
            {imagePreviewUrl && (
                <ImagePreview src={imagePreviewUrl} alt="Előnézet" onClose={() => setImagePreviewUrl(null)} />
            )}
        </>
    );
}
