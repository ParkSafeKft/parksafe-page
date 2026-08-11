'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, Clock3, Loader2, Map, UserPlus, UsersRound } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface UsageStats {
    active_users_7d: number;
    rides_7d: number;
    distance_meters_7d: number;
    duration_seconds_7d: number;
    new_users_7d: number;
    computed_at: string;
}

interface ContentStatsOverviewProps { onNavigate?: (tab: string) => void; }
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
            const response = await fetch('/api/admin-usage-stats', { headers: { Authorization: `Bearer ${session.access_token}` } });
            if (!response.ok) {
                if (response.status === 401) { await supabase.auth.signOut(); router.replace('/login'); return; }
                if (response.status === 403) { await supabase.auth.signOut(); router.replace('/'); return; }
                throw new Error('Hiba történt a heti aktivitás betöltésekor.');
            }
            setStats(await response.json());
        } catch (reason) {
            if (isDev) console.error(reason);
            setError(reason instanceof Error ? reason.message : 'Ismeretlen hiba');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { loadStats(); }, [loadStats]);

    const metrics = useMemo(() => stats ? [
        { label: 'Aktív userek', value: stats.active_users_7d.toLocaleString('hu-HU'), note: 'ride-ot indított', icon: UsersRound },
        { label: 'Ride-ok', value: stats.rides_7d.toLocaleString('hu-HU'), note: 'rögzített út', icon: Bike },
        { label: 'Távolság', value: `${(stats.distance_meters_7d / 1000).toLocaleString('hu-HU', { maximumFractionDigits: 1 })} km`, note: 'összesen', icon: Map },
        { label: 'Idő', value: `${Math.round(stats.duration_seconds_7d / 60).toLocaleString('hu-HU')} perc`, note: 'rögzítve', icon: Clock3 },
        { label: 'Új userek', value: stats.new_users_7d.toLocaleString('hu-HU'), note: 'regisztráció', icon: UserPlus, action: () => onNavigate?.('users') },
    ] : [], [stats, onNavigate]);

    if (loading) return <div className="ops-dashboard-loading"><Loader2 aria-label="Betöltés" /></div>;
    if (error) return <div className="ops-dashboard-error">{error}</div>;
    if (!stats) return null;

    return (
        <section className="ops-weekly-ledger">
            <header><span>Elmúlt 7 nap</span><small>Frissítve: {new Intl.DateTimeFormat('hu-HU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(stats.computed_at))}</small></header>
            <div>
                {metrics.map(({ label, value, note, icon: Icon, action }) => (
                    <button type="button" key={label} onClick={action} disabled={!action}>
                        <Icon aria-hidden="true" /><span>{label}</span><strong>{value}</strong><small>{note}</small>
                    </button>
                ))}
            </div>
        </section>
    );
}
