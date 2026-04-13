'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Crown, Medal, Loader2, Eye, EyeOff, Globe, Building2, ListChecks } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { toast } from 'sonner';
import { writeAuditLog } from '@/lib/adminAuditLog';

const isDev = process.env.NODE_ENV === 'development';

interface City { id: string; name: string }

interface LeaderboardTabProps {
    cities: City[];
    adminId: string | null;
}

type View = 'global' | 'per_city' | 'attempts';

interface GlobalRow {
    user_id: string;
    username: string | null;
    avatar_url: string | null;
    xp: number;
    current_streak: number;
    longest_streak: number;
    badge_count: number;
}

interface PerCityRow {
    user_id: string;
    username: string | null;
    completions: number;
    avg_speed: number;
    total_distance_km: number;
}

interface AttemptRow {
    id: string;
    user_id: string;
    profiles?: { username?: string | null; full_name?: string | null } | null;
    duration_seconds: number | null;
    average_speed_kmh: number | null;
    distance_meters: number | null;
    xp_awarded: number | null;
    hidden_from_leaderboard: boolean;
    daily_challenges?: { challenge_date?: string | null; cities?: { name?: string | null } | null } | null;
}

const rankIcon = (r: number) => {
    if (r === 1) return <Crown className="w-4 h-4 text-amber-400" />;
    if (r === 2) return <Medal className="w-4 h-4 text-zinc-300" />;
    if (r === 3) return <Medal className="w-4 h-4 text-amber-700" />;
    return null;
};

