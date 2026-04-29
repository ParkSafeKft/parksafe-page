'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import {
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    XCircle,
    Plus,
    Loader2,
    Users,
    MapPin,
    Building,
    Wrench,
    ArrowLeft,
    Camera,
    Droplet,
    Building2,
    Trophy,
    Route,
    ScrollText,
} from 'lucide-react';
import { toast } from 'sonner';

import AdminSidebar from '@/components/admin/AdminSidebar';
import UsersTable from '@/components/admin/UsersTable';
import ParkingTable from '@/components/admin/ParkingTable';
import ServicesTable from '@/components/admin/ServicesTable';
import RepairTable from '@/components/admin/RepairTable';
import AddLocationModal from '@/components/admin/AddLocationModal';
import EditLocationModal from '@/components/admin/EditLocationModal';
import DetailModal from '@/components/admin/DetailModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import DeviceStatsOverview from '@/components/admin/DeviceStatsOverview';
import FeedbackTable from '@/components/admin/FeedbackTable';
import PoiFlagsTable from '@/components/admin/PoiFlagsTable';
import ParkingImageSubmissionsTable from '@/components/admin/ParkingImageSubmissionsTable';
import DrinkingFountainTable from '@/components/admin/DrinkingFountainTable';
import CitiesTable from '@/components/admin/CitiesTable';
import DailyChallengesTable from '@/components/admin/DailyChallengesTable';
import CommunityRoutesTable from '@/components/admin/CommunityRoutesTable';
import CityFormModal from '@/components/admin/CityFormModal';
import CommunityRouteReviewModal from '@/components/admin/CommunityRouteReviewModal';
import DailyChallengeDetailModal from '@/components/admin/DailyChallengeDetailModal';
import LeaderboardTab from '@/components/admin/LeaderboardTab';
import AuditLogTable from '@/components/admin/AuditLogTable';
import { writeAuditLog } from '@/lib/adminAuditLog';
import ContentStatsOverview from '@/components/admin/ContentStatsOverview';

/**
 * Sanitize a search term to prevent PostgREST filter injection.
 * Escapes characters that have special meaning in PostgREST filter syntax.
 */
function sanitizeSearchTerm(term: string): string {
    return term
        .replace(/\\/g, '\\\\')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_')
        .replace(/,/g, '')
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .replace(/\./g, ' ')
        .trim()
        .slice(0, 100);
}

const isDev = process.env.NODE_ENV === 'development';

/**
 * Delete a file from Supabase Storage given its public URL.
 * Works for any public bucket by extracting bucket + path from the URL.
 */
async function deleteSupabasePublicFile(publicUrl: string) {
    try {
        const marker = '/storage/v1/object/public/';
        const idx = publicUrl.indexOf(marker);
        if (idx === -1) return;

        const withoutPrefix = publicUrl.slice(idx + marker.length).split('?')[0];
        const [bucket, ...rest] = withoutPrefix.split('/');
        const path = rest.join('/');

        if (!bucket || !path) return;

        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error && isDev) {
            console.error('Storage delete error:', error);
        }
    } catch (e) {
        if (isDev) console.error('Error while deleting from storage:', e);
    }
}

