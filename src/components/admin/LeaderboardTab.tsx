'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Crown, Eye, EyeOff, Flag, Globe, Loader2, MapPin, Medal, Sparkles } from 'lucide-react';
import DetailModal from '@/components/admin/DetailModal';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { toast } from 'sonner';
import { writeAuditLog } from '@/lib/adminAuditLog';

const isDev = process.env.NODE_ENV === 'development';
type XpScope = 'global' | 'country' | 'city';

type City = { id: string; name: string; country_code?: string | null };
type LeaderboardTabProps = { cities: City[]; adminId: string | null };
type XpRow = {
    rank: number;
    user_id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    xp: number;
    home_city_name: string | null;
    country_code: string | null;
    show_on_regional_leaderboard: boolean;
    is_supporter: boolean;
};

const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-amber-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-zinc-300" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-700" />;
    return null;
};

export default function LeaderboardTab({ cities, adminId }: LeaderboardTabProps) {
    const [scope, setScope] = useState<XpScope>('global');
    const [cityId, setCityId] = useState('');
    const [country, setCountry] = useState('HU');
    const [includeOptedOut, setIncludeOptedOut] = useState(true);
    const [rows, setRows] = useState<XpRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggleId, setToggleId] = useState<string | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);
    const [userModal, setUserModal] = useState<{ open: boolean; item: unknown }>({ open: false, item: null });

    const countryCodes = useMemo(() => {
        const values = new Set(cities.map(city => city.country_code).filter((value): value is string => Boolean(value)));
        if (values.size === 0) values.add('HU');
        return Array.from(values).sort();
    }, [cities]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                if (scope === 'city' && !cityId) {
                    if (!cancelled) setRows([]);
                    return;
                }
                const { data, error } = await supabase.rpc('admin_get_regional_leaderboard', {
                    p_scope: scope,
                    p_city_id: scope === 'city' ? cityId : null,
                    p_country_code: scope === 'country' ? country : null,
                    p_include_opted_out: includeOptedOut,
                    p_limit: 200,
                });
                if (error) throw error;
                if (!cancelled) setRows((data || []) as XpRow[]);
            } catch (error) {
                if (isDev) console.error(error);
                toast.error('Hiba a ranglista betöltésekor');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void load();
        return () => { cancelled = true; };
    }, [scope, cityId, country, includeOptedOut, refreshTick]);

    const handleUserClick = async (userId: string) => {
        const { data } = await supabase.from('profiles')
            .select('id, username, full_name, email, avatar_url, role, created_at, phone')
            .eq('id', userId).single();
        if (data) setUserModal({ open: true, item: data });
    };

    const handleToggleVisibility = async (userId: string, currentlyVisible: boolean) => {
        setToggleId(userId);
        try {
            const { error } = await supabase.from('profiles')
                .update({ show_on_regional_leaderboard: !currentlyVisible }).eq('id', userId);
            if (error) throw error;
            await writeAuditLog({
                adminId,
                action: currentlyVisible ? 'regional_visibility_off' : 'regional_visibility_on',
                targetType: 'user',
                targetId: userId,
            });
            toast.success(currentlyVisible ? 'Felhasználó kivéve a regionális ranglistáról' : 'Felhasználó visszahelyezve a regionális ranglistára');
            setRefreshTick(value => value + 1);
        } catch (error) {
            if (isDev) console.error(error);
            toast.error('Hiba a regionális láthatóság módosítása során');
        } finally {
            setToggleId(null);
        }
    };

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
            <div className="flex flex-wrap items-center gap-3 px-2">
                <div className="flex gap-2">
                    {([['global', 'Globális', Globe], ['country', 'Országos', Flag], ['city', 'Városi', MapPin]] as const).map(([value, label, Icon]) => (
                        <button key={value} onClick={() => setScope(value)} className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border ${scope === value ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'}`}>
                            <Icon className="w-3.5 h-3.5" />{label}
                        </button>
                    ))}
                </div>
                {scope === 'country' && (
                    <select value={country} onChange={event => setCountry(event.target.value)} className="bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-1.5">
                        {countryCodes.map(code => <option key={code} value={code}>{code}</option>)}
                    </select>
                )}
                {scope === 'city' && (
                    <select value={cityId} onChange={event => setCityId(event.target.value)} className="bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-1.5">
                        <option value="">Válassz várost</option>
                        {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                    </select>
                )}
                {scope !== 'global' && (
                    <label className="flex items-center gap-2 text-xs text-zinc-300 ml-auto">
                        <input type="checkbox" checked={includeOptedOut} onChange={event => setIncludeOptedOut(event.target.checked)} className="w-4 h-4 accent-green-500" />
                        Opt-outolt felhasználók is
                    </label>
                )}
            </div>
            {loading ? <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div> : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"><Sparkles className="w-8 h-8 text-zinc-700 mb-4" /><p className="text-zinc-500 text-sm">Nincsenek XP-vel rendelkező felhasználók ezzel a szűrővel.</p></div>
            ) : (
                <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111]">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-[#111111]"><tr className="border-b border-white/5 bg-white/[0.02]"><th className="p-4 text-xs font-bold text-zinc-500">#</th><th className="p-4 text-xs font-bold text-zinc-500">Felhasználó</th><th className="p-4 text-xs font-bold text-zinc-500">XP</th><th className="p-4 text-xs font-bold text-zinc-500">Otthon</th>{scope !== 'global' && <><th className="p-4 text-xs font-bold text-zinc-500">Láthatóság</th><th className="p-4 text-xs font-bold text-zinc-500 text-right">Művelet</th></>}</tr></thead>
                        <tbody className="divide-y divide-white/5">{rows.map(row => {
                            const visible = row.show_on_regional_leaderboard;
                            const name = row.username || row.full_name || row.user_id.slice(0, 8);
                            return <tr key={row.user_id} className={`hover:bg-white/[0.04] ${!visible && scope !== 'global' ? 'opacity-60' : ''}`}>
                                <td className="p-4"><div className="flex items-center gap-2">{rankIcon(Number(row.rank))}<span className="text-sm font-bold font-mono text-zinc-300">{row.rank}</span></div></td>
                                <td className="p-4 cursor-pointer" onClick={() => void handleUserClick(row.user_id)}><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full overflow-hidden border border-white/10"><ImageWithFallback src={row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100'} alt={name} className="w-full h-full object-cover" /></div><span className="text-sm font-semibold text-white">{name}{row.is_supporter && <span className="text-amber-400 ml-1">★</span>}</span></div></td>
                                <td className="p-4 text-amber-400 font-bold font-mono text-sm">{row.xp}</td>
                                <td className="p-4 text-xs text-zinc-300"><span>{row.home_city_name || '-'}</span><span className="block text-[11px] text-zinc-600 font-mono">{row.country_code || '-'}</span></td>
                                {scope !== 'global' && <><td className="p-4 text-xs text-zinc-400">{visible ? <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3 text-green-500" /> Látható</span> : <span className="inline-flex items-center gap-1"><EyeOff className="w-3 h-3 text-red-400" /> Opt-out</span>}</td><td className="p-4 text-right"><button onClick={() => void handleToggleVisibility(row.user_id, visible)} disabled={toggleId === row.user_id} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border border-zinc-700 text-zinc-300 disabled:opacity-50">{visible ? <><EyeOff className="w-3 h-3" /> Kivesz</> : <><Eye className="w-3 h-3" /> Visszatesz</>}</button></td></>}
                            </tr>;
                        })}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
