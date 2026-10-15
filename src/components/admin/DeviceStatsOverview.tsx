'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppWindow, Bike, ChartNoAxesCombined, Repeat2, Smartphone, UsersRound } from 'lucide-react';
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

export default function DeviceStatsOverview({ children, activation }: { children?: ReactNode; activation?: ReactNode }) {
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
            setError(null);
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

    return (
        <div className="ops-overview-page">
            <section className="ops-overview-summary" aria-label="Közösség és aktivitás" aria-busy={loading}>
                {[
                    { label: 'Felhasználó', value: stats?.total_users, icon: UsersRound, note: stats ? `${stats.registered_users.toLocaleString('hu-HU')} regisztrált · ${stats.guest_users.toLocaleString('hu-HU')} vendég` : 'Összesen' },
                    { label: 'Aktív tekerő', value: stats?.user_metrics.active_this_month, icon: Bike, note: 'Ebben a hónapban' },
                    { label: 'Visszatérő tekerő', value: stats?.user_metrics.returning_this_month, icon: Repeat2, note: 'Ebben és korábbi hónapban is tekert' },
                ].map(({ icon: Icon, ...item }) => <div key={item.label}><span><Icon aria-hidden="true" />{item.label}</span><strong>{item.value === undefined ? <span className="ops-activation-placeholder" aria-hidden="true" /> : item.value.toLocaleString('hu-HU')}</strong><small>{item.note}</small></div>)}
            </section>
            {error ? <div className="ops-dashboard-error" role="alert">{error}</div> : null}
            {children}
            <div className="ops-audience-grid">
                <MonthlyUsersChart data={view?.monthlyUsers ?? []} loading={loading} />
                <section className="ops-audience-panel" aria-label="Eszközök és platformmegoszlás">
                    <header><h2><Smartphone aria-hidden="true" />Eszközök</h2><span>Platformmegoszlás</span></header>
                    {stats && view ? <>
                        <DeviceRing stats={stats} />
                        <table className="ops-platform-table">
                            <caption className="sr-only">Eszközök platformonként</caption>
                            <thead><tr><th scope="col">Platform</th><th scope="col">Eszköz</th><th scope="col">Arány</th></tr></thead>
                            <tbody>
                                <Platform platform="android" label="Android" value={stats.android_devices} share={view.androidShare} />
                                <Platform platform="apple" label="iOS" value={stats.ios_devices} share={view.iosShare} />
                                {stats.web_devices > 0 ? <Platform platform="web" label="Web" value={stats.web_devices} share={view.webShare} /> : null}
                            </tbody>
                        </table>
                    </> : <p className="ops-audience-empty" role="status">{loading ? 'Betöltés…' : 'Nincs adat'}</p>}
                </section>
            </div>
            {activation}
        </div>
    );
}

function MonthlyUsersChart({ data, loading }: { data: Array<{ month: string; users: number; label: string; fullLabel: string }>; loading: boolean }) {
    const latest = data.at(-1);
    return (
        <section className="ops-user-growth ops-registration-chart" aria-label="Havi új regisztrációk">
            <header>
                <div><h2><ChartNoAxesCombined aria-hidden="true" />Új regisztrációk</h2><small>Elmúlt 12 hónap</small></div>
                {latest ? <strong>{latest.users.toLocaleString('hu-HU')} <small>ebben a hónapban</small></strong> : null}
            </header>
            <ol className="sr-only">
                {data.map(item => <li key={item.month}>{item.fullLabel}: {item.users.toLocaleString('hu-HU')} új felhasználó</li>)}
            </ol>
            <div className="ops-user-growth-chart">
                {data.length === 0 ? <p className="ops-audience-empty" role="status">{loading ? 'Betöltés…' : 'Nincs adat'}</p> :
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
                        <Line type="monotone" dataKey="users" isAnimationActive={false} stroke="var(--ops-green)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--ops-green)', stroke: '#0c0f0d', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>}
            </div>
        </section>
    );
}

function Platform({ platform, label, value, share }: { platform: 'android' | 'apple' | 'web'; label: string; value: number; share: number }) {
    return (
        <tr>
            <th scope="row"><span className="ops-platform-cell"><span className={`ops-platform-mark is-${platform}`} aria-hidden="true">
                {platform === 'android' ? <AndroidMark /> : platform === 'apple' ? <AppleMark /> : <AppWindow aria-hidden="true" />}
            </span>{label}</span></th>
            <td>{value.toLocaleString('hu-HU')}</td><td>{share}%</td>
        </tr>
    );
}

function DeviceRing({ stats }: { stats: DeviceStats }) {
    const total = stats.android_devices + stats.ios_devices + stats.web_devices;
    const android = total ? stats.android_devices / total * 100 : 0;
    const ios = total ? stats.ios_devices / total * 100 : 0;
    return <svg className="ops-device-ring" viewBox="0 0 140 140" role="img" aria-label={`${stats.total_devices.toLocaleString('hu-HU')} eszköz; Android ${stats.android_devices}, iOS ${stats.ios_devices}${stats.web_devices ? `, Web ${stats.web_devices}` : ''}`}>
        <g transform="rotate(-90 70 70)" fill="none" strokeWidth="10">
            <circle cx="70" cy="70" r="55" stroke="var(--ops-border-strong)" />
            {total > 0 ? <>
                <circle cx="70" cy="70" r="55" pathLength="100" stroke="var(--ops-green)" strokeDasharray={`${android} ${100 - android}`} />
                <circle cx="70" cy="70" r="55" pathLength="100" stroke="var(--ops-text-2)" strokeDasharray={`${ios} ${100 - ios}`} strokeDashoffset={-android} />
            </> : null}
        </g>
        <text x="70" y="69" textAnchor="middle" className="ops-device-count">{stats.total_devices.toLocaleString('hu-HU')}</text>
        <text x="70" y="88" textAnchor="middle" className="ops-device-caption">eszköz</text>
    </svg>;
}

function AppleMark() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.15 6.9c-.95 0-2.42-1.08-3.96-1.04-2.04.03-3.91 1.18-4.96 3.01-2.12 3.68-.55 9.1 1.52 12.09 1.01 1.45 2.21 3.09 3.79 3.04 1.52-.07 2.09-.99 3.94-.99 1.83 0 2.34.99 3.95.95 1.62-.03 2.65-1.48 3.64-2.95 1.17-1.7 1.65-3.35 1.69-3.44-.04-.01-3.21-1.22-3.25-4.86-.03-3.04 2.48-4.49 2.6-4.56-1.43-2.09-3.64-2.32-4.42-2.38-2.01-.16-3.7 1.09-4.73 1.09Zm3.58-3.1c.83-1 1.4-2.4 1.24-3.8-1.2.05-2.64.83-3.49 1.83-.77.88-1.43 2.33-1.25 3.69 1.34.1 2.7-.68 3.5-1.72Z" /></svg>;
}

function AndroidMark() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m17.88 9.32 2-3.46a.42.42 0 0 0-.15-.57.42.42 0 0 0-.57.16l-2.02 3.5A12.3 12.3 0 0 0 12 7.85c-1.85 0-3.59.39-5.14 1.1l-2.02-3.5a.42.42 0 0 0-.57-.16.42.42 0 0 0-.15.57l2 3.46A11.96 11.96 0 0 0 0 18.76h24a11.96 11.96 0 0 0-6.12-9.44ZM6.48 15.34a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm11.04 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" /></svg>;
}