export default function AdminPage() {
    const router = useRouter();
    const { user: profile, loading: authLoading, signOut } = useAuth();


    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    // Data states
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [users, setUsers] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [parkingSpots, setParkingSpots] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bicycleServices, setBicycleServices] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [repairStations, setRepairStations] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [feedback, setFeedback] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [poiFlags, setPoiFlags] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [parkingImageSubmissions, setParkingImageSubmissions] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [drinkingFountains, setDrinkingFountains] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [cities, setCities] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [dailyChallenges, setDailyChallenges] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [communityRoutes, setCommunityRoutes] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [citiesForFilter, setCitiesForFilter] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [auditLog, setAuditLog] = useState<any[]>([]);

    // Filters
    const [challengeCityFilter, setChallengeCityFilter] = useState('');
    const [challengeDateFrom, setChallengeDateFrom] = useState('');
    const [challengeDateTo, setChallengeDateTo] = useState('');
    const [challengeActiveFilter, setChallengeActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [routeStatusFilter, setRouteStatusFilter] = useState('');
    const [routeDateFrom, setRouteDateFrom] = useState('');
    const [routeDateTo, setRouteDateTo] = useState('');
    const [auditActionFilter, setAuditActionFilter] = useState('');
    const [auditTargetTypeFilter, setAuditTargetTypeFilter] = useState('');

    // New modals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [cityFormModal, setCityFormModal] = useState<{ show: boolean; item: any | null }>({ show: false, item: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [routeReviewModal, setRouteReviewModal] = useState<{ show: boolean; item: any | null }>({ show: false, item: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [challengeDetailModal, setChallengeDetailModal] = useState<{ show: boolean; item: any | null }>({ show: false, item: null });

    const [dataLoading, setDataLoading] = useState(false);
    const [toggleLoading, setToggleLoading] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Selection
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Sorting
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    // Modals
    const [addLocationModal, setAddLocationModal] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editLocationModal, setEditLocationModal] = useState<{ show: boolean; item: any }>({
        show: false,
        item: null
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [detailModal, setDetailModal] = useState<{ show: boolean; item: any; type: string }>({
        show: false,
        item: null,
        type: 'user'
    });
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; table: string | null; id: string | null }>({
        show: false,
        table: null,
        id: null
    });

    // Map active tab to Supabase table name
    const getTableForTab = (tab: string): string | null => {
        switch (tab) {
            case 'users': return 'profiles';
            case 'parking': return 'parkingSpots';
            case 'parking_images': return 'parking_image_submissions';
            case 'services': return 'bicycleService';
            case 'repair': return 'repairStation';
            case 'feedback': return 'feedback';
            case 'poi_flags': return 'poi_flags';
            case 'drinking_fountain': return 'drinkingFountain';
            case 'cities': return 'cities';
            case 'daily_challenges': return 'daily_challenges';
            case 'community_routes': return 'community_bike_lanes';
            case 'leaderboard': return 'challenge_attempts';
            case 'audit_log': return 'admin_audit_log';
            default: return null;
        }
    };

    const activeTable = getTableForTab(activeTab);

    // Ref to always hold the latest fetchData, avoiding stale closures in realtime callback
    const fetchDataRef = useRef<(silent?: boolean) => Promise<void>>(undefined);

    // Realtime subscription - debounced refetch to avoid hammering on rapid changes
    const refetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleRealtimeChange = useCallback(() => {
        if (refetchTimeoutRef.current) {
            clearTimeout(refetchTimeoutRef.current);
        }
        refetchTimeoutRef.current = setTimeout(() => {
            fetchDataRef.current?.(true);
        }, 500);
    }, []);

    const { isSubscribed: isRealtimeConnected } = useRealtimeSubscription({
        table: activeTable || '',
        enabled: !!activeTable,
        onchange: handleRealtimeChange,
    });

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (refetchTimeoutRef.current) {
                clearTimeout(refetchTimeoutRef.current);
            }
        };
    }, []);

    // Fetch data (silent = true skips the loading spinner, used for realtime updates)
    const fetchData = async (silent = false) => {
        if (!profile) return;
        if (!silent) setDataLoading(true);
        try {
            let query;
            let countQuery;

            switch (activeTab) {
                case 'users':
                    query = supabase.from('profiles').select('*');
                    countQuery = supabase.from('profiles').select('*', { count: 'exact', head: true });
                    break;
                case 'parking':
                    query = supabase.from('parkingSpots').select('*');
                    countQuery = supabase.from('parkingSpots').select('*', { count: 'exact', head: true });
                    break;
                case 'parking_images':
                    query = supabase
                        .from('parking_image_submissions')
                        .select(`
                            *,
                            parkingSpots!parking_image_submissions_parking_spot_id_fkey (name, city, coordinate)
                        `);
                    countQuery = supabase.from('parking_image_submissions').select('*', { count: 'exact', head: true });
                    break;
                case 'services':
                    query = supabase.from('bicycleService').select('*');
                    countQuery = supabase.from('bicycleService').select('*', { count: 'exact', head: true });
                    break;
                case 'repair':
                    query = supabase.from('repairStation').select('*');
                    countQuery = supabase.from('repairStation').select('*', { count: 'exact', head: true });
                    break;
                case 'drinking_fountain':
                    query = supabase.from('drinkingFountain').select('*');
                    countQuery = supabase.from('drinkingFountain').select('*', { count: 'exact', head: true });
                    break;
                case 'feedback':
                    query = supabase.from('feedback').select('*');
                    countQuery = supabase.from('feedback').select('*', { count: 'exact', head: true });
                    break;
                case 'poi_flags':
                    query = supabase.from('poi_flags').select('*, profiles!poi_flags_user_id_fkey(username, full_name)');
                    countQuery = supabase.from('poi_flags').select('*', { count: 'exact', head: true });
                    break;
                case 'cities':
                    query = supabase.from('cities').select('*');
                    countQuery = supabase.from('cities').select('*', { count: 'exact', head: true });
                    break;
                case 'daily_challenges':
                    query = supabase.from('daily_challenges').select('*, cities!daily_challenges_city_id_fkey(id, name, slug)');
                    countQuery = supabase.from('daily_challenges').select('*', { count: 'exact', head: true });
                    if (challengeCityFilter) {
                        query = query.eq('city_id', challengeCityFilter);
                        countQuery = countQuery.eq('city_id', challengeCityFilter);
                    }
                    if (challengeDateFrom) {
                        query = query.gte('challenge_date', challengeDateFrom);
                        countQuery = countQuery.gte('challenge_date', challengeDateFrom);
                    }
                    if (challengeDateTo) {
                        query = query.lte('challenge_date', challengeDateTo);
                        countQuery = countQuery.lte('challenge_date', challengeDateTo);
                    }
                    if (challengeActiveFilter === 'active') {
                        query = query.eq('is_active', true);
                        countQuery = countQuery.eq('is_active', true);
                    } else if (challengeActiveFilter === 'inactive') {
                        query = query.eq('is_active', false);
                        countQuery = countQuery.eq('is_active', false);
                    }
                    break;
                case 'community_routes':
                    // community_bike_lanes.user_id FK -> auth.users, not profiles — can't use PostgREST join.
                    query = supabase.from('community_bike_lanes').select('*');
                    countQuery = supabase.from('community_bike_lanes').select('*', { count: 'exact', head: true });
                    if (routeStatusFilter) {
                        query = query.eq('status', routeStatusFilter);
                        countQuery = countQuery.eq('status', routeStatusFilter);
                    }
                    if (routeDateFrom) {
                        query = query.gte('created_at', routeDateFrom);
                        countQuery = countQuery.gte('created_at', routeDateFrom);
                    }
                    if (routeDateTo) {
                        // include end-of-day for inclusive range
                        const endIso = `${routeDateTo}T23:59:59.999Z`;
                        query = query.lte('created_at', endIso);
                        countQuery = countQuery.lte('created_at', endIso);
                    }
                    break;
                case 'leaderboard':
                    // Leaderboard tab manages its own data fetching internally.
                    setTotalCount(0);
                    setDataLoading(false);
                    return;
                case 'audit_log':
                    query = supabase.from('admin_audit_log').select('*');
                    countQuery = supabase.from('admin_audit_log').select('*', { count: 'exact', head: true });
                    if (auditActionFilter) {
                        query = query.eq('action', auditActionFilter);
                        countQuery = countQuery.eq('action', auditActionFilter);
                    }
                    if (auditTargetTypeFilter) {
                        query = query.eq('target_type', auditTargetTypeFilter);
                        countQuery = countQuery.eq('target_type', auditTargetTypeFilter);
                    }
                    break;
                case 'dashboard':
                    setDataLoading(false);
                    return;
                default:
                    return;
            }

            // Search (sanitized to prevent PostgREST filter injection)
            if (searchTerm) {
                const safe = sanitizeSearchTerm(searchTerm);
                if (safe) {
                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(searchTerm.trim());
                    const idQuery = isUuid ? `id.eq.${searchTerm.trim()},` : '';

                    if (activeTab === 'users') {
                        query = query.or(`${idQuery}username.ilike.%${safe}%,full_name.ilike.%${safe}%,email.ilike.%${safe}%`);
                        countQuery = countQuery.or(`${idQuery}username.ilike.%${safe}%,full_name.ilike.%${safe}%,email.ilike.%${safe}%`);
                    } else if (activeTab === 'feedback') {
                        query = query.or(`${idQuery}title.ilike.%${safe}%,description.ilike.%${safe}%`);
                        countQuery = countQuery.or(`${idQuery}title.ilike.%${safe}%,description.ilike.%${safe}%`);
                    } else if (activeTab === 'poi_flags') {
                        query = query.or(`${idQuery}reason.ilike.%${safe}%,comment.ilike.%${safe}%,poi_type.ilike.%${safe}%`);
                        countQuery = countQuery.or(`${idQuery}reason.ilike.%${safe}%,comment.ilike.%${safe}%,poi_type.ilike.%${safe}%`);
                    } else if (activeTab === 'parking_images') {
                        query = query.or(`${idQuery}image_url.ilike.%${safe}%`);
                        countQuery = countQuery.or(`${idQuery}image_url.ilike.%${safe}%`);
                    } else if (activeTab === 'cities') {
                        query = query.or(`${idQuery}name.ilike.%${safe}%,slug.ilike.%${safe}%,name_en.ilike.%${safe}%`);
                        countQuery = countQuery.or(`${idQuery}name.ilike.%${safe}%,slug.ilike.%${safe}%,name_en.ilike.%${safe}%`);
                    } else if (activeTab === 'daily_challenges') {
                        // date-like search
                        query = query.or(`${idQuery}generation_source.ilike.%${safe}%`);
                        countQuery = countQuery.or(`${idQuery}generation_source.ilike.%${safe}%`);
                    } else if (activeTab === 'community_routes') {
                        query = query.or(`${idQuery}name.ilike.%${safe}%,description.ilike.%${safe}%,surface_type.ilike.%${safe}%`);
                        countQuery = countQuery.or(`${idQuery}name.ilike.%${safe}%,description.ilike.%${safe}%,surface_type.ilike.%${safe}%`);
                    } else if (activeTab === 'audit_log') {
                        query = query.or(`${idQuery}action.ilike.%${safe}%,target_type.ilike.%${safe}%,notes.ilike.%${safe}%`);
                        countQuery = countQuery.or(`${idQuery}action.ilike.%${safe}%,target_type.ilike.%${safe}%,notes.ilike.%${safe}%`);
                    } else {
                        query = query.or(`${idQuery}name.ilike.%${safe}%,city.ilike.%${safe}%`);
                        countQuery = countQuery.or(`${idQuery}name.ilike.%${safe}%,city.ilike.%${safe}%`);
                    }
                }
            }

            {
            // Sorting — make sure the sort column actually exists on this tab's table.
            // Allowlist of valid sortable columns per tab; falls back to the first entry if current key is unknown.
            const validSortKeys: Record<string, string[]> = {
                users: ['created_at', 'username', 'email', 'full_name', 'role'],
                parking: ['created_at', 'name', 'city'],
                parking_images: ['created_at', 'status'],
                services: ['created_at', 'name', 'city'],
                repair: ['created_at', 'name', 'city'],
                drinking_fountain: ['created_at', 'name', 'city'],
                feedback: ['created_at', 'status', 'priority', 'title'],
                poi_flags: ['created_at', 'status', 'reason'],
                cities: ['created_at', 'name', 'slug', 'country_code'],
                daily_challenges: ['challenge_date', 'distance_meters', 'generated_at', 'generation_source'],
                community_routes: ['created_at', 'status', 'name', 'quality_rating'],
                audit_log: ['created_at', 'action', 'target_type'],
            };
            const allowed = validSortKeys[activeTab] || ['created_at'];
            const sortKeyForTab = allowed.includes(sortConfig.key) ? sortConfig.key : allowed[0];
            query = query.order(sortKeyForTab, { ascending: sortConfig.direction === 'asc' });
            }

            // Pagination
            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            const [dataRes, countRes] = await Promise.all([query, countQuery]);

            if (dataRes.error) throw dataRes.error;
            if (countRes.error) throw countRes.error;

            setTotalCount(countRes.count || 0);

            if (activeTab === 'users') setUsers(dataRes.data || []);
            else if (activeTab === 'parking') setParkingSpots(dataRes.data || []);
            else if (activeTab === 'services') setBicycleServices(dataRes.data || []);
            else if (activeTab === 'repair') setRepairStations(dataRes.data || []);
            else if (activeTab === 'drinking_fountain') setDrinkingFountains(dataRes.data || []);
            else if (activeTab === 'feedback') setFeedback(dataRes.data || []);
            else if (activeTab === 'poi_flags') {
                // Flatten the joined profiles data
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mapped = (dataRes.data || []).map((row: any) => ({
                    ...row,
                    reporter_username: row.profiles?.username || null,
                    reporter_full_name: row.profiles?.full_name || null,
                }));
                setPoiFlags(mapped);
            } else if (activeTab === 'parking_images') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mapped = (dataRes.data || []).map((row: any) => ({
                    ...row,
                    parking_name: row.parkingSpots?.name || null,
                    parking_city: row.parkingSpots?.city || null,
                    parking_coordinate: row.parkingSpots?.coordinate || null,
                    reporter_username: row.user_id ? String(row.user_id).slice(0, 8) : null,
                    reporter_full_name: null,
                }));
                setParkingImageSubmissions(mapped);
            } else if (activeTab === 'cities') {
                const rows = dataRes.data || [];
                const cityIds = rows.map((c: { id: string }) => c.id);
                let countsMap: Record<string, number> = {};
                if (cityIds.length > 0) {
                    const { data: ch } = await supabase
                        .from('daily_challenges')
                        .select('city_id')
                        .in('city_id', cityIds);
                    countsMap = (ch || []).reduce<Record<string, number>>((acc, r: { city_id: string }) => {
                        acc[r.city_id] = (acc[r.city_id] || 0) + 1;
                        return acc;
                    }, {});
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setCities(rows.map((c: any) => ({ ...c, challenges_count: countsMap[c.id] || 0 })));
            } else if (activeTab === 'daily_challenges') {
                setDailyChallenges(dataRes.data || []);
            } else if (activeTab === 'community_routes') {
                const rows = dataRes.data || [];
                // Resolve submitter usernames via a separate profiles lookup (no FK to profiles).
                const userIds = Array.from(new Set(
                    rows.map((r: { user_id?: string | null }) => r.user_id).filter((v): v is string => !!v)
                ));
                let profilesMap: Record<string, { username?: string | null; full_name?: string | null }> = {};
                if (userIds.length > 0) {
                    const { data: profs } = await supabase
                        .from('profiles')
                        .select('id, username, full_name')
                        .in('id', userIds);
                    profilesMap = Object.fromEntries(
                        (profs || []).map((p: { id: string; username?: string | null; full_name?: string | null }) => [p.id, p])
                    );
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mapped = rows.map((r: any) => ({
                    ...r,
                    profiles: r.user_id ? profilesMap[r.user_id] || null : null,
                }));
                setCommunityRoutes(mapped);
            } else if (activeTab === 'audit_log') {
                const rows = dataRes.data || [];
                const adminIds = Array.from(new Set(
                    rows.map((r: { admin_id?: string | null }) => r.admin_id).filter((v): v is string => !!v)
                ));
                let profilesMap: Record<string, { username?: string | null; full_name?: string | null }> = {};
                if (adminIds.length > 0) {
                    const { data: profs } = await supabase.from('profiles').select('id, username, full_name').in('id', adminIds);
                    profilesMap = Object.fromEntries((profs || []).map((p: { id: string; username?: string | null; full_name?: string | null }) => [p.id, p]));
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mapped = rows.map((r: any) => ({ ...r, profiles: r.admin_id ? profilesMap[r.admin_id] || null : null }));
                setAuditLog(mapped);
            }

        } catch (error) {
            if (isDev) console.error('Error fetching data:', error);
            if (!silent) toast.error('Hiba történt az adatok betöltésekor');
        } finally {
            if (!silent) setDataLoading(false);
        }
    };

    // Keep the ref in sync with the latest fetchData
    fetchDataRef.current = fetchData;

    useEffect(() => {
        // Reset page and selection on tab/search change
        setCurrentPage(1);
        setSelectedRows(new Set());
        setSelectAll(false);
        setMobileSearchOpen(false);
        // Reset sort key to a column that exists on this tab's table
        const defaultSortKey = activeTab === 'daily_challenges' ? 'challenge_date' : 'created_at';
        setSortConfig(prev => (prev.key === defaultSortKey ? prev : { key: defaultSortKey, direction: 'desc' }));
    }, [activeTab, searchTerm]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, currentPage, sortConfig, searchTerm, profile, pageSize, challengeCityFilter, challengeDateFrom, challengeDateTo, challengeActiveFilter, routeStatusFilter, routeDateFrom, routeDateTo, auditActionFilter, auditTargetTypeFilter]);

    // Load cities for filter dropdowns when those tabs open
    useEffect(() => {
        if (activeTab !== 'daily_challenges' && activeTab !== 'leaderboard') return;
        if (citiesForFilter.length > 0) return;
        supabase.from('cities').select('id, name').order('name').then(({ data }) => {
            if (data) setCitiesForFilter(data);
        });
    }, [activeTab, citiesForFilter.length]);

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            const currentData = activeTab === 'users' ? users :
                activeTab === 'parking' ? parkingSpots :
                    activeTab === 'parking_images' ? parkingImageSubmissions :
                        activeTab === 'drinking_fountain' ? drinkingFountains :
                            activeTab === 'services' ? bicycleServices :
                                activeTab === 'repair' ? repairStations :
                                    activeTab === 'poi_flags' ? poiFlags : feedback;
            setSelectedRows(new Set(currentData.map(item => item.id)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedRows);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
            setSelectAll(false);
        }
        setSelectedRows(newSelected);
    };

    const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
        setToggleLoading(id);
        const table = activeTab === 'parking' ? 'parkingSpots' :
            activeTab === 'services' ? 'bicycleService' :
                activeTab === 'drinking_fountain' ? 'drinkingFountain' : 'repairStation';

        try {
            const { error } = await supabase
                .from(table)
                .update({ available: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success('Státusz sikeresen módosítva');
            fetchData();
        } catch (error) {
            if (isDev) console.error('Error toggling status:', error);
            toast.error('Hiba történt a státusz módosítása során');
        } finally {
            setToggleLoading(null);
        }
    };

    const handleFeedbackStatusChange = async (id: string, newStatus: string) => {
        setToggleLoading(id);
        try {
            const { error } = await supabase
                .from('feedback')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success('Visszajelzés státusza frissítve');
            fetchData();
        } catch (error) {
            if (isDev) console.error('Error updating feedback status:', error);
            toast.error('Hiba történt a státusz frissítésekor');
        } finally {
            setToggleLoading(null);
        }
    };

    const handleOpenPoiEdit = useCallback(async (poiId: string, poiType: string) => {
        const tableMap: Record<string, string> = {
            parking: 'parkingSpots',
            bicycleService: 'bicycleService',
            repairStation: 'repairStation',
            drinkingFountain: 'drinkingFountain',
        };
        const tabMap: Record<string, string> = {
            parking: 'parking',
            bicycleService: 'services',
            repairStation: 'repair',
            drinkingFountain: 'drinking_fountain',
        };
        const table = tableMap[poiType];
        const tab = tabMap[poiType];
        if (!table || !tab) {
            toast.error('Ismeretlen POI típus');
            return;
        }
        setDetailModal(prev => ({ ...prev, show: false }));
        try {
            const { data, error } = await supabase.from(table).select('*').eq('id', poiId).single();
            if (error) throw error;
            if (!data) {
                toast.error('POI nem található');
                return;
            }
            setActiveTab(tab);
            setEditLocationModal({ show: true, item: data });
            toast.success('POI szerkesztés megnyitva');
        } catch (err) {
            if (process.env.NODE_ENV === 'development') console.error(err);
            toast.error('POI betöltése sikertelen');
        }
    }, []);

    const handlePoiFlagStatusChange = async (id: string, newStatus: string) => {
        setToggleLoading(id);
        try {
            const { error } = await supabase
                .from('poi_flags')
                .update({ status: newStatus, reviewed_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            toast.success('POI bejelentés státusza frissítve');
            fetchData();
        } catch (error) {
            if (isDev) console.error('Error updating poi flag status:', error);
            toast.error('Hiba történt a státusz frissítésekor');
        } finally {
            setToggleLoading(null);
        }
    };

    const handleParkingImageStatusChange = async (id: string, newStatus: string) => {
        if (!profile) return;
        setToggleLoading(id);
        try {
            const { data, error } = await supabase
                .rpc('parking_image_submission_set_status', {
                    p_submission_id: id,
                    p_new_status: newStatus,
                });

            if (error || (data && (data as any).error)) {
                if (isDev) console.error('Error updating parking image status via RPC:', error || (data as any).error);
                toast.error('Hiba történt a státusz frissítésekor');
            } else {
                toast.success('Kép státusza frissítve');
                fetchData();
            }
        } catch (error) {
            if (isDev) console.error('Error updating parking image status via RPC:', error);
            toast.error('Hiba történt a státusz frissítésekor');
        } finally {
            setToggleLoading(null);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDeleteParkingImageSubmission = async (submission: any) => {
        if (!submission) return;
        const confirmed = window.confirm('Biztosan törlöd ezt a kérelmet, a hozzá tartozó képet és a markerhez csatolt képet is?');
        if (!confirmed) return;

        setToggleLoading(submission.id);

        try {
            const imageUrl = typeof submission.image_url === 'string' ? submission.image_url : null;

            // 1) Kép törlése a storage-ból (Supabase Storage API-val)
            if (imageUrl) {
                await deleteSupabasePublicFile(imageUrl);
            }

            // 2) DB takarítás RPC-vel (picture_url tömb + submission sor)
            const { data, error } = await supabase
                .rpc('parking_image_submission_delete', { submission_id: submission.id });

            if (error || (data && (data as any).error)) {
                if (isDev) console.error('RPC delete error (parking_image_submission_delete):', error || (data as any).error);
                toast.error('Hiba történt a kérelem törlésekor');
            } else {
                toast.success('Kérelem és kép sikeresen törölve');
                fetchData();
            }
        } catch (err) {
            if (isDev) console.error('Error deleting parking image submission via RPC:', err);
            toast.error('Hiba történt a törlés közben');
        } finally {
            setToggleLoading(null);
        }
    };

    const handleDeleteClick = (id: string) => {
        const table = getTableForTab(activeTab) || 'feedback';
        setDeleteModal({ show: true, table, id });
    };

    const handleToggleCityActive = async (id: string, currentStatus: boolean) => {
        setToggleLoading(id);
        try {
            const { error } = await supabase.from('cities').update({ is_active: !currentStatus }).eq('id', id);
            if (error) throw error;
            await writeAuditLog({ adminId, action: 'toggle_city_active', targetType: 'city', targetId: id, notes: !currentStatus ? 'activated' : 'deactivated' });
            toast.success('Státusz módosítva');
            fetchData();
        } catch (err) {
            if (isDev) console.error(err);
            toast.error('Hiba a státusz módosítása során');
        } finally {
            setToggleLoading(null);
        }
    };

    const handleToggleChallengeActive = async (id: string, currentStatus: boolean) => {
        setToggleLoading(id);
        try {
            const { error } = await supabase.from('daily_challenges').update({ is_active: !currentStatus }).eq('id', id);
            if (error) throw error;
            await writeAuditLog({ adminId, action: 'toggle_challenge_active', targetType: 'daily_challenge', targetId: id, notes: !currentStatus ? 'activated' : 'deactivated' });
            toast.success('Kihívás státusza módosítva');
            fetchData();
        } catch (err) {
            if (isDev) console.error(err);
            toast.error('Hiba a státusz módosítása során');
        } finally {
            setToggleLoading(null);
        }
    };

    const adminId = (profile as { id?: string } | null)?.id ?? null;

    const handleUserToggleBan = async (id: string, currentlyBanned: boolean) => {
        setToggleLoading(id);
        try {
            const { error } = await supabase.from('profiles')
                .update({ banned_at: currentlyBanned ? null : new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            await writeAuditLog({
                adminId,
                action: currentlyBanned ? 'unban_user' : 'ban_user',
                targetType: 'user',
                targetId: id,
            });
            toast.success(currentlyBanned ? 'Tiltás feloldva' : 'Felhasználó tiltva');
            fetchData();
        } catch (err) {
            if (isDev) console.error(err);
            toast.error('Hiba a tiltás módosítása során');
        } finally {
            setToggleLoading(null);
        }
    };

    const handleCommunityRouteStatusChange = async (id: string, newStatus: string) => {
        setToggleLoading(id);
        try {
            const { error } = await supabase
                .from('community_bike_lanes')
                .update({ status: newStatus })
                .eq('id', id);
            if (error) throw error;
            await writeAuditLog({ adminId, action: 'community_route_status', targetType: 'community_bike_lane', targetId: id, notes: newStatus });
            toast.success('Útvonal státusza frissítve');
            fetchData();
        } catch (err) {
            if (isDev) console.error(err);
            toast.error('Hiba a státusz frissítésekor');
        } finally {
            setToggleLoading(null);
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;

        // Recalculate table name from activeTab instead of trusting state
        const table = getTableForTab(activeTab);
        if (!table) return;

        try {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', deleteModal.id);

            if (error) throw error;

            toast.success('Elem sikeresen törölve');
            setDeleteModal({ show: false, table: null, id: null });
            fetchData();
        } catch (error) {
            if (isDev) console.error('Error deleting item:', error);
            toast.error('Hiba történt a törlés során');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            if (isDev) console.error('Logout error:', error);
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!profile || (profile as any).role !== 'admin') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="bg-card border-border shadow-2xl max-w-md w-full">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-destructive/20 border-2 border-destructive/30 mx-auto mb-6 flex items-center justify-center">
                                <XCircle className="h-8 w-8 text-destructive" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">Hozzáférés megtagadva</h2>
                            <p className="text-muted-foreground mb-6">Nincs jogosultságod az admin panel megtekintéséhez.</p>
                            <Button
                                onClick={() => router.push('/')}
                                variant="outline"
                                className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Vissza a főoldalra
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="admin-dark min-h-screen bg-background text-foreground flex w-full">
                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    profile={profile}
                    onLogout={handleLogout}
                    onHomeConfig={() => router.push('/')}
                />

                <SidebarInset className="flex flex-col flex-1 h-screen overflow-hidden">
                    <header className="flex-shrink-0 p-3 sm:p-4 xl:p-6 pb-2">
                        <Card className="bg-card border-border shadow-lg">
                            <CardContent className="p-3 xl:p-4">
                                <div className="hidden xl:flex items-center justify-between">
                                    {/* Left Section */}
                                    <div className="flex items-center gap-4">
                                        <SidebarTrigger />
                                        <Separator orientation="vertical" className="h-8 bg-sidebar-border" />
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                                {activeTab === 'dashboard' && <Loader2 className="h-5 w-5 text-white" />}
                                                {activeTab === 'users' && <Users className="h-5 w-5 text-white" />}
                                                {activeTab === 'parking' && <MapPin className="h-5 w-5 text-white" />}
                                                {activeTab === 'parking_images' && <Camera className="h-5 w-5 text-white" />}
                                                {activeTab === 'services' && <Building className="h-5 w-5 text-white" />}
                                                {activeTab === 'repair' && <Wrench className="h-5 w-5 text-white" />}
                                                {activeTab === 'drinking_fountain' && <Droplet className="h-5 w-5 text-white" />}
                                                {activeTab === 'feedback' && <Users className="h-5 w-5 text-white" />}
                                                {activeTab === 'poi_flags' && <MapPin className="h-5 w-5 text-white" />}
                                                {activeTab === 'cities' && <Building2 className="h-5 w-5 text-white" />}
                                                {activeTab === 'daily_challenges' && <Trophy className="h-5 w-5 text-white" />}
                                                {activeTab === 'community_routes' && <Route className="h-5 w-5 text-white" />}
                                                {activeTab === 'leaderboard' && <Trophy className="h-5 w-5 text-white" />}
                                                {activeTab === 'audit_log' && <ScrollText className="h-5 w-5 text-white" />}
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                                    {activeTab === 'dashboard' && 'Vezérlőpult'}
                                                    {activeTab === 'users' && 'Felhasználók'}
                                                    {activeTab === 'parking' && 'Bicikli Parkolók'}
                                                    {activeTab === 'parking_images' && 'Parkoló képek'}
                                                    {activeTab === 'services' && 'Szervizek & Boltok'}
                                                    {activeTab === 'repair' && 'Javító Állomások'}
                                                    {activeTab === 'drinking_fountain' && 'Ivókutak'}
                                                    {activeTab === 'feedback' && 'Visszajelzések'}
                                                    {activeTab === 'poi_flags' && 'POI Bejelentések'}
                                                    {activeTab === 'cities' && 'Városok'}
                                                    {activeTab === 'daily_challenges' && 'Napi kihívások'}
                                                    {activeTab === 'community_routes' && 'Közösségi útvonalak'}
                                                    {activeTab === 'leaderboard' && 'Ranglista'}
                                                    {activeTab === 'audit_log' && 'Audit napló'}
                                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                        {activeTab === 'dashboard' ? 'Áttekintés' : `${totalCount} elem`}
                                                    </Badge>
                                                    {activeTab !== 'dashboard' && (
                                                        <Badge
                                                            variant="outline"
                                                            className={`gap-1.5 text-xs ${isRealtimeConnected
                                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                                }`}
                                                        >
                                                            <span className="relative flex h-2 w-2">
                                                                {isRealtimeConnected && (
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                                )}
                                                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isRealtimeConnected ? 'bg-emerald-500' : 'bg-yellow-500'
                                                                    }`} />
                                                            </span>
                                                            {isRealtimeConnected ? 'Élő' : 'Kapcsolódás...'}
                                                        </Badge>
                                                    )}
                                                </h1>
                                                <p className="text-muted-foreground text-sm mt-1">
                                                    {activeTab === 'dashboard' && 'Rendszerstatisztikák és áttekintés'}
                                                    {activeTab === 'users' && 'Összes regisztrált felhasználó kezelése'}
                                                    {activeTab === 'parking' && 'Bicikli parkolók létrehozása és kezelése'}
                                                    {activeTab === 'parking_images' && 'Felhasználók által beküldött parkoló képek jóváhagyása'}
                                                    {activeTab === 'services' && 'Kerékpár szervizek és boltok kezelése'}
                                                    {activeTab === 'repair' && 'Önkiszolgáló javító állomások kezelése'}
                                                    {activeTab === 'drinking_fountain' && 'Ivókutak nyilvántartása és kezelése'}
                                                    {activeTab === 'feedback' && 'Felhasználói visszajelzések kezelése'}
                                                    {activeTab === 'poi_flags' && 'POI-khoz kapcsolódó bejelentések kezelése'}
                                                    {activeTab === 'cities' && 'Városok kezelése (slug, koordináták, bounding box)'}
                                                    {activeTab === 'daily_challenges' && 'Automatikusan generált napi kihívások áttekintése'}
                                                    {activeTab === 'community_routes' && 'Közösségi beküldésű kerékpárutak moderálása'}
                                                    {activeTab === 'leaderboard' && 'Teljesített kihívások rangsora és láthatóság-kezelés'}
                                                    {activeTab === 'audit_log' && 'Admin műveletek időrendi naplója'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Keresés..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 w-80"
                                            />
                                            {searchTerm && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                    onClick={() => setSearchTerm('')}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        {activeTab !== 'users' && activeTab !== 'dashboard' && activeTab !== 'feedback' && activeTab !== 'poi_flags' && activeTab !== 'parking_images' && activeTab !== 'cities' && activeTab !== 'daily_challenges' && activeTab !== 'community_routes' && activeTab !== 'leaderboard' && activeTab !== 'audit_log' && (
                                            <>
                                                <Separator orientation="vertical" className="h-8 bg-sidebar-border" />
                                                <Button
                                                    onClick={() => setAddLocationModal(true)}
                                                    className="gap-2"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Új hozzáadása
                                                </Button>
                                            </>
                                        )}
                                        {activeTab === 'cities' && (
                                            <>
                                                <Separator orientation="vertical" className="h-8 bg-sidebar-border" />
                                                <Button
                                                    onClick={() => setCityFormModal({ show: true, item: null })}
                                                    className="gap-2"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Új város
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile Header */}
                                <div className="xl:hidden flex items-center gap-2 min-h-[40px]">
                                    <SidebarTrigger />
                                    <Separator orientation="vertical" className="h-6 bg-sidebar-border" />
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <h1 className="text-base font-bold text-foreground truncate">
                                            {activeTab === 'dashboard' && 'Vezérlőpult'}
                                            {activeTab === 'users' && 'Felhasználók'}
                                            {activeTab === 'parking' && 'Bicikli Parkolók'}
                                            {activeTab === 'parking_images' && 'Parkoló képek'}
                                            {activeTab === 'services' && 'Szervizek & Boltok'}
                                            {activeTab === 'repair' && 'Javító Állomások'}
                                            {activeTab === 'drinking_fountain' && 'Ivókutak'}
                                            {activeTab === 'feedback' && 'Visszajelzések'}
                                            {activeTab === 'poi_flags' && 'POI Bejelentések'}
                                            {activeTab === 'cities' && 'Városok'}
                                            {activeTab === 'daily_challenges' && 'Napi kihívások'}
                                            {activeTab === 'community_routes' && 'Közösségi útvonalak'}
                                            {activeTab === 'leaderboard' && 'Ranglista'}
                                            {activeTab === 'audit_log' && 'Audit napló'}
                                        </h1>
                                        {activeTab !== 'dashboard' && (
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shrink-0 text-xs">
                                                {totalCount}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {activeTab !== 'dashboard' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setMobileSearchOpen(v => !v)}
                                            >
                                                {mobileSearchOpen ? <XCircle className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                                            </Button>
                                        )}
                                        {activeTab !== 'users' && activeTab !== 'dashboard' && activeTab !== 'feedback' && activeTab !== 'poi_flags' && activeTab !== 'parking_images' && activeTab !== 'cities' && activeTab !== 'daily_challenges' && activeTab !== 'community_routes' && activeTab !== 'leaderboard' && activeTab !== 'audit_log' && (
                                            <Button
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setAddLocationModal(true)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {activeTab === 'cities' && (
                                            <Button
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setCityFormModal({ show: true, item: null })}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {/* Mobile Search Bar */}
                                {mobileSearchOpen && activeTab !== 'dashboard' && (
                                    <div className="xl:hidden mt-3 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Keresés..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 w-full"
                                            autoFocus
                                        />
                                        {searchTerm && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                onClick={() => setSearchTerm('')}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </header>

                    <main className="flex-1 overflow-hidden p-3 sm:p-4 xl:p-6 pt-2">
                        {dataLoading ? (
                            <Card className="bg-card border-border shadow-lg h-full flex items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            </Card>
                        ) : (
                            <Card className="bg-card border-border overflow-hidden h-full flex flex-col">
                                <CardContent className="p-0 m-0 flex-1 overflow-hidden flex flex-col">
                                    {activeTab === 'dashboard' && (
                                        <div className="overflow-y-auto h-full p-1">
                                            <DeviceStatsOverview />
                                            <ContentStatsOverview onNavigate={setActiveTab} />
                                        </div>
                                    )}
                                    {activeTab === 'users' && (
                                        <UsersTable
                                            users={users}
                                            isLoading={dataLoading}
                                            selectedRows={selectedRows}
                                            onSelectAll={handleSelectAll}
                                            onSelectRow={handleSelectRow}
                                            onSort={handleSort}
                                            sortConfig={sortConfig}
                                            onRowClick={(item) => setDetailModal({ show: true, item, type: 'user' })}
                                            onToggleBan={handleUserToggleBan}
                                            toggleLoading={toggleLoading}
                                            searchTerm={searchTerm}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'parking' && (
                                        <ParkingTable
                                            data={parkingSpots}
                                            selectedRows={selectedRows}
                                            onSelectAll={handleSelectAll}
                                            onSelectRow={handleSelectRow}
                                            onSort={handleSort}
                                            sortConfig={sortConfig}
                                            onRowClick={(item) => setDetailModal({ show: true, item, type: 'parking' })}
                                            onEdit={(item) => setEditLocationModal({ show: true, item })}
                                            onDelete={(id) => handleDeleteClick(id)}
                                            onToggleAvailability={handleToggleAvailability}
                                            toggleLoading={toggleLoading}
                                            searchTerm={searchTerm}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'parking_images' && (
                                        <ParkingImageSubmissionsTable
                                            data={parkingImageSubmissions}
                                            isLoading={dataLoading}
                                            onStatusChange={handleParkingImageStatusChange}
                                            onOpenParkingEdit={(parkingSpotId) => handleOpenPoiEdit(parkingSpotId, 'parking')}
                                            onDelete={handleDeleteParkingImageSubmission}
                                            searchTerm={searchTerm}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'services' && (
                                        <ServicesTable
                                            data={bicycleServices}
                                            selectedRows={selectedRows}
                                            onSelectAll={handleSelectAll}
                                            onSelectRow={handleSelectRow}
                                            onSort={handleSort}
                                            sortConfig={sortConfig}
                                            onRowClick={(item) => setDetailModal({ show: true, item, type: 'service' })}
                                            onEdit={(item) => setEditLocationModal({ show: true, item })}
                                            onDelete={(id) => handleDeleteClick(id)}
                                            onToggleAvailability={handleToggleAvailability}
                                            toggleLoading={toggleLoading}
                                            searchTerm={searchTerm}
                                            selectAll={selectAll}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'repair' && (
                                        <RepairTable
                                            data={repairStations}
                                            selectedRows={selectedRows}
                                            onSelectAll={handleSelectAll}
                                            onSelectRow={handleSelectRow}
                                            onSort={handleSort}
                                            sortConfig={sortConfig}
                                            onRowClick={(item) => setDetailModal({ show: true, item, type: 'repair' })}
                                            onEdit={(item) => setEditLocationModal({ show: true, item })}
                                            onDelete={(id) => handleDeleteClick(id)}
                                            onToggleAvailability={handleToggleAvailability}
                                            toggleLoading={toggleLoading}
                                            searchTerm={searchTerm}
                                            selectAll={selectAll}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'drinking_fountain' && (
                                        <DrinkingFountainTable
                                            data={drinkingFountains}
                                            selectedRows={selectedRows}
                                            onSelectAll={handleSelectAll}
                                            onSelectRow={handleSelectRow}
                                            onSort={handleSort}
                                            sortConfig={sortConfig}
                                            onRowClick={(item) => setDetailModal({ show: true, item, type: 'drinking_fountain' })}
                                            onEdit={(item) => setEditLocationModal({ show: true, item })}
                                            onDelete={(id) => handleDeleteClick(id)}
                                            onToggleAvailability={handleToggleAvailability}
                                            toggleLoading={toggleLoading}
                                            searchTerm={searchTerm}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'feedback' && (
                                        <FeedbackTable
                                            data={feedback}
                                            isLoading={dataLoading}
                                            selectedRows={selectedRows}
                                            onSelectAll={handleSelectAll}
                                            onSelectRow={handleSelectRow}
                                            onSort={handleSort}
                                            sortConfig={sortConfig}
                                            onRowClick={(item) => setDetailModal({ show: true, item, type: 'feedback' })}
                                            onStatusChange={handleFeedbackStatusChange}
                                            searchTerm={searchTerm}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'cities' && (
                                        <CitiesTable
                                            data={cities}
                                            onRowClick={(item) => setCityFormModal({ show: true, item })}
                                            onEdit={(item) => setCityFormModal({ show: true, item })}
                                            onDelete={(id) => handleDeleteClick(id)}
                                            onToggleActive={handleToggleCityActive}
                                            toggleLoading={toggleLoading}
                                            searchTerm={searchTerm}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'daily_challenges' && (
                                        <DailyChallengesTable
                                            data={dailyChallenges}
                                            onRowClick={(item) => setChallengeDetailModal({ show: true, item })}
                                            onDelete={(id) => handleDeleteClick(id)}
                                            onToggleActive={handleToggleChallengeActive}
                                            toggleLoading={toggleLoading}
                                            searchTerm={searchTerm}
                                            cityFilter={challengeCityFilter}
                                            onCityFilterChange={setChallengeCityFilter}
                                            dateFrom={challengeDateFrom}
                                            onDateFromChange={setChallengeDateFrom}
                                            dateTo={challengeDateTo}
                                            onDateToChange={setChallengeDateTo}
                                            activeFilter={challengeActiveFilter}
                                            onActiveFilterChange={setChallengeActiveFilter}
                                            cities={citiesForFilter}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'community_routes' && (
                                        <CommunityRoutesTable
                                            data={communityRoutes}
                                            onRowClick={(item) => setRouteReviewModal({ show: true, item })}
                                            onDelete={(id) => handleDeleteClick(id)}
                                            onStatusChange={handleCommunityRouteStatusChange}
                                            toggleLoading={toggleLoading}
                                            statusFilter={routeStatusFilter}
                                            onStatusFilterChange={setRouteStatusFilter}
                                            dateFrom={routeDateFrom}
                                            onDateFromChange={setRouteDateFrom}
                                            dateTo={routeDateTo}
                                            onDateToChange={setRouteDateTo}
                                            searchTerm={searchTerm}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'leaderboard' && (
                                        <LeaderboardTab cities={citiesForFilter} adminId={adminId} />
                                    )}
                                    {activeTab === 'audit_log' && (
                                        <AuditLogTable
                                            data={auditLog}
                                            actionFilter={auditActionFilter}
                                            onActionFilterChange={setAuditActionFilter}
                                            targetTypeFilter={auditTargetTypeFilter}
                                            onTargetTypeFilterChange={setAuditTargetTypeFilter}
                                            searchTerm={searchTerm}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                    {activeTab === 'poi_flags' && (
                                        <PoiFlagsTable
                                            data={poiFlags}
                                            isLoading={dataLoading}
                                            selectedRows={selectedRows}
                                            onSelectAll={handleSelectAll}
                                            onSelectRow={handleSelectRow}
                                            onSort={handleSort}
                                            sortConfig={sortConfig}
                                            onRowClick={(item) => setDetailModal({ show: true, item, type: 'poi_flags' })}
                                            onStatusChange={handlePoiFlagStatusChange}
                                            onDelete={(id) => handleDeleteClick(id)}
                                            searchTerm={searchTerm}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </main>
                </SidebarInset>

                {/* Modals */}
                <AddLocationModal
                    isOpen={addLocationModal}
                    onClose={() => setAddLocationModal(false)}
                    locationType={activeTab}
                    onSuccess={() => {
                        setAddLocationModal(false);
                        fetchData();
                    }}
                />

                <EditLocationModal
                    isOpen={editLocationModal.show}
                    onClose={() => setEditLocationModal({ show: false, item: null })}
                    locationType={activeTab}
                    item={editLocationModal.item}
                    onSuccess={() => {
                        setEditLocationModal({ show: false, item: null });
                        fetchData();
                    }}
                />

                <DetailModal
                    isOpen={detailModal.show}
                    onClose={() => setDetailModal({ ...detailModal, show: false })}
                    item={detailModal.item}
                    type={detailModal.type}
                    onEdit={(item) => {
                        setDetailModal({ ...detailModal, show: false });
                        setEditLocationModal({ show: true, item });
                    }}
                    onStatusChange={detailModal.type === 'poi_flags' ? handlePoiFlagStatusChange : handleFeedbackStatusChange}
                    onOpenPoiEdit={detailModal.type === 'poi_flags' ? handleOpenPoiEdit : undefined}
                />

                <DeleteConfirmModal
                    isOpen={deleteModal.show}
                    onClose={() => setDeleteModal({ show: false, table: null, id: null })}
                    onConfirm={confirmDelete}
                />

                <CityFormModal
                    isOpen={cityFormModal.show}
                    onClose={() => setCityFormModal({ show: false, item: null })}
                    city={cityFormModal.item}
                    onSuccess={() => {
                        setCityFormModal({ show: false, item: null });
                        fetchData();
                    }}
                />

                <DailyChallengeDetailModal
                    isOpen={challengeDetailModal.show}
                    onClose={() => setChallengeDetailModal({ show: false, item: null })}
                    challenge={challengeDetailModal.item}
                    adminId={adminId}
                />

                <CommunityRouteReviewModal
                    isOpen={routeReviewModal.show}
                    onClose={() => setRouteReviewModal({ show: false, item: null })}
                    route={routeReviewModal.item}
                    onSuccess={() => {
                        setRouteReviewModal({ show: false, item: null });
                        fetchData();
                    }}
                />
            </div>
        </SidebarProvider>
    );
}
