'use client';

import { useState, useEffect } from 'react';
import {
    Loader2,
    Smartphone,
    User,
    Ghost,
    TrendingUp,
    AppWindow,
    Monitor,
    Calendar,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


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

export default function DeviceStatsOverview() {
    const [stats, setStats] = useState<DeviceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/device-stats');
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to fetch stats');
            }

            const data = await res.json();

            if (data) {
                setStats(data);
            } else {
                // Fallback struct if empty
                setStats({
                    total_devices: 0,
                    registered_users: 0,
                    guest_users: 0,
                    ios_devices: 0,
                    android_devices: 0,
                    web_devices: 0,
                    active_last_7_days: 0,
                    active_last_30_days: 0
                });
            }
        } catch (err: any) {
            console.error('Error fetching device stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                Hiba történt a statisztikák betöltésekor: {error}
            </div>
        );
    }

    if (!stats) return null;

    const conversionRate = stats.total_devices > 0
        ? ((stats.registered_users / stats.total_devices) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Összes Eszköz"
                    value={stats.total_devices.toLocaleString()}
                    icon={<Smartphone className="w-5 h-5 text-blue-500" />}
                    description="Összes telepítés"
                    color="blue"
                />
                <StatCard
                    title="Regisztrált Felhasználók"
                    value={stats.registered_users.toLocaleString()}
                    icon={<User className="w-5 h-5 text-green-500" />}
                    description="Fiókkal rendelkezők"
                    color="green"
                />
                <StatCard
                    title="Vendég Felhasználók"
                    value={stats.guest_users.toLocaleString()}
                    icon={<Ghost className="w-5 h-5 text-purple-500" />}
                    description="Fiók nélkül"
                    color="purple"
                />
                <StatCard
                    title="Konverziós Ráta"
                    value={`${conversionRate}%`}
                    icon={<TrendingUp className="w-5 h-5 text-yellow-500" />}
                    description="Guest → Regisztráció"
                    color="yellow"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Platform Distribution */}
                <Card className="bg-[#111111] border-white/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-zinc-400" />
                            Platform Megoszlás
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <PlatformBar
                                label="iOS"
                                count={stats.ios_devices}
                                total={stats.total_devices}
                                color="bg-blue-500"
                                icon={<AppWindow className="w-4 h-4" />}
                            />
                            <PlatformBar
                                label="Android"
                                count={stats.android_devices}
                                total={stats.total_devices}
                                color="bg-green-500"
                                icon={<Smartphone className="w-4 h-4" />}
                            />
                            <PlatformBar
                                label="Web"
                                count={stats.web_devices}
                                total={stats.total_devices}
                                color="bg-orange-500"
                                icon={<Monitor className="w-4 h-4" />}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Stats */}
                <Card className="bg-[#111111] border-white/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-zinc-400" />
                            Aktivitás
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-sm text-zinc-400 mb-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Utolsó 7 nap
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {stats.active_last_7_days.toLocaleString()}
                                </div>
                                <div className="text-xs text-zinc-500 mt-1">
                                    Aktív eszközök
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-sm text-zinc-400 mb-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Utolsó 30 nap
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {stats.active_last_30_days.toLocaleString()}
                                </div>
                                <div className="text-xs text-zinc-500 mt-1">
                                    Aktív eszközök
                                </div>
                            </div>
                        </div>

                        {stats.active_last_30_days > 0 && (
                            <div className="mt-6">
                                <div className="flex justify-between text-sm text-zinc-400 mb-2">
                                    <span>Retention (7 nap / 30 nap)</span>
                                    <span>{((stats.active_last_7_days / stats.active_last_30_days) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(((stats.active_last_7_days / stats.active_last_30_days) * 100), 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, description, color }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description: string;
    color: string
}) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
        green: 'bg-green-500/10 border-green-500/20 text-green-500',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
        yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    };

    return (
        <Card className="bg-[#111111] border-white/5">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                        {icon}
                    </div>
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
                    <div className="text-2xl font-bold text-white">{value}</div>
                    <p className="text-xs text-zinc-500">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function PlatformBar({ label, count, total, color, icon }: {
    label: string;
    count: number;
    total: number;
    color: string;
    icon: React.ReactNode;
}) {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                    {icon}
                    {label}
                </div>
                <div className="text-sm text-zinc-400">
                    {count} ({percentage.toFixed(1)}%)
                </div>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
