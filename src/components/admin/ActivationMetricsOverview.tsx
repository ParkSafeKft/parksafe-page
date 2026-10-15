'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, Clock3, Repeat2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { ANALYTICS_TIMEZONE, formatMedianTime, type ActivationMetrics, type RegistrationPreset } from '@/lib/activationMetrics';

export default function ActivationMetricsOverview() {
    const router = useRouter();
    const [period, setPeriod] = useState<RegistrationPreset>('30');
    const [revision, setRevision] = useState(0);
    const [stats, setStats] = useState<ActivationMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (controller.signal.aborted) return;
                if (!session?.access_token) { router.replace('/login'); return; }
                const response = await fetch(`/api/admin-activation-metrics?period=${period}`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                    cache: 'no-store', signal: controller.signal,
                });
                if (controller.signal.aborted) return;
                if (response.status === 401) { router.replace('/login'); return; }
                if (response.status === 403) { router.replace('/'); return; }
                if (!response.ok) throw new Error('Nem sikerült frissíteni.');
                const data: ActivationMetrics = await response.json();
                if (!controller.signal.aborted) setStats(data);
            } catch (reason) {
                if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Ismeretlen hiba');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        void load();
        return () => controller.abort();
    }, [period, revision, router]);

    const count = (value: number) => value.toLocaleString('hu-HU');
    const percentage = (value: number | null) => value === null ? 'Nincs adat' : `${value.toLocaleString('hu-HU', { maximumFractionDigits: 1 })}%`;
    const date = (value: string) => new Intl.DateTimeFormat('hu-HU', {
        timeZone: ANALYTICS_TIMEZONE, dateStyle: 'short',
    }).format(new Date(`${value}T12:00:00Z`));

    return (
        <section className="ops-activation" aria-labelledby="activation-title" aria-busy={loading}>
            <header>
                <h2 id="activation-title">Aktiválás és visszatérés</h2>
                <div className="ops-activation-periods" role="group" aria-label="Regisztrációs időszak">
                    {([{ value: '30', label: '30 nap' }, { value: '90', label: '90 nap' }, { value: 'all', label: 'Teljes időszak' }] as const).map(option => (
                        <button key={option.value} type="button" aria-pressed={period === option.value} onClick={() => {
                            setPeriod(option.value);
                            if (period === option.value) setRevision(value => value + 1);
                        }}>{option.label}</button>
                    ))}
                </div>
            </header>
            <div className="ops-activation-context">
                <span>{stats ? `${date(stats.registration_from)} – ${date(stats.registration_to)}` : <Placeholder />}</span>
                <span>{stats ? <><b>{count(stats.first_ride.sample_users)}</b> tekert · {count(stats.cohort_users)} regisztráló</> : <Placeholder />}</span>
            </div>
            <div className="ops-activation-values">
                <article><h3><Bike aria-hidden="true" />Első tekerés</h3><small>Regisztráció után 7 napon belül</small>
                    <strong>{stats ? percentage(stats.activation.percent) : <Placeholder />}</strong>
                    <p>{stats ? `${count(stats.activation.numerator)} / ${count(stats.activation.denominator)} regisztráló` : <Placeholder />}</p>
                    <RatioBar percent={stats?.activation.percent ?? null} label="Első tekerés aránya" /></article>
                <article><h3><Repeat2 aria-hidden="true" />Visszatérés</h3><small>Első tekerés után 7 napon belül</small>
                    <strong>{stats ? percentage(stats.return.percent) : <Placeholder />}</strong>
                    <p>{stats ? `${count(stats.return.numerator)} / ${count(stats.return.denominator)} első tekerő` : <Placeholder />}</p>
                    <RatioBar percent={stats?.return.percent ?? null} label="Visszatérők aránya" /></article>
                <article><h3><Clock3 aria-hidden="true" />Első tekerésig</h3><small>Medián idő</small>
                    <strong>{stats ? formatMedianTime(stats.first_ride.median_seconds) : <Placeholder />}</strong>
                    <p>{stats ? `${count(stats.first_ride.sample_users)} tekerő alapján` : <Placeholder />}</p></article>
            </div>
            <footer className="ops-activation-footer">
                <div className="ops-activation-status" aria-live="polite" aria-atomic="true">
                    {loading ? <span role="status">{stats ? 'Frissítés…' : 'Betöltés…'}</span> : error ? <span role="alert">{error} <button type="button" onClick={() => setRevision(value => value + 1)}>Újra</button></span> : stats ? <time dateTime={stats.cutoff}>Frissítve {new Intl.DateTimeFormat('hu-HU', { timeZone: stats.timezone, dateStyle: 'short', timeStyle: 'short' }).format(new Date(stats.cutoff))} · {stats.timezone}</time> : null}
                </div>
            </footer>
        </section>
    );
}

function Placeholder() {
    return <span className="ops-activation-placeholder" aria-hidden="true" />;
}

function RatioBar({ percent, label }: { percent: number | null; label: string }) {
    return <div className="ops-ratio-bar" role={percent === null ? undefined : 'meter'} aria-hidden={percent === null ? true : undefined} aria-label={percent === null ? undefined : label} aria-valuemin={percent === null ? undefined : 0} aria-valuemax={percent === null ? undefined : 100} aria-valuenow={percent ?? undefined}>
        {percent === null ? null : <span style={{ width: `${percent}%` }} />}
    </div>;
}
