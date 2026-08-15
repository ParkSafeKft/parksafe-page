'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    BatteryWarning,
    Bike,
    Bug,
    ChevronDown,
    Copy,
    Crosshair,
    Database,
    Eye,
    EyeOff,
    Loader2,
    MapPinned,
    RefreshCw,
    Search,
    ShieldCheck,
    Smartphone,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminModalSection } from './AdminModal';
import InteractiveRouteMap from './InteractiveRouteMap';

type RoutePoint = [number, number];

interface RideDiagnostic {
    total_count: number | string | null;
    ride_id: string;
    client_ride_id: string | null;
    started_at: string | null;
    created_at: string | null;
    favorite_name: string | null;
    kind: string | null;
    distance_meters: number | null;
    raw_distance_meters: number | null;
    duration_seconds: number | null;
    moving_time_seconds: number | null;
    average_speed_kmh: number | string | null;
    refine_status: string | null;
    refine_started_at: string | null;
    refined_at: string | null;
    refine_attempts: number | null;
    refine_next_retry_at: string | null;
    refine_reason: string | null;
    distance_status: string | null;
    elevation_status: string | null;
    valhalla_match_ratio: number | string | null;
    open_elevation_chunks: number | null;
    recorded_point_count: number | null;
    snapped_point_count: number | null;
    raw_sample_count: number | null;
    gps_accuracy_avg_m: number | string | null;
    gps_accuracy_p95_m: number | string | null;
    gps_accuracy_max_m: number | string | null;
    telemetry_created_at: string | null;
    os: string | null;
    os_version: string | null;
    manufacturer: string | null;
    model: string | null;
    app_version: string | null;
    sample_count_total: number | null;
    sample_count_accepted: number | null;
    sample_count_rejected: Record<string, unknown> | null;
    background_kills: number | null;
    heartbeat_gap_count: number | null;
    bg_permission: string | null;
    battery_saver_on: boolean | null;
    doze_whitelisted: boolean | null;
    precise_location_on: boolean | null;
}

interface RevealedRoute {
    recorded: RoutePoint[];
    refined: RoutePoint[];
}

const PAGE_SIZE = 25;

const REFINE_LABELS: Record<string, string> = {
    success: 'Sikeres',
    partial: 'Részleges',
    pending: 'Várakozik',
    running: 'Folyamatban',
    skipped: 'Kihagyva',
    failed: 'Sikertelen',
    legacy: 'Nem futott',
};

const REJECTION_LABELS: Record<string, string> = {
    before_start: 'Indítás előtti',
    first_fix: 'Első GPS-fix',
    non_positive_time: 'Hibás időbélyeg',
    poor_accuracy: 'Pontatlan GPS',
    resumed_anchor: 'Folytatási horgonypont',
    stale_gap: 'Hosszú mintaköz',
    stationary: 'Álló helyzet',
    teleport: 'Ugrásszerű pozíció',
};

function asNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleString('hu-HU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDistance(value: number | null): string {
    if (value === null || value === undefined) return '—';
    return `${(value / 1000).toFixed(2)} km`;
}

function formatDuration(value: number | null): string {
    if (!value || value <= 0) return '—';
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    return hours > 0 ? `${hours}ó ${minutes}p` : `${minutes}p`;
}

function refineTone(status: string | null): string {
    if (status === 'success') return 'success';
    if (status === 'partial' || status === 'pending' || status === 'running') return 'warning';
    if (status === 'skipped' || status === 'failed') return 'danger';
    return 'neutral';
}

