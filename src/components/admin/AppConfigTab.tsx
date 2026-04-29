'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save, Wrench, Smartphone, Flag, AlertTriangle, RefreshCw, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const SEMVER_RE = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;
const FLAG_KEY_RE = /^[a-z][a-z0-9_]{2,39}$/;

// Flags we always want to surface in the UI even if missing from `data`,
// so the admin sees them as togglable rows from day one.
const KNOWN_FLAGS: Array<{ key: string; description: string }> = [
    { key: 'supporter_cta', description: 'BumeaCafé támogatói CTA megjelenítése a mobil app-ban' },
];

interface ConfigRow {
    key: string;
    value: string;
    data: Record<string, unknown> | null;
    updated_at: string;
}

interface MaintenanceData {
    enabled: boolean;
    title_en: string;
    title_hu: string;
    message_en: string;
    message_hu: string;
    estimated_end: string | null;
}

const DEFAULT_MAINTENANCE: MaintenanceData = {
    enabled: false,
    title_en: 'Scheduled maintenance',
    title_hu: 'Tervezett karbantartás',
    message_en: 'ParkSafe is undergoing maintenance. We\'ll be back shortly.',
    message_hu: 'A ParkSafe karbantartás alatt áll. Hamarosan visszatérünk.',
    estimated_end: null,
};

/**
 * `estimated_end` is stored as ISO8601 (UTC). The <input type="datetime-local">
 * needs `YYYY-MM-DDTHH:mm` in **local** time. These two helpers do the round-trip.
 */