export default function LeaderboardTab({ cities, adminId }: LeaderboardTabProps) {
    const [view, setView] = useState<View>('global');
    const [cityId, setCityId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [globalRows, setGlobalRows] = useState<GlobalRow[]>([]);
    const [perCityRows, setPerCityRows] = useState<PerCityRow[]>([]);
    const [attemptRows, setAttemptRows] = useState<AttemptRow[]>([]);
    const [showHidden, setShowHidden] = useState(false);
    const [toggleId, setToggleId] = useState<string | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                if (view === 'global') {
                    const { data } = await supabase
                        .from('user_progress')
                        .select('*')
                        .order('xp', { ascending: false })
                        .limit(100);
                    if (!data) { if (!cancelled) setGlobalRows([]); return; }
                    const userIds = data.map(r => r.user_id).filter(Boolean);
                    const { data: profs } = userIds.length
                        ? await supabase.from('profiles').select('id, username, avatar_url').in('id', userIds)
                        : { data: [] as { id: string; username?: string | null; avatar_url?: string | null }[] };
                    const profMap = Object.fromEntries((profs || []).map(p => [p.id, p]));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const rows: GlobalRow[] = data.map((r: any) => {
                        const badgeCount = Object.entries(r)
                            .filter(([k, v]) => k.startsWith('badge_') && typeof v === 'number')
                            .reduce((sum, [, v]) => sum + (v as number), 0);
                        return {
                            user_id: r.user_id,
                            username: profMap[r.user_id]?.username ?? null,
                            avatar_url: profMap[r.user_id]?.avatar_url ?? null,
                            xp: r.xp ?? 0,
                            current_streak: r.current_streak ?? 0,
                            longest_streak: r.longest_streak ?? 0,
                            badge_count: badgeCount,
                        };
                    });
                    if (!cancelled) setGlobalRows(rows);
                } else if (view === 'per_city') {
                    if (!cityId) { if (!cancelled) setPerCityRows([]); return; }
                    // Fetch completed attempts for this city, then aggregate client-side.
                    const { data } = await supabase
                        .from('challenge_attempts')
                        .select('user_id, average_speed_kmh, distance_meters, daily_challenges!inner(city_id)')
                        .eq('status', 'completed')
                        .eq('daily_challenges.city_id', cityId)
                        .eq('hidden_from_leaderboard', false);
                    const acc = new Map<string, { user_id: string; completions: number; speedSum: number; distSum: number }>();
                    for (const r of (data || []) as { user_id: string; average_speed_kmh: number | null; distance_meters: number | null }[]) {
                        const cur = acc.get(r.user_id) || { user_id: r.user_id, completions: 0, speedSum: 0, distSum: 0 };
                        cur.completions += 1;
                        cur.speedSum += Number(r.average_speed_kmh ?? 0);
                        cur.distSum += Number(r.distance_meters ?? 0);
                        acc.set(r.user_id, cur);
                    }
                    const userIds = Array.from(acc.keys());
                    const { data: profs } = userIds.length
                        ? await supabase.from('profiles').select('id, username').in('id', userIds)
                        : { data: [] as { id: string; username?: string | null }[] };
                    const profMap = Object.fromEntries((profs || []).map(p => [p.id, p]));
                    const rows: PerCityRow[] = Array.from(acc.values())
                        .map(a => ({
                            user_id: a.user_id,
                            username: profMap[a.user_id]?.username ?? null,
                            completions: a.completions,
                            avg_speed: a.completions > 0 ? a.speedSum / a.completions : 0,
                            total_distance_km: a.distSum / 1000,
                        }))
                        .sort((a, b) => b.completions - a.completions || b.avg_speed - a.avg_speed)
                        .slice(0, 100);
                    if (!cancelled) setPerCityRows(rows);
                } else if (view === 'attempts') {
                    const baseSelect = 'id, user_id, duration_seconds, average_speed_kmh, distance_meters, xp_awarded, hidden_from_leaderboard, daily_challenges!inner(challenge_date, city_id, cities(name))';
                    let q = supabase
                        .from('challenge_attempts')
                        .select(baseSelect)
                        .eq('status', 'completed')
                        .order('duration_seconds', { ascending: true, nullsFirst: false })
                        .limit(100);
                    if (cityId) q = q.eq('daily_challenges.city_id', cityId);
                    if (!showHidden) q = q.eq('hidden_from_leaderboard', false);
                    const { data } = await q;
                    const rows = (data || []) as unknown as AttemptRow[];
                    const userIds = Array.from(new Set(rows.map(r => r.user_id).filter(Boolean)));
                    const { data: profs } = userIds.length
                        ? await supabase.from('profiles').select('id, username, full_name').in('id', userIds)
                        : { data: [] as { id: string; username?: string | null; full_name?: string | null }[] };
                    const profMap = Object.fromEntries((profs || []).map(p => [p.id, p]));
                    if (!cancelled) setAttemptRows(rows.map(r => ({ ...r, profiles: profMap[r.user_id] || null })));
                }
            } catch (err) {
                if (isDev) console.error(err);
                toast.error('Hiba a ranglista betöltésekor');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [view, cityId, showHidden, refreshTick]);

    const handleToggleHidden = async (id: string, currentlyHidden: boolean) => {
        setToggleId(id);
        try {
            const { error } = await supabase
                .from('challenge_attempts')
                .update({ hidden_from_leaderboard: !currentlyHidden })
                .eq('id', id);
            if (error) throw error;
            await writeAuditLog({
                adminId,
                action: currentlyHidden ? 'show_on_leaderboard' : 'hide_from_leaderboard',
                targetType: 'challenge_attempt',
                targetId: id,
            });
            toast.success(currentlyHidden ? 'Mutatva a ranglistán' : 'Rejtve a ranglistáról');
            setRefreshTick(t => t + 1);
        } catch (err) {
            if (isDev) console.error(err);
            toast.error('Hiba a státusz módosítása során');
        } finally {
            setToggleId(null);
        }
    };

    const segmentBtn = (v: View, label: string, Icon: typeof Globe) => (
        <button
            onClick={() => setView(v)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${view === v
                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                }`}
        >
            <Icon className="w-3.5 h-3.5" />
            {label}
        </button>
    );

    const renderToolbar = () => (
        <div className="flex flex-wrap items-center gap-3 px-2">
            <div className="flex gap-2">
                {segmentBtn('global', 'Globális', Globe)}
                {segmentBtn('per_city', 'Városonként', Building2)}
                {segmentBtn('attempts', 'Próbák', ListChecks)}
            </div>
            {(view === 'per_city' || view === 'attempts') && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Város:</span>
                    <select
                        value={cityId}
                        onChange={(e) => setCityId(e.target.value)}
                        className="bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500/50"
                    >
                        <option value="">{view === 'per_city' ? '— Válassz várost —' : 'Minden város'}</option>
                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            )}
            {view === 'attempts' && (
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none ml-auto">
                    <input type="checkbox" checked={showHidden} onChange={e => setShowHidden(e.target.checked)} className="w-4 h-4 accent-green-500" />
                    Rejtett sorok mutatása
                </label>
            )}
        </div>
    );

    const Empty = ({ msg }: { msg: string }) => (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-zinc-700" />
            </div>
            <p className="text-zinc-500 text-sm">{msg}</p>
        </div>
    );

    const renderGlobal = () => (
        <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111]">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#111111]">
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-12">#</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Felhasználó</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">XP</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Streak</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Leghosszabb</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Badge-ek</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {globalRows.map((r, i) => {
                        const rank = i + 1;
                        return (
                            <tr key={r.user_id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {rankIcon(rank)}
                                        <span className={`text-sm font-bold font-mono ${rank <= 3 ? 'text-white' : 'text-zinc-400'}`}>{rank}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                                            <ImageWithFallback
                                                src={r.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100'}
                                                alt={r.username || 'User'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-sm font-semibold text-white">{r.username || String(r.user_id).slice(0, 8)}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-amber-400 font-bold font-mono text-sm">{r.xp}</td>
                                <td className="p-4 text-zinc-300 font-mono text-xs">🔥 {r.current_streak}</td>
                                <td className="p-4 text-zinc-500 font-mono text-xs">{r.longest_streak}</td>
                                <td className="p-4 text-zinc-300 font-mono text-xs">{r.badge_count}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    const renderPerCity = () => (
        <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111]">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#111111]">
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-12">#</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Felhasználó</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Teljesítések</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Átlag seb.</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Össztáv</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {perCityRows.map((r, i) => {
                        const rank = i + 1;
                        return (
                            <tr key={r.user_id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {rankIcon(rank)}
                                        <span className={`text-sm font-bold font-mono ${rank <= 3 ? 'text-white' : 'text-zinc-400'}`}>{rank}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-semibold text-white">{r.username || String(r.user_id).slice(0, 8)}</td>
                                <td className="p-4 text-zinc-300 font-mono text-sm">{r.completions}</td>
                                <td className="p-4 text-zinc-300 font-mono text-xs">{r.avg_speed.toFixed(1)} km/h</td>
                                <td className="p-4 text-zinc-300 font-mono text-xs">{r.total_distance_km.toFixed(2)} km</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    const renderAttempts = () => (
        <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111]">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#111111]">
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-12">#</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Felhasználó</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Város / Dátum</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Idő</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Átlag seb.</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Távolság</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">XP</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Láthatóság</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Művelet</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {attemptRows.map((r, i) => {
                        const rank = i + 1;
                        const dur = r.duration_seconds ? `${Math.floor(r.duration_seconds / 60)}:${String(r.duration_seconds % 60).padStart(2, '0')}` : '-';
                        const cityName = r.daily_challenges?.cities?.name || '-';
                        const date = r.daily_challenges?.challenge_date ? new Date(r.daily_challenges.challenge_date).toLocaleDateString('hu-HU', { year: '2-digit', month: 'short', day: 'numeric' }) : '-';
                        const username = r.profiles?.username || r.profiles?.full_name || String(r.user_id).slice(0, 8);
                        const hidden = !!r.hidden_from_leaderboard;
                        return (
                            <tr key={r.id} className={`hover:bg-white/[0.02] transition-colors ${hidden ? 'opacity-50' : ''}`}>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {rankIcon(rank)}
                                        <span className={`text-sm font-bold font-mono ${rank <= 3 ? 'text-white' : 'text-zinc-400'}`}>{rank}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-semibold text-white">{username}</td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-zinc-300">{cityName}</span>
                                        <span className="text-[11px] text-zinc-500">{date}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-zinc-100 font-mono">{dur}</td>
                                <td className="p-4 text-xs text-zinc-300 font-mono">{r.average_speed_kmh != null ? Number(r.average_speed_kmh).toFixed(1) : '-'} km/h</td>
                                <td className="p-4 text-xs text-zinc-300 font-mono">{r.distance_meters ? (r.distance_meters / 1000).toFixed(2) : '-'} km</td>
                                <td className="p-4 text-xs text-amber-400 font-bold">{r.xp_awarded ?? 0}</td>
                                <td className="p-4">
                                    {hidden ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-red-500/10 text-red-400 border-red-500/20">
                                            <EyeOff className="w-3 h-3" /> Rejtett
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-green-500/10 text-green-500 border-green-500/20">
                                            <Eye className="w-3 h-3" /> Látható
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleToggleHidden(r.id, hidden)}
                                        disabled={toggleId === r.id}
                                        className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${hidden
                                            ? 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                            : 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                            }`}
                                    >
                                        {hidden ? <><Eye className="w-3 h-3" /> Visszaállít</> : <><EyeOff className="w-3 h-3" /> Rejt</>}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    const isEmpty = useMemo(() => {
        if (view === 'global') return globalRows.length === 0;
        if (view === 'per_city') return perCityRows.length === 0;
        return attemptRows.length === 0;
    }, [view, globalRows, perCityRows, attemptRows]);

    return (
        <div className="flex flex-col gap-4 h-full">
            {renderToolbar()}
            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
            ) : isEmpty ? (
                <Empty msg={
                    view === 'per_city' && !cityId
                        ? 'Válassz egy várost a rangsor megtekintéséhez.'
                        : 'Nincsenek bejegyzések ezzel a szűrővel.'
                } />
            ) : view === 'global' ? renderGlobal()
                : view === 'per_city' ? renderPerCity()
                    : renderAttempts()}
        </div>
    );
}
