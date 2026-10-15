'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import styles from './WeeklyStatsDetailModal.module.css';

export type WeeklyMetricKey = 'active-users' | 'rides' | 'distance' | 'duration' | 'new-users';

export interface WeeklyActiveUser {
    id: string;
    username: string | null;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    ride_count_7d: number;
    distance_meters_7d: number;
    duration_seconds_7d: number;
    last_ride_at: string | null;
}

export interface WeeklyRide {
    id: string;
    user_id: string | null;
    username: string | null;
    full_name: string | null;
    email: string | null;
    started_at: string | null;
    distance_meters: number;
    duration_seconds: number;
    average_speed_kmh: number;
    favorite_name: string | null;
    kind: string | null;
    start_point: [number, number] | null;
    end_point: [number, number] | null;
}

export interface WeeklyNewUser {
    id: string;
    username: string | null;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string | null;
}

export interface WeeklyUsageStats {
    active_users_7d: number;
    rides_7d: number;
    distance_meters_7d: number;
    duration_seconds_7d: number;
    new_users_7d: number;
    computed_at: string;
    active_users: WeeklyActiveUser[];
    rides: WeeklyRide[];
    new_users: WeeklyNewUser[];
}

interface WeeklyStatsDetailModalProps {
    metric: WeeklyMetricKey | null;
    stats: WeeklyUsageStats;
    onClose: () => void;
    onOpenUser?: WeeklyUserNavigation;
    onOpenRide?: WeeklyUserNavigation;
}

export type WeeklyUserNavigation = (userId: string, onReturn: () => void, signal: AbortSignal) => Promise<boolean>;

const metricCopy: Record<WeeklyMetricKey, { title: string; shortTitle: string; subtitle: string }> = {
    'active-users': {
        title: 'Aktív tekerők',
        shortTitle: 'Aktívak',
        subtitle: 'Akik legalább egy tekerést mentettek az elmúlt 7 napban.',
    },
    rides: {
        title: 'Tekerések',
        shortTitle: 'Tekerések',
        subtitle: 'A hét mentett útjai, a legutóbbitól visszafelé.',
    },
    distance: {
        title: 'Megtett távolság',
        shortTitle: 'Távolság',
        subtitle: 'A hét mentett útjai, a leghosszabb távval kezdve.',
    },
    duration: {
        title: 'Rögzített idő',
        shortTitle: 'Idő',
        subtitle: 'A hét mentett útjai, a leghosszabb menetidővel kezdve.',
    },
    'new-users': {
        title: 'Új regisztrálók',
        shortTitle: 'Újak',
        subtitle: 'Az elmúlt 7 napban csatlakozott felhasználók.',
    },
};
const metrics = Object.keys(metricCopy) as WeeklyMetricKey[];
const numberFormat = new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 1 });
const dateTimeFormat = new Intl.DateTimeFormat('hu-HU', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Budapest',
});

function getPersonName(person: { username: string | null; full_name: string | null; email: string | null }) {
    return person.username || person.full_name || person.email || 'Ismeretlen felhasználó';
}

function formatDistance(meters: number) {
    return numberFormat.format(meters / 1000) + ' km';
}

function formatDuration(seconds: number) {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return minutes.toLocaleString('hu-HU') + ' perc';
    return Math.floor(minutes / 60) + ' ó ' + String(minutes % 60).padStart(2, '0') + ' p';
}

function formatDate(value: string | null) {
    return value ? dateTimeFormat.format(new Date(value)) : 'Nincs időpont';
}

function getRideLabel(ride: WeeklyRide) {
    if (ride.favorite_name) return ride.favorite_name;
    if (ride.kind === 'normal') return 'Normál tekerés';
    if (ride.kind === 'challenge') return 'Kihívás';
    return ride.kind || 'Rögzített út';
}

function PersonCell({ person, avatarUrl }: {
    person: { username: string | null; full_name: string | null; email: string | null };
    avatarUrl?: string | null;
}) {
    return (
        <div className={styles.person}>
            <Avatar className={styles.avatar} aria-hidden="true">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                <AvatarFallback>{getPersonName(person).charAt(0).toLocaleUpperCase('hu-HU')}</AvatarFallback>
            </Avatar>
            <span className={styles.personCopy}>
                <strong>{getPersonName(person)}</strong>
                <small>{person.email || person.full_name || 'Nincs további profiladat'}</small>
            </span>
        </div>
    );
}

export default function WeeklyStatsDetailModal({ metric, stats, onClose, onOpenUser, onOpenRide }: WeeklyStatsDetailModalProps) {
    if (!metric) return null;
    return <WeeklyStatsView key={metric} metric={metric} stats={stats} onClose={onClose} onOpenUser={onOpenUser} onOpenRide={onOpenRide} />;
}

