'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, AppWindow, Loader2, Smartphone, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface DeviceStats {
    total_devices: number;
    registered_users: number;
    guest_users: number;
    ios_devices: number;
    android_devices: number;
    web_devices: number;
    active_last_7_days: number;
    active_last_30_days: number;
}

const isDev = process.env.NODE_ENV === 'development';

export default function DeviceStatsOverview() {
    const [stats, setStats] = useState<DeviceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchStats = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                await supabase.auth.signOut();
                router.replace('/login');
                return;
            }
            const response = await fetch('/api/device-stats', { headers: { Authorization: `Bearer ${session.access_token}` } });
            if (!response.ok) {
                if (response.status === 401) {
                    await supabase.auth.signOut();
                    router.replace('/login');
                    return;
                }
                if (response.status === 403) {
                    await supabase.auth.signOut();
                    router.replace('/');
                    return;
                }
                let message = 'Hiba történt a statisztikák lekérésekor.';
                try {
                    const body = await response.json();
                    if (body?.error) message = body.error;
                } catch { /* response was not JSON */ }
                throw new Error(message);
            }
            setStats(await response.json());
        } catch (reason: unknown) {
            if (isDev) console.error('Error fetching device stats:', reason);
            setError(reason instanceof Error ? reason.message : 'Ismeretlen hiba');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchStats();
        const interval = window.setInterval(fetchStats, 30000);
        return () => window.clearInterval(interval);
    }, [fetchStats]);

    const view = useMemo(() => {
        if (!stats) return null;
        const platformTotal = stats.ios_devices + stats.android_devices + stats.web_devices;
        const percent = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;
        return {
            conversion: stats.total_devices > 0 ? (stats.registered_users / stats.total_devices) * 100 : 0,
            retention: stats.active_last_30_days > 0 ? (stats.active_last_7_days / stats.active_last_30_days) * 100 : 0,
            iosShare: percent(stats.ios_devices, platformTotal),
            androidShare: percent(stats.android_devices, platformTotal),
            webShare: percent(stats.web_devices, platformTotal),
        };
    }, [stats]);

    if (loading) return <div className="ops-dashboard-loading"><Loader2 aria-label="Betöltés" /></div>;
    if (error) return <div className="ops-dashboard-error">{error}</div>;
    if (!stats || !view) return null;

    return (
        <section className="ops-dashboard" aria-label="Rendszerállapot">
            <div className="ops-dashboard-hero">
                <div>
                    <span>Rendszerkép</span>
                    <h2>{stats.total_devices.toLocaleString('hu-HU')}</h2>
                    <p>ismert eszköz a ParkSafe hálózatban</p>
                </div>
                <div className="ops-dashboard-ratio">
                    <span>Regisztráció / eszköz</span>
                    <strong>{view.conversion.toFixed(1)}%</strong>
                    <i><b style={{ width: `${Math.min(view.conversion, 100)}%` }} /></i>
                </div>
            </div>

            <div className="ops-metric-ledger">
                <Metric icon={UserRound} label="Regisztrált" value={stats.registered_users} note="felhasználó" />
                <Metric icon={Activity} label="Aktív 7 nap" value={stats.active_last_7_days} note="eszköz" />
                <Metric icon={Activity} label="Aktív 30 nap" value={stats.active_last_30_days} note="eszköz" />
                <Metric icon={Smartphone} label="Vendég" value={stats.guest_users} note="eszköz" />
            </div>

            <div className="ops-dashboard-lower">
                <div className="ops-platform-ledger">
                    <header><AppWindow aria-hidden="true" /><span>Platformmegoszlás</span><small>{(stats.ios_devices + stats.android_devices + stats.web_devices).toLocaleString('hu-HU')} eszköz</small></header>
                    <Platform label="Android" value={stats.android_devices} share={view.androidShare} />
                    <Platform label="iOS" value={stats.ios_devices} share={view.iosShare} />
                    {stats.web_devices > 0 ? <Platform label="Web" value={stats.web_devices} share={view.webShare} /> : null}
                </div>
                <div className="ops-retention-panel">
                    <span>7 / 30 napos aktivitás</span>
                    <strong>{view.retention.toFixed(1)}%</strong>
                    <p>{stats.active_last_7_days.toLocaleString('hu-HU')} felhasználó tért vissza az elmúlt héten a {stats.active_last_30_days.toLocaleString('hu-HU')} havi aktívból.</p>
                </div>
            </div>
        </section>
    );
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof Activity; label: string; value: number; note: string }) {
    return <div className="ops-metric"><Icon aria-hidden="true" /><span>{label}</span><strong>{value.toLocaleString('hu-HU')}</strong><small>{note}</small></div>;
}

function Platform({ label, value, share }: { label: string; value: number; share: number }) {
    return <div className="ops-platform-row"><span>{label}</span><i><b style={{ width: `${share}%` }} /></i><strong>{value.toLocaleString('hu-HU')}</strong><small>{share}%</small></div>;
}