function gpsAssessment(ride: RideDiagnostic): { label: string; tone: string; detail: string } {
    const total = asNumber(ride.sample_count_total);
    const accepted = asNumber(ride.sample_count_accepted);
    const p95 = asNumber(ride.gps_accuracy_p95_m);
    if (total === null && p95 === null) {
        return { label: 'Nincs telemetria', tone: 'neutral', detail: 'Lejárt vagy nem érkezett' };
    }
    const rate = total && accepted !== null ? accepted / total : null;
    const rateText = rate === null ? '—' : `${Math.round(rate * 100)}% elfogadva`;
    if ((rate === null || rate >= 0.9) && (p95 === null || p95 <= 20)) {
        return { label: 'Jó GPS', tone: 'success', detail: rateText };
    }
    if ((rate === null || rate >= 0.7) && (p95 === null || p95 <= 50)) {
        return { label: 'Ingadozó GPS', tone: 'warning', detail: rateText };
    }
    return { label: 'Gyenge GPS', tone: 'danger', detail: rateText };
}

function parseRoutePoints(value: unknown): RoutePoint[] {
    if (!Array.isArray(value)) return [];
    return value.flatMap((entry): RoutePoint[] => {
        if (!Array.isArray(entry) || entry.length < 2) return [];
        const lng = Number(entry[0]);
        const lat = Number(entry[1]);
        if (!Number.isFinite(lng) || !Number.isFinite(lat) || Math.abs(lng) > 180 || Math.abs(lat) > 90) return [];
        return [[lng, lat]];
    });
}

function rejectionEntries(value: Record<string, unknown> | null): Array<[string, number]> {
    if (!value) return [];
    return Object.entries(value)
        .map(([key, raw]) => [key, asNumber(raw) ?? 0] as [string, number])
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);
}

function copyId(id: string, label: string) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(id).then(
        () => toast.success(`${label} vágólapra másolva`),
        () => toast.error('Másolás sikertelen')
    );
}

