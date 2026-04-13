'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Building2, Trophy, Route, CheckCircle2, Loader2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentStats {
    active_cities: number;
    total_cities: number;
    todays_challenges: number;
    total_challenges: number;
    pending_community_routes: number;
    total_challenge_completions: number;
    completions_last_7d: number;
    new_users_last_7d: number;
}

interface ContentStatsOverviewProps {
    onNavigate?: (tab: string) => void;
}

const isDev = process.env.NODE_ENV === 'development';

export default function ContentStatsOverview({ onNavigate }: ContentStatsOverviewProps) {
    const [stats, setStats] = useState<ContentStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const today = new Date().toISOString().slice(0, 10);
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                const [citiesAll, citiesActive, chAll, chToday, crPending, caDone, caLast7d, usersLast7d] = await Promise.all([
                    supabase.from('cities').select('*', { count: 'exact', head: true }),
                    supabase.from('cities').select('*', { count: 'exact', head: true }).eq('is_active', true),
                    supabase.from('daily_challenges').select('*', { count: 'exact', head: true }),
                    supabase.from('daily_challenges').select('*', { count: 'exact', head: true }).eq('challenge_date', today),
                    supabase.from('community_bike_lanes').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                    supabase.from('challenge_attempts').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
                    supabase.from('challenge_attempts').select('*', { count: 'exact', head: true }).eq('status', 'completed').gte('finished_at', sevenDaysAgo),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
                ]);
                if (cancelled) return;
                setStats({
                    active_cities: citiesActive.count ?? 0,
                    total_cities: citiesAll.count ?? 0,
                    todays_challenges: chToday.count ?? 0,
                    total_challenges: chAll.count ?? 0,
                    pending_community_routes: crPending.count ?? 0,
                    total_challenge_completions: caDone.count ?? 0,
                    completions_last_7d: caLast7d.count ?? 0,
                    new_users_last_7d: usersLast7d.count ?? 0,
                });
            } catch (err) {
                if (isDev) console.error(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (!stats) return null;

    const cards = [
        {
            title: 'Aktív városok',
            value: stats.active_cities,
            subtitle: `${stats.total_cities} összesen`,
            icon: Building2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            tab: 'cities',
        },
        {
            title: 'Összes teljesített',
            value: stats.total_challenge_completions,
            subtitle: `${stats.completions_last_7d} az elmúlt 7 napban`,
            icon: Trophy,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            tab: 'leaderboard',
        },
        {
            title: 'Új útvonalak',
            value: stats.pending_community_routes,
            subtitle: 'moderációra vár',
            icon: Route,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            tab: 'community_routes',
        },
        {
            title: 'Teljesítések 7 nap',
            value: stats.completions_last_7d,
            subtitle: `${stats.total_challenge_completions} minden időben`,
            icon: CheckCircle2,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            tab: 'leaderboard',
        },
        {
            title: 'Új felhasználók 7 nap',
            value: stats.new_users_last_7d,
            subtitle: 'regisztráció',
            icon: UserPlus,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            tab: 'users',
        },
    ];

    return (
        <div className="mt-4">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 px-1">Tartalom áttekintés</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {cards.map(c => {
                    const Icon = c.icon;
                    const clickable = !!onNavigate;
                    return (
                        <Card
                            key={c.title}
                            onClick={clickable ? () => onNavigate(c.tab) : undefined}
                            className={`bg-card border-border ${clickable ? 'cursor-pointer transition-colors hover:border-primary/40 hover:bg-card/80' : ''}`}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
                                <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center`}>
                                    <Icon className={`w-4 h-4 ${c.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">{c.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">{c.subtitle}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
