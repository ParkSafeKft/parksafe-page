'use client';

import { Fragment, useEffect, useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import styles from './GpsDeviceDiagnostics.module.css';
import records from './AdminRecordBrowser.module.css';

export interface GpsGroup {
    manufacturer: string; model: string; os: string; os_version: string; app_version: string;
    battery_saver_on: boolean | null; doze_whitelisted: boolean | null;
    rides: number; measured_rides: number; partial_rides: number; gap_rides: number; legacy_gap_rides: number;
    users?: number; measured_users?: number; gap_users?: number;
    count_rides: number; raw_samples: number | null; accepted_samples: number | null;
    gap_percent: number | null; accepted_percent: number | null;
    storage_measured_rides: number; storage_mismatch_rides: number; rejection_measured_rides: number;
    poor_accuracy: number | null; stale_gap: number | null; teleport: number | null;
}
interface Result { days: number; total_rides: number; telemetry_rides: number; groups: GpsGroup[] }
const setting = (value: boolean | null) => value == null ? 'Ismeretlen' : value ? 'Igen' : 'Nem';
const amount = (value: number | null) => value == null ? 'Nincs adat' : value.toLocaleString('hu-HU');

export function GpsGroupTable({ groups }: { groups: GpsGroup[] }) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const tableId = useId();
    if (!groups.length) return <p>Nincs adat a kiválasztott szűréshez. Ez nem jelent hibamentes működést.</p>;
    return <div className={`${records.scroll} ${styles.scroll}`} tabIndex={0} aria-label="GPS-minőség rekordlista"><table className={records.table}><caption className={records.srOnly}>GPS-minőség készülék, OS, appverzió és energiatakarékos beállítás szerint</caption>
        <thead><tr><th>Eszköz</th><th>Túrák</th><th>GPS-kimaradás</th><th>Elfogadott GPS-pontok</th><th>Részletek</th></tr></thead>
        <tbody>{groups.map((g, i) => {
            const key = JSON.stringify([g.manufacturer, g.model, g.os, g.os_version, g.app_version, g.battery_saver_on, g.doze_whitelisted]);
            const open = expanded.has(key);
            return <Fragment key={key}><tr>
            <td><strong className={styles.device}>{g.manufacturer} {g.model}</strong><span className={styles.secondary}>{g.os} {g.os_version} · App {g.app_version}</span><span className={styles.secondary}>Akkukímélő: {setting(g.battery_saver_on)} · Doze-kivétel: {setting(g.doze_whitelisted)}</span></td>
            <td><strong className={styles.metric}>{amount(g.rides)}</strong><span className={styles.secondary}>{g.users == null ? 'Felhasználószám még nem elérhető' : `${amount(g.users)} felhasználótól`}</span>{g.rides < 5 && <span className={styles.caution}>Kevés adat</span>}</td>
            <td>{g.gap_percent == null ? <><span className={styles.unknown}>Nincs mért arány</span><span className={styles.secondary}>Még nincs kimaradásmérés</span></> : <><strong className={styles.metric}>{g.gap_percent.toLocaleString('hu-HU')}%</strong><span className={styles.secondary}>{g.gap_rides} / {g.measured_rides} mért túra</span>{g.measured_rides < 5 && <span className={styles.caution}>Kevés adat</span>}</>}</td>
            <td>{g.accepted_percent == null ? <span className={styles.unknown}>Nincs adat</span> : <><strong className={styles.metric}>{g.accepted_percent.toLocaleString('hu-HU')}%</strong><meter className={styles.meter} min={0} max={100} value={g.accepted_percent} aria-label="Elfogadott GPS-pontok aránya" /><span className={styles.secondary}>{g.count_rides} túra alapján</span></>}</td>
            <td><button aria-expanded={open} aria-controls={`${tableId}-${i}`} onClick={() => setExpanded(previous => {
                const next = new Set(previous);
                if (next.has(key)) next.delete(key); else next.add(key);
                return next;
            })}>{open ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}{open ? 'Mutatók bezárása' : 'Mutatók'}</button></td>
        </tr><tr hidden={!open} className={styles.detailRow}><td colSpan={5} id={`${tableId}-${i}`}><dl className={styles.detailGrid}>
                <div><dt>Elfogadott / beérkezett pont</dt><dd>{amount(g.accepted_samples)} / {amount(g.raw_samples)}</dd></div>
                <div><dt>Pontatlan helyzet miatt elutasítva</dt><dd>{amount(g.poor_accuracy)}</dd></div>
                <div><dt>Túl régi minta miatt elutasítva</dt><dd>{amount(g.stale_gap)}</dd></div>
                <div><dt>Irreális ugrás miatt elutasítva</dt><dd>{amount(g.teleport)}</dd></div>
                <div><dt>Elutasítási adatok lefedettsége</dt><dd>{g.rejection_measured_rides} túra</dd></div>
                <div><dt>Kimaradásméréssel rendelkező túra</dt><dd>{g.measured_rides} / {g.rides}</dd></div>
                <div><dt>Kimaradásméréssel rendelkező felhasználó</dt><dd>{amount(g.measured_users ?? null)}</dd></div>
                <div><dt>Kimaradással érintett felhasználó</dt><dd>{amount(g.gap_users ?? null)}</dd></div>
                <div><dt>Ebből részleges mérés</dt><dd>{g.partial_rides}</dd></div>
                <div><dt>Régi pozitív kimaradási jel</dt><dd>{g.legacy_gap_rides}</dd></div>
                <div><dt>Eltérő elfogadott és tárolt pontszám</dt><dd>{g.storage_measured_rides ? `${g.storage_mismatch_rides} / ${g.storage_measured_rides} túra` : 'Nincs adat'}</dd></div>
            </dl></td></tr></Fragment>;
        })}</tbody>
    </table></div>;
}