function isoToLocalInput(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function localInputToIso(local: string): string | null {
    if (!local) return null;
    const d = new Date(local);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
}

export default function AppConfigTab() {
    const [rows, setRows] = useState<ConfigRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    // Per-key save state.
    const [savingKey, setSavingKey] = useState<string | null>(null);

    // Editable copies (so the user can revert by reloading).
    const [minVersion, setMinVersion] = useState('');
    const [maintenance, setMaintenance] = useState<MaintenanceData>(DEFAULT_MAINTENANCE);
    const [maintenanceValueOn, setMaintenanceValueOn] = useState(false);
    const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
    const [featureFlagsValueOn, setFeatureFlagsValueOn] = useState(true);
    const [newFlagKey, setNewFlagKey] = useState('');

    // Fetch on mount + manual reload.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData.session?.access_token;
                if (!token) {
                    toast.error('Nincs aktív session.');
                    return;
                }
                const res = await fetch('/api/app-config', {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                });
                if (!res.ok) {
                    const body = (await res.json().catch(() => ({}))) as { error?: string };
                    throw new Error(body.error || `HTTP ${res.status}`);
                }
                const json = (await res.json()) as { items: ConfigRow[] };
                if (cancelled) return;

                setRows(json.items);

                // Hydrate editable copies.
                const versionRow = json.items.find((r) => r.key === 'min_app_version');
                setMinVersion(versionRow?.value ?? '0.0.0');

                const maintRow = json.items.find((r) => r.key === 'maintenance');
                const maintData = (maintRow?.data ?? {}) as Partial<MaintenanceData>;
                setMaintenance({
                    enabled: Boolean(maintData.enabled ?? false),
                    title_en: maintData.title_en ?? DEFAULT_MAINTENANCE.title_en,
                    title_hu: maintData.title_hu ?? DEFAULT_MAINTENANCE.title_hu,
                    message_en: maintData.message_en ?? DEFAULT_MAINTENANCE.message_en,
                    message_hu: maintData.message_hu ?? DEFAULT_MAINTENANCE.message_hu,
                    estimated_end: maintData.estimated_end ?? null,
                });
                setMaintenanceValueOn((maintRow?.value ?? 'off') === 'on');

                const flagsRow = json.items.find((r) => r.key === 'feature_flags');
                const flagsData = (flagsRow?.data ?? {}) as Record<string, unknown>;
                const normalized: Record<string, boolean> = {};
                for (const [k, v] of Object.entries(flagsData)) {
                    normalized[k] = v === true || v === 'true';
                }
                // Make sure all KNOWN_FLAGS appear as togglable rows even if the
                // DB does not yet have them in `data`.
                for (const known of KNOWN_FLAGS) {
                    if (!(known.key in normalized)) normalized[known.key] = false;
                }
                setFeatureFlags(normalized);
                setFeatureFlagsValueOn((flagsRow?.value ?? 'on') === 'on');
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Konfiguráció betöltése sikertelen');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const updatedAt = useMemo(() => {
        const map: Record<string, string> = {};
        for (const r of rows) map[r.key] = r.updated_at;
        return map;
    }, [rows]);

    async function patchKey(payload: {
        key: string;
        value: string;
        data?: Record<string, unknown> | null;
    }): Promise<boolean> {
        setSavingKey(payload.key);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) {
                toast.error('Nincs aktív session.');
                return false;
            }
            const res = await fetch('/api/app-config', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as { error?: string };
                throw new Error(body.error || `HTTP ${res.status}`);
            }
            const json = (await res.json()) as { item: ConfigRow };
            setRows((prev) => {
                const idx = prev.findIndex((r) => r.key === payload.key);
                if (idx === -1) return [...prev, json.item];
                const copy = [...prev];
                copy[idx] = json.item;
                return copy;
            });
            toast.success(`${payload.key} mentve`);
            return true;
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Mentés sikertelen');
            return false;
        } finally {
            setSavingKey(null);
        }
    }

    const minVersionDirty = (rows.find((r) => r.key === 'min_app_version')?.value ?? '0.0.0') !== minVersion;
    const minVersionValid = SEMVER_RE.test(minVersion);

    const maintenanceRow = rows.find((r) => r.key === 'maintenance');
    const maintenanceDirty = useMemo(() => {
        if (!maintenanceRow) return true;
        const d = (maintenanceRow.data ?? {}) as Partial<MaintenanceData>;
        return (
            (maintenanceRow.value === 'on') !== maintenanceValueOn ||
            Boolean(d.enabled ?? false) !== maintenance.enabled ||
            (d.title_en ?? '') !== maintenance.title_en ||
            (d.title_hu ?? '') !== maintenance.title_hu ||
            (d.message_en ?? '') !== maintenance.message_en ||
            (d.message_hu ?? '') !== maintenance.message_hu ||
            (d.estimated_end ?? null) !== maintenance.estimated_end
        );
    }, [maintenanceRow, maintenance, maintenanceValueOn]);

    const flagsRow = rows.find((r) => r.key === 'feature_flags');
    const flagsDirty = useMemo(() => {
        if (!flagsRow) return true;
        if ((flagsRow.value === 'on') !== featureFlagsValueOn) return true;
        const d = (flagsRow.data ?? {}) as Record<string, unknown>;
        const keys = new Set([...Object.keys(d), ...Object.keys(featureFlags)]);
        for (const k of keys) {
            const orig = d[k] === true || d[k] === 'true';
            const cur = Boolean(featureFlags[k]);
            if (orig !== cur) return true;
        }
        return false;
    }, [flagsRow, featureFlags, featureFlagsValueOn]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="overflow-y-auto h-full p-4 sm:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Top toolbar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">App-konfiguráció</h2>
                        <p className="text-sm text-muted-foreground">
                            A mobil app indulásakor olvassa ezeket a kapcsolókat. Módosítások azonnal élesednek.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReloadKey((k) => k + 1)}
                        className="gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Újratöltés
                    </Button>
                </div>

                {/* Maintenance mode */}
                <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                    <Wrench className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                        Karbantartási mód
                                        {maintenanceValueOn && (
                                            <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                                                <AlertTriangle className="w-3 h-3 mr-1" />
                                                AKTÍV
                                            </Badge>
                                        )}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Bekapcsolva a mobil app blokkoló képernyőt mutat a megadott üzenettel.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="maint-toggle" className="text-sm">
                                    {maintenanceValueOn ? 'Be' : 'Ki'}
                                </Label>
                                <Switch
                                    id="maint-toggle"
                                    checked={maintenanceValueOn}
                                    onCheckedChange={(v) => {
                                        setMaintenanceValueOn(v);
                                        setMaintenance((m) => ({ ...m, enabled: v }));
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cím (HU)</Label>
                                <Input
                                    value={maintenance.title_hu}
                                    onChange={(e) => setMaintenance((m) => ({ ...m, title_hu: e.target.value }))}
                                    placeholder="Tervezett karbantartás"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cím (EN)</Label>
                                <Input
                                    value={maintenance.title_en}
                                    onChange={(e) => setMaintenance((m) => ({ ...m, title_en: e.target.value }))}
                                    placeholder="Scheduled maintenance"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Üzenet (HU)</Label>
                                <Textarea
                                    value={maintenance.message_hu}
                                    onChange={(e) => setMaintenance((m) => ({ ...m, message_hu: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Üzenet (EN)</Label>
                                <Textarea
                                    value={maintenance.message_en}
                                    onChange={(e) => setMaintenance((m) => ({ ...m, message_en: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Becsült vége (helyi idő)</Label>
                                <Input
                                    type="datetime-local"
                                    value={isoToLocalInput(maintenance.estimated_end)}
                                    onChange={(e) =>
                                        setMaintenance((m) => ({
                                            ...m,
                                            estimated_end: localInputToIso(e.target.value),
                                        }))
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Üresen hagyva nem mutatunk várható időt. UTC-be konvertálva mentődik.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground">
                                Utoljára frissítve: {updatedAt.maintenance ? new Date(updatedAt.maintenance).toLocaleString('hu-HU') : '—'}
                            </span>
                            <Button
                                onClick={() =>
                                    patchKey({
                                        key: 'maintenance',
                                        value: maintenanceValueOn ? 'on' : 'off',
                                        data: { ...maintenance },
                                    })
                                }
                                disabled={!maintenanceDirty || savingKey === 'maintenance'}
                                className="gap-2"
                            >
                                {savingKey === 'maintenance' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Karbantartás mentése
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Min app version */}
                <Card>
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <Smartphone className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground">Minimum app verzió</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Ennél régebbi kliensek frissítésre kényszerítve. Formátum: <code className="font-mono">MAJOR.MINOR.PATCH</code>.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="min-version">Verzió</Label>
                                <Input
                                    id="min-version"
                                    value={minVersion}
                                    onChange={(e) => setMinVersion(e.target.value.trim())}
                                    placeholder="1.4.0"
                                    className={!minVersionValid ? 'border-destructive' : ''}
                                />
                                {!minVersionValid && (
                                    <p className="text-xs text-destructive">
                                        Érvénytelen formátum. Példa: <code className="font-mono">1.4.0</code>
                                    </p>
                                )}
                            </div>
                            <Button
                                onClick={() => patchKey({ key: 'min_app_version', value: minVersion })}
                                disabled={!minVersionDirty || !minVersionValid || savingKey === 'min_app_version'}
                                className="gap-2"
                            >
                                {savingKey === 'min_app_version' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Verzió mentése
                            </Button>
                        </div>

                        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                            Utoljára frissítve: {updatedAt.min_app_version ? new Date(updatedAt.min_app_version).toLocaleString('hu-HU') : '—'}
                        </div>
                    </CardContent>
                </Card>

                {/* Feature flags */}
                <Card>
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                                    <Flag className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Feature flags</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Egyedi képességek be- és kikapcsolása. Master kapcsoló kikapcsolása minden flag-et felülír.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="flags-master" className="text-sm">
                                    Master {featureFlagsValueOn ? 'be' : 'ki'}
                                </Label>
                                <Switch
                                    id="flags-master"
                                    checked={featureFlagsValueOn}
                                    onCheckedChange={setFeatureFlagsValueOn}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {Object.entries(featureFlags).length === 0 && (
                                <p className="text-sm text-muted-foreground italic px-3 py-4 text-center border border-dashed border-border rounded-lg">
                                    Még nincs egyetlen feature flag sem. Add hozzá lent.
                                </p>
                            )}
                            {Object.entries(featureFlags).map(([flagKey, enabled]) => {
                                const meta = KNOWN_FLAGS.find((k) => k.key === flagKey);
                                return (
                                    <div
                                        key={flagKey}
                                        className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-mono text-sm text-foreground truncate">{flagKey}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {meta?.description ?? 'Egyedi feature kapcsoló'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Switch
                                                checked={enabled}
                                                disabled={!featureFlagsValueOn}
                                                onCheckedChange={(v) =>
                                                    setFeatureFlags((prev) => ({ ...prev, [flagKey]: v }))
                                                }
                                            />
                                            {!meta && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                    onClick={() =>
                                                        setFeatureFlags((prev) => {
                                                            const copy = { ...prev };
                                                            delete copy[flagKey];
                                                            return copy;
                                                        })
                                                    }
                                                    title="Flag eltávolítása"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add new flag */}
                            <div className="flex items-center gap-2 pt-2">
                                <Input
                                    value={newFlagKey}
                                    onChange={(e) => setNewFlagKey(e.target.value.toLowerCase())}
                                    placeholder="uj_flag_neve"
                                    className="font-mono"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="gap-2 shrink-0"
                                    disabled={
                                        !FLAG_KEY_RE.test(newFlagKey) || newFlagKey in featureFlags
                                    }
                                    onClick={() => {
                                        setFeatureFlags((prev) => ({ ...prev, [newFlagKey]: false }));
                                        setNewFlagKey('');
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Hozzáad
                                </Button>
                            </div>
                            {newFlagKey && !FLAG_KEY_RE.test(newFlagKey) && (
                                <p className="text-xs text-destructive px-1">
                                    Csak kisbetű/szám/aláhúzás, 3–40 karakter, betűvel kezdődik.
                                </p>
                            )}
                            {newFlagKey && newFlagKey in featureFlags && (
                                <p className="text-xs text-destructive px-1">
                                    Ez a flag már létezik.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground">
                                Utoljára frissítve: {updatedAt.feature_flags ? new Date(updatedAt.feature_flags).toLocaleString('hu-HU') : '—'}
                            </span>
                            <Button
                                onClick={() =>
                                    patchKey({
                                        key: 'feature_flags',
                                        value: featureFlagsValueOn ? 'on' : 'off',
                                        data: featureFlags,
                                    })
                                }
                                disabled={!flagsDirty || savingKey === 'feature_flags'}
                                className="gap-2"
                            >
                                {savingKey === 'feature_flags' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Flags mentése
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
