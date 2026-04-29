'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Trophy,
    Crown,
    Medal,
    Loader2,
    Eye,
    EyeOff,
    Globe,
    Building2,
    ListChecks,
    Flag,
    Sparkles,
    MapPin,
} from 'lucide-react';
import DetailModal from '@/components/admin/DetailModal';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { toast } from 'sonner';
import { writeAuditLog } from '@/lib/adminAuditLog';

const isDev = process.env.NODE_ENV === 'development';

interface City {
    id: string;
    name: string;
    country_code?: string | null;
}

interface LeaderboardTabProps {
    cities: City[];
    adminId: string | null;
}

type Group = 'xp' | 'challenge';
type XpScope = 'global' | 'country' | 'city';
type ChallengeView = 'per_city' | 'attempts';

interface XpRow {
    rank: number;
    user_id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    xp: number;
    home_city_id: string | null;
    home_city_name: string | null;
    country_code: string | null;
    show_on_regional_leaderboard: boolean;
    is_supporter: boolean;
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
    // Top-level group: XP vs Challenge
    const [group, setGroup] = useState<Group>('xp');

    // XP-side state
    const [xpScope, setXpScope] = useState<XpScope>('global');
    const [xpCityId, setXpCityId] = useState<string>('');
    const [xpCountry, setXpCountry] = useState<string>('HU');
    const [xpRows, setXpRows] = useState<XpRow[]>([]);
    const [includeOptedOut, setIncludeOptedOut] = useState(true);

    // Challenge-side state
    const [challengeView, setChallengeView] = useState<ChallengeView>('per_city');
    const [challengeCityId, setChallengeCityId] = useState<string>('');
    const [perCityRows, setPerCityRows] = useState<PerCityRow[]>([]);
    const [attemptRows, setAttemptRows] = useState<AttemptRow[]>([]);
    const [showHidden, setShowHidden] = useState(false);

    // Shared state
    const [loading, setLoading] = useState(true);
    const [toggleId, setToggleId] = useState<string | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [userModal, setUserModal] = useState<{ open: boolean; item: any }>({ open: false, item: null });

    // Distinct country codes available across known cities (for the country picker).
    const countryCodes = useMemo(() => {
        const set = new Set<string>();
        for (const c of cities) {
            if (c.country_code) set.add(c.country_code);
        }
        // Default to HU even if cities lack country_code (live data shows HU only).
        if (set.size === 0) set.add('HU');
        return Array.from(set).sort();
    }, [cities]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                if (group === 'xp') {
                    if (xpScope === 'city' && !xpCityId) {
                        if (!cancelled) setXpRows([]);
                        return;
                    }
                    const { data, error } = await supabase.rpc('admin_get_regional_leaderboard', {
                        p_scope: xpScope,
                        p_city_id: xpScope === 'city' ? xpCityId : null,
                        p_country_code: xpScope === 'country' ? xpCountry : null,
                        p_include_opted_out: includeOptedOut,
                        p_limit: 200,
                    });
                    if (error) throw error;
                    const rows = (data || []) as XpRow[];
                    if (!cancelled) setXpRows(rows);
                } else if (group === 'challenge' && challengeView === 'per_city') {
                    if (!challengeCityId) {
                        if (!cancelled) setPerCityRows([]);
                        return;
                    }
                    const { data } = await supabase
                        .from('challenge_attempts')
                        .select('user_id, average_speed_kmh, distance_meters, daily_challenges!inner(city_id)')
                        .eq('status', 'completed')
                        .eq('daily_challenges.city_id', challengeCityId)
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
                        ? await supabase.from('profiles').select('id, username, full_name').in('id', userIds)
                        : { data: [] as { id: string; username?: string | null; full_name?: string | null }[] };
                    const profMap = Object.fromEntries((profs || []).map(p => [p.id, p]));
                    const rows: PerCityRow[] = Array.from(acc.values())
                        .map(a => ({
                            user_id: a.user_id,
                            username: profMap[a.user_id]?.username || profMap[a.user_id]?.full_name || null,
                            completions: a.completions,
                            avg_speed: a.completions > 0 ? a.speedSum / a.completions : 0,
                            total_distance_km: a.distSum / 1000,
                        }))
                        .sort((a, b) => b.completions - a.completions || b.avg_speed - a.avg_speed)
                        .slice(0, 100);
                    if (!cancelled) setPerCityRows(rows);
                } else if (group === 'challenge' && challengeView === 'attempts') {
                    const baseSelect = 'id, user_id, duration_seconds, average_speed_kmh, distance_meters, xp_awarded, hidden_from_leaderboard, daily_challenges!inner(challenge_date, city_id, cities(name))';
                    let q = supabase
                        .from('challenge_attempts')
                        .select(baseSelect)
                        .eq('status', 'completed')
                        .order('duration_seconds', { ascending: true, nullsFirst: false })
                        .limit(100);
                    if (challengeCityId) q = q.eq('daily_challenges.city_id', challengeCityId);
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
    }, [group, xpScope, xpCityId, xpCountry, includeOptedOut, challengeView, challengeCityId, showHidden, refreshTick]);