export default function UserRideDiagnostics({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [rows, setRows] = useState<RideDiagnostic[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [queryDraft, setQueryDraft] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedRideId, setExpandedRideId] = useState<string | null>(null);
    const [purposeByRide, setPurposeByRide] = useState<Record<string, string>>({});
    const [routes, setRoutes] = useState<Record<string, RevealedRoute>>({});
    const [routeMode, setRouteMode] = useState<Record<string, 'recorded' | 'refined'>>({});
    const [routeLoadingId, setRouteLoadingId] = useState<string | null>(null);

    useEffect(() => {
        setIsOpen(false);
        setRows([]);
        setTotalCount(0);
        setQueryDraft('');
        setQuery('');
        setStatus('all');
        setExpandedRideId(null);
        setPurposeByRide({});
        setRoutes({});
        setRouteMode({});
        setError(null);
    }, [userId]);

    const loadDiagnostics = async ({
        reset,
        nextQuery = query,
        nextStatus = status,
    }: {
        reset: boolean;
        nextQuery?: string;
        nextStatus?: string;
    }) => {
        const offset = reset ? 0 : rows.length;
        if (reset) setLoading(true);
        else setLoadingMore(true);
        setError(null);
        try {
            const { data, error: rpcError } = await supabase.rpc('admin_get_user_ride_diagnostics', {
                p_user_id: userId,
                p_limit: PAGE_SIZE,
                p_offset: offset,
                p_query: nextQuery.trim() || null,
                p_refine_status: nextStatus === 'all' ? null : nextStatus,
            });
            if (rpcError) throw rpcError;
            const nextRows = (Array.isArray(data) ? data : []) as RideDiagnostic[];
            setRows(current => reset ? nextRows : [...current, ...nextRows]);
            setTotalCount(asNumber(nextRows[0]?.total_count) ?? (reset ? nextRows.length : rows.length + nextRows.length));
        } catch (loadError) {
            const message = loadError instanceof Error ? loadError.message : 'A diagnosztika nem tölthető be.';
            setError(message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const openDiagnostics = () => {
        setIsOpen(true);
        void loadDiagnostics({ reset: true, nextQuery: '', nextStatus: 'all' });
    };

    const closeDiagnostics = () => {
        setIsOpen(false);
        setRows([]);
        setRoutes({});
        setPurposeByRide({});
        setExpandedRideId(null);
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        const nextQuery = queryDraft.trim();
        setQuery(nextQuery);
        void loadDiagnostics({ reset: true, nextQuery });
    };

    const changeStatus = (nextStatus: string) => {
        setStatus(nextStatus);
        void loadDiagnostics({ reset: true, nextStatus });
    };

    const revealRoute = async (rideId: string) => {
        const purpose = (purposeByRide[rideId] || '').trim();
        if (purpose.length < 10) return;
        setRouteLoadingId(rideId);
        setError(null);
        try {
            const { data, error: rpcError } = await supabase.rpc('admin_get_ride_diagnostic_track', {
                p_ride_id: rideId,
                p_purpose: purpose,
            });
            if (rpcError) throw rpcError;
            const result = Array.isArray(data) ? data[0] : null;
            const recorded = parseRoutePoints(result?.recorded_points);
            const refined = parseRoutePoints(result?.refined_points);
            setRoutes(current => ({ ...current, [rideId]: { recorded, refined } }));
            setRouteMode(current => ({ ...current, [rideId]: refined.length >= 2 ? 'refined' : 'recorded' }));
            setPurposeByRide(current => ({ ...current, [rideId]: '' }));
        } catch (routeError) {
            const message = routeError instanceof Error ? routeError.message : 'Az útvonal nem tölthető be.';
            setError(message);
        } finally {
            setRouteLoadingId(null);
        }
    };

    const visibleRows = useMemo(() => rows, [rows]);
    const remainingCount = Math.max(totalCount - rows.length, 0);

    return (
        <AdminModalSection
            title="Ride diagnosztika"
            icon={Bug}
            description={isOpen ? `${totalCount.toLocaleString('hu-HU')} találat` : 'Admin-only hibakeresés'}
        >
            {!isOpen ? (
                <div className="ride-diagnostics-gate">
                    <div className="ride-diagnostics-gate-icon"><ShieldCheck /></div>
                    <div>
                        <strong>Védett támogatási nézet</strong>
                        <p>A megnyitás naplózott. A lista technikai mérőszámokat mutat; pontos útvonal csak külön indoklással tölthető be.</p>
                    </div>
                    <Button type="button" size="sm" onClick={openDiagnostics}>
                        <Eye /> Diagnosztika megnyitása
                    </Button>
                </div>
            ) : (
                <div className="ride-diagnostics">
                    <div className="ride-diagnostics-privacy">
                        <ShieldCheck />
                        <span><strong>Hozzáférés naplózva.</strong> A GPS-telemetria 90 nap után automatikusan törlődik; útvonaladatot csak hibajegyhez indokoltan nyiss meg.</span>
                        <button type="button" onClick={closeDiagnostics}><EyeOff /> Bezárás és ürítés</button>
                    </div>

                    <form className="ride-diagnostics-toolbar" onSubmit={submitSearch}>
                        <label>
                            <Search aria-hidden="true" />
                            <span className="sr-only">Keresés ride azonosító alapján</span>
                            <Input
                                value={queryDraft}
                                onChange={event => setQueryDraft(event.target.value)}
                                placeholder="Ride ID, kliens ID vagy név"
                                maxLength={100}
                            />
                        </label>
                        <select value={status} onChange={event => changeStatus(event.target.value)} aria-label="Finomítási állapot">
                            <option value="all">Minden állapot</option>
                            <option value="success">Sikeres</option>
                            <option value="partial">Részleges</option>
                            <option value="pending">Várakozik</option>
                            <option value="running">Folyamatban</option>
                            <option value="skipped">Kihagyva</option>
                            <option value="failed">Sikertelen</option>
                            <option value="legacy">Nem futott</option>
                        </select>
                        <Button type="submit" size="sm" variant="outline" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : <Search />} Keresés
                        </Button>
                    </form>

                    {error ? (
                        <div className="ride-diagnostics-error" role="alert"><AlertTriangle />{error}</div>
                    ) : null}

                    {loading ? (
                        <div className="admin-profile-empty" role="status"><Loader2 className="animate-spin" /><span>Ride diagnosztika betöltése…</span></div>
                    ) : visibleRows.length === 0 ? (
                        <div className="admin-profile-empty"><Bike /><div><strong>Nincs találat</strong><span>A megadott szűrőkkel nem található ride.</span></div></div>
                    ) : (
                        <>
                            <div className="ride-diagnostics-progress">
                                <span><strong>{rows.length.toLocaleString('hu-HU')}</strong> / {totalCount.toLocaleString('hu-HU')} ride betöltve</span>
                                {remainingCount > 0 ? (
                                    <Button type="button" size="sm" variant="outline" onClick={() => void loadDiagnostics({ reset: false })} disabled={loadingMore}>
                                        {loadingMore ? <Loader2 className="animate-spin" /> : <Database />} Régebbi ride-ok betöltése ({Math.min(PAGE_SIZE, remainingCount)})
                                    </Button>
                                ) : null}
                            </div>
                            <div className="ride-diagnostics-list">
                            {visibleRows.map(ride => {
                                const expanded = expandedRideId === ride.ride_id;
                                const statusKey = ride.refine_status || 'legacy';
                                const gps = gpsAssessment(ride);
                                const rejected = rejectionEntries(ride.sample_count_rejected);
                                const revealed = routes[ride.ride_id];
                                const selectedMode = routeMode[ride.ride_id] || 'recorded';
                                const selectedPoints = selectedMode === 'refined' ? revealed?.refined : revealed?.recorded;
                                const matchRatio = asNumber(ride.valhalla_match_ratio);
                                const accepted = asNumber(ride.sample_count_accepted);
                                const total = asNumber(ride.sample_count_total);
                                return (
                                    <article className="ride-diagnostic-card" key={ride.ride_id} data-expanded={expanded}>
                                        <button
                                            type="button"
                                            className="ride-diagnostic-summary"
                                            onClick={() => setExpandedRideId(expanded ? null : ride.ride_id)}
                                            aria-expanded={expanded}
                                        >
                                            <span className="ride-diagnostic-date"><Bike />{formatDate(ride.started_at || ride.created_at)}</span>
                                            <span><strong>{ride.favorite_name || (ride.kind === 'challenge' ? 'Kihívás ride' : 'Normál ride')}</strong><small>{formatDistance(ride.distance_meters)} · {formatDuration(ride.duration_seconds)}</small></span>
                                            <span className="ride-diagnostic-state" data-tone={refineTone(ride.refine_status)}><RefreshCw />{REFINE_LABELS[statusKey] || statusKey}<small>{(ride.refine_attempts || 0) > 1 ? `${ride.refine_attempts} kísérlet` : 'Finomítás'}</small></span>
                                            <span className="ride-diagnostic-state" data-tone={gps.tone}><Crosshair />{gps.label}<small>{gps.detail}</small></span>
                                            <ChevronDown className="ride-diagnostic-chevron" />
                                        </button>

                                        {expanded ? (
                                            <div className="ride-diagnostic-detail">
                                                <div className="ride-diagnostic-idline">
                                                    <span>
                                                        <code>Ride: {ride.ride_id}</code>
                                                        <button type="button" className="admin-modal-meta-action" onClick={() => copyId(ride.ride_id, 'Ride ID')} aria-label="Ride ID másolása" title="Ride ID másolása"><Copy /></button>
                                                    </span>
                                                    {ride.client_ride_id ? (
                                                        <span>
                                                            <code>Kliens: {ride.client_ride_id}</code>
                                                            <button type="button" className="admin-modal-meta-action" onClick={() => copyId(ride.client_ride_id!, 'Kliens ID')} aria-label="Kliens ID másolása" title="Kliens ID másolása"><Copy /></button>
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <div className="ride-diagnostic-panels">
                                                    <section>
                                                        <header><RefreshCw /><h3>Finomítási folyamat</h3></header>
                                                        <dl>
                                                            <div><dt>Mentve</dt><dd>{formatDate(ride.created_at)}</dd></div>
                                                            <div><dt>Indítva</dt><dd>{formatDate(ride.refine_started_at)}</dd></div>
                                                            <div><dt>Eredmény</dt><dd data-tone={refineTone(ride.refine_status)}>{REFINE_LABELS[statusKey] || statusKey}</dd></div>
                                                            <div><dt>Kísérletek</dt><dd>{ride.refine_attempts ?? 0}{(ride.refine_attempts || 0) > 1 ? ' · újrapróbálva' : ''}</dd></div>
                                                            <div><dt>Következő próba</dt><dd>{formatDate(ride.refine_next_retry_at)}</dd></div>
                                                            <div><dt>Valhalla illesztés</dt><dd>{matchRatio === null ? '—' : `${Math.round(matchRatio * 100)}%`}</dd></div>
                                                            <div><dt>Távolság / magasság</dt><dd>{ride.distance_status || '—'} / {ride.elevation_status || '—'}</dd></div>
                                                        </dl>
                                                        {ride.refine_reason ? <p className="ride-diagnostic-reason"><AlertTriangle />{ride.refine_reason}</p> : null}
                                                    </section>

                                                    <section>
                                                        <header><Crosshair /><h3>GPS minták</h3></header>
                                                        <dl>
                                                            <div><dt>Elfogadott</dt><dd>{accepted === null || total === null ? '—' : `${accepted.toLocaleString('hu-HU')} / ${total.toLocaleString('hu-HU')}`}</dd></div>
                                                            <div><dt>Pontosság átlag / P95</dt><dd>{asNumber(ride.gps_accuracy_avg_m)?.toFixed(1) ?? '—'} m / {asNumber(ride.gps_accuracy_p95_m)?.toFixed(1) ?? '—'} m</dd></div>
                                                            <div><dt>Legrosszabb pontosság</dt><dd>{asNumber(ride.gps_accuracy_max_m)?.toFixed(1) ?? '—'} m</dd></div>
                                                            <div><dt>Nyers / rögzített / illesztett</dt><dd>{ride.raw_sample_count ?? 0} / {ride.recorded_point_count ?? 0} / {ride.snapped_point_count ?? 0}</dd></div>
                                                            <div><dt>Nyers / finomított táv</dt><dd>{formatDistance(ride.raw_distance_meters)} / {formatDistance(ride.distance_meters)}</dd></div>
                                                        </dl>
                                                        {rejected.length > 0 ? (
                                                            <div className="ride-diagnostic-rejections">
                                                                {rejected.map(([key, count]) => <span key={key}>{REJECTION_LABELS[key] || key}<b>{count.toLocaleString('hu-HU')}</b></span>)}
                                                            </div>
                                                        ) : null}
                                                    </section>

                                                    <section>
                                                        <header><Smartphone /><h3>Készülék és háttérfutás</h3></header>
                                                        <dl>
                                                            <div><dt>Készülék</dt><dd>{[ride.manufacturer, ride.model].filter(Boolean).join(' ') || '—'}</dd></div>
                                                            <div><dt>Rendszer / app</dt><dd>{[ride.os, ride.os_version].filter(Boolean).join(' ') || '—'} · {ride.app_version || '—'}</dd></div>
                                                            <div><dt>Pontos hely</dt><dd>{ride.precise_location_on === null ? '—' : ride.precise_location_on ? 'Bekapcsolva' : 'Kikapcsolva'}</dd></div>
                                                            <div><dt>Háttérengedély</dt><dd>{ride.bg_permission || '—'}</dd></div>
                                                            <div><dt>Háttérleállás / mintaköz</dt><dd>{ride.background_kills ?? 0} / {ride.heartbeat_gap_count ?? 0}</dd></div>
                                                            <div><dt>Energiatakarékos mód</dt><dd>{ride.battery_saver_on === null ? '—' : ride.battery_saver_on ? 'Bekapcsolva' : 'Kikapcsolva'}</dd></div>
                                                        </dl>
                                                        {ride.battery_saver_on ? <p className="ride-diagnostic-reason"><BatteryWarning />Az energiatakarékos mód ronthatta a háttérben mért GPS-jelet.</p> : null}
                                                    </section>
                                                </div>

                                                <section className="ride-route-disclosure">
                                                    <header><MapPinned /><div><h3>Pontos útvonal</h3><p>Külön hozzáférési eseményként naplózzuk. Csak a hibakereséshez szükséges ideig tartsd nyitva.</p></div></header>
                                                    {!revealed ? (
                                                        <div className="ride-route-purpose">
                                                            <label htmlFor={`route-purpose-${ride.ride_id}`}>Hozzáférés indoka</label>
                                                            <Input
                                                                id={`route-purpose-${ride.ride_id}`}
                                                                value={purposeByRide[ride.ride_id] || ''}
                                                                onChange={event => setPurposeByRide(current => ({ ...current, [ride.ride_id]: event.target.value }))}
                                                                placeholder="Pl. PS-1234 hibajegy: sikertelen finomítás vizsgálata"
                                                                minLength={10}
                                                                maxLength={500}
                                                            />
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                onClick={() => void revealRoute(ride.ride_id)}
                                                                disabled={(purposeByRide[ride.ride_id] || '').trim().length < 10 || routeLoadingId === ride.ride_id}
                                                            >
                                                                {routeLoadingId === ride.ride_id ? <Loader2 className="animate-spin" /> : <Eye />} Útvonal megtekintése
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="ride-route-revealed">
                                                            <div className="ride-route-controls">
                                                                <div>
                                                                    <button type="button" data-active={selectedMode === 'recorded'} disabled={revealed.recorded.length < 2} onClick={() => setRouteMode(current => ({ ...current, [ride.ride_id]: 'recorded' }))}>Rögzített ({revealed.recorded.length})</button>
                                                                    <button type="button" data-active={selectedMode === 'refined'} disabled={revealed.refined.length < 2} onClick={() => setRouteMode(current => ({ ...current, [ride.ride_id]: 'refined' }))}>Finomított ({revealed.refined.length})</button>
                                                                </div>
                                                                <button type="button" onClick={() => setRoutes(current => {
                                                                    const next = { ...current };
                                                                    delete next[ride.ride_id];
                                                                    return next;
                                                                })}><EyeOff /> Elrejtés és ürítés</button>
                                                            </div>
                                                            {selectedPoints && selectedPoints.length >= 2 ? (
                                                                <div className="ride-route-map"><InteractiveRouteMap points={selectedPoints} height={330} lineColor={selectedMode === 'refined' ? '#52df78' : '#60a5fa'} /></div>
                                                            ) : (
                                                                <div className="ride-diagnostics-error"><XCircle />Ehhez a nézethez nincs használható útvonal.</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </section>
                                            </div>
                                        ) : null}
                                    </article>
                                );
                            })}
                            </div>
                        </>
                    )}

                    {!loading && rows.length < totalCount ? (
                        <Button type="button" size="sm" variant="outline" className="ride-diagnostics-more" onClick={() => void loadDiagnostics({ reset: false })} disabled={loadingMore}>
                            {loadingMore ? <Loader2 className="animate-spin" /> : <Database />} Régebbi ride-ok betöltése ({Math.min(PAGE_SIZE, remainingCount)})
                        </Button>
                    ) : null}
                </div>
            )}
        </AdminModalSection>
    );
}
