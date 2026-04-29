import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Dialog,
    DialogContent,
    DialogTitle,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ImagePreview from './ImagePreview';
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
    ArrowLeft,
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
                    <DialogContent className="admin-dark max-w-3xl w-[90vw] max-h-[90vh] overflow-hidden bg-card border-border p-0">
                        <div className="flex flex-col h-[85vh]">
                            {/* Header */}
                            <div className="p-6 border-b border-border flex-shrink-0 bg-background/50 backdrop-blur-sm">
                                <DialogTitle className="text-foreground flex items-center justify-between text-xl font-bold">
                                    <div className="flex items-center gap-4 min-w-0 pr-8">
                                    {onBack && (
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                                            title="Vissza az előző modálra"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                    )}
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
                                            <Camera className="h-6 w-6 text-green-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h1 className="text-lg font-bold text-foreground truncate leading-tight">
                                                Parkoló kép kérelem
                                            </h1>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-xs font-mono text-muted-foreground truncate opacity-70">
                                                    ID: {item.id?.substring(0, 8)}…
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => copyId(item.id)}
                                                    className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                                                    title="ID másolása"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-white/10 bg-white/5">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </Badge>
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentStatus === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    currentStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${currentSubmissionStatus.color}`} />
                                                    {currentSubmissionStatus.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </DialogTitle>
                            </div>

                            <ScrollArea className="flex-1 min-h-0">
                                <div className="p-6 space-y-6">
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

                                    {/* Uploader card — clickable */}
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Feltöltő
                                        </h3>
                                        {onOpenUser && item.user_id ? (
                                            <button
                                                type="button"
                                                onClick={() => onOpenUser(item.user_id)}
                                                className="w-full p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors flex items-center gap-4 group text-left"
                                            >
                                                <Avatar className="h-12 w-12 ring-2 ring-border flex-shrink-0">
                                                    <AvatarImage src={item.reporter_avatar_url} alt={uploaderDisplayName} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                                        {uploaderInitial}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {uploaderDisplayName}
                                                    </p>
                                                    {item.reporter_email && (
                                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                            {item.reporter_email}
                                                        </p>
                                                    )}
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors flex-shrink-0" />
                                            </button>
                                        ) : (
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center gap-4">
                                                <Avatar className="h-12 w-12 ring-2 ring-border flex-shrink-0">
                                                    <AvatarImage src={item.reporter_avatar_url} alt={uploaderDisplayName} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                                        {uploaderInitial}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">{uploaderDisplayName}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Parking-spot card — clickable */}
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Érintett parkoló
                                        </h3>
                                        {onOpenParkingSpot && item.parking_spot_id ? (
                                            <button
                                                type="button"
                                                onClick={() => onOpenParkingSpot(item.parking_spot_id)}
                                                className="w-full p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors flex items-center gap-4 group text-left"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="h-5 w-5 text-green-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {item.parking_name || 'Ismeretlen parkoló'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {item.parking_city || 'Nincs város megadva'}
                                                    </p>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors flex-shrink-0" />
                                            </button>
                                        ) : (
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="h-5 w-5 text-green-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {item.parking_name || 'Ismeretlen parkoló'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {item.parking_city || 'Nincs város megadva'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

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
                                </div>
                            </ScrollArea>

                            {/* Footer — full action bar so admin doesn't have to exit and reopen the dropdown */}
                            <div className="p-6 border-t border-border flex justify-between gap-2 flex-wrap">
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
                                    <Button onClick={onClose} variant="outline" size="sm">Bezárás</Button>
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
                        </div>
                    </DialogContent>
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
                <DialogContent className="admin-dark max-w-3xl w-[90vw] max-h-[90vh] overflow-hidden bg-card border-border p-0">
                    <div className="flex flex-col h-[85vh]">
                        {/* Header — same shape as parking_image */}
                        <div className="p-6 border-b border-border flex-shrink-0 bg-background/50 backdrop-blur-sm">
                            <DialogTitle className="text-foreground flex items-center justify-between text-xl font-bold">
                                <div className="flex items-center gap-4 min-w-0 pr-8">
                                    {onBack && (
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                                            title="Vissza az előző modálra"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                    )}
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
                                        <Flag className="h-6 w-6 text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-lg font-bold text-foreground truncate leading-tight">
                                            POI Bejelentés
                                        </h1>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-xs font-mono text-muted-foreground truncate opacity-70">
                                                ID: {item.id.substring(0, 8)}…
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => copyId(item.id)}
                                                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                                                title="ID másolása"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-white/10 bg-white/5">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </Badge>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentStatus === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                currentStatus === 'dismissed' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
                                                    currentStatus === 'reviewed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${currentStatusObj.color}`} />
                                                {currentStatusObj.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </DialogTitle>
                        </div>

                        <ScrollArea className="flex-1 min-h-0">
                            <div className="p-6 space-y-6">
                                {/* POI card — clickable, opens POI in this same modal */}
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Érintett POI
                                    </h3>
                                    {onOpenPoiDetail && item.poi_id && item.poi_type ? (
                                        <button
                                            type="button"
                                            onClick={() => onOpenPoiDetail(item.poi_id, item.poi_type)}
                                            className="w-full p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors flex items-center gap-4 group text-left"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/10 flex-shrink-0">
                                                {getPoiTypeIcon(item.poi_type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{poiName}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                    {getPoiTypeLabel(item.poi_type)} · <span className="font-mono">ID: {item.poi_id?.substring(0, 8)}…</span>
                                                </p>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors flex-shrink-0" />
                                        </button>
                                    ) : (
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/10 flex-shrink-0">
                                                {getPoiTypeIcon(item.poi_type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{poiName}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                    {getPoiTypeLabel(item.poi_type)} · <span className="font-mono">ID: {item.poi_id?.substring(0, 8)}…</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Reporter card — clickable, matches parking_image uploader */}
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Bejelentő
                                    </h3>
                                    {onOpenUser && item.user_id ? (
                                        <button
                                            type="button"
                                            onClick={() => onOpenUser(item.user_id)}
                                            className="w-full p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors flex items-center gap-4 group text-left"
                                        >
                                            <Avatar className="h-12 w-12 ring-2 ring-border flex-shrink-0">
                                                <AvatarImage src={item.reporter_avatar_url} alt={reporterDisplayName} />
                                                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                                    {reporterInitial}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{reporterDisplayName}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Bejelentve: {new Date(item.created_at).toLocaleDateString('hu-HU', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors flex-shrink-0" />
                                        </button>
                                    ) : (
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center gap-4">
                                            <Avatar className="h-12 w-12 ring-2 ring-border flex-shrink-0">
                                                <AvatarImage src={item.reporter_avatar_url} alt={reporterDisplayName} />
                                                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                                    {reporterInitial}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{reporterDisplayName}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

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
                            </div>
                        </ScrollArea>

                        {/* Footer — quick status actions, same shape as parking_image accept/reject */}
                        <div className="p-6 border-t border-border flex justify-end gap-2 flex-wrap">
                            <Button onClick={onClose} variant="outline" size="sm">Bezárás</Button>
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
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (type === 'feedback') {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="admin-dark max-w-2xl w-[90vw] max-h-[90vh] overflow-hidden bg-card border-border p-0">
                    <div className="flex flex-col h-[85vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-border flex-shrink-0 bg-background/50 backdrop-blur-sm">
                            <DialogTitle className="text-foreground flex items-center justify-between text-xl font-bold">
                                <div className="flex items-center gap-4 min-w-0 pr-8">
                                    {onBack && (
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                                            title="Vissza az előző modálra"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                    )}
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
                                        <MessageSquare className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-lg font-bold text-foreground truncate leading-tight">
                                            Visszajelzés részletei
                                        </h1>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-xs font-mono text-muted-foreground truncate opacity-70">
                                                ID: {item.id.substring(0, 8)}...
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => copyId(item.id)}
                                                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                                                title="ID másolása"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-white/10 bg-white/5">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </DialogTitle>
                        </div>

                        <ScrollArea className="flex-1 min-h-0">
                            <div className="p-6 space-y-6">
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
                            </div>

                            <Separator className="bg-border" />

                            {/* Contact info */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                    Kapcsolat
                                </h3>
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                    {item.contact_email ? (
                                        <div className="flex items-center gap-3 text-white">
                                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <Mail className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground">Email cím</span>
                                                <span className="font-medium break-all">{item.contact_email}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-zinc-500 flex items-center gap-2">
                                            <XCircle className="w-4 h-4" />
                                            Nincs megadva elérhetőség
                                        </p>
                                    )}
                                </div>
                            </div>
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
                        </ScrollArea>

                        <div className="p-6 border-t border-border flex justify-end">
                            <Button onClick={onClose} variant="outline">Bezárás</Button>
                        </div>
                    </div>
                </DialogContent >
            </Dialog >
        );
    }

    if (type === 'user') {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="admin-dark max-w-2xl w-[90vw] max-h-[90vh] overflow-hidden bg-card border-border p-0">
                    <div className="flex flex-col h-[85vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-border flex-shrink-0 bg-background/50 backdrop-blur-sm">
                            <DialogTitle className="text-foreground flex items-center gap-4 text-xl font-bold">
                                <div className="flex items-center gap-4 min-w-0 pr-8">
                                    {onBack && (
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                                            title="Vissza az előző modálra"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                    )}
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                                        <Users className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl font-bold text-foreground truncate">
                                            {item.username || item.full_name || 'Felhasználó'}
                                        </h1>
                                        <p className="text-muted-foreground text-sm mt-1 truncate">
                                            Felhasználói profil és beállítások
                                        </p>
                                    </div>
                                </div>
                            </DialogTitle>
                        </div>

                        {/* Scrollable Content */}
                        <ScrollArea className="flex-1 min-h-0">
                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* User Profile Section */}
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-4">
                                            <Shield className="h-4 w-4 flex-shrink-0" />
                                            <span>Felhasználói adatok</span>
                                        </h3>
                                        <div className="space-y-6">
                                            {/* Profile Section */}
                                            <div className="flex items-start gap-6">
                                                <Avatar className="h-20 w-20 ring-2 ring-border flex-shrink-0">
                                                    <AvatarImage src={item.avatar_url} alt={item.username || item.full_name || 'User'} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-2xl">
                                                        {(item.username || item.full_name || item.email || 'U').charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0 space-y-3">
                                                    <div>
                                                        <h3 className="font-semibold text-foreground text-2xl">{item.username || item.full_name || 'Nincs megadva'}</h3>
                                                        <p className="text-muted-foreground text-base truncate">{item.email}</p>
                                                    </div>
                                                    <Badge
                                                        variant={item.role === 'admin' ? 'default' : 'secondary'}
                                                        className={`text-sm px-3 py-1 ${item.role === 'admin' ? 'bg-primary hover:bg-primary/80 text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                                                    >
                                                        {item.role === 'admin' ? 'Adminisztrátor' : 'Felhasználó'}
                                                    </Badge>
                                                    {item.id && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-xs font-mono text-muted-foreground">ID: {item.id.substring(0, 8)}...</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyId(item.id)}
                                                                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                                                                title="ID másolása"
                                                            >
                                                                <Copy className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <Separator className="bg-border" />

                                            {/* Contact Information */}
                                            <div className="flex flex-col gap-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-medium text-foreground">Email cím</p>
                                                        <p className="text-sm text-muted-foreground truncate mt-1">{item.email || 'Nincs megadva'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-medium text-foreground">Telefonszám</p>
                                                        <p className="text-sm text-muted-foreground mt-1">{item.phone || 'Nincs megadva'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-medium text-foreground">Regisztráció dátuma</p>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {item.created_at
                                                                ? new Date(item.created_at).toLocaleDateString('hu-HU', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })
                                                                : 'Ismeretlen'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Activity */}
                                    {(() => {
                                        const xpVal = activityProgress?.xp ?? 0;
                                        const currentStreak = activityProgress?.current_streak ?? 0;
                                        const longestStreak = activityProgress?.longest_streak ?? 0;
                                        const challengeCompletions = activityProgress?.challenge_completions ?? 0;
                                        const challengeCities = activityProgress?.challenge_cities ?? 0;
                                        const unlockedBadges = activityProgress
                                            ? ACTIVITY_BADGE_KEYS.filter(k => Number(activityProgress[k] ?? 0) > 0)
                                            : [];
                                        const stats = activityStats;
                                        const hasAny = (stats?.totalRides ?? 0) > 0 || challengeCompletions > 0 || xpVal > 0;

                                        return (
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-4">
                                                    <Activity className="h-4 w-4 flex-shrink-0" />
                                                    <span>Aktivitás</span>
                                                </h3>

                                                {/* Header chips */}
                                                {(activityHomeCity || activitySupporter?.is_supporter || xpVal > 0) && (
                                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                                        {activityHomeCity && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-200">
                                                                <MapPin size={12} className="text-green-400" />
                                                                {activityHomeCity}
                                                            </span>
                                                        )}
                                                        {activitySupporter?.is_supporter && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                                                <Star size={12} className="fill-amber-400" />
                                                                Támogató
                                                                {activitySupporter.supporter_since && (
                                                                    <span className="text-[10px] text-amber-300/70 ml-1">
                                                                        ({new Date(activitySupporter.supporter_since).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })})
                                                                    </span>
                                                                )}
                                                            </span>
                                                        )}
                                                        {xpVal > 0 && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-400">
                                                                <Zap size={12} />
                                                                {xpVal.toLocaleString('hu-HU')} XP
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {activityLoading ? (
                                                    <div className="flex items-center justify-center py-12 border border-dashed border-border rounded-xl bg-background/30">
                                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                                    </div>
                                                ) : !hasAny ? (
                                                    <div className="text-center py-8 border border-dashed border-border rounded-xl bg-background/30">
                                                        <Bike className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                                        <p className="text-muted-foreground text-sm">Még nincs rögzített aktivitás ennél a felhasználónál.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {/* Key Stats Grid */}
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            <div className="rounded-xl border border-white/5 bg-background/50 p-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <Bike className="w-4 h-4 text-green-400" />
                                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Túrák</span>
                                                                </div>
                                                                <div className="text-2xl font-extrabold text-foreground">
                                                                    {(stats?.totalRides ?? 0).toLocaleString('hu-HU')}
                                                                </div>
                                                            </div>
                                                            <div className="rounded-xl border border-white/5 bg-background/50 p-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <RouteIcon className="w-4 h-4 text-blue-400" />
                                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Össztáv</span>
                                                                </div>
                                                                <div className="text-2xl font-extrabold text-foreground">
                                                                    {(stats?.totalDistanceKm ?? 0).toFixed(1)}
                                                                    <span className="text-sm font-bold text-muted-foreground ml-1">km</span>
                                                                </div>
                                                            </div>
                                                            <div className="rounded-xl border border-white/5 bg-background/50 p-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <Gauge className="w-4 h-4 text-purple-400" />
                                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Átlag seb.</span>
                                                                </div>
                                                                <div className="text-2xl font-extrabold text-foreground">
                                                                    {(stats?.avgSpeedKmh ?? 0).toFixed(1)}
                                                                    <span className="text-sm font-bold text-muted-foreground ml-1">km/h</span>
                                                                </div>
                                                            </div>
                                                            <div className="rounded-xl border border-white/5 bg-background/50 p-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <Trophy className="w-4 h-4 text-amber-400" />
                                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">XP</span>
                                                                </div>
                                                                <div className="text-2xl font-extrabold text-foreground">
                                                                    {xpVal.toLocaleString('hu-HU')}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Riding + Challenges side by side */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="rounded-xl border border-white/5 bg-background/50 p-4">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Bike className="w-4 h-4 text-zinc-400" />
                                                                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Kerékpározás</h4>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="rounded-lg bg-zinc-900/60 border border-white/5 p-2.5">
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase mb-1">
                                                                            <Gauge size={11} /> Max seb.
                                                                        </div>
                                                                        <div className="text-sm font-mono font-bold text-foreground">{(stats?.maxSpeedKmh ?? 0).toFixed(1)} km/h</div>
                                                                    </div>
                                                                    <div className="rounded-lg bg-zinc-900/60 border border-white/5 p-2.5">
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase mb-1">
                                                                            <Timer size={11} /> Össz idő
                                                                        </div>
                                                                        <div className="text-sm font-mono font-bold text-foreground">{formatActivityDuration(stats?.totalDurationSec ?? 0)}</div>
                                                                    </div>
                                                                    <div className="rounded-lg bg-zinc-900/60 border border-white/5 p-2.5">
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase mb-1">
                                                                            <RouteIcon size={11} /> Leghosszabb
                                                                        </div>
                                                                        <div className="text-sm font-mono font-bold text-foreground">{(stats?.longestRideKm ?? 0).toFixed(2)} km</div>
                                                                    </div>
                                                                    <div className="rounded-lg bg-zinc-900/60 border border-white/5 p-2.5">
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase mb-1">
                                                                            <Mountain size={11} /> Szintemelk.
                                                                        </div>
                                                                        <div className="text-sm font-mono font-bold text-foreground">{Math.round(stats?.totalElevationM ?? 0).toLocaleString('hu-HU')} m</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="rounded-xl border border-white/5 bg-background/50 p-4">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Trophy className="w-4 h-4 text-amber-400" />
                                                                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Kihívások &amp; sorozatok</h4>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="rounded-lg bg-zinc-900/60 border border-white/5 p-2.5">
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase mb-1">
                                                                            <Trophy size={11} /> Teljesítések
                                                                        </div>
                                                                        <div className="text-sm font-mono font-bold text-foreground">{challengeCompletions.toLocaleString('hu-HU')}</div>
                                                                    </div>
                                                                    <div className="rounded-lg bg-zinc-900/60 border border-white/5 p-2.5">
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase mb-1">
                                                                            <MapPin size={11} /> Városok
                                                                        </div>
                                                                        <div className="text-sm font-mono font-bold text-foreground">{challengeCities.toLocaleString('hu-HU')}</div>
                                                                    </div>
                                                                    <div className="rounded-lg bg-zinc-900/60 border border-white/5 p-2.5">
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase mb-1">
                                                                            <Timer size={11} /> Legjobb idő
                                                                        </div>
                                                                        <div className="text-sm font-mono font-bold text-foreground">{formatActivityShort(stats?.fastestAttemptSec)}</div>
                                                                    </div>
                                                                    <div className="rounded-lg bg-zinc-900/60 border border-white/5 p-2.5">
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase mb-1">
                                                                            <Flame size={11} /> Sorozat (most/leghosszabb)
                                                                        </div>
                                                                        <div className="text-sm font-mono font-bold text-foreground">
                                                                            {currentStreak} <span className="text-zinc-500">/</span> {longestStreak} <span className="text-[10px] text-zinc-500">nap</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Badges */}
                                                        <div className="rounded-xl border border-white/5 bg-background/50 p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Award className="w-4 h-4 text-purple-400" />
                                                                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Jelvények</h4>
                                                                </div>
                                                                <span className="text-xs font-mono text-zinc-400">{unlockedBadges.length} / {ACTIVITY_BADGE_KEYS.length}</span>
                                                            </div>
                                                            {unlockedBadges.length === 0 ? (
                                                                <p className="text-xs text-muted-foreground italic">Nincs megszerzett jelvény.</p>
                                                            ) : (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {unlockedBadges.map(k => (
                                                                        <span
                                                                            key={k}
                                                                            title={`${BADGE_LABELS[k] || k} — szint ${activityProgress?.[k] ?? 0}`}
                                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-purple-500/10 border border-purple-500/20 text-purple-200"
                                                                        >
                                                                            <Award className="w-3 h-3 text-purple-400" />
                                                                            {BADGE_LABELS[k] || k}
                                                                            {Number(activityProgress?.[k] ?? 0) > 1 && (
                                                                                <span className="text-purple-400 font-mono">×{activityProgress?.[k]}</span>
                                                                            )}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Recent rides */}
                                                        {activityRecent.length > 0 && (
                                                            <div className="rounded-xl border border-white/5 bg-background/50 p-4">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Clock className="w-4 h-4 text-zinc-400" />
                                                                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Legutóbbi túrák</h4>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    {activityRecent.map(r => {
                                                                        const km = ((r.distance_meters ?? 0) / 1000).toFixed(1);
                                                                        const date = r.started_at
                                                                            ? new Date(r.started_at).toLocaleDateString('hu-HU', { year: '2-digit', month: 'short', day: 'numeric' })
                                                                            : '—';
                                                                        const avg = Number(r.average_speed_kmh ?? 0).toFixed(1);
                                                                        return (
                                                                            <div key={r.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900/60 border border-white/5 text-xs">
                                                                                <div className="flex items-center gap-2 min-w-0">
                                                                                    {r.challenge_completed ? (
                                                                                        <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                                                                    ) : (
                                                                                        <Bike className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                                                                                    )}
                                                                                    <span className="font-semibold text-zinc-200 truncate">
                                                                                        {r.favorite_name || date}
                                                                                    </span>
                                                                                    {r.favorite_name && (
                                                                                        <span className="text-[10px] text-zinc-500">{date}</span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center gap-3 font-mono text-zinc-400 flex-shrink-0">
                                                                                    <span>{km} km</span>
                                                                                    <span>{formatActivityShort(r.duration_seconds)}</span>
                                                                                    <span className="text-zinc-500">{avg} km/h</span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                        </ScrollArea>

                        {/* Action Buttons */}
                        <div className="p-6 border-t border-border flex-shrink-0">
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="px-8"
                                >
                                    Bezárás
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent >
            </Dialog >
        );
    }

    // Location Details (Parking, Service, Repair, Drinking Fountain)
    const locationIcon = type === 'parking' ? MapPin : type === 'service' ? Store : type === 'drinking_fountain' ? Droplet : Wrench;
    const LocationIcon = locationIcon;
    const locationGradient = type === 'parking'
        ? 'from-green-500/20 to-green-600/20 border-green-500/30'
        : type === 'service'
            ? 'from-blue-500/20 to-blue-600/20 border-blue-500/30'
            : type === 'drinking_fountain'
                ? 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30'
                : 'from-orange-500/20 to-orange-600/20 border-orange-500/30';
    const locationIconColor = type === 'parking' ? 'text-green-400' : type === 'service' ? 'text-blue-400' : type === 'drinking_fountain' ? 'text-cyan-400' : 'text-orange-400';

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="admin-dark max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden bg-card border-border p-0">
                    <div className="flex flex-col h-[85vh]">
                        {/* Header - same pattern as POI / Feedback */}
                        <div className="p-6 border-b border-border flex-shrink-0 bg-background/50 backdrop-blur-sm">
                            <DialogTitle className="text-foreground flex items-center justify-between text-xl font-bold">
                                <div className="flex items-center gap-4 min-w-0 pr-8">
                                    {onBack && (
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                                            title="Vissza az előző modálra"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                    )}
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${locationGradient} border flex items-center justify-center flex-shrink-0 shadow-inner`}>
                                        <LocationIcon className={`h-6 w-6 ${locationIconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-lg font-bold text-foreground truncate leading-tight">
                                            {item.name || 'Helyszín'}
                                        </h1>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <Badge variant={item.available ? 'default' : 'destructive'} className="flex items-center gap-1 text-xs w-fit">
                                                {item.available ? (
                                                    <>
                                                        <CheckCircle className="h-3 w-3" />
                                                        Aktív
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3" />
                                                        Inaktív
                                                    </>
                                                )}
                                            </Badge>
                                            {item.city && (
                                                <span className="text-xs text-muted-foreground">· {item.city}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] font-mono text-muted-foreground opacity-80 break-all">
                                                ID: {item.id}
                                            </span>
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
                                </div>
                            </DialogTitle>
                        </div>

                        {/* Scrollable Content */}
                        <ScrollArea className="flex-1 min-h-0">
                            <div className="p-6 space-y-6">
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
                            </div>
                        </ScrollArea>

                        {/* Footer - same as other modals */}
                        <div className="p-6 border-t border-border flex justify-end gap-2 flex-shrink-0">
                            <Button variant="outline" onClick={onClose}>
                                Bezárás
                            </Button>
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
                    </div>
                </DialogContent>
            </Dialog>
            {imagePreviewUrl && (
                <ImagePreview src={imagePreviewUrl} alt="Előnézet" onClose={() => setImagePreviewUrl(null)} />
            )}
        </>
    );
}
