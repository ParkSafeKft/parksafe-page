'use client';

import { useMemo, useState } from 'react';
import {
    Bike,
    Clock3,
    ExternalLink,
    Map,
    Search,
    UserPlus,
    UsersRound,
    type LucideIcon,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    AdminModalBody,
    AdminModalContent,
    AdminModalFrame,
    AdminModalHeader,
} from './AdminModal';

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
}

const metricCopy: Record<WeeklyMetricKey, {
    eyebrow: string;
    title: string;
    subtitle: string;
    icon: LucideIcon;
}> = {
    'active-users': {
        eyebrow: 'Elmúlt 7 nap · felhasználók',
        title: 'Aktív userek',
        subtitle: 'Minden felhasználó, aki legalább egy ride-ot indított.',
        icon: UsersRound,
    },
    rides: {
        eyebrow: 'Elmúlt 7 nap · aktivitás',
        title: 'Ride-ok',
        subtitle: 'Az összes rögzített út, legfrissebb elöl.',
        icon: Bike,
    },
    distance: {
        eyebrow: 'Elmúlt 7 nap · teljesítmény',
        title: 'Megtett távolság',
        subtitle: 'Az utak távolság szerint rendezve, a leghosszabbal kezdve.',
        icon: Map,
    },
    duration: {
        eyebrow: 'Elmúlt 7 nap · teljesítmény',
        title: 'Rögzített idő',
        subtitle: 'Az utak menetidő szerint rendezve, a leghosszabbal kezdve.',
        icon: Clock3,
    },
    'new-users': {
        eyebrow: 'Elmúlt 7 nap · regisztrációk',
        title: 'Új userek',
        subtitle: 'Az időszakban létrehozott felhasználói profilok.',
        icon: UserPlus,
    },
};

