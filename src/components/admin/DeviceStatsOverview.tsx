'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
    Activity,
    AppWindow,
    Calendar,
    Ghost,
    Loader2,
    Smartphone,
    TrendingUp,
    User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis
} from 'recharts';

const isDev = process.env.NODE_ENV === 'development';

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

const platformColors = {
    iOS: '#3b82f6',
    Android: '#22c55e'
};

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

            const res = await fetch('/api/device-stats', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (!res.ok) {
                let errorMessage = 'Hiba történt a statisztikák lekérésekor.';
                try {
                    const errorData = await res.json();
                    if (errorData?.error) {
                        errorMessage = errorData.error;
                    }
                } catch {
                    // Ignore JSON parse errors.
                }

                if (res.status === 401) {
                    await supabase.auth.signOut();
                    router.replace('/login');
                    return;
                } else if (res.status === 403) {
                    await supabase.auth.signOut();
                    router.replace('/');
                    return;
                }

                throw new Error(errorMessage);
            }

            const data = await res.json();

            setStats(data ?? {
                total_devices: 0,
                registered_users: 0,
                guest_users: 0,
                ios_devices: 0,
                android_devices: 0,
                web_devices: 0,
                active_last_7_days: 0,
                active_last_30_days: 0
            });
        } catch (err: unknown) {
            if (isDev) console.error('Error fetching device stats:', err);
            setError(err instanceof Error ? err.message : 'Ismeretlen hiba');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchStats();

        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const derivedStats = useMemo(() => {
        if (!stats) return null;

        const conversionRate = stats.total_devices > 0
            ? (stats.registered_users / stats.total_devices) * 100
            : 0;
        const retentionRate = stats.active_last_30_days > 0
            ? (stats.active_last_7_days / stats.active_last_30_days) * 100
            : 0;

        const platformTotal = stats.ios_devices + stats.android_devices;
        const platformData = [
            { name: 'iOS', value: stats.ios_devices, color: platformColors.iOS, icon: AppWindow },
            { name: 'Android', value: stats.android_devices, color: platformColors.Android, icon: Smartphone },
        ];

        const activityData = [
            { name: '30 nap', value: stats.active_last_30_days },
            { name: '7 nap', value: stats.active_last_7_days },
        ];

        return { conversionRate, retentionRate, platformTotal, platformData, activityData };
    }, [stats]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-red-400">
                Hiba történt a statisztikák betöltésekor: {error}
            </div>
        );
    }

    if (!stats || !derivedStats) return null;

    return (
        <div className="animate-in fade-in space-y-4 duration-500">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <Card className="overflow-hidden border-white/10 bg-[#101010] py-0 shadow-none xl:col-span-5">
                    <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-zinc-400">Összes eszköz</p>
                                <div className="mt-2 flex items-end gap-3">
                                    <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                        {stats.total_devices.toLocaleString()}
                                    </span>
                                    <span className="pb-1 text-sm text-zinc-500">telepítés</span>
                                </div>
                            </div>
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400">
                                <Smartphone className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <MetricPill
                                icon={<User className="h-4 w-4" />}
                                label="Regisztrált"
                                value={stats.registered_users.toLocaleString()}
                                accent="text-emerald-400"
                            />
                            <MetricPill
                                icon={<Ghost className="h-4 w-4" />}
                                label="Vendég"
                                value={stats.guest_users.toLocaleString()}
                                accent="text-violet-400"
                            />
                        </div>

                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Konverziós ráta</span>
                                <span className="font-semibold text-white">{derivedStats.conversionRate.toFixed(1)}%</span>
                            </div>
                            <ProgressTrack
                                value={derivedStats.conversionRate}
                                className="bg-gradient-to-r from-emerald-500 to-lime-400"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-white/10 bg-[#101010] py-0 shadow-none xl:col-span-4">
                    <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-base text-white">
                            <AppWindow className="h-4 w-4 text-zinc-400" />
                            Platform megoszlás
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 sm:px-6">
                        <div className="grid grid-cols-[120px_1fr] items-center gap-5">
                            <div className="h-[132px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={derivedStats.platformData}
                                            dataKey="value"
                                            innerRadius={38}
                                            outerRadius={58}
                                            paddingAngle={3}
                                            stroke="none"
                                        >
                                            {derivedStats.platformData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                {derivedStats.platformData.map((item) => (
                                    <PlatformRow
                                        key={item.name}
                                        label={item.name}
                                        count={item.value}
                                        total={derivedStats.platformTotal}
                                        color={item.color}
                                        icon={<item.icon className="h-4 w-4" />}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-white/10 bg-[#101010] py-0 shadow-none xl:col-span-3">
                    <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-base text-white">
                            <Activity className="h-4 w-4 text-zinc-400" />
                            Aktivitás
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 sm:px-6">
                        <div className="h-[104px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={derivedStats.activityData} margin={{ top: 8, right: 0, left: -28, bottom: 0 }}>
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                    <YAxis hide />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#6366f1" barSize={42} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <TinyStat label="7 nap" value={stats.active_last_7_days.toLocaleString()} />
                            <TinyStat label="30 nap" value={stats.active_last_30_days.toLocaleString()} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1">
                <Card className="border-white/10 bg-[#101010] py-0 shadow-none">
                    <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-base text-white">
                            <TrendingUp className="h-4 w-4 text-zinc-400" />
                            Retention
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 sm:px-6">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <MetricPill
                                icon={<Calendar className="h-4 w-4" />}
                                label="Aktív 7 nap"
                                value={stats.active_last_7_days.toLocaleString()}
                                accent="text-indigo-300"
                            />
                            <MetricPill
                                icon={<Calendar className="h-4 w-4" />}
                                label="Aktív 30 nap"
                                value={stats.active_last_30_days.toLocaleString()}
                                accent="text-sky-300"
                            />
                        </div>
                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-zinc-400">7 / 30 nap</span>
                                <span className="font-semibold text-white">{derivedStats.retentionRate.toFixed(1)}%</span>
                            </div>
                            <ProgressTrack
                                value={derivedStats.retentionRate}
                                className="bg-gradient-to-r from-indigo-500 to-sky-400"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function MetricPill({ icon, label, value, accent }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    accent: string;
}) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className={`mb-2 flex items-center gap-2 text-xs font-medium ${accent}`}>
                {icon}
                <span>{label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
        </div>
    );
}

function PlatformRow({ label, count, total, color, icon }: {
    label: string;
    count: number;
    total: number;
    color: string;
    icon: React.ReactNode;
}) {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2 font-medium text-white">
                    <span style={{ color }}>{icon}</span>
                    <span>{label}</span>
                </div>
                <span className="shrink-0 text-zinc-400">{count.toLocaleString()} ({percentage.toFixed(1)}%)</span>
            </div>
            <ProgressTrack value={percentage} style={{ backgroundColor: color }} />
        </div>
    );
}

function ProgressTrack({ value, className, style }: {
    value: number;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
                className={`h-full rounded-full transition-all duration-500 ${className ?? ''}`}
                style={{ width: `${Math.min(value, 100)}%`, ...style }}
            />
        </div>
    );
}

function TinyStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-white/[0.03] px-3 py-2">
            <div className="text-xs text-zinc-500">{label}</div>
            <div className="text-lg font-semibold text-white">{value}</div>
        </div>
    );
}