function WeeklyStatsView({ metric, stats, onClose, onOpenUser, onOpenRide }: WeeklyStatsDetailModalProps & { metric: WeeklyMetricKey }) {
    const [activeMetric, setActiveMetric] = useState(metric);
    const [query, setQuery] = useState('');
    const [viewingUser, setViewingUser] = useState(false);
    const [openingUserId, setOpeningUserId] = useState<string | null>(null);
    const [navigationError, setNavigationError] = useState('');
    const panelRef = useRef<HTMLDivElement>(null);
    const pendingNavigation = useRef<AbortController | null>(null);
    const returnPosition = useRef<{ top: number; userId: string } | null>(null);
    const id = useId();
    const normalizedQuery = query.trim().toLocaleLowerCase('hu-HU');
    const copy = metricCopy[activeMetric];

    useEffect(() => () => pendingNavigation.current?.abort(), []);

    async function openUser(userId: string, navigate = onOpenUser, returnId = userId) {
        if (!navigate || pendingNavigation.current) return;
        const request = new AbortController();
        pendingNavigation.current = request;
        returnPosition.current = { top: panelRef.current?.scrollTop ?? 0, userId: returnId };
        setOpeningUserId(userId);
        setNavigationError('');
        try {
            const opened = await navigate(userId, () => setViewingUser(false), request.signal);
            if (request.signal.aborted) return;
            if (opened) setViewingUser(true);
            else setNavigationError('A részletek nem tölthetők be. Próbáld újra.');
        } catch {
            if (!request.signal.aborted) setNavigationError('A részletek nem tölthetők be. Próbáld újra.');
        } finally {
            if (pendingNavigation.current === request) pendingNavigation.current = null;
            if (!request.signal.aborted) setOpeningUserId(null);
        }
    }

    function close() {
        pendingNavigation.current?.abort();
        onClose();
    }

    function userCell(user: WeeklyActiveUser | WeeklyNewUser) {
        const person = <PersonCell person={user} avatarUrl={user.avatar_url} />;
        if (!onOpenUser) return person;
        return <button type="button" className={styles.userButton} data-user-id={user.id} data-record-id={user.id}
            disabled={openingUserId !== null} aria-label={getPersonName(user) + ' profiljának megnyitása'}
            onClick={() => void openUser(user.id)}>
            {person}
            {openingUserId === user.id ? <Loader2 className={styles.loadingIcon} aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
        </button>;
    }

    const activeUsers = useMemo(() => stats.active_users.filter(user =>
        !normalizedQuery || [user.username, user.full_name, user.email, user.id]
            .some(value => value?.toLocaleLowerCase('hu-HU').includes(normalizedQuery))
    ), [normalizedQuery, stats.active_users]);

    const newUsers = useMemo(() => stats.new_users.filter(user =>
        !normalizedQuery || [user.username, user.full_name, user.email, user.id]
            .some(value => value?.toLocaleLowerCase('hu-HU').includes(normalizedQuery))
    ), [normalizedQuery, stats.new_users]);

    const rides = useMemo(() => {
        const filtered = stats.rides.filter(ride =>
            !normalizedQuery || [ride.username, ride.full_name, ride.email, ride.favorite_name, ride.kind, ride.id]
                .some(value => value?.toLocaleLowerCase('hu-HU').includes(normalizedQuery))
        );
        if (activeMetric === 'distance') return [...filtered].sort((a, b) => b.distance_meters - a.distance_meters);
        if (activeMetric === 'duration') return [...filtered].sort((a, b) => b.duration_seconds - a.duration_seconds);
        return filtered;
    }, [activeMetric, normalizedQuery, stats.rides]);

    const visibleCount = activeMetric === 'active-users' ? activeUsers.length
        : activeMetric === 'new-users' ? newUsers.length : rides.length;
    const totalCount = activeMetric === 'active-users' ? stats.active_users.length
        : activeMetric === 'new-users' ? stats.new_users.length : stats.rides.length;
    const summary = {
        'active-users': { value: numberFormat.format(stats.active_users_7d ?? stats.active_users.length), unit: 'aktív tekerő' },
        rides: { value: numberFormat.format(stats.rides_7d ?? stats.rides.length), unit: 'mentett tekerés' },
        distance: { value: numberFormat.format((stats.distance_meters_7d ?? 0) / 1000), unit: 'kilométer' },
        duration: { value: formatDuration(stats.duration_seconds_7d ?? 0), unit: 'rögzített idő' },
        'new-users': { value: numberFormat.format(stats.new_users_7d ?? stats.new_users.length), unit: 'új regisztráló' },
    }[activeMetric];

    function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        let nextIndex: number;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % metrics.length;
        else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + metrics.length) % metrics.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = metrics.length - 1;
        else return;
        event.preventDefault();
        setActiveMetric(metrics[nextIndex]);
        event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
    }

    return (
        <Dialog open={!viewingUser} onOpenChange={open => !open && close()}>
            <DialogContent className={styles.modal} data-slot="weekly-stats-dialog" showCloseButton={false}
                onCloseAutoFocus={event => { if (viewingUser) event.preventDefault(); }}
                onOpenAutoFocus={event => {
                    const position = returnPosition.current;
                    if (!position || !panelRef.current) return;
                    event.preventDefault();
                    panelRef.current.scrollTop = position.top;
                    [...panelRef.current.querySelectorAll<HTMLButtonElement>('[data-record-id]')]
                        .find(button => button.dataset.recordId === position.userId)?.focus({ preventScroll: true });
                    returnPosition.current = null;
                }}>
                <header className={styles.header}>
                    <div className={styles.topbar}>
                        <p className={styles.period}>Elmúlt 7 nap</p>
                        <button type="button" className={styles.close} onClick={close} aria-label="Heti statisztika bezárása">
                            <span aria-hidden="true">Esc</span><X aria-hidden="true" />
                        </button>
                    </div>
                    <div className={styles.heading}>
                        <div className={styles.headingCopy}>
                            <DialogTitle className={styles.title}>{copy.title}</DialogTitle>
                            <DialogDescription className={styles.description}>{copy.subtitle}</DialogDescription>
                        </div>
                        <div className={styles.summary} aria-label={'Teljes időszak: ' + summary.value + ' ' + summary.unit}>
                            <span>Teljes időszak</span>
                            <strong>{summary.value}</strong>
                            <span>{summary.unit}</span>
                        </div>
                    </div>
                    <div className={styles.tabs} role="tablist" aria-label="Heti statisztikák">
                        {metrics.map((key, index) => (
                            <button key={key} id={id + '-' + key} type="button" role="tab"
                                disabled={openingUserId !== null}
                                aria-selected={key === activeMetric} aria-controls={id + '-panel'}
                                aria-label={metricCopy[key].title} tabIndex={key === activeMetric ? 0 : -1}
                                onClick={() => setActiveMetric(key)} onKeyDown={event => handleTabKey(event, index)}>
                                <span className={styles.fullTab}>{metricCopy[key].title}</span>
                                <span className={styles.shortTab}>{metricCopy[key].shortTitle}</span>
                            </button>
                        ))}
                    </div>
                </header>
                <div className={styles.toolbar}>
                    <div className={styles.search}>
                        <Search aria-hidden="true" />
                        <label className="sr-only" htmlFor={id + '-search'}>Keresés név, email vagy útvonal alapján</label>
                        <input id={id + '-search'} type="search" value={query}
                            onChange={event => setQuery(event.target.value)}
                            placeholder="Név, email vagy útvonal keresése" spellCheck={false} />
                        {query ? <button type="button" onClick={() => setQuery('')} aria-label="Keresés törlése"><X aria-hidden="true" /></button> : null}
                    </div>
                    <span className={styles.resultCount} aria-live="polite" aria-atomic="true">
                        {normalizedQuery ? visibleCount + ' / ' + totalCount + ' találat' : totalCount.toLocaleString('hu-HU') + ' rekord'}
                    </span>
                </div>
                {navigationError ? <p className={styles.navigationError} role="alert">{navigationError}</p> : null}
                <span className="sr-only" role="status">{openingUserId ? 'Részletek betöltése…' : ''}</span>
                <div key={activeMetric} ref={panelRef} className={styles.content} id={id + '-panel'} role="tabpanel" aria-labelledby={id + '-' + activeMetric} tabIndex={0}>
                    {activeMetric === 'active-users' ? (
                        <table className={styles.table + ' ' + styles.usersTable} role="table">
                            <thead role="rowgroup"><tr role="row"><th scope="col">Felhasználó</th><th scope="col">Tekerés</th><th scope="col">Távolság</th><th scope="col">Idő</th><th scope="col">Legutóbbi tekerés</th></tr></thead>
                            <tbody role="rowgroup">
                                {activeUsers.map(user => (
                                    <tr key={user.id} role="row">
                                        <td role="cell">{userCell(user)}</td>
                                        <td role="cell" data-label="Tekerés" className={styles.emphasis}>{user.ride_count_7d.toLocaleString('hu-HU')}</td>
                                        <td role="cell" data-label="Távolság">{formatDistance(user.distance_meters_7d)}</td>
                                        <td role="cell" data-label="Idő">{formatDuration(user.duration_seconds_7d)}</td>
                                        <td role="cell" data-label="Legutóbbi tekerés" className={styles.date}>{formatDate(user.last_ride_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : activeMetric === 'new-users' ? (
                        <table className={styles.table + ' ' + styles.newUsersTable} role="table">
                            <thead role="rowgroup"><tr role="row"><th scope="col">Felhasználó</th><th scope="col">Csatlakozott</th><th scope="col">Heti aktivitás</th></tr></thead>
                            <tbody role="rowgroup">
                                {newUsers.map(user => {
                                    const activity = stats.active_users.find(activeUser => activeUser.id === user.id);
                                    return (
                                        <tr key={user.id} role="row">
                                            <td role="cell">{userCell(user)}</td>
                                            <td role="cell" data-label="Csatlakozott" className={styles.date}>{formatDate(user.created_at)}</td>
                                            <td role="cell" data-label="Heti aktivitás">
                                                {activity
                                                    ? <span>{activity.ride_count_7d} tekerés <span className={styles.separator}>·</span> {formatDistance(activity.distance_meters_7d)}</span>
                                                    : <span className={styles.muted}>Még nincs mentett tekerés</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <table className={styles.table + ' ' + styles.ridesTable} role="table">
                            <thead role="rowgroup"><tr role="row"><th scope="col">Tekerő / időpont</th><th scope="col">Útvonal</th><th scope="col" aria-sort={activeMetric === 'distance' ? 'descending' : undefined}>Távolság</th><th scope="col" aria-sort={activeMetric === 'duration' ? 'descending' : undefined}>Idő</th><th scope="col">Átlagsebesség</th><th scope="col"><span className="sr-only">Részletek</span></th></tr></thead>
                            <tbody role="rowgroup">
                                {rides.map(ride => (
                                    <tr key={ride.id} role="row" className={styles.linkedRow}>
                                        <td role="cell">
                                            {onOpenUser && ride.user_id ? <button type="button" className={styles.ridePerson} data-record-id={ride.id + ':user'}
                                                disabled={openingUserId !== null} onClick={() => void openUser(ride.user_id!, onOpenUser, ride.id + ':user')}
                                                aria-label={getPersonName(ride) + ' profiljának megnyitása'}><strong>{getPersonName(ride)}</strong><small>{formatDate(ride.started_at)}</small></button>
                                                : <span className={styles.ridePerson}><strong>{getPersonName(ride)}</strong><small>{formatDate(ride.started_at)}</small></span>}
                                        </td>
                                        <td role="cell" data-label="Útvonal" className={styles.routeName}>
                                            {onOpenRide ? <button type="button" className={styles.rideLink} data-record-id={ride.id}
                                                disabled={openingUserId !== null} onClick={() => void openUser(ride.id, onOpenRide)}
                                                aria-label={getPersonName(ride) + ': ' + getRideLabel(ride) + '. Tekerés részletei'}>
                                                <strong>{getRideLabel(ride)}</strong>
                                            </button> : <Link className={styles.rideLink} href={'/admin/ride-diagnostics?ride=' + encodeURIComponent(ride.id)}
                                                aria-label={getPersonName(ride) + ': ' + getRideLabel(ride) + '. Tekerés részletei'}>
                                                <strong>{getRideLabel(ride)}</strong>
                                            </Link>}
                                        </td>
                                        <td role="cell" data-label="Távolság" className={activeMetric === 'distance' ? styles.emphasis : undefined}>{formatDistance(ride.distance_meters)}</td>
                                        <td role="cell" data-label="Idő" className={activeMetric === 'duration' ? styles.emphasis : undefined}>{formatDuration(ride.duration_seconds)}</td>
                                        <td role="cell" data-label="Átlagsebesség">{ride.average_speed_kmh > 0 ? numberFormat.format(ride.average_speed_kmh) + ' km/h' : 'Nincs adat'}</td>
                                        <td role="cell" className={styles.rowAction} aria-hidden="true"><ChevronRight /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {visibleCount === 0 ? (
                        <div className={styles.empty}>
                            <Search aria-hidden="true" />
                            <strong>{normalizedQuery ? 'Nincs ilyen találat' : 'Ez a hét még üres'}</strong>
                            <span>{normalizedQuery ? 'Próbálj másik nevet, emailt vagy útvonalat.' : 'Ebben a nézetben még nincs megjeleníthető adat az elmúlt 7 napból.'}</span>
                            {normalizedQuery ? <button type="button" onClick={() => setQuery('')}>Keresés törlése</button> : null}
                        </div>
                    ) : null}
                </div>
                <footer className={styles.footer}>
                    <span>{stats.computed_at ? 'Frissítve: ' + formatDate(stats.computed_at) : 'Elmúlt 7 nap adatai'}</span>
                    <span>{activeMetric === 'active-users' || activeMetric === 'new-users' ? 'Heti felhasználói aktivitás' : 'A sorokra kattintva megnyílnak a tekerés részletei'}</span>
                </footer>
            </DialogContent>
        </Dialog>
    );
}
