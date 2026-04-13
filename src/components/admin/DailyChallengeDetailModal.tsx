'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, X, MapPin, Flag, Calendar, Mountain, Gauge, Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import InteractiveRouteMap from './InteractiveRouteMap';
import { writeAuditLog } from '@/lib/adminAuditLog';

interface DailyChallengeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    challenge: any | null;
    adminId: string | null;
}

interface AttemptRow {
    id: string;
    user_id: string;
    profiles?: { username?: string | null; full_name?: string | null } | null;
    status: string;
    distance_meters: number | null;
    average_speed_kmh: number | null;
    duration_seconds: number | null;
    xp_awarded: number | null;
    hidden_from_leaderboard: boolean;
}

type Pt = [number, number]; // [lng, lat]

function extractPoints(challenge: { route_points?: unknown; start_lat?: number; start_lng?: number; finish_lat?: number; finish_lng?: number }): Pt[] {
    const rp = challenge.route_points;
    if (Array.isArray(rp) && rp.length > 0) {
        const pts = (rp as unknown[])
            .map(p => {
                if (Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number') {
                    return [p[0], p[1]] as Pt;
                }
                if (p && typeof p === 'object') {
                    const o = p as { lng?: number; lon?: number; lat?: number };
                    const lng = o.lng ?? o.lon;
                    const lat = o.lat;
                    if (typeof lng === 'number' && typeof lat === 'number') return [lng, lat] as Pt;
                }
                return null;
            })
            .filter((v): v is Pt => v !== null);
        if (pts.length > 0) return pts;
    }
    // Fallback: just start → finish line
    if (
        typeof challenge.start_lat === 'number' && typeof challenge.start_lng === 'number' &&
        typeof challenge.finish_lat === 'number' && typeof challenge.finish_lng === 'number'
    ) {
        return [[challenge.start_lng, challenge.start_lat], [challenge.finish_lng, challenge.finish_lat]];
    }
    return [];
}

