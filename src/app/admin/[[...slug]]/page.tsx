'use client';

import { Button } from '@/components/ui/button';
import { Card,CardContent } from '@/components/ui/card';
import {
SidebarInset,
SidebarProvider
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { supabase } from '@/lib/supabaseClient';
import {
ArrowLeft,
Loader2,
XCircle
} from 'lucide-react';
import { useParams,useRouter } from 'next/navigation';
import { useCallback,useEffect,useRef,useState } from 'react';
import { toast } from 'sonner';

import ActivationMetricsOverview from '@/components/admin/ActivationMetricsOverview';
import AddLocationModal from '@/components/admin/AddLocationModal';
import { getAdminNavigationItem } from '@/components/admin/adminNavigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminRecordBrowser,{ type RecordFilter } from '@/components/admin/AdminRecordBrowser';
import { AUDIT_ACTION_LABELS,RECORD_COLLECTIONS,RECORD_STATUSES,type AdminRecord } from '@/components/admin/adminRecordModel';
import { applyRecordAction } from '@/components/admin/adminRecordMutations';
import AdminSidebar from '@/components/admin/AdminSidebar';
import workspaceStyles from '@/components/admin/AdminWorkspace.module.css';
import AppConfigTab from '@/components/admin/AppConfigTab';
import CityFormModal from '@/components/admin/CityFormModal';
import CommunityRouteReviewModal from '@/components/admin/CommunityRouteReviewModal';
import ContentStatsOverview from '@/components/admin/ContentStatsOverview';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import DetailModal from '@/components/admin/DetailModal';
import DeviceStatsOverview from '@/components/admin/DeviceStatsOverview';
import EditLocationModal from '@/components/admin/EditLocationModal';
import ImagePreview from '@/components/admin/ImagePreview';
import LeaderboardTab from '@/components/admin/LeaderboardTab';
import { EditSuggestionModal,PoiSuggestion } from '@/components/admin/PoiSuggestionsTable';
import type { AdminRideRecord } from '@/components/admin/RideDetailContent';
import RideDiagnosticsTab from '@/components/admin/RideDiagnosticsTab';
import GpsDeviceDiagnostics from '@/components/admin/GpsDeviceDiagnostics';
import RouteHeatmapTab from '@/components/admin/RouteHeatmapTab';
import { writeAuditLog } from '@/lib/adminAuditLog';

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

type RpcResultWithError = {
    error?: string | null;
};

/**
 * URL routing for the admin panel.
 * Each tab maps to a path segment under /admin so the browser back button
 * navigates between tabs (and opened records) instead of leaving the panel.
 */
const TAB_SLUGS: Record<string, string> = {
    dashboard: '',
    users: 'users',
    parking: 'parking',
    parking_images: 'parking-images',
    services: 'services',
    repair: 'repair',
    drinking_fountain: 'drinking-fountains',
    feedback: 'feedback',
    poi_flags: 'poi-flags',
    poi_suggestions: 'poi-suggestions',
    cities: 'cities',
    community_routes: 'community-routes',
    leaderboard: 'leaderboard',
    route_heatmap: 'route-heatmap',
    ride_diagnostics: 'ride-diagnostics',
    gps_diagnostics: 'gps-diagnostics',
    audit_log: 'audit-log',
    app_config: 'app-config',
};

const SLUG_TO_TAB: Record<string, string> = Object.fromEntries(
    Object.entries(TAB_SLUGS).filter(([, v]) => v).map(([k, v]) => [v, k])
);

const tabFromSlug = (slug: string | undefined): string => {
    if (!slug) return 'dashboard';
    return SLUG_TO_TAB[slug] || 'dashboard';
};

const buildAdminUrl = (tab: string, recordId?: string): string => {
    const slug = TAB_SLUGS[tab] ?? '';
    const base = slug ? `/admin/${slug}` : '/admin';
    return recordId ? `${base}/${recordId}` : base;
};

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

    // URL is the source of truth for which tab is active.
    // /admin            → dashboard
    // /admin/<tab-slug> → that tab
    // Records open as in-page modals only - opening a record does not change
    // the URL, but switching tabs (or pressing browser back to a previous tab)
    // closes any open modal so the visible state matches the URL.
    const params = useParams<{ slug?: string[] }>();
    const slugSegments = (params?.slug as string[] | undefined) || [];
    const activeTab = tabFromSlug(slugSegments[0]);

    const setActiveTab = useCallback((tab: string) => {
        router.push(buildAdminUrl(tab));
    }, [router]);

    const [searchTerm, setSearchTerm] = useState('');

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
    const [poiSuggestions, setPoiSuggestions] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [parkingImageSubmissions, setParkingImageSubmissions] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [drinkingFountains, setDrinkingFountains] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [cities, setCities] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [communityRoutes, setCommunityRoutes] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [citiesForFilter, setCitiesForFilter] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [auditLog, setAuditLog] = useState<any[]>([]);

    // Filters
    const [userSupporterFilter, setUserSupporterFilter] = useState<'all' | 'supporters' | 'non_supporters'>('all');
    const [userSortMode, setUserSortMode] = useState<'supporters_first' | 'newest' | 'oldest' | 'name_asc'>('supporters_first');
    const [routeStatusFilter, setRouteStatusFilter] = useState('');
    const [routeDateFrom, setRouteDateFrom] = useState('');
    const [routeDateTo, setRouteDateTo] = useState('');
    const [auditActionFilter, setAuditActionFilter] = useState('');
    const [auditTargetTypeFilter, setAuditTargetTypeFilter] = useState('');
    const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('');
    const [feedbackPriorityFilter, setFeedbackPriorityFilter] = useState('');
    const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState('');
    const [poiFlagStatusFilter, setPoiFlagStatusFilter] = useState('');
    const [poiFlagReasonFilter, setPoiFlagReasonFilter] = useState('');
    const [poiSuggestionStatusFilter, setPoiSuggestionStatusFilter] = useState('');
    const [poiSuggestionTypeFilter, setPoiSuggestionTypeFilter] = useState('');
    const [directoryStatusFilter,setDirectoryStatusFilter] = useState('');
    const [parkingImageStatusFilter, setParkingImageStatusFilter] = useState('');

    // New modals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [cityFormModal, setCityFormModal] = useState<{ show: boolean; item: any | null }>({ show: false, item: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [routeReviewModal, setRouteReviewModal] = useState<{ show: boolean; item: any | null }>({ show: false, item: null });
    const [suggestionEditor, setSuggestionEditor] = useState<PoiSuggestion | null>(null);
    const actionLock = useRef(false);
    const recordScope = useRef('');

    const [dataLoading, setDataLoading] = useState(false);
    const [toggleLoading, setToggleLoading] = useState<string | null>(null);
    const [batchActionLoading, setBatchActionLoading] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Selection
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    // Sorting
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    recordScope.current = JSON.stringify([activeTab,searchTerm,currentPage,pageSize,sortConfig,userSupporterFilter,userSortMode,routeStatusFilter,routeDateFrom,routeDateTo,auditActionFilter,auditTargetTypeFilter,feedbackStatusFilter,feedbackPriorityFilter,feedbackCategoryFilter,poiFlagStatusFilter,poiFlagReasonFilter,poiSuggestionStatusFilter,poiSuggestionTypeFilter,parkingImageStatusFilter,directoryStatusFilter]);
    const fetchSequence = useRef(0);

    // Modals
    const [addLocationModal, setAddLocationModal] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editLocationModal, setEditLocationModal] = useState<{ show: boolean; item: any; locationType?: string }>({
        show: false,
        item: null
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [detailModal, setDetailModal] = useState<{ show: boolean; item: any; type: string }>({
        show: false,
        item: null,
        type: 'user'
    });
    // Stack of previously-shown detail records, so cross-nav (e.g. parking-image → user → spot)
    // can offer a back button without losing the chain.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [detailHistory, setDetailHistory] = useState<Array<{ item: any; type: string }>>([]);
    // Refs mirror state so the helpers can read the current values without forcing re-creation
    // of the useCallbacks. Without this, the React 19 strict-mode double-invocation of state
    // updaters caused history to be pushed twice.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detailModalRef = useRef<{ show: boolean; item: any; type: string }>({ show: false, item: null, type: 'user' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detailHistoryRef = useRef<Array<{ item: any; type: string }>>([]);
    const weeklyDetailReturnRef = useRef<(() => void) | null>(null);
    const [hasWeeklyReturn, setHasWeeklyReturn] = useState(false);
    const [detailReturnLabel, setDetailReturnLabel] = useState('Vissza az előző nézethez');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [imageSubmissionToDelete, setImageSubmissionToDelete] = useState<any | null>(null);
    const [deletingRecord, setDeletingRecord] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; table: string | null; id: string | null }>({
        show: false,
        table: null,
        id: null
    });
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

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
            case 'poi_suggestions': return 'poi_suggestions';
            case 'drinking_fountain': return 'drinkingFountain';
            case 'cities': return 'cities';
            case 'community_routes': return 'community_bike_lanes';
            case 'leaderboard': return null;
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
        const request = ++fetchSequence.current, requestScope = recordScope.current;
        if (!silent) setDataLoading(true);
        try {
            let query;
            let countQuery;

            switch (activeTab) {
                case 'users':
                    query = supabase.from('profiles').select('*');
                    countQuery = supabase.from('profiles').select('*', { count: 'exact', head: true });
                    if (userSupporterFilter === 'supporters') {
                        query = query.eq('is_supporter', true);
                        countQuery = countQuery.eq('is_supporter', true);
                    } else if (userSupporterFilter === 'non_supporters') {
                        // Older profiles may predate the boolean default and contain NULL.
                        query = query.or('is_supporter.eq.false,is_supporter.is.null');
                        countQuery = countQuery.or('is_supporter.eq.false,is_supporter.is.null');
                    }
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
                            parkingSpots!parking_image_submissions_parking_spot_id_fkey (name, city, coordinate, osm_id, osm_type)
                        `);
                    countQuery = supabase.from('parking_image_submissions').select('*', { count: 'exact', head: true });
                    if (parkingImageStatusFilter) {
                        query = query.eq('status', parkingImageStatusFilter);
                        countQuery = countQuery.eq('status', parkingImageStatusFilter);
                    }
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
                    if (feedbackStatusFilter) {
                        query = query.eq('status', feedbackStatusFilter);
                        countQuery = countQuery.eq('status', feedbackStatusFilter);
                    }
                    if (feedbackPriorityFilter) {
                        query = query.eq('priority', feedbackPriorityFilter);
                        countQuery = countQuery.eq('priority', feedbackPriorityFilter);
                    }
                    if (feedbackCategoryFilter) {
                        query = query.eq('category', feedbackCategoryFilter);
                        countQuery = countQuery.eq('category', feedbackCategoryFilter);
                    }
                    break;
                case 'poi_flags':
                    query = supabase.from('poi_flags').select('*, profiles!poi_flags_user_id_fkey(username, full_name, avatar_url)');
                    countQuery = supabase.from('poi_flags').select('*', { count: 'exact', head: true });
                    if (poiFlagStatusFilter) {
                        query = query.eq('status', poiFlagStatusFilter);
                        countQuery = countQuery.eq('status', poiFlagStatusFilter);
                    }
                    if (poiFlagReasonFilter) {
                        query = query.eq('reason', poiFlagReasonFilter);
                        countQuery = countQuery.eq('reason', poiFlagReasonFilter);
                    }
                    break;
                case 'poi_suggestions':
                    query = supabase.from('poi_suggestions').select('*');
                    countQuery = supabase.from('poi_suggestions').select('*', { count: 'exact', head: true });
                    if (poiSuggestionStatusFilter) {
                        query = query.eq('status', poiSuggestionStatusFilter);
                        countQuery = countQuery.eq('status', poiSuggestionStatusFilter);
                    }
                    if (poiSuggestionTypeFilter) {
                        query = query.eq('suggested_type', poiSuggestionTypeFilter);
                        countQuery = countQuery.eq('suggested_type', poiSuggestionTypeFilter);
                    }
                    break;
                case 'cities':
                    query = supabase.from('cities').select('*');
                    countQuery = supabase.from('cities').select('*', { count: 'exact', head: true });
                    break;
                case 'community_routes':
                    // community_bike_lanes.user_id FK -> auth.users, not profiles - can't use PostgREST join.
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
                case 'route_heatmap':
                    // Heatmap tab uses a privacy-preserving RPC and manages its own loading.
                    setTotalCount(0);
                    setDataLoading(false);
                    return;
                case 'ride_diagnostics':
                case 'gps_diagnostics':
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
                case 'app_config':
                    setDataLoading(false);
                    return;
                default:
                    return;
            }

            if (directoryStatusFilter && ['users','cities','parking','services','repair','drinking_fountain'].includes(activeTab)) {
                if(activeTab === 'users') {
                    query = directoryStatusFilter === 'active' ? query.is('banned_at',null) : query.not('banned_at','is',null);
                    countQuery = directoryStatusFilter === 'active' ? countQuery.is('banned_at',null) : countQuery.not('banned_at','is',null);
                } else {
                    const column = activeTab === 'cities' ? 'is_active' : 'available';
                    const enabled = ['active','available'].includes(directoryStatusFilter);
                    query = query.eq(column,enabled); countQuery = countQuery.eq(column,enabled);
                }
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
                    } else if (activeTab === 'poi_suggestions') {
                        query = query.or(`${idQuery}comment.ilike.%${safe}%,suggested_type.ilike.%${safe}%,name.ilike.%${safe}%,city.ilike.%${safe}%`);
                        countQuery = countQuery.or(`${idQuery}comment.ilike.%${safe}%,suggested_type.ilike.%${safe}%,name.ilike.%${safe}%,city.ilike.%${safe}%`);
                    } else if (activeTab === 'parking_images') {
                        query = query.or(`${idQuery}image_url.ilike.%${safe}%`);
                        countQuery = countQuery.or(`${idQuery}image_url.ilike.%${safe}%`);
                    } else if (activeTab === 'cities') {
                        query = query.or(`${idQuery}name.ilike.%${safe}%,slug.ilike.%${safe}%,name_en.ilike.%${safe}%`);
                        countQuery = countQuery.or(`${idQuery}name.ilike.%${safe}%,slug.ilike.%${safe}%,name_en.ilike.%${safe}%`);
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
            // Sorting - make sure the sort column actually exists on this tab's table.
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
                poi_suggestions: ['created_at', 'status', 'suggested_type', 'name', 'city'],
                cities: ['created_at', 'name', 'slug', 'country_code'],
                community_routes: ['created_at', 'status', 'name', 'quality_rating'],
                audit_log: ['created_at', 'action', 'target_type'],
            };
            if (activeTab === 'users') {
                if (userSortMode === 'supporters_first') {
                    query = query
                        .order('is_supporter', { ascending: false, nullsFirst: false })
                        .order('created_at', { ascending: false });
                } else if (userSortMode === 'oldest') {
                    query = query.order('created_at', { ascending: true });
                } else if (userSortMode === 'name_asc') {
                    query = query.order('username', { ascending: true, nullsFirst: false });
                } else {
                    query = query.order('created_at', { ascending: false });
                }
            } else {
                const allowed = validSortKeys[activeTab] || ['created_at'];
                const sortKeyForTab = allowed.includes(sortConfig.key) ? sortConfig.key : allowed[0];
                query = query.order(sortKeyForTab, { ascending: sortConfig.direction === 'asc' });
            }
            }

            // Pagination
            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            const [dataRes, countRes] = await Promise.all([query, countQuery]);

            if (request !== fetchSequence.current || requestScope !== recordScope.current) return;
            if (dataRes.error) throw dataRes.error;
            if (countRes.error) throw countRes.error;

            setTotalCount(countRes.count || 0);
            const lastPage = Math.max(1, Math.ceil((countRes.count || 0) / pageSize));
            if (currentPage > lastPage) { setCurrentPage(lastPage); return; }

            if (activeTab === 'users') setUsers(dataRes.data || []);
            else if (activeTab === 'parking') setParkingSpots(dataRes.data || []);
            else if (activeTab === 'services') setBicycleServices(dataRes.data || []);
            else if (activeTab === 'repair') setRepairStations(dataRes.data || []);
            else if (activeTab === 'drinking_fountain') setDrinkingFountains(dataRes.data || []);
            else if (activeTab === 'feedback') {
                const rows = dataRes.data || [];
                const userIds = Array.from(new Set(rows.map((row: {user_id?: string}) => row.user_id).filter((id): id is string => Boolean(id))));
                const { data: people } = userIds.length ? await supabase.from('profiles').select('id,username,full_name').in('id',userIds) : {data:[]};
                if (request !== fetchSequence.current || requestScope !== recordScope.current) return;
                const names = new Map((people || []).map(person => [person.id,person]));
                setFeedback(rows.map((row: {user_id?: string}) => ({...row, profiles: names.get(row.user_id)})));
            }
            else if (activeTab === 'poi_flags') {
                // Flatten the joined profiles data
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mapped = (dataRes.data || []).map((row: any) => ({
                    ...row,
                    reporter_username: row.profiles?.username || null,
                    reporter_full_name: row.profiles?.full_name || null,
                    reporter_avatar_url: row.profiles?.avatar_url || null,
                }));
                if (request !== fetchSequence.current || requestScope !== recordScope.current) return;
                setPoiFlags(mapped);
            } else if (activeTab === 'poi_suggestions') {
                const rows = dataRes.data || [];
                const userIds = Array.from(new Set(
                    rows.map((r: { user_id?: string | null }) => r.user_id).filter((v): v is string => !!v)
                ));
                let profilesMap: Record<string, { id: string; username?: string | null; full_name?: string | null; avatar_url?: string | null }> = {};
                if (userIds.length > 0) {
                    const { data: profs } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url')
                        .in('id', userIds);
                    profilesMap = Object.fromEntries(
                        (profs || []).map((p: { id: string; username?: string | null; full_name?: string | null; avatar_url?: string | null }) => [p.id, p])
                    );
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mapped = rows.map((row: any) => {
                    const prof = row.user_id ? profilesMap[row.user_id] : null;
                    return {
                        ...row,
                        reporter_username: prof?.username || null,
                        reporter_full_name: prof?.full_name || null,
                        reporter_avatar_url: prof?.avatar_url || null,
                    };
                });
                if (request !== fetchSequence.current || requestScope !== recordScope.current) return;
                setPoiSuggestions(mapped);
            } else if (activeTab === 'parking_images') {
                const rows = dataRes.data || [];
                // user_id FK points at auth.users, not profiles - resolve via separate lookup.
                const userIds = Array.from(new Set(
                    rows.map((r: { user_id?: string | null }) => r.user_id).filter((v): v is string => !!v)
                ));
                let profilesMap: Record<string, { id: string; username?: string | null; full_name?: string | null; avatar_url?: string | null; email?: string | null }> = {};
                if (userIds.length > 0) {
                    const { data: profs } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url, email')
                        .in('id', userIds);
                    profilesMap = Object.fromEntries(
                        (profs || []).map((p: { id: string; username?: string | null; full_name?: string | null; avatar_url?: string | null; email?: string | null }) => [p.id, p])
                    );
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mapped = rows.map((row: any) => {
                    const prof = row.user_id ? profilesMap[row.user_id] : null;
                    return {
                        ...row,
                        parking_name: row.parkingSpots?.name || null,
                        parking_city: row.parkingSpots?.city || null,
                        parking_coordinate: row.parkingSpots?.coordinate || null,
                        parking_osm_id: row.parkingSpots?.osm_id ?? null,
                        parking_osm_type: row.parkingSpots?.osm_type || null,
                        reporter_username: prof?.username || null,
                        reporter_full_name: prof?.full_name || null,
                        reporter_avatar_url: prof?.avatar_url || null,
                        reporter_email: prof?.email || null,
                    };
                });
                if (request !== fetchSequence.current || requestScope !== recordScope.current) return;
                setParkingImageSubmissions(mapped);
            } else if (activeTab === 'cities') {
                const rows = dataRes.data || [];
                setCities(rows);
            } else if (activeTab === 'community_routes') {
                const rows = dataRes.data || [];
                // Resolve submitter usernames via a separate profiles lookup (no FK to profiles).
                const userIds = Array.from(new Set(
                    rows.map((r: { user_id?: string | null }) => r.user_id).filter((v): v is string => !!v)
                ));
                let profilesMap: Record<string, { username?: string | null; full_name?: string | null; avatar_url?: string | null; email?: string | null }> = {};
                if (userIds.length > 0) {
                    const { data: profs } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url, email')
                        .in('id', userIds);
                    profilesMap = Object.fromEntries(
                        (profs || []).map((p: { id: string; username?: string | null; full_name?: string | null; avatar_url?: string | null; email?: string | null }) => [p.id, p])
                    );
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mapped = rows.map((r: any) => ({
                    ...r,
                    profiles: r.user_id ? profilesMap[r.user_id] || null : null,
                }));
                if (request !== fetchSequence.current || requestScope !== recordScope.current) return;
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
                if (request !== fetchSequence.current || requestScope !== recordScope.current) return;
                setAuditLog(mapped);
            }

        } catch (error) {
            if (isDev) console.error('Error fetching data:', error);
            if (!silent) toast.error('Hiba történt az adatok betöltésekor');
        } finally {
            if (request === fetchSequence.current) setDataLoading(false);
        }
    };

    // Keep the ref in sync with the latest fetchData
    fetchDataRef.current = fetchData;

    useEffect(() => {
        // Reset page and selection on tab/search change
        setDirectoryStatusFilter('');
        setCurrentPage(1);
        setSelectedRows(new Set());
        // Close any open modal when the user switches tabs (or pops back
        // through the URL history). Without this, an opened detail/edit
        // modal would linger on the wrong tab.
        setDetailModal(prev => (prev.show ? { ...prev, show: false } : prev));
        detailHistoryRef.current = [];
        detailModalRef.current = { ...detailModalRef.current, show: false };
        weeklyDetailReturnRef.current = null;
        setHasWeeklyReturn(false);
        setDetailHistory([]);
        setEditLocationModal(prev => (prev.show ? { show: false, item: null } : prev));
        setCityFormModal(prev => (prev.show ? { show: false, item: null } : prev));
        setRouteReviewModal(prev => (prev.show ? { show: false, item: null } : prev));
        setSuggestionEditor(null);
        setImageSubmissionToDelete(null);
        setDeleteModal({ show: false, table: null, id: null });
        // Reset sort key to a column that exists on this tab's table
        const defaultSortKey = 'created_at';
        setSortConfig(prev => (prev.key === defaultSortKey ? prev : { key: defaultSortKey, direction: 'desc' }));
    }, [activeTab, searchTerm]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, currentPage, sortConfig, searchTerm, profile, pageSize, userSupporterFilter, userSortMode, routeStatusFilter, routeDateFrom, routeDateTo, auditActionFilter, auditTargetTypeFilter, feedbackStatusFilter, feedbackPriorityFilter, feedbackCategoryFilter, poiFlagStatusFilter, poiFlagReasonFilter, poiSuggestionStatusFilter, poiSuggestionTypeFilter, parkingImageStatusFilter, directoryStatusFilter]);

    useEffect(() => {
        setSelectedRows(new Set());
    }, [activeTab, searchTerm, sortConfig, currentPage, pageSize, userSupporterFilter, userSortMode, feedbackStatusFilter, feedbackPriorityFilter, feedbackCategoryFilter, poiFlagStatusFilter, poiFlagReasonFilter, poiSuggestionStatusFilter, poiSuggestionTypeFilter, parkingImageStatusFilter, routeStatusFilter, routeDateFrom, routeDateTo, auditActionFilter, auditTargetTypeFilter, directoryStatusFilter]);

    // Load cities for filter dropdowns when those tabs open
    useEffect(() => {
        if (activeTab !== 'leaderboard') return;
        if (citiesForFilter.length > 0) return;
        supabase.from('cities').select('id, name, country_code').order('name').then(({ data }) => {
            if (data) setCitiesForFilter(data);
        });
    }, [activeTab, citiesForFilter.length]);

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
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



    // Open a record in the detail modal as a *fresh* navigation (used by table row clicks).
    // Resets the back-stack so the user can't go back to whatever was open in a previous tab.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openFreshDetail = useCallback((item: any, type: string) => {
        weeklyDetailReturnRef.current = null;
        setHasWeeklyReturn(false);
        detailModalRef.current = { show: true, item, type };
        detailHistoryRef.current = [];
        setDetailHistory([]);
        setDetailModal({ show: true, item, type });
    }, []);

    // Open a record as a *linked* navigation (used by cross-nav cards inside DetailModal).
    // Pushes the currently-shown record onto the back-stack so the user can return.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openLinkedDetail = useCallback((item: any, type: string) => {
        const prev = detailModalRef.current;
        if (prev.show && prev.item) {
            detailHistoryRef.current = [...detailHistoryRef.current, { item: prev.item, type: prev.type }];
            setDetailHistory(detailHistoryRef.current);
        }
        detailModalRef.current = { show: true, item, type };
        setDetailModal({ show: true, item, type });
    }, []);

    const closeDetail = useCallback(() => {
        const returnToWeekly = weeklyDetailReturnRef.current;
        weeklyDetailReturnRef.current = null;
        setHasWeeklyReturn(false);
        detailModalRef.current = { ...detailModalRef.current, show: false };
        detailHistoryRef.current = [];
        setDetailModal(prev => ({ ...prev, show: false }));
        setDetailHistory([]);
        returnToWeekly?.();
    }, []);

    const goBackDetail = useCallback(() => {
        const stack = detailHistoryRef.current;
        if (stack.length === 0) {
            if (weeklyDetailReturnRef.current) closeDetail();
            return;
        }
        const last = stack[stack.length - 1];
        detailHistoryRef.current = stack.slice(0, -1);
        detailModalRef.current = { show: true, item: last.item, type: last.type };
        setDetailHistory(detailHistoryRef.current);
        setDetailModal({ show: true, item: last.item, type: last.type });
    }, [closeDetail]);



    const handleOpenUserProfile = useCallback(async (userId: string, onReturn?: () => void, signal?: AbortSignal, returnLabel = 'Vissza az előző nézethez') => {
        const origin = detailModalRef.current;
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (signal?.aborted || detailModalRef.current !== origin) return false;
            if (error) throw error;
            if (!data) {
                toast.error('Felhasználó nem található');
                return false;
            }
            if (onReturn) {
                openFreshDetail(data, 'user');
                weeklyDetailReturnRef.current = onReturn;
                setHasWeeklyReturn(true);
                setDetailReturnLabel(returnLabel);
            } else {
                openLinkedDetail(data, 'user');
            }
            return true;
        } catch (err) {
            if (signal?.aborted || detailModalRef.current !== origin) return false;
            if (isDev) console.error(err);
            toast.error('Felhasználó betöltése sikertelen');
            return false;
        }
    }, [openFreshDetail, openLinkedDetail]);

    const openRideRecord = useCallback((ride: AdminRideRecord) => openFreshDetail(ride, 'ride'), [openFreshDetail]);
    const handleOpenRide = useCallback(async (rideId: string, onReturn?: () => void, signal?: AbortSignal) => {
        const origin = detailModalRef.current;
        try {
            const { data, error } = await supabase.from('ride_summaries')
                .select('id,user_id,client_ride_id,started_at,created_at,duration_seconds,moving_time_seconds,distance_meters,average_speed_kmh,max_speed_kmh,elevation_gain_meters,favorite_name,track_samples')
                .eq('id', rideId).single();
            if (signal?.aborted || detailModalRef.current !== origin) return false;
            if (error || !data) throw error || new Error('Ride unavailable');
            const { track_samples, ...metadata } = data;
            const samples = Array.isArray(track_samples) ? track_samples.length : 0;
            const ride = { ...metadata, ride_type: 'normal', sample_total: samples, sample_accepted: samples, sample_rejected: 0 };
            if (onReturn) {
                openFreshDetail(ride, 'ride');
                weeklyDetailReturnRef.current = onReturn;
                setHasWeeklyReturn(true);
                setDetailReturnLabel('Vissza a heti statisztikához');
            } else openLinkedDetail(ride, 'ride');
            void writeAuditLog({ adminId: profile?.id, action: 'view_ride_diagnostic', targetType: 'ride', targetId: rideId, notes: 'Tekerés részletei megtekintve.' });
            return true;
        } catch {
            if (!signal?.aborted && detailModalRef.current === origin) toast.error('A tekerés nem tölthető be.');
            return false;
        }
    }, [openFreshDetail, openLinkedDetail, profile?.id]);

    const handleOpenPoiDetail = useCallback(async (poiId: string, poiType: string) => {
        const origin = detailModalRef.current;
        const tableMap: Record<string, string> = {
            parking: 'parkingSpots',
            bicycleService: 'bicycleService',
            repairStation: 'repairStation',
            drinkingFountain: 'drinkingFountain',
        };
        const detailTypeMap: Record<string, string> = {
            parking: 'parking',
            bicycleService: 'service',
            repairStation: 'repair',
            drinkingFountain: 'drinking_fountain',
        };
        const table = tableMap[poiType];
        const detailType = detailTypeMap[poiType];
        if (!table || !detailType) {
            toast.error('Ismeretlen POI típus');
            return;
        }
        try {
            const { data, error } = await supabase.from(table).select('*').eq('id', poiId).single();
            if (detailModalRef.current !== origin) return;
            if (error) throw error;
            if (!data) {
                toast.error('POI nem található');
                return;
            }
            openLinkedDetail(data, detailType);
        } catch (err) {
            if (isDev) console.error(err);
            toast.error('POI betöltése sikertelen');
        }
    }, [openLinkedDetail]);

    const handleOpenParkingSpotDetail = useCallback(async (spotId: string) => {
        const origin = detailModalRef.current;
        try {
            const { data, error } = await supabase.from('parkingSpots').select('*').eq('id', spotId).single();
            if (detailModalRef.current !== origin) return;
            if (error) throw error;
            if (!data) {
                toast.error('Parkoló nem található');
                return;
            }
            openLinkedDetail(data, 'parking');
        } catch (err) {
            if (isDev) console.error(err);
            toast.error('Parkoló betöltése sikertelen');
        }
    }, [openLinkedDetail]);

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



    const handlePoiSuggestionSave = async (id: string, updates: Partial<PoiSuggestion>) => {
        setToggleLoading(id);
        try {
            const { error } = await supabase
                .from('poi_suggestions')
                .update({
                    suggested_type: updates.suggested_type ?? null,
                    status: updates.status ?? 'pending',
                    name: updates.name ?? null,
                    city: updates.city ?? null,
                    latitude: updates.latitude ?? null,
                    longitude: updates.longitude ?? null,
                    comment: updates.comment ?? null,
                    details: updates.details ?? {},
                })
                .eq('id', id);

            if (error) throw error;

            toast.success('POI javaslat frissítve');
            fetchData();
        } catch (error) {
            if (isDev) console.error('Error updating poi suggestion:', error);
            toast.error('Hiba történt a POI javaslat mentésekor');
        } finally {
            setToggleLoading(null);
        }
    };

    const handlePoiSuggestionStatusChange = async (id: string, newStatus: string) => {
        setToggleLoading(id);
        try {
            const { error } = await supabase
                .from('poi_suggestions')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success('POI javaslat státusza frissítve');
            fetchData();
        } catch (error) {
            if (isDev) console.error('Error updating poi suggestion status:', error);
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

            const rpcData = data as RpcResultWithError | null;
            if (error || rpcData?.error) {
                if (isDev) console.error('Error updating parking image status via RPC:', error || rpcData?.error);
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
    const deleteParkingImageSubmission = async (submission: any) => {
        if (!submission) return;

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

            const rpcData = data as RpcResultWithError | null;
            if (error || rpcData?.error) {
                if (isDev) console.error('RPC delete error (parking_image_submission_delete):', error || rpcData?.error);
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
            setImageSubmissionToDelete(null);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDeleteParkingImageSubmission = (submission: any) => setImageSubmissionToDelete(submission);

    const handleDeleteClick = (id: string) => {
        const table = getTableForTab(activeTab) || 'feedback';
        setDeleteModal({ show: true, table, id });
    };



    const adminId = (profile as { id?: string } | null)?.id ?? null;

    const handleUserToggleBan = async (id: string, currentlyBanned: boolean): Promise<boolean> => {
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
            await fetchData();
            return true;
        } catch (err) {
            if (isDev) console.error(err);
            toast.error('Hiba a tiltás módosítása során');
            return false;
        } finally {
            setToggleLoading(null);
        }
    };

    const handleUserToggleSupporter = async (id: string, currentlySupporter: boolean): Promise<boolean> => {
        setToggleLoading(id);
        try {
            const { error } = await supabase.rpc('set_supporter_status', {
                p_user_id: id,
                p_is_supporter: !currentlySupporter,
            });
            if (error) throw error;
            await writeAuditLog({
                adminId,
                action: currentlySupporter ? 'revoke_supporter' : 'grant_supporter',
                targetType: 'user',
                targetId: id,
            });
            toast.success(currentlySupporter ? 'Támogatói jelvény visszavonva' : 'Támogatói jelvény megadva');
            await fetchData();
            return true;
        } catch (err) {
            if (isDev) console.error(err);
            toast.error('Hiba a támogatói jelvény módosítása során');
            return false;
        } finally {
            setToggleLoading(null);
        }
    };



    const confirmDelete = async () => {
        if (!deleteModal.id) return;

        const table = deleteModal.table;
        if (!table || !['profiles', 'parkingSpots', 'parking_image_submissions', 'bicycleService', 'repairStation', 'feedback', 'poi_flags', 'poi_suggestions', 'drinkingFountain', 'cities', 'community_bike_lanes', 'admin_audit_log'].includes(table) || deletingRecord) return;

        setDeletingRecord(true);
        try {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', deleteModal.id);

            if (error) throw error;

            toast.success('Elem sikeresen törölve');
            setDeleteModal({ show: false, table: null, id: null });
            setEditLocationModal({ show: false, item: null });
            if (detailModal.item?.id === deleteModal.id) closeDetail();
            fetchData();
        } catch (error) {
            if (isDev) console.error('Error deleting item:', error);
            toast.error('Hiba történt a törlés során');
        } finally {
            setDeletingRecord(false);
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

    const recordRows: AdminRecord[] = ({ users, parking: parkingSpots, services: bicycleServices, repair: repairStations,
        drinking_fountain: drinkingFountains, cities, feedback, poi_flags: poiFlags, poi_suggestions: poiSuggestions,
        parking_images: parkingImageSubmissions, community_routes: communityRoutes, audit_log: auditLog } as Record<string, AdminRecord[]>)[activeTab] || [];
    const openRecord = (row: AdminRecord) => {
        if (activeTab === 'cities') { setCityFormModal({show:true,item:row}); return; }
        if (activeTab === 'community_routes') { setRouteReviewModal({show:true,item:row}); return; }
        if (activeTab === 'poi_suggestions') { setSuggestionEditor(row as PoiSuggestion); return; }
        openFreshDetail(row, ({users:'user',services:'service',parking_images:'parking_image'} as Record<string,string>)[activeTab] || activeTab);
    };
    const editRecord = (row: AdminRecord) => {
        if (activeTab === 'cities' || activeTab === 'poi_suggestions') { openRecord(row); return; }
        setEditLocationModal({show:true,item:row,locationType:activeTab});
    };
    const handleRecordAction = async (ids: string[], value: string) => {
        if (actionLock.current || dataLoading) return;
        const kind = activeTab, scope = recordScope.current;
        if (!ids.length || ids.some(id => !recordRows.some(row => row.id === id))) return;
        actionLock.current = true;
        setBatchActionLoading(true);
        try {
            const result = await applyRecordAction(supabase, writeAuditLog, kind, ids, value, adminId || '');
            if (result.succeeded.length) toast.success(`${result.succeeded.length} rekord frissítve`);
            if (result.failed.length) toast.error(`${result.failed.length} rekord módosítása nem sikerült. Ezek kijelölve maradtak.`);
            if (recordScope.current === scope) { setSelectedRows(new Set(result.failed)); await fetchData(true); }
        } catch (error) { toast.error(error instanceof Error ? error.message : 'A módosítás nem sikerült.'); }
        finally { actionLock.current = false; setBatchActionLoading(false); }
    };
    const recordFilters: RecordFilter[] = [];
    const addFilter = (label: string, value: string, setter: (value: string) => void, values: {value:string;label:string}[]) => {
        recordFilters.push({ label, value, options:[{value:'',label:'Mind'},...values], onChange:next => {setter(next);setCurrentPage(1);} });
    };
    const statusFilter = ({ feedback:[feedbackStatusFilter,setFeedbackStatusFilter],poi_flags:[poiFlagStatusFilter,setPoiFlagStatusFilter],poi_suggestions:[poiSuggestionStatusFilter,setPoiSuggestionStatusFilter],parking_images:[parkingImageStatusFilter,setParkingImageStatusFilter],community_routes:[routeStatusFilter,setRouteStatusFilter] } as Record<string,[string,(value:string)=>void]>)[activeTab];
    if (['users','cities','parking','services','repair','drinking_fountain'].includes(activeTab)) addFilter('Állapot',directoryStatusFilter,setDirectoryStatusFilter,RECORD_STATUSES[activeTab]);
    if (statusFilter) addFilter('Állapot',statusFilter[0],statusFilter[1],RECORD_STATUSES[activeTab]);
    const opts = (values: Record<string,string>) => Object.entries(values).map(([value,label])=>({value,label}));
    if (activeTab === 'users') {
        recordFilters.push({label:'Támogatói státusz',value:userSupporterFilter,onChange:next=>{setUserSupporterFilter(next as typeof userSupporterFilter);setCurrentPage(1);},options:opts({all:'Minden felhasználó',supporters:'Támogatók',non_supporters:'Nem támogatók'})});
        recordFilters.push({label:'Rendezés',value:userSortMode,onChange:next=>{setUserSortMode(next as typeof userSortMode);setCurrentPage(1);},options:opts({supporters_first:'Támogatók elöl',newest:'Legújabb elöl',oldest:'Legrégebbi elöl',name_asc:'Név szerint'})});
    }
    if(activeTab === 'feedback') {
        addFilter('Prioritás',feedbackPriorityFilter,setFeedbackPriorityFilter,opts({high:'Magas',medium:'Közepes',low:'Alacsony'}));
        addFilter('Kategória',feedbackCategoryFilter,setFeedbackCategoryFilter,opts({bug:'Hiba',feature:'Funkció',ui_ux:'UI / UX',content:'Tartalom',other:'Egyéb'}));
    }
    if(activeTab === 'poi_flags') addFilter('Ok',poiFlagReasonFilter,setPoiFlagReasonFilter,opts({wrong_location:'Rossz helyen',doesnt_exist:'Nem létezik',incorrect_info:'Hibás információ',duplicate:'Duplikált',other:'Egyéb'}));
    if(activeTab === 'poi_suggestions') addFilter('Helyszín típusa',poiSuggestionTypeFilter,setPoiSuggestionTypeFilter,opts({parking:'Parkoló',bicycleService:'Szerviz / bolt',repairStation:'Javítóállomás',drinkingFountain:'Ivókút'}));
    if(activeTab === 'community_routes') {
        recordFilters.push({label:'Ettől',value:routeDateFrom,type:'date',onChange:next=>{setRouteDateFrom(next);setCurrentPage(1);}});
        recordFilters.push({label:'Eddig',value:routeDateTo,type:'date',onChange:next=>{setRouteDateTo(next);setCurrentPage(1);}});
    }
    if(activeTab === 'audit_log') {
        addFilter('Művelet',auditActionFilter,setAuditActionFilter,opts(AUDIT_ACTION_LABELS));
        addFilter('Cél típusa',auditTargetTypeFilter,setAuditTargetTypeFilter,opts({user:'Felhasználó',ride:'Tekerés',city:'Város',community_bike_lane:'Közösségi útvonal',challenge_attempt:'Kihívásteljesítés',daily_challenge:'Napi kihívás'}));
    }

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
            <div className={`admin-modern ${workspaceStyles.workspace}`}>
                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    profile={profile}
                    onLogout={handleLogout}
                    onHomeConfig={() => router.push('/')}
                    onProfile={() => { if (adminId) void handleOpenUserProfile(adminId); }}
                />

                <SidebarInset className="flex flex-col flex-1 h-screen overflow-hidden bg-background">
                    <header className="contents">
                        <AdminPageHeader
                            activeTab={activeTab}
                            totalCount={totalCount}
                            hasRealtime={!!activeTable}
                            isRealtimeConnected={isRealtimeConnected}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onNavigate={setActiveTab}
                            onCreate={() => {
                                if (activeTab === 'cities') {
                                    setCityFormModal({ show: true, item: null });
                                    return;
                                }
                                setAddLocationModal(true);
                            }}
                        />
                    </header>

                    <div className="admin-canvas" role="region" aria-label="Admin tartalom">
                        {RECORD_COLLECTIONS.includes(activeTab) ? <AdminRecordBrowser
                            key={activeTab} kind={activeTab} title={getAdminNavigationItem(activeTab).label}
                            rows={recordRows} total={totalCount} loading={dataLoading} busy={batchActionLoading}
                            selected={selectedRows} onSelect={setSelectedRows} filters={recordFilters}
                            page={currentPage} pages={totalPages} pageSize={pageSize}
                            onPage={setCurrentPage} onPageSize={size => { setPageSize(size); setCurrentPage(1); }}
                            sort={sortConfig} onSort={['parking','services','repair','drinking_fountain','cities','feedback','poi_suggestions'].includes(activeTab) ? handleSort : undefined}
                            onOpen={activeTab === 'audit_log' ? undefined : openRecord}
                            onEdit={['parking','services','repair','drinking_fountain','cities','poi_suggestions'].includes(activeTab) ? editRecord : undefined}
                            onDelete={['users','audit_log'].includes(activeTab) ? undefined : row => activeTab === 'parking_images' ? handleDeleteParkingImageSubmission(row) : handleDeleteClick(row.id)}
                            onUser={id => { void handleOpenUserProfile(id); }}
                            onPoi={handleOpenPoiDetail} onRide={id => { void handleOpenRide(id); }}
                            onAction={activeTab === 'audit_log' ? undefined : handleRecordAction}
                        /> : <div className={['leaderboard','ride_diagnostics','gps_diagnostics'].includes(activeTab) ? 'admin-record-view' : activeTab === 'dashboard' ? 'admin-overview-view' : 'admin-special-view'}>
                            {activeTab === 'dashboard' && <DeviceStatsOverview activation={<ActivationMetricsOverview />}>
                                <ContentStatsOverview onOpenUser={(id, back, signal) => handleOpenUserProfile(id, back, signal, 'Vissza a heti statisztikához')} onOpenRide={handleOpenRide} />
                            </DeviceStatsOverview>}
                            {activeTab === 'leaderboard' && <LeaderboardTab cities={citiesForFilter} adminId={adminId} onOpenUser={handleOpenUserProfile} />}
                            {activeTab === 'ride_diagnostics' && <RideDiagnosticsTab onOpenRide={openRideRecord} onOpenUser={handleOpenUserProfile} />}
                            {activeTab === 'gps_diagnostics' && <GpsDeviceDiagnostics />}
                            {activeTab === 'route_heatmap' && <RouteHeatmapTab />}
                            {activeTab === 'app_config' && <AppConfigTab />}
                        </div>}
                    </div>
                </SidebarInset>

                <EditSuggestionModal key={suggestionEditor?.id || 'closed'} item={suggestionEditor} isOpen={Boolean(suggestionEditor)} onClose={() => setSuggestionEditor(null)} onSave={handlePoiSuggestionSave} onStatusChange={handlePoiSuggestionStatusChange} onOpenUser={handleOpenUserProfile} />
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
                    onBack={detailModal.show ? () => setEditLocationModal({ show: false, item: null }) : undefined}
                    locationType={editLocationModal.locationType ?? activeTab}
                    item={editLocationModal.item}
                    onSuccess={async () => {
                        setEditLocationModal({ show: false, item: null });
                        const table = getTableForTab(editLocationModal.locationType ?? activeTab);
                        if (detailModal.show && table && editLocationModal.item?.id) {
                            const { data } = await supabase.from(table).select('*').eq('id', editLocationModal.item.id).single();
                            if (data && detailModalRef.current.item?.id === editLocationModal.item.id) {
                                detailModalRef.current = { ...detailModalRef.current, item: data };
                                setDetailModal(previous => ({ ...previous, item: data }));
                            }
                        }
                        fetchData();
                    }}
                    onDelete={(id) => {
                        const table = getTableForTab(editLocationModal.locationType ?? activeTab);
                        if (table) setDeleteModal({ show: true, table, id });
                    }}
                />

                <DetailModal
                    isOpen={detailModal.show && !editLocationModal.show}
                    onClose={closeDetail}
                    item={detailModal.item}
                    type={detailModal.type}
                    onBack={detailHistory.length > 0 || hasWeeklyReturn ? goBackDetail : undefined}
                    backLabel={detailHistory.length === 0 && hasWeeklyReturn ? detailReturnLabel : undefined}
                    onEdit={(item, type) => {
                        // Map DetailModal's `type` (parking/service/repair/drinking_fountain)
                        // to EditLocationModal's `locationType` (parking/services/repair/drinking_fountain).
                        // Without this the edit modal falls back to `activeTab`, which is wrong when the
                        // user reached this detail via cross-nav from another tab (e.g. POI flag → spot).
                        const detailToEditType: Record<string, string> = {
                            parking: 'parking',
                            service: 'services',
                            repair: 'repair',
                            drinking_fountain: 'drinking_fountain',
                        };
                        const locationType = detailToEditType[type];
                        setEditLocationModal({ show: true, item, locationType });
                    }}
                    onStatusChange={
                        detailModal.type === 'poi_flags' ? handlePoiFlagStatusChange :
                        detailModal.type === 'parking_image' ? handleParkingImageStatusChange :
                        handleFeedbackStatusChange
                    }
                    onOpenPoiDetail={detailModal.type === 'poi_flags' ? handleOpenPoiDetail : undefined}
                    onOpenUser={handleOpenUserProfile}
                    onOpenRide={handleOpenRide}
                    onOpenParkingSpot={handleOpenParkingSpotDetail}
                    onToggleUserBan={detailModal.type === 'user' ? handleUserToggleBan : undefined}
                    onToggleUserSupporter={detailModal.type === 'user' ? handleUserToggleSupporter : undefined}
                    userActionLoading={toggleLoading}
                    onDeleteSubmission={detailModal.type === 'parking_image' ? handleDeleteParkingImageSubmission : undefined}
                />

                {imagePreviewUrl && (
                    <ImagePreview
                        src={imagePreviewUrl}
                        alt="Kép előnézet"
                        onClose={() => setImagePreviewUrl(null)}
                    />
                )}

                <DeleteConfirmModal
                    isOpen={deleteModal.show}
                    loading={deletingRecord}
                    onClose={() => setDeleteModal({ show: false, table: null, id: null })}
                    onConfirm={confirmDelete}
                />
                <DeleteConfirmModal isOpen={imageSubmissionToDelete !== null} title="Képkérelem törlése"
                    description="A kérelem, a hozzá tartozó kép és a helyszínhez csatolt kép is véglegesen törlődik."
                    loading={Boolean(imageSubmissionToDelete && toggleLoading === imageSubmissionToDelete.id)}
                    onClose={() => setImageSubmissionToDelete(null)}
                    onConfirm={() => void deleteParkingImageSubmission(imageSubmissionToDelete)} />

                <CityFormModal
                    isOpen={cityFormModal.show}
                    onClose={() => setCityFormModal({ show: false, item: null })}
                    city={cityFormModal.item}
                    onSuccess={() => {
                        setCityFormModal({ show: false, item: null });
                        fetchData();
                    }}
                />

                <CommunityRouteReviewModal
                    isOpen={routeReviewModal.show}
                    onClose={() => setRouteReviewModal({ show: false, item: null })}
                    route={routeReviewModal.item}
                    adminId={adminId}
                    onOpenUser={(userId, onReturn, signal) => handleOpenUserProfile(userId, onReturn, signal, 'Vissza az útvonal ellenőrzéséhez')}
                    onSuccess={() => {
                        setRouteReviewModal({ show: false, item: null });
                        fetchData();
                    }}
                />
            </div>
        </SidebarProvider>
    );
}
