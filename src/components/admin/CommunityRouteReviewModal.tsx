'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Route,
    Save,
    Loader2,
    CheckCircle2,
    XCircle,
    Search,
    Clock,
    User,
    Calendar,
    Star,
    ExternalLink,
    Pencil,
    ChevronDown,
    Copy,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import InteractiveRouteMap from './InteractiveRouteMap';

type Pt = [number, number]; // [lng, lat]

function extractLngLatPoints(raw: unknown): Pt[] {
    if (!raw) return [];
    if (typeof raw === 'object' && raw !== null && 'coordinates' in raw) {
        const coords = (raw as { coordinates?: unknown }).coordinates;
        if (Array.isArray(coords)) return extractLngLatPoints(coords);
    }
    if (!Array.isArray(raw)) return [];
    const out: Pt[] = [];
    for (const p of raw) {
        if (Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number') {
            out.push([p[0], p[1]]);
            continue;
        }
        if (p && typeof p === 'object') {
            const o = p as { lng?: number; lon?: number; longitude?: number; lat?: number; latitude?: number };
            const lng = o.lng ?? o.lon ?? o.longitude;
            const lat = o.lat ?? o.latitude;
            if (typeof lng === 'number' && typeof lat === 'number') out.push([lng, lat]);
        }
    }
    return out;
}

function haversineKm(pts: Pt[]): number {
    if (pts.length < 2) return 0;
    const R = 6371;
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
        const [lng1, lat1] = pts[i - 1];
        const [lng2, lat2] = pts[i];
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        total += 2 * R * Math.asin(Math.sqrt(a));
    }
    return total;
}

function copyId(id: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(id).then(
            () => toast.success('ID vágólapra másolva'),
            () => toast.error('Másolás sikertelen')
        );
    }
}

interface CommunityRouteReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    route: any | null;
    onSuccess: () => void;
}

const REJECT_REASONS = [
    'duplikáció — már létezik a térképen',
    'nem létező út',
    'pontatlan rajz',
    'OSM-en már szerepel',
    'nem kerékpárút',
    'egyéb (lásd jegyzet)',
];