export default function GpsDeviceDiagnostics() {
    const [days, setDays] = useState(30);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('rides');
    const [request, setRequest] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [state, setState] = useState<{ days: number; request: number; result?: Result; error?: boolean } | null>(null);
    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const { data, error } = await supabase.rpc('admin_get_gps_device_diagnostics', { p_days: days });
                if (error || !data || !Array.isArray(data.groups)) throw error || new Error('Invalid response');
                if (!cancelled) setState({ days, request, result: data });
            } catch {
                if (!cancelled) setState({ days, request, error: true });
            }
        })();
        return () => { cancelled = true; };
    }, [days, request]);
    const groups = useMemo(() => (state?.result?.groups || []).filter(g =>
        [g.manufacturer, g.model, g.os, g.os_version, g.app_version].join(' ').toLocaleLowerCase('hu-HU').includes(query.toLocaleLowerCase('hu-HU')))
        .sort((a, b) => sort === 'rides' ? b.rides - a.rides || `${a.manufacturer} ${a.model}`.localeCompare(`${b.manufacturer} ${b.model}`)
            : sort === 'device' ? `${a.manufacturer} ${a.model}`.localeCompare(`${b.manufacturer} ${b.model}`)
            : (b.gap_percent ?? -1) - (a.gap_percent ?? -1) || b.measured_rides - a.measured_rides), [state, query, sort]);
    const current = state?.days === days && state?.request === request;
    const pages = Math.max(1, Math.ceil(groups.length / pageSize));
    const currentPage = Math.min(page, pages);
    return <section className={`${records.browser} ${styles.panel}`} aria-label="GPS-minőség eszközönként" aria-busy={!current}>
        <div className={records.toolbar}><div className={records.filters}>
            <label>Időszak<select value={days} onChange={e => { setDays(Number(e.target.value)); setPage(1); }}>{[7, 30, 90].map(n => <option key={n} value={n}>Utolsó {n} nap</option>)}</select></label>
            <label>Eszköz / OS / appverzió<input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} type="search" /></label>
            <label>Rendezés<select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="rides">Legtöbb túra elöl</option><option value="gap">Kimaradási arány szerint</option><option value="device">Eszköz szerint</option></select></label>
        </div>
            <button onClick={() => setRequest(n => n + 1)}>Frissítés</button>
            <span className={records.total}>{current && !state?.error ? `${groups.length} rekord` : '…'}</span>
        </div>
        {!current ? <p role="status">GPS-összesítés betöltése…</p> : state?.error ? <p role="alert">Az összesítés nem tölthető be. Ellenőrizd az adminjogosultságot és a migráció telepítését, majd frissíts.</p>
            : state?.result && <><p className={styles.notice}>{state.result.total_rides} mentett túra; {state.result.telemetry_rides} telemetriával; {state.result.total_rides - state.result.telemetry_rides} telemetria nélkül.</p><GpsGroupTable groups={groups.slice((currentPage - 1) * pageSize, currentPage * pageSize)} /></>}
        <footer className={records.pager}>
            <label>Sorok oldalanként<select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>{[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
            <span>{currentPage} / {pages} oldal</span>
            <div><button aria-label="Előző oldal" disabled={!current || currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Előző</button><button aria-label="Következő oldal" disabled={!current || currentPage >= pages} onClick={() => setPage(currentPage + 1)}>Következő</button></div>
        </footer>
        <details className={styles.notes}><summary>Adatok értelmezése</summary><p>Kizárólag összesített GPS-adatok, koordináta és személyes adat nélkül. A kimaradási arány nevezője az összehasonlítható mintapárral rendelkező túrák száma. A részleges mérés csak a megfigyelt szakaszt fedi. Régi pozitív jel: heartbeat-kimaradás összehasonlítható mérési lefedettség nélkül. A tárolási eltérés az elfogadott és tárolt mintaszám különbsége, önmagában nem adatvesztési bizonyíték. Az energiabeállítás szerinti együttjárás nem bizonyít okot. A telemetria megőrzése legfeljebb 90 nap.</p></details>
    </section>;
}
