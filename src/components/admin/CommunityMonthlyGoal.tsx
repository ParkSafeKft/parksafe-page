'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabaseClient';
import { goalMeters, goalKilometersInput, goalProgress, validGoalSnapshot, type MonthlyGoalConfig, type MonthlyGoalSnapshot } from '@/lib/communityMonthlyGoal';
import styles from './CommunityMonthlyGoal.module.css';

const number = (value: number) => value.toLocaleString('hu-HU', { maximumFractionDigits: 1 });
const monthLabel = (month: string) => new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${month}-01T12:00:00Z`));

async function goalRequest(month?: string, options?: { signal?: AbortSignal; body?: unknown }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('A munkamenet lejárt. Jelentkezz be újra.');
    const response = await fetch(`/api/admin-community-monthly-goal${month ? `?month=${month}` : ''}`, {
        method: options?.body ? 'PATCH' : 'GET', cache: 'no-store', signal: options?.signal,
        headers: { Authorization: `Bearer ${session.access_token}`, ...(options?.body ? { 'Content-Type': 'application/json' } : {}) },
        body: options?.body ? JSON.stringify(options.body) : undefined,
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'A havi cél nem érhető el.');
    return body;
}

export default function CommunityMonthlyGoal() {
    const [entry, setEntry] = useState<{ snapshot: MonthlyGoalSnapshot; receivedAt: number } | null>(null);
    const [clock, setClock] = useState(() => Date.now());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const editButton = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const controller = new AbortController();
        let pending = false;
        async function load() {
            setClock(Date.now());
            if (document.hidden || pending) return;
            pending = true;
            setLoading(true);
            try {
                const data: unknown = await goalRequest(undefined, { signal: controller.signal });
                if (!validGoalSnapshot(data)) throw new Error('A havi cél válasza érvénytelen.');
                if (!controller.signal.aborted) {
                    const now = Date.now();
                    setEntry({ snapshot: data, receivedAt: now });
                    setClock(now);
                    setError('');
                }
            } catch (reason) {
                if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'A havi cél nem érhető el.');
            } finally {
                pending = false;
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        void load();
        const timer = window.setInterval(load, 60_000);
        document.addEventListener('visibilitychange', load);
        window.addEventListener('focus', load);
        return () => {
            controller.abort();
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', load);
            window.removeEventListener('focus', load);
        };
    }, [revision]);

    useEffect(() => {
        if (!entry) return;
        const remaining = Date.parse(entry.snapshot.period_end) - Date.parse(entry.snapshot.computed_at) - (Date.now() - entry.receivedAt);
        const timer = window.setTimeout(() => { setClock(Date.now()); setRevision(value => value + 1); }, Math.max(0, Math.min(remaining, 2_147_483_647)));
        return () => window.clearTimeout(timer);
    }, [entry]);

    const snapshot = entry?.snapshot;
    const expired = entry && clock - entry.receivedAt >= Date.parse(entry.snapshot.period_end) - Date.parse(entry.snapshot.computed_at);
    const active = snapshot?.enabled && !expired ? snapshot : null;
    const progress = active ? goalProgress(active) : null;
    function closeEditor() {
        setEditing(false);
        window.requestAnimationFrame(() => editButton.current?.focus());
    }

    return <section className={styles.panel} aria-labelledby="community-monthly-title" aria-busy={loading}>
        <header className={styles.header}>
            <div><h2 id="community-monthly-title">Közösségi cél</h2><p>{snapshot && !expired ? monthLabel(snapshot.month_key) : 'Aktuális hónap'}</p></div>
            <button ref={editButton} className={styles.edit} type="button" aria-label="Közösségi cél módosítása" title="Cél módosítása" disabled={saving || !snapshot || Boolean(expired)} aria-haspopup="dialog" onClick={() => { setEditing(true); setMessage(''); }}><Pencil aria-hidden="true" size={16} /></button>
        </header>
        {active && progress ? <>
            <div className={styles.values}><div><strong>{number(active.total_distance_meters / 1000)}</strong><small> / {number(active.target_distance_meters / 1000)} km</small></div><strong className={styles.percent}>{number(progress.percent)}%</strong></div>
            <div className={styles.track} role="progressbar" aria-label="A havi közösségi cél teljesítése" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.bar} aria-valuetext={`${number(progress.percent)}%, ${number(active.total_distance_meters / 1000)} / ${number(active.target_distance_meters / 1000)} km`}><span style={{ width: `${progress.bar}%` }} /></div>
        </> : <p className={styles.empty}>{expired ? 'Hónapváltás történt. Az új havi adat frissítésre vár.' : snapshot ? 'Erre a hónapra nincs aktív közösségi cél. A mobilappban ilyenkor rejtve marad a kártya.' : loading ? 'A havi cél betöltése…' : 'A havi cél adatai jelenleg nem érhetők el.'}</p>}
        {error || message ? <div className={styles.footer} aria-live="polite">{error ? <span role="alert">{error}{active ? ' Az utolsó sikeres adat látható.' : ''} <button type="button" disabled={loading} onClick={() => setRevision(value => value + 1)}>Újra</button></span> : message}</div> : null}
        {editing && snapshot ? <GoalEditor currentMonth={snapshot.month_key} onBusy={setSaving} onClose={closeEditor} onSaved={() => { closeEditor(); setMessage('Cél mentve.'); setRevision(value => value + 1); }} /> : null}
    </section>;
}

function GoalEditor({ currentMonth, onClose, onSaved, onBusy }: { currentMonth: string; onClose: () => void; onSaved: () => void; onBusy: (busy: boolean) => void }) {
    const [month, setMonth] = useState(currentMonth);
    const [config, setConfig] = useState<MonthlyGoalConfig | null>(null);
    const [target, setTarget] = useState('');
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);
    const monthInput = useRef<HTMLSelectElement>(null);
    const mounted = useRef(true);
    useEffect(() => { mounted.current = true; monthInput.current?.focus(); return () => { mounted.current = false; }; }, []);
    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            setLoading(true); setLoaded(false); setError('');
            try {
                const row: MonthlyGoalConfig | null = await goalRequest(month, { signal: controller.signal });
                if (!controller.signal.aborted) {
                    setConfig(row); setTarget(row ? goalKilometersInput(row.target_meters) : ''); setEnabled(row?.enabled ?? false); setLoaded(true);
                }
            } catch (reason) {
                if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'A beállítások nem érhetők el.');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        void load();
        return () => controller.abort();
    }, [month, revision]);

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!loaded || saving) return;
        if (goalMeters(target) === null) { setError('Adj meg pozitív kilométercélt, legfeljebb három tizedesjeggyel.'); return; }
        setSaving(true); onBusy(true); setError('');
        try {
            await goalRequest(undefined, { body: { month, target_km: target, enabled, expected_updated_at: config?.updated_at ?? null } });
            if (mounted.current) onSaved();
        } catch (reason) {
            if (mounted.current) setError(reason instanceof Error ? reason.message : 'A mentés sikertelen.');
        } finally { onBusy(false); if (mounted.current) setSaving(false); }
    }

    const months = Array.from({ length: 24 }, (_, offset) => {
        const date = new Date(`${currentMonth}-01T12:00:00Z`);
        date.setUTCMonth(date.getUTCMonth() + offset);
        return date.toISOString().slice(0, 7);
    }).filter(value => value <= '2099-12');

    return <Dialog open onOpenChange={open => { if (!open && !saving) onClose(); }}>
        <DialogContent className={styles.dialog} aria-describedby={undefined} onEscapeKeyDown={event => { if (saving) event.preventDefault(); }} onPointerDownOutside={event => { if (saving) event.preventDefault(); }}>
            <form id="community-goal-editor" onSubmit={save}>
                <div className={styles.dialogHeader}><DialogTitle>Közösségi cél</DialogTitle></div>
                <div className={styles.dialogBody}>
                    <div className={styles.fields}>
                        <label>Hónap<select ref={monthInput} value={month} required disabled={saving} onChange={event => { setLoaded(false); setMonth(event.target.value); }}>
                            {months.map(value => <option key={value} value={value}>{monthLabel(value)}</option>)}
                        </select></label>
                        <label>Cél<span className={styles.distanceInput}><input aria-label="Cél kilométerben" type="text" inputMode="decimal" value={loading ? '' : target} placeholder={loading ? '…' : '4000'} required maxLength={20} disabled={!loaded || saving} onChange={event => setTarget(event.target.value)} /><span>km</span></span></label>
                    </div>
                    <div className={styles.visibility}><label htmlFor="community-goal-enabled">Megjelenítés az appban</label><Switch id="community-goal-enabled" className={styles.toggle} checked={enabled} disabled={!loaded || saving} onCheckedChange={setEnabled} /></div>
                    <div aria-live="polite">{loading ? <p role="status" className={styles.dialogStatus}>Betöltés…</p> : error ? <p role="alert" className={styles.error}>{error} <button className={styles.reload} type="button" disabled={saving} onClick={() => setRevision(value => value + 1)}>Újratöltés</button></p> : null}</div>
                </div>
                <div className={styles.actions}><button className={styles.cancel} type="button" disabled={saving} onClick={onClose}>Mégse</button><button className={styles.save} type="submit" disabled={!loaded || saving}>{saving ? 'Mentés…' : 'Mentés'}</button></div>
            </form>
        </DialogContent>
    </Dialog>;
}