const statusMeta: Record<string, { label: string; className: string; icon: typeof Clock }> = {
    pending: { label: 'Függőben', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
    in_review: { label: 'Vizsgálat alatt', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Search },
    accepted: { label: 'Elfogadva', className: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
    rejected: { label: 'Elutasítva', className: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
};

type Status = 'pending' | 'in_review' | 'accepted' | 'rejected';

export default function CommunityRouteReviewModal({ isOpen, onClose, route, onSuccess }: CommunityRouteReviewModalProps) {
    const [adminNotes, setAdminNotes] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<Status>('pending');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setAdminNotes(route?.admin_notes ?? '');
        setSelectedStatus((route?.status as Status) ?? 'pending');
    }, [route, isOpen]);

    const points = useMemo<Pt[]>(() => {
        if (!route) return [];
        const fromGeom = extractLngLatPoints(route.geometry);
        if (fromGeom.length >= 2) return fromGeom;
        return extractLngLatPoints(route.points);
    }, [route]);

    const mid = useMemo(() => {
        if (points.length === 0) return null;
        let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
        for (const [lng, lat] of points) {
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
        }
        return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
    }, [points]);

    const lengthKm = useMemo(() => haversineKm(points), [points]);

    if (!route) return null;

    const currentMeta = statusMeta[route.status] || statusMeta.pending;
    const CurrentIcon = currentMeta.icon;

    const osmEditUrl = mid ? `https://www.openstreetmap.org/edit?#map=17/${mid.lat.toFixed(5)}/${mid.lng.toFixed(5)}` : null;
    const googleMapsUrl = points.length >= 2
        ? `https://www.google.com/maps/dir/?api=1&origin=${points[0][1]},${points[0][0]}&destination=${points[points.length - 1][1]},${points[points.length - 1][0]}&travelmode=bicycling`
        : null;

    const previewLineColor =
        selectedStatus === 'accepted' ? '#22c55e'
            : selectedStatus === 'in_review' ? '#f59e0b'
                : selectedStatus === 'rejected' ? '#ef4444'
                    : '#a1a1aa';

    const handleSave = async () => {
        const trimmedNotes = adminNotes.trim();
        if (selectedStatus === 'rejected' && trimmedNotes.length < 5) {
            toast.error('Elutasításhoz indoklás kötelező (min. 5 karakter)');
            return;
        }
        setSaving(true);
        try {
            const { error } = await supabase
                .from('community_bike_lanes')
                .update({ status: selectedStatus, admin_notes: trimmedNotes || null })
                .eq('id', route.id);
            if (error) throw error;
            if (selectedStatus === 'accepted' && route.status !== 'accepted') {
                toast.success('Elfogadva — ne felejtsd el felvinni OSM-re manuálisan!', { duration: 6000 });
            } else {
                toast.success('Mentve');
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            toast.error('Hiba a mentéskor');
        } finally {
            setSaving(false);
        }
    };

    const submitterName = route.profiles?.username || route.profiles?.full_name || (route.user_id ? String(route.user_id).slice(0, 8) : '-');
    const submittedAt = route.created_at ? new Date(route.created_at).toLocaleString('hu-HU') : '-';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !saving && onClose()}>
            <DialogContent className="admin-dark max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden bg-card border-border p-0">
                <div className="flex flex-col h-[85vh]">
                    {/* Header — same pattern as EditLocationModal */}
                    <div className="p-6 border-b border-border flex-shrink-0 bg-background/50 backdrop-blur-sm">
                        <DialogTitle className="text-foreground flex items-center justify-between text-xl font-bold">
                            <div className="flex items-center gap-4 min-w-0 pr-8">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <Route className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-lg font-bold text-foreground truncate leading-tight">
                                        {route.name || 'Névtelen útvonal'}
                                    </h1>
                                    <div className="flex flex-col mt-1 gap-0.5">
                                        <span className="text-xs text-muted-foreground truncate">Közösségi útvonal moderálás</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-mono text-muted-foreground opacity-80 break-all">
                                                ID: {route.id}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => copyId(route.id)}
                                                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors shrink-0"
                                                title="ID másolása"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogTitle>
                    </div>

                    {/* Scrollable body */}
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="p-6 space-y-6">
                            {/* Status badge + length summary */}
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${currentMeta.className}`}>
                                    <CurrentIcon className="w-3.5 h-3.5" />
                                    Jelenlegi: {currentMeta.label}
                                </span>
                                {points.length > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                        {points.length} pont · {lengthKm.toFixed(2)} km
                                    </span>
                                )}
                            </div>

                            {route.description && (
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Leírás</label>
                                    <p className="text-sm text-zinc-300 whitespace-pre-wrap p-3 rounded-xl bg-zinc-900/30 border border-white/5">{route.description}</p>
                                </div>
                            )}

                            {/* Metadata grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="p-3 rounded-xl bg-zinc-900/30 border border-white/5">
                                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                                        <User className="w-3 h-3" /> Beküldő
                                    </div>
                                    <p className="mt-1 text-sm text-zinc-200">{submitterName}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-zinc-900/30 border border-white/5">
                                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                                        <Calendar className="w-3 h-3" /> Beküldve
                                    </div>
                                    <p className="mt-1 text-sm text-zinc-200">{submittedAt}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-zinc-900/30 border border-white/5">
                                    <div className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Felület</div>
                                    <p className="mt-1 text-sm text-zinc-200">{route.surface_type || '-'}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-zinc-900/30 border border-white/5">
                                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                                        <Star className="w-3 h-3" /> Minőség
                                    </div>
                                    <p className="mt-1 text-sm text-zinc-200">{route.quality_rating ? `${route.quality_rating}/5` : '-'}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-zinc-900/30 border border-white/5">
                                    <div className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Megerősítések</div>
                                    <p className="mt-1 text-sm text-zinc-200">{route.verification_count ?? 0}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-zinc-900/30 border border-white/5">
                                    <div className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Bejelentések</div>
                                    <p className="mt-1 text-sm text-zinc-200">{route.reported_count ?? 0}</p>
                                </div>
                            </div>

                            {/* Map block */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Útvonal</label>
                                    <div className="flex gap-2">
                                        {googleMapsUrl && (
                                            <a
                                                href={googleMapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded border border-white/10 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" /> Google Maps
                                            </a>
                                        )}
                                        {osmEditUrl && (
                                            <a
                                                href={osmEditUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded border border-white/10 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                                            >
                                                <Pencil className="w-3 h-3" /> OSM szerkesztő
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-white/10 overflow-hidden">
                                    {points.length >= 1 ? (
                                        <InteractiveRouteMap points={points} height={360} lineColor={previewLineColor} />
                                    ) : (
                                        <div className="flex items-center justify-center h-40 text-sm text-zinc-500 bg-zinc-900/40">
                                            Nincs értelmezhető útvonal geometria
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status selector */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Új státusz</label>
                                <div className="relative">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value as Status)}
                                        disabled={saving}
                                        className="w-full appearance-none bg-zinc-900/50 border border-white/5 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 rounded-xl px-4 py-3 pr-10 text-sm text-white transition-all outline-none disabled:opacity-50"
                                    >
                                        <option value="pending">Új (függőben)</option>
                                        <option value="in_review">Vizsgálat alatt</option>
                                        <option value="accepted">Elfogadva</option>
                                        <option value="rejected">Elutasítva</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Admin notes */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                                    Admin jegyzet {selectedStatus === 'rejected' && <span className="text-red-400 normal-case">(kötelező, min. 5 karakter)</span>}
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    rows={3}
                                    placeholder={selectedStatus === 'rejected' ? 'Indoklás kötelező…' : 'Megjegyzés…'}
                                    className="w-full bg-zinc-900/50 border border-white/5 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-all outline-none resize-none"
                                />
                                {selectedStatus === 'rejected' && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mr-1 self-center">Gyors:</span>
                                        {REJECT_REASONS.map(r => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setAdminNotes(prev => prev ? `${prev}\n${r}` : r)}
                                                className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                                            >
                                                + {r}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer — same pattern as EditLocationModal */}
                    <div className="p-6 border-t border-border flex justify-end gap-2 flex-shrink-0">
                        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                            Mégse
                        </Button>
                        <Button type="button" onClick={handleSave} disabled={saving} className="gap-2">
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Mentés...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Mentés
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