const numberFormat = new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 1 });
const dateTimeFormat = new Intl.DateTimeFormat('hu-HU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

function getPersonName(person: { username: string | null; full_name: string | null; email: string | null }) {
    return person.username || person.full_name || person.email || 'Ismeretlen felhasználó';
}

function getInitial(person: { username: string | null; full_name: string | null; email: string | null }) {
    return getPersonName(person).charAt(0).toLocaleUpperCase('hu-HU');
}

function formatDistance(meters: number) {
    return `${numberFormat.format(meters / 1000)} km`;
}

function formatDuration(seconds: number) {
    const totalMinutes = Math.round(seconds / 60);
    if (totalMinutes < 60) return `${totalMinutes.toLocaleString('hu-HU')} perc`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} ó ${minutes.toString().padStart(2, '0')} p`;
}

function formatDate(value: string | null) {
    return value ? dateTimeFormat.format(new Date(value)) : 'Nincs időpont';
}

function getMapUrl(ride: WeeklyRide) {
    if (!ride.start_point || !ride.end_point) return null;
    const [startLng, startLat] = ride.start_point;
    const [endLng, endLat] = ride.end_point;
    return `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${endLat},${endLng}&travelmode=bicycling`;
}

function getRideLabel(ride: WeeklyRide) {
    if (ride.favorite_name) return ride.favorite_name;
    if (ride.kind === 'normal') return 'Normál ride';
    if (ride.kind === 'challenge') return 'Kihívás ride';
    return ride.kind || 'Rögzített út';
}

function PersonCell({ person, avatarUrl }: {
    person: { username: string | null; full_name: string | null; email: string | null };
    avatarUrl?: string | null;
}) {
    return (
        <div className="weekly-detail-person">
            <Avatar className="weekly-detail-avatar" aria-hidden="true">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                <AvatarFallback>{getInitial(person)}</AvatarFallback>
            </Avatar>
            <span>
                <strong>{getPersonName(person)}</strong>
                <small>{person.email || person.full_name || 'Nincs további profiladat'}</small>
            </span>
        </div>
    );
}

export default function WeeklyStatsDetailModal({ metric, stats, onClose }: WeeklyStatsDetailModalProps) {
    const [query, setQuery] = useState('');
    const normalizedQuery = query.trim().toLocaleLowerCase('hu-HU');
    const copy = metric ? metricCopy[metric] : metricCopy.rides;
    const Icon = copy.icon;

    const activeUsers = useMemo(() => stats.active_users.filter(user => {
        if (!normalizedQuery) return true;
        return [user.username, user.full_name, user.email, user.id]
            .some(value => value?.toLocaleLowerCase('hu-HU').includes(normalizedQuery));
    }), [normalizedQuery, stats.active_users]);

    const newUsers = useMemo(() => stats.new_users.filter(user => {
        if (!normalizedQuery) return true;
        return [user.username, user.full_name, user.email, user.id]
            .some(value => value?.toLocaleLowerCase('hu-HU').includes(normalizedQuery));
    }), [normalizedQuery, stats.new_users]);

    const rides = useMemo(() => {
        const filtered = stats.rides.filter(ride => {
            if (!normalizedQuery) return true;
            return [ride.username, ride.full_name, ride.email, ride.favorite_name, ride.kind, ride.id]
                .some(value => value?.toLocaleLowerCase('hu-HU').includes(normalizedQuery));
        });
        if (metric === 'distance') return [...filtered].sort((a, b) => b.distance_meters - a.distance_meters);
        if (metric === 'duration') return [...filtered].sort((a, b) => b.duration_seconds - a.duration_seconds);
        return filtered;
    }, [metric, normalizedQuery, stats.rides]);

    if (!metric) return null;

    const visibleCount = metric === 'active-users'
        ? activeUsers.length
        : metric === 'new-users'
            ? newUsers.length
            : rides.length;

    return (
        <Dialog open onOpenChange={open => !open && onClose()}>
            <AdminModalContent variant="inspector" className="weekly-detail-modal">
                <AdminModalFrame>
                    <AdminModalHeader
                        eyebrow={copy.eyebrow}
                        title={copy.title}
                        subtitle={copy.subtitle}
                        icon={Icon}
                        meta={<span>{visibleCount.toLocaleString('hu-HU')} megjelenített rekord</span>}
                    />
                    <div className="weekly-detail-toolbar">
                        <Search aria-hidden="true" />
                        <label className="sr-only" htmlFor="weekly-detail-search">Keresés a részletek között</label>
                        <input
                            id="weekly-detail-search"
                            type="search"
                            value={query}
                            onChange={event => setQuery(event.target.value)}
                            placeholder="Keresés név, email vagy útvonal alapján…"
                            spellCheck={false}
                        />
                        {query ? <button type="button" onClick={() => setQuery('')}>Törlés</button> : null}
                    </div>
                    <AdminModalBody className="weekly-detail-body">
                        {metric === 'active-users' ? (
                            <div className="weekly-detail-table weekly-detail-table--users">
                                <div className="weekly-detail-table-head" aria-hidden="true">
                                    <span>Felhasználó</span><span>Ride</span><span>Távolság</span><span>Idő</span><span>Utolsó ride</span>
                                </div>
                                {activeUsers.map(user => (
                                    <article className="weekly-detail-row" key={user.id}>
                                        <PersonCell person={user} avatarUrl={user.avatar_url} />
                                        <span data-label="Ride"><strong>{user.ride_count_7d.toLocaleString('hu-HU')}</strong></span>
                                        <span data-label="Távolság"><strong>{formatDistance(user.distance_meters_7d)}</strong></span>
                                        <span data-label="Idő"><strong>{formatDuration(user.duration_seconds_7d)}</strong></span>
                                        <span data-label="Utolsó ride">{formatDate(user.last_ride_at)}</span>
                                    </article>
                                ))}
                            </div>
                        ) : metric === 'new-users' ? (
                            <div className="weekly-detail-table weekly-detail-table--new-users">
                                <div className="weekly-detail-table-head" aria-hidden="true">
                                    <span>Felhasználó</span><span>Regisztráció</span><span>Heti aktivitás</span>
                                </div>
                                {newUsers.map(user => {
                                    const activity = stats.active_users.find(activeUser => activeUser.id === user.id);
                                    return (
                                        <article className="weekly-detail-row" key={user.id}>
                                            <PersonCell person={user} avatarUrl={user.avatar_url} />
                                            <span data-label="Regisztráció">{formatDate(user.created_at)}</span>
                                            <span data-label="Heti aktivitás">
                                                {activity
                                                    ? <strong>{activity.ride_count_7d} ride · {formatDistance(activity.distance_meters_7d)}</strong>
                                                    : 'Még nincs ride'}
                                            </span>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="weekly-detail-table weekly-detail-table--rides">
                                <div className="weekly-detail-table-head" aria-hidden="true">
                                    <span>Időpont & user</span><span>Útvonal</span><span>Távolság</span><span>Idő</span><span>Átlag</span><span>Térkép</span>
                                </div>
                                {rides.map(ride => {
                                    const mapUrl = getMapUrl(ride);
                                    return (
                                        <article className="weekly-detail-row" key={ride.id}>
                                            <div className="weekly-detail-ride-user">
                                                <strong>{getPersonName(ride)}</strong>
                                                <small>{formatDate(ride.started_at)}</small>
                                            </div>
                                            <span data-label="Útvonal">
                                                <strong>{getRideLabel(ride)}</strong>
                                                {ride.start_point && ride.end_point ? <small>GPS útvonal elérhető</small> : null}
                                            </span>
                                            <span data-label="Távolság"><strong>{formatDistance(ride.distance_meters)}</strong></span>
                                            <span data-label="Idő"><strong>{formatDuration(ride.duration_seconds)}</strong></span>
                                            <span data-label="Átlag">{ride.average_speed_kmh > 0 ? `${numberFormat.format(ride.average_speed_kmh)} km/h` : '—'}</span>
                                            <span data-label="Térkép">
                                                {mapUrl ? (
                                                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label="Útvonal megnyitása a Google Térképen">
                                                        <ExternalLink aria-hidden="true" />
                                                        <span>Térkép</span>
                                                    </a>
                                                ) : '—'}
                                            </span>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                        {visibleCount === 0 ? (
                            <div className="weekly-detail-empty">
                                <Search aria-hidden="true" />
                                <strong>Nincs találat</strong>
                                <span>Próbálj más nevet, emailt vagy útvonalat.</span>
                            </div>
                        ) : null}
                    </AdminModalBody>
                </AdminModalFrame>
            </AdminModalContent>
        </Dialog>
    );
}