    const handleUserClick = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('id, username, full_name, email, avatar_url, role, created_at, phone')
            .eq('id', userId)
            .single();
        if (data) setUserModal({ open: true, item: data });
    };

    const handleToggleAttemptHidden = async (id: string, currentlyHidden: boolean) => {
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

    const handleToggleRegionalVisibility = async (userId: string, currentlyVisible: boolean) => {
        setToggleId(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ show_on_regional_leaderboard: !currentlyVisible })
                .eq('id', userId);
            if (error) throw error;
            await writeAuditLog({
                adminId,
                action: currentlyVisible ? 'regional_visibility_off' : 'regional_visibility_on',
                targetType: 'user',
                targetId: userId,
            });
            toast.success(currentlyVisible ? 'Felhasználó kivéve a regionális ranglistáról' : 'Felhasználó visszahelyezve a regionális ranglistára');
            setRefreshTick(t => t + 1);
        } catch (err) {
            if (isDev) console.error(err);
            toast.error('Hiba a regionális láthatóság módosítása során');
        } finally {
            setToggleId(null);
        }
    };

    // Renderers ---------------------------------------------------------------

    const groupBtn = (g: Group, label: string, Icon: typeof Globe) => (
        <button
            onClick={() => setGroup(g)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${group === g
                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                }`}
        >
            <Icon className="w-3.5 h-3.5" />
            {label}
        </button>
    );

    const subBtn = <T,>(active: T, value: T, onClick: () => void, label: string, Icon: typeof Globe) => (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${active === value
                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                }`}
        >
            <Icon className="w-3.5 h-3.5" />
            {label}
        </button>
    );

    const renderToolbar = () => (
        <div className="flex flex-col gap-3 px-2">
            {/* Group selector + scope hint */}
            <div className="flex flex-wrap items-center gap-2">
                {groupBtn('xp', 'XP rangsor', Sparkles)}
                {groupBtn('challenge', 'Kihívások', Trophy)}
                <span className="text-[11px] text-zinc-600 ml-2 hidden sm:inline">
                    {group === 'xp'
                        ? 'Általános XP-alapú rangsor — global / országos / városi szinttel'
                        : 'Kihívás-teljesítések ideje és aggregátumok'}
                </span>
            </div>

            {/* Sub-scope toolbar */}
            {group === 'xp' ? (
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2">
                        {subBtn(xpScope, 'global', () => setXpScope('global'), 'Globális', Globe)}
                        {subBtn(xpScope, 'country', () => setXpScope('country'), 'Országos', Flag)}
                        {subBtn(xpScope, 'city', () => setXpScope('city'), 'Városi', MapPin)}
                    </div>

                    {xpScope === 'country' && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Ország:</span>
                            <select
                                value={xpCountry}
                                onChange={(e) => setXpCountry(e.target.value)}
                                className="bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500/50"
                            >
                                {countryCodes.map(cc => <option key={cc} value={cc}>{cc}</option>)}
                            </select>
                        </div>
                    )}
                    {xpScope === 'city' && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Város:</span>
                            <select
                                value={xpCityId}
                                onChange={(e) => setXpCityId(e.target.value)}
                                className="bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500/50"
                            >
                                <option value="">— Válassz várost —</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    {xpScope !== 'global' && (
                        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none ml-auto">
                            <input
                                type="checkbox"
                                checked={includeOptedOut}
                                onChange={e => setIncludeOptedOut(e.target.checked)}
                                className="w-4 h-4 accent-green-500"
                            />
                            Opt-outolt felhasználók is
                        </label>
                    )}
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2">
                        {subBtn(challengeView, 'per_city', () => setChallengeView('per_city'), 'Városonként', Building2)}
                        {subBtn(challengeView, 'attempts', () => setChallengeView('attempts'), 'Próbák', ListChecks)}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Város:</span>
                        <select
                            value={challengeCityId}
                            onChange={(e) => setChallengeCityId(e.target.value)}
                            className="bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500/50"
                        >
                            <option value="">{challengeView === 'per_city' ? '— Válassz várost —' : 'Minden város'}</option>
                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    {challengeView === 'attempts' && (
                        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none ml-auto">
                            <input
                                type="checkbox"
                                checked={showHidden}
                                onChange={e => setShowHidden(e.target.checked)}
                                className="w-4 h-4 accent-green-500"
                            />
                            Rejtett sorok mutatása
                        </label>
                    )}
                </div>
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

    const renderXp = () => {
        const isGlobal = xpScope === 'global';
        return (
            <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111]">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#111111]">
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-12">#</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Felhasználó</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">XP</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Otthon</th>
                            {!isGlobal && (
                                <>
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Regionális láthatóság</th>
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Művelet</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {xpRows.map((r) => {
                            const visible = r.show_on_regional_leaderboard;
                            const displayName = r.username || r.full_name || String(r.user_id).slice(0, 8);
                            return (
                                <tr key={r.user_id} className={`hover:bg-white/[0.04] transition-colors ${!visible && !isGlobal ? 'opacity-60' : ''}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {rankIcon(Number(r.rank))}
                                            <span className={`text-sm font-bold font-mono ${Number(r.rank) <= 3 ? 'text-white' : 'text-zinc-400'}`}>{r.rank}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 cursor-pointer" onClick={() => handleUserClick(r.user_id)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                                                <ImageWithFallback
                                                    src={r.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100'}
                                                    alt={displayName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                                                    {displayName}
                                                    {r.is_supporter && (
                                                        <span title="Támogató" className="text-amber-400">★</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-amber-400 font-bold font-mono text-sm">{r.xp}</td>
                                    <td className="p-4 text-xs text-zinc-300">
                                        <div className="flex flex-col">
                                            <span>{r.home_city_name || '—'}</span>
                                            <span className="text-[11px] text-zinc-600 font-mono">{r.country_code || '—'}</span>
                                        </div>
                                    </td>
                                    {!isGlobal && (
                                        <>
                                            <td className="p-4">
                                                {visible ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-green-500/10 text-green-500 border-green-500/20">
                                                        <Eye className="w-3 h-3" /> Látható
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-red-500/10 text-red-400 border-red-500/20">
                                                        <EyeOff className="w-3 h-3" /> Opt-out
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleToggleRegionalVisibility(r.user_id, visible)}
                                                    disabled={toggleId === r.user_id}
                                                    className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${visible
                                                        ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                        : 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                        }`}
                                                    title={visible ? 'Eltávolít a regionális listáról' : 'Visszateszi a regionális listára'}
                                                >
                                                    {visible ? <><EyeOff className="w-3 h-3" /> Kivesz</> : <><Eye className="w-3 h-3" /> Visszatesz</>}
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

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
                            <tr key={r.user_id} onClick={() => handleUserClick(r.user_id)} className="hover:bg-white/[0.04] transition-colors cursor-pointer">
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
                                        onClick={() => handleToggleAttemptHidden(r.id, hidden)}
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
        if (group === 'xp') return xpRows.length === 0;
        if (challengeView === 'per_city') return perCityRows.length === 0;
        return attemptRows.length === 0;
    }, [group, challengeView, xpRows, perCityRows, attemptRows]);

    const emptyMsg = useMemo(() => {
        if (group === 'xp') {
            if (xpScope === 'city' && !xpCityId) return 'Válassz egy várost a városi XP rangsor megtekintéséhez.';
            return 'Nincsenek XP-vel rendelkező felhasználók ezzel a szűrővel.';
        }
        if (challengeView === 'per_city' && !challengeCityId) return 'Válassz egy várost a rangsor megtekintéséhez.';
        return 'Nincsenek bejegyzések ezzel a szűrővel.';
    }, [group, xpScope, xpCityId, challengeView, challengeCityId]);

    return (
        <div className="flex flex-col gap-4 h-full">
            <DetailModal
                isOpen={userModal.open}
                onClose={() => setUserModal({ open: false, item: null })}
                item={userModal.item}
                type="user"
                onEdit={() => {}}
                onStatusChange={() => {}}
            />
            {renderToolbar()}
            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
            ) : isEmpty ? (
                <Empty msg={emptyMsg} />
            ) : group === 'xp' ? renderXp()
                : challengeView === 'per_city' ? renderPerCity()
                    : renderAttempts()}
        </div>
    );
}
