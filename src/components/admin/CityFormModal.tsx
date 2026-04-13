'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Building2, Save, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    city: any | null;
    onSuccess: () => void;
}

const emptyForm = {
    name: '',
    name_en: '',
    slug: '',
    country_code: 'HU',
    center_lat: '',
    center_lng: '',
    bbox_sw_lat: '',
    bbox_sw_lng: '',
    bbox_ne_lat: '',
    bbox_ne_lng: '',
    timezone: 'Europe/Budapest',
    is_active: true,
};

export default function CityFormModal({ isOpen, onClose, city, onSuccess }: CityFormModalProps) {
    const isEdit = !!city;
    const [form, setForm] = useState<typeof emptyForm>(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (city) {
            setForm({
                name: city.name ?? '',
                name_en: city.name_en ?? '',
                slug: city.slug ?? '',
                country_code: city.country_code ?? 'HU',
                center_lat: city.center_lat?.toString() ?? '',
                center_lng: city.center_lng?.toString() ?? '',
                bbox_sw_lat: city.bbox_sw_lat?.toString() ?? '',
                bbox_sw_lng: city.bbox_sw_lng?.toString() ?? '',
                bbox_ne_lat: city.bbox_ne_lat?.toString() ?? '',
                bbox_ne_lng: city.bbox_ne_lng?.toString() ?? '',
                timezone: city.timezone ?? 'Europe/Budapest',
                is_active: city.is_active ?? true,
            });
        } else {
            setForm(emptyForm);
        }
    }, [city, isOpen]);

    const toNum = (v: string): number | null => {
        const n = Number(v);
        return isFinite(n) && v.trim() !== '' ? n : null;
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.slug.trim()) {
            toast.error('Név és slug megadása kötelező');
            return;
        }
        const payload = {
            name: form.name.trim(),
            name_en: form.name_en.trim() || null,
            slug: form.slug.trim().toLowerCase(),
            country_code: form.country_code.trim().toUpperCase() || 'HU',
            center_lat: toNum(form.center_lat),
            center_lng: toNum(form.center_lng),
            bbox_sw_lat: toNum(form.bbox_sw_lat),
            bbox_sw_lng: toNum(form.bbox_sw_lng),
            bbox_ne_lat: toNum(form.bbox_ne_lat),
            bbox_ne_lng: toNum(form.bbox_ne_lng),
            timezone: form.timezone.trim() || 'Europe/Budapest',
            is_active: form.is_active,
        };

        const required: (keyof typeof payload)[] = ['center_lat', 'center_lng', 'bbox_sw_lat', 'bbox_sw_lng', 'bbox_ne_lat', 'bbox_ne_lng'];
        for (const k of required) {
            if (payload[k] === null) {
                toast.error(`Hiányzó vagy érvénytelen: ${k}`);
                return;
            }
        }

        setSaving(true);
        try {
            if (isEdit) {
                const { error } = await supabase.from('cities').update(payload).eq('id', city.id);
                if (error) throw error;
                toast.success('Város frissítve');
            } else {
                const { error } = await supabase.from('cities').insert(payload);
                if (error) throw error;
                toast.success('Város létrehozva');
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : 'Hiba a mentés során';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50";
    const labelCls = "text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block";

    return (
        <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-2xl p-0 gap-0 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <DialogTitle className="flex items-center gap-3 text-lg font-bold text-white">
                        <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-green-500" />
                        </div>
                        {isEdit ? 'Város szerkesztése' : 'Új város hozzáadása'}
                    </DialogTitle>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/10">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <ScrollArea className="max-h-[70vh]">
                    <div className="p-5 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Név (magyar) *</label>
                                <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Budapest" />
                            </div>
                            <div>
                                <label className={labelCls}>Név (angol)</label>
                                <input className={inputCls} value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} placeholder="Budapest" />
                            </div>
                            <div>
                                <label className={labelCls}>Slug *</label>
                                <input className={inputCls} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="budapest" />
                            </div>
                            <div>
                                <label className={labelCls}>Ország kód</label>
                                <input className={inputCls} value={form.country_code} onChange={e => setForm(f => ({ ...f, country_code: e.target.value }))} placeholder="HU" maxLength={2} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Központ koordináta</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Lat *</label>
                                    <input type="number" step="any" className={inputCls} value={form.center_lat} onChange={e => setForm(f => ({ ...f, center_lat: e.target.value }))} placeholder="47.4979" />
                                </div>
                                <div>
                                    <label className={labelCls}>Lng *</label>
                                    <input type="number" step="any" className={inputCls} value={form.center_lng} onChange={e => setForm(f => ({ ...f, center_lng: e.target.value }))} placeholder="19.0402" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Bounding box</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>SW Lat *</label>
                                    <input type="number" step="any" className={inputCls} value={form.bbox_sw_lat} onChange={e => setForm(f => ({ ...f, bbox_sw_lat: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>SW Lng *</label>
                                    <input type="number" step="any" className={inputCls} value={form.bbox_sw_lng} onChange={e => setForm(f => ({ ...f, bbox_sw_lng: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>NE Lat *</label>
                                    <input type="number" step="any" className={inputCls} value={form.bbox_ne_lat} onChange={e => setForm(f => ({ ...f, bbox_ne_lat: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>NE Lng *</label>
                                    <input type="number" step="any" className={inputCls} value={form.bbox_ne_lng} onChange={e => setForm(f => ({ ...f, bbox_ne_lng: e.target.value }))} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Időzóna</label>
                                <input className={inputCls} value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} placeholder="Europe/Budapest" />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                                        className="w-4 h-4 accent-green-500"
                                    />
                                    Aktív
                                </label>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="flex items-center justify-end gap-2 p-4 border-t border-white/5 bg-[#0a0a0a]">
                    <Button variant="outline" onClick={onClose} disabled={saving} className="border-white/10 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                        Mégse
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2 bg-green-500 hover:bg-green-600 text-black font-semibold">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEdit ? 'Mentés' : 'Létrehozás'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