export default function DailyChallengeDetailModal({ isOpen, onClose, challenge, adminId }: DailyChallengeDetailModalProps) {
    const points = useMemo(() => challenge ? extractPoints(challenge) : [], [challenge]);
    const [attempts, setAttempts] = useState<AttemptRow[]>([]);
    const [attemptsLoading, setAttemptsLoading] = useState(false);
    const [toggleId, setToggleId] = useState<string | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);

    useEffect(() => {
        if (!isOpen || !challenge?.id) return;
        let cancelled = false;
        const load = async () => {
            setAttemptsLoading(true);
            try {
                const { data } = await supabase
                    .from('challenge_attempts')
                    .select('id, user_id, status, distance_meters, average_speed_kmh, duration_seconds, xp_awarded, hidden_from_leaderboard')
                    .eq('challenge_id', challenge.id)
                    .order('duration_seconds', { ascending: true, nullsFirst: false })
                    .limit(200);
                const rows = (data || []) as AttemptRow[];
                const userIds = Array.from(new Set(rows.map(r => r.user_id).filter(Boolean)));
                const { data: profs } = userIds.length
                    ? await supabase.from('profiles').select('id, username, full_name').in('id', userIds)
                    : { data: [] as { id: string; username?: string | null; full_name?: string | null }[] };
                const profMap = Object.fromEntries((profs || []).map(p => [p.id, p]));
                if (!cancelled) setAttempts(rows.map(r => ({ ...r, profiles: profMap[r.user_id] || null })));
            } catch (err) {
                if (process.env.NODE_ENV === 'development') console.error(err);
            } finally {
                if (!cancelled) setAttemptsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [isOpen, challenge?.id, refreshTick]);

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
            if (process.env.NODE_ENV === 'development') console.error(err);
            toast.error('Hiba a státusz módosítása során');
        } finally {
            setToggleId(null);
        }
    };

    if (!challenge) return null;

    const km = challenge.distance_meters ? (challenge.distance_meters / 1000).toFixed(2) : '-';
    const elevation = challenge.elevation_gain_m ? Math.round(challenge.elevation_gain_m) : 0;
    const source: string = challenge.generation_source || 'auto';
    const cityName = challenge.cities?.name || '-';

    return (
        <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-3xl p-0 gap-0 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <DialogTitle className="flex items-center gap-3 text-lg font-bold text-white">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-amber-500" />
                        </div>
                        Napi kihívás részletei
                    </DialogTitle>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/10">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <ScrollArea className="max-h-[75vh]">
                    <div className="p-5 space-y-5">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {challenge.challenge_date
                                    ? new Date(challenge.challenge_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
                                    : 'Ismeretlen dátum'}
                            </h2>
                            <p className="text-sm text-zinc-500 mt-1">{cityName} · Forrás: <span className="uppercase text-zinc-300">{source}</span></p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-2 text-[11px] text-zinc-500 uppercase tracking-wider font-bold">
                                    <Gauge className="w-3 h-3" /> Távolság
                                </div>
                                <p className="mt-1 text-sm text-zinc-100 font-mono">{km} km</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-2 text-[11px] text-zinc-500 uppercase tracking-wider font-bold">
                                    <Mountain className="w-3 h-3" /> Szint+
                                </div>
                                <p className="mt-1 text-sm text-zinc-100 font-mono">{elevation} m</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-2 text-[11px] text-zinc-500 uppercase tracking-wider font-bold">
                                    <Calendar className="w-3 h-3" /> Generálva
                                </div>
                                <p className="mt-1 text-[11px] text-zinc-300">
                                    {challenge.generated_at ? new Date(challenge.generated_at).toLocaleString('hu-HU') : '-'}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-2 text-[11px] text-zinc-500 uppercase tracking-wider font-bold">
                                    <Building2 className="w-3 h-3" /> Város
                                </div>
                                <p className="mt-1 text-sm text-zinc-100">{cityName}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Útvonal ({points.length} pont)</h3>
                            <div className="rounded-xl border border-white/10 overflow-hidden">
                                {points.length >= 1 ? (
                                    <InteractiveRouteMap points={points} height={360} />
                                ) : (
                                    <div className="flex items-center justify-center h-40 text-sm text-zinc-500 bg-zinc-900/40">
                                        Nincs útvonal adat ehhez a kihíváshoz
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                                <div className="flex items-center gap-2 text-[11px] text-green-500 uppercase tracking-wider font-bold">
                                    <MapPin className="w-3 h-3" /> Start (A)
                                </div>
                                <p className="mt-1 text-xs text-zinc-300 font-mono">
                                    {typeof challenge.start_lat === 'number' && typeof challenge.start_lng === 'number'
                                        ? `${challenge.start_lat.toFixed(5)}, ${challenge.start_lng.toFixed(5)}`
                                        : '-'}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <div className="flex items-center gap-2 text-[11px] text-blue-400 uppercase tracking-wider font-bold">
                                    <Flag className="w-3 h-3" /> Finish (B)
                                </div>
                                <p className="mt-1 text-xs text-zinc-300 font-mono">
                                    {typeof challenge.finish_lat === 'number' && typeof challenge.finish_lng === 'number'
                                        ? `${challenge.finish_lat.toFixed(5)}, ${challenge.finish_lng.toFixed(5)}`
                                        : '-'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Próbák ({attempts.length})
                            </h3>
                            {attemptsLoading ? (
                                <div className="flex items-center justify-center py-6 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                                </div>
                            ) : attempts.length === 0 ? (
                                <div className="py-6 text-center text-xs text-zinc-500 bg-white/[0.02] border border-white/5 rounded-xl">
                                    Még nincs próba ehhez a kihíváshoz
                                </div>
                            ) : (
                                <div className="rounded-xl border border-white/5 overflow-hidden">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead className="bg-white/[0.03]">
                                            <tr className="border-b border-white/5">
                                                <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Felhasználó</th>
                                                <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Státusz</th>
                                                <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Idő</th>
                                                <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Átl. seb.</th>
                                                <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Táv</th>
                                                <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">XP</th>
                                                <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">Ranglista</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {attempts.map(a => {
                                                const dur = a.duration_seconds ? `${Math.floor(a.duration_seconds / 60)}:${String(a.duration_seconds % 60).padStart(2, '0')}` : '-';
                                                const username = a.profiles?.username || a.profiles?.full_name || String(a.user_id).slice(0, 8);
                                                const hidden = !!a.hidden_from_leaderboard;
                                                return (
                                                    <tr key={a.id} className={hidden ? 'opacity-50' : ''}>
                                                        <td className="p-2 text-zinc-200">{username}</td>
                                                        <td className="p-2">
                                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${a.status === 'completed' ? 'bg-green-500/10 text-green-400' : a.status === 'abandoned' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                                                {a.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-2 text-zinc-300 font-mono">{dur}</td>
                                                        <td className="p-2 text-zinc-300 font-mono">{a.average_speed_kmh != null ? Number(a.average_speed_kmh).toFixed(1) : '-'}</td>
                                                        <td className="p-2 text-zinc-300 font-mono">{a.distance_meters ? (a.distance_meters / 1000).toFixed(2) : '-'} km</td>
                                                        <td className="p-2 text-amber-400 font-bold">{a.xp_awarded ?? 0}</td>
                                                        <td className="p-2 text-right">
                                                            <button
                                                                onClick={() => handleToggleHidden(a.id, hidden)}
                                                                disabled={toggleId === a.id || a.status !== 'completed'}
                                                                title={a.status !== 'completed' ? 'Csak teljesített próba rejthető' : (hidden ? 'Visszaállít' : 'Rejt')}
                                                                className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${hidden ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'}`}
                                                            >
                                                                {hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="text-[11px] text-zinc-600">
                            ID: <span className="font-mono">{challenge.id}</span>
                        </div>
                    </div>
                </ScrollArea>

                <div className="flex items-center justify-end gap-2 p-4 border-t border-white/5 bg-[#0a0a0a]">
                    <Button variant="outline" onClick={onClose} className="border-white/10 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                        Bezár
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
