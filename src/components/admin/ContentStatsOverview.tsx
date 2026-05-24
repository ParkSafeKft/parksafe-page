'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Bike, Clock3, Loader2, Map, UserPlus, UsersRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UsageStats {
    active_users_7d: number;
    rides_7d: number;
    distance_meters_7d: number;
    duration_seconds_7d: number;
    new_users_7d: number;
    computed_at: string;
}

interface ContentStatsOverviewProps {
    onNavigate?: (tab: string) => void;
}

const isDev = process.env.NODE_ENV === 'development';

export default function ContentStatsOverview({ onNavigate }: ContentStatsOverviewProps) {
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const loadStats = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                await supabase.auth.signOut();
                router.replace('/login');
                return;
            }

            const res = await fetch('/api/admin-usage-stats', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    await supabase.auth.signOut();
                    router.replace('/login');
                    return;
                }
                if (res.status === 403) {
                    await supabase.auth.signOut();
                    router.replace('/');
                    return;
                }
                throw new Error('Hiba történt a heti aktivitás betöltésekor.');
            }

            setStats(await res.json());
        } catch (err) {
            if (isDev) console.error(err);
            setError(err instanceof Error ? err.message : 'Ismeretlen hiba');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const cards = useMemo(() => {
        if (!stats) return [];

        const totalKm = stats.distance_meters_7d / 1000;
        const totalMinutes = Math.round(stats.duration_seconds_7d / 60);

        return [
            {
                title: 'Aktív userek',
                value: stats.active_users_7d.toLocaleString('hu-HU'),
                subtitle: 'ride-ot indítottak',
                icon: UsersRound,
                color: 'emerald',
            },
            {
                title: 'Ride-ok',
                value: stats.rides_7d.toLocaleString('hu-HU'),
                subtitle: 'rögzített út',
                icon: Bike,
                color: 'blue',
            },
            {
                title: 'Összes km',
                value: totalKm.toLocaleString('hu-HU', { maximumFractionDigits: totalKm >= 100 ? 0 : 1 }),
                subtitle: 'megtett távolság',
                icon: Map,
                color: 'green',
            },
            {
                title: 'Összes perc',
                value: totalMinutes.toLocaleString('hu-HU'),
                subtitle: 'rögzített idő',
                icon: Clock3,
                color: 'amber',
            },
            {
                title: 'Új userek',
                value: stats.new_users_7d.toLocaleString('hu-HU'),
                subtitle: 'regisztráció',
                icon: UserPlus,
                color: 'purple',
            },
        ];
    }, [stats]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <section className="mt-4">
            <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
                    <UsersRound className="h-4 w-4" />
                    Elmúlt 7 nap
                </h2>
                <span className="text-xs text-zinc-600">app aktivitás</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {cards.map((card) => {
                    const Icon = card.icon;
                    const palette = palettes[card.color];
                    const clickable = card.title === 'Új userek' && !!onNavigate;

                    return (
                        <Card
                            key={card.title}
                            onClick={clickable ? () => onNavigate('users') : undefined}
                            className={`border-white/10 bg-[#101010] py-0 shadow-none ${clickable ? 'cursor-pointer transition-colors hover:border-white/20 hover:bg-[#151515]' : ''}`}
                        >
                            <CardContent className="p-4">
                                <div className="mb-5 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-zinc-400">{card.title}</p>
                                        <p className="mt-1 text-xs text-zinc-600">{card.subtitle}</p>
                                    </div>
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${palette.bg} ${palette.border}`}>
                                        <Icon className={`h-4 w-4 ${palette.text}`} />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold tracking-tight text-white">{card.value}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}

const palettes: Record<string, { text: string; bg: string; border: string }> = {
    emerald: {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
    },
    blue: {
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
    },
    green: {
        text: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
    },
    amber: {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
    },
    purple: {
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
    },
};
