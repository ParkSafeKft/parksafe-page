'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppWindow, Bike, Loader2, Repeat2, Smartphone, UserPlus, UserRound, type LucideIcon } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '@/lib/supabaseClient';

interface DeviceStats {
    total_users: number;
    total_devices: number;
    registered_users: number;
    guest_users: number;
    ios_devices: number;
    android_devices: number;
    web_devices: number;
    monthly_users: Array<{ month: string; users: number }>;
    user_metrics: {
        active_this_month: number;
        returning_this_month: number;
        new_this_month: number;
    };
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
            iosShare: percent(stats.ios_devices, platformTotal),
            androidShare: percent(stats.android_devices, platformTotal),
            webShare: percent(stats.web_devices, platformTotal),
            monthlyUsers: (stats.monthly_users ?? []).map(item => {
                const date = new Date(`${item.month}T00:00:00Z`);
                return {
                    ...item,
                    label: new Intl.DateTimeFormat('hu-HU', { month: 'short', timeZone: 'UTC' }).format(date),
                    fullLabel: new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', timeZone: 'UTC' }).format(date),
                };
            }),
        };
    }, [stats]);

    if (loading) return <div className="ops-dashboard-loading"><Loader2 aria-label="Betöltés" /></div>;
    if (error) return <div className="ops-dashboard-error">{error}</div>;
    if (!stats || !view) return null;

    return (
        <section className="ops-dashboard" aria-label="Rendszerállapot">
            <div className="ops-dashboard-hero">
                <div className="ops-dashboard-total">
                    <span>Rendszerkép</span>
                    <h2>{stats.total_users.toLocaleString('hu-HU')}</h2>
                    <p>összes felhasználó</p>
                </div>

                <div className="ops-user-split">
                    <UserSplitRow
                        icon={UserRound}
                        label="Regisztrált"
                        value={stats.registered_users}
                    />
                    <UserSplitRow
                        icon={Smartphone}
                        label="Vendég"
                        value={stats.guest_users}
                    />
                </div>

                <div className="ops-platform-compact">
                    <header><AppWindow aria-hidden="true" /><span>Platformok</span><small>{(stats.ios_devices + stats.android_devices + stats.web_devices).toLocaleString('hu-HU')} eszköz</small></header>
                    <Platform platform="android" label="Android" value={stats.android_devices} share={view.androidShare} />
                    <Platform platform="apple" label="iOS" value={stats.ios_devices} share={view.iosShare} />
                    {stats.web_devices > 0 ? <Platform platform="web" label="Web" value={stats.web_devices} share={view.webShare} /> : null}
                </div>
            </div>

            {view.monthlyUsers.length > 0 ? <MonthlyUsersChart data={view.monthlyUsers} /> : null}

            <div className="ops-user-kpis" aria-label="Havi felhasználói mutatók">
                <Metric icon={Repeat2} label="Visszatérő felhasználók" value={stats.user_metrics.returning_this_month} note="ebben és egy korábbi hónapban is tekertek" />
                <Metric icon={Bike} label="Aktív felhasználók" value={stats.user_metrics.active_this_month} note="ebben a hónapban rögzítettek túrát" />
                <Metric icon={UserPlus} label="Új regisztrációk" value={stats.user_metrics.new_this_month} note="ebben a hónapban" />
            </div>
        </section>
    );
}

function Metric({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: number; note: string }) {
    return <div className="ops-metric"><Icon aria-hidden="true" /><span>{label}</span><strong>{value.toLocaleString('hu-HU')}</strong><small>{note}</small></div>;
}

function UserSplitRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
    return <div className="ops-user-row"><Icon aria-hidden="true" /><span>{label}</span><strong>{value.toLocaleString('hu-HU')}</strong></div>;
}

function MonthlyUsersChart({ data }: { data: Array<{ month: string; users: number; label: string; fullLabel: string }> }) {
    const latest = data.at(-1);
    return (
        <section className="ops-user-growth" aria-label="Havi új regisztrációk">
            <header>
                <div><span>Új regisztrációk</span><small>elmúlt 12 hónap</small></div>
                {latest ? <strong>{latest.users.toLocaleString('hu-HU')} <small>ebben a hónapban</small></strong> : null}
            </header>
            <ol className="sr-only">
                {data.map(item => <li key={item.month}>{item.fullLabel}: {item.users.toLocaleString('hu-HU')} új felhasználó</li>)}
            </ol>
            <div className="ops-user-growth-chart">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 800, height: 176 }}>
                    <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                        <CartesianGrid vertical={false} stroke="var(--ops-border)" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--ops-text-3)', fontSize: 10 }} dy={8} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--ops-text-3)', fontSize: 10 }} />
                        <Tooltip
                            cursor={{ stroke: 'var(--ops-border-strong)' }}
                            contentStyle={{ border: '1px solid var(--ops-border-strong)', borderRadius: '6px', background: '#0c0f0d', color: 'var(--ops-text)', fontSize: '11px' }}
                            labelFormatter={(_, payload) => payload[0]?.payload.fullLabel ?? ''}
                            formatter={(value) => [`${Number(value).toLocaleString('hu-HU')} felhasználó`, 'Regisztráció']}
                        />
                        <Line type="monotone" dataKey="users" stroke="var(--ops-green)" strokeWidth={2} dot={{ r: 2.5, fill: 'var(--ops-green)', strokeWidth: 0 }} activeDot={{ r: 4, fill: 'var(--ops-green)', stroke: '#0c0f0d', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}

function Platform({ platform, label, value, share }: { platform: 'android' | 'apple' | 'web'; label: string; value: number; share: number }) {
    return (
        <div className="ops-platform-row">
            <span className="ops-platform-mark" role="img" aria-label={label}>
                {platform === 'android' ? <AndroidMark /> : platform === 'apple' ? <AppleMark /> : <AppWindow aria-hidden="true" />}
            </span>
            <i><b style={{ width: `${share}%` }} /></i>
            <strong>{value.toLocaleString('hu-HU')}</strong>
            <small>{share}%</small>
        </div>
    );
}

function AppleMark() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.15 6.9c-.95 0-2.42-1.08-3.96-1.04-2.04.03-3.91 1.18-4.96 3.01-2.12 3.68-.55 9.1 1.52 12.09 1.01 1.45 2.21 3.09 3.79 3.04 1.52-.07 2.09-.99 3.94-.99 1.83 0 2.34.99 3.95.95 1.62-.03 2.65-1.48 3.64-2.95 1.17-1.7 1.65-3.35 1.69-3.44-.04-.01-3.21-1.22-3.25-4.86-.03-3.04 2.48-4.49 2.6-4.56-1.43-2.09-3.64-2.32-4.42-2.38-2.01-.16-3.7 1.09-4.73 1.09Zm3.58-3.1c.83-1 1.4-2.4 1.24-3.8-1.2.05-2.64.83-3.49 1.83-.77.88-1.43 2.33-1.25 3.69 1.34.1 2.7-.68 3.5-1.72Z" /></svg>;
}

function AndroidMark() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m17.88 9.32 2-3.46a.42.42 0 0 0-.15-.57.42.42 0 0 0-.57.16l-2.02 3.5A12.3 12.3 0 0 0 12 7.85c-1.85 0-3.59.39-5.14 1.1l-2.02-3.5a.42.42 0 0 0-.57-.16.42.42 0 0 0-.15.57l2 3.46A11.96 11.96 0 0 0 0 18.76h24a11.96 11.96 0 0 0-6.12-9.44ZM6.48 15.34a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm11.04 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" /></svg>;
}
