'use client';

import { useEffect, useState } from 'react';
import { Crosshair } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Evidence {
    schema_version: 1;
    sample_gap_threshold_ms: number;
    observed_sample_count: number;
    observed_interval_count: number;
    sample_gaps: { start_ms: number; end_ms: number }[];
    events: { at_ms: number; kind: string; value: string }[];
    dropped_gaps: number;
    dropped_events: number;
    coverage: 'complete' | 'partial';
}

const EVENT_LABELS: Record<string, string> = {
    app_state: 'App állapota', foreground_permission: 'Helyengedély',
    background_permission: 'Háttér-helyengedély', pause: 'Szünet', resume: 'Folytatás', recovery: 'Helyreállítás',
};
const VALUE_LABELS: Record<string, string> = {
    active: 'Előtérben', background: 'Háttérben', inactive: 'Inaktív',
    unknown: 'Nem ismert', extension: 'Bővítmény', granted: 'Engedélyezve',
    denied: 'Tiltva', undetermined: 'Nem ismert', paused: 'Szüneteltetve',
    recording: 'Rögzítés', resumed: 'Megszakított túra folytatva',
};
const time = (ms: number) => new Date(ms).toLocaleString('hu-HU', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
});

export function TrackingEvidence({ evidence }: { evidence: Evidence | null }) {
    const count = (n: unknown) => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
    if (!evidence || evidence.schema_version !== 1 || !Array.isArray(evidence.sample_gaps) || !Array.isArray(evidence.events) ||
        !count(evidence.observed_interval_count) || !count(evidence.observed_sample_count) ||
        !count(evidence.dropped_gaps) || !count(evidence.dropped_events) ||
        evidence.sample_gap_threshold_ms !== 15000 || !['complete', 'partial'].includes(evidence.coverage) ||
        evidence.sample_gaps.length > 100 || evidence.events.length > 100 ||
        !evidence.sample_gaps.every(gap => gap && count(gap.start_ms) && count(gap.end_ms) && gap.end_ms > gap.start_ms) ||
        !evidence.events.every(event => event && count(event.at_ms) && typeof event.kind === 'string' && typeof event.value === 'string')) {
        return <p>Nincs mért mintakimaradási adat. Régebbi kliens vagy hiányzó telemetria; ez nem jelent hibamentes túrát.</p>;
    }
    const gaps = evidence.sample_gaps;
    const maxGap = gaps.reduce((max, gap) => Math.max(max, gap.end_ms - gap.start_ms), 0);
    return <>
        <dl>
            <div><dt>Megfigyelés</dt><dd>{evidence.coverage === 'complete' ? 'Indítástól' : 'Részleges'}</dd></div>
            <div><dt>Megfigyelt minták / időközök</dt><dd>{evidence.observed_sample_count} / {evidence.observed_interval_count}</dd></div>
            <div><dt>{evidence.sample_gap_threshold_ms / 1000} mp feletti mintaköz</dt><dd>{evidence.observed_interval_count ? gaps.length + evidence.dropped_gaps : 'Nincs összehasonlítható mintapár'}</dd></div>
            <div><dt>Leghosszabb tárolt mintaköz</dt><dd>{gaps.length ? `${(maxGap / 1000).toFixed(1)} mp` : evidence.observed_interval_count ? 'Nincs a megfigyelt szakaszon' : 'Nem állapítható meg'}</dd></div>
        </dl>
        <p>A mintaköz GPS-időbélyegek közti rés, önmagában nem bizonyít háttérleállást. A kézi szünetet és a helyreállításig eltelt időt nem számítjuk hibának.</p>
        {gaps.length > 0 && <details><summary>Mintaközök időpontjai ({gaps.length})</summary><ol>
            {gaps.map((gap, index) => <li key={`${gap.start_ms}-${index}`}>{time(gap.start_ms)} – {time(gap.end_ms)} · {((gap.end_ms - gap.start_ms) / 1000).toFixed(1)} mp</li>)}
        </ol></details>}
        {evidence.events.length > 0 && <details><summary>Megfigyelt állapotok és váltások ({evidence.events.length})</summary><ol>
            {evidence.events.map((event, index) => <li key={`${event.at_ms}-${index}`}>{time(event.at_ms)} · {Object.hasOwn(EVENT_LABELS, event.kind) ? EVENT_LABELS[event.kind] : 'Ismeretlen esemény'}: {Object.hasOwn(VALUE_LABELS, event.value) ? VALUE_LABELS[event.value] : 'Nem ismert'}</li>)}
        </ol></details>}
        {(evidence.dropped_gaps > 0 || evidence.dropped_events > 0) && <p>A tárolási korlát miatt {evidence.dropped_gaps} korábbi mintaköz és {evidence.dropped_events} korábbi esemény részlete kimaradt.</p>}
    </>;
}

export default function RideTrackingDiagnostics({ rideId }: { rideId: string }) {
    const [result, setResult] = useState<{ owner: string; evidence: Evidence | null; error: boolean } | null>(null);
    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const { data, error } = await supabase.rpc('admin_get_ride_tracking_diagnostics', { p_ride_id: rideId });
                if (error) throw error;
                if (!cancelled) setResult({ owner: rideId, evidence: data?.[0]?.tracking_diagnostics ?? null, error: false });
            } catch {
                if (!cancelled) setResult({ owner: rideId, evidence: null, error: true });
            }
        })();
        return () => { cancelled = true; };
    }, [rideId]);
    return <section>
        <header><Crosshair /><h3>GPS-kimaradások és állapotváltások</h3></header>
        {!result || result.owner !== rideId ? <p role="status">Diagnosztika betöltése…</p>
            : result.error ? <p role="alert">A részletes diagnosztika nem tölthető be. Ellenőrizd a hozzáférést és az adatbázis-frissítés telepítését.</p>
                : <TrackingEvidence evidence={result.evidence} />}
    </section>;
}
