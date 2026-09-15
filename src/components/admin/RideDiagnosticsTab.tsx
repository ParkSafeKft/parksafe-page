/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight, Copy, SearchX } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { writeAuditLog } from '@/lib/adminAuditLog';
import { Dialog } from '@/components/ui/dialog';
import { AdminModalBody, AdminModalContent, AdminModalFrame, AdminModalHeader, AdminModalSection } from './AdminModal';

type Row = Record<string, any> & { ride_type: 'normal' | 'diagnostic' };
const PAGE_SIZE = 25;
const normalSelect = 'id,user_id,client_ride_id,started_at,created_at,duration_seconds,moving_time_seconds,distance_meters,track_samples';
const diagnosticSelect = 'id,client_ride_id,user_id,started_at,created_at,duration_seconds,moving_time_seconds,distance_meters,raw_sample_count,rejection_counts,reason,model';
const formatDate = (value: unknown) => value ? new Date(String(value)).toLocaleString('hu-HU', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const number = (value: unknown) => value == null ? 0 : Number(value) || 0;

export default function RideDiagnosticsTab() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Row | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    const [normal, diagnostic] = await Promise.all([
      supabase.from('ride_summaries').select(normalSelect).order('created_at', { ascending: false }).limit(500),
      supabase.from('discarded_ride_diagnostics').select(diagnosticSelect).order('created_at', { ascending: false }).limit(500),
    ]);
    if (normal.error || diagnostic.error) { setRows([]); setError('A diagnosztikai adatforrás vagy az admin RLS-hozzáférés hiányzik.'); setLoading(false); return; }
    const saved = (normal.data || []).map((row: any) => ({ ...row, ride_type: 'normal', sample_total: Array.isArray(row.track_samples) ? row.track_samples.length : 0, sample_accepted: Array.isArray(row.track_samples) ? row.track_samples.length : 0, sample_rejected: 0 }));
    const discarded = (diagnostic.data || []).map((row: any) => ({ ...row, ride_type: 'diagnostic', sample_total: number(row.raw_sample_count), sample_accepted: 0, sample_rejected: Object.values(row.rejection_counts || {}).reduce((sum: number, value: any) => sum + number(value), 0) }));
    setRows([...saved, ...discarded].sort((a, b) => new Date(b.started_at || b.created_at || 0).getTime() - new Date(a.started_at || a.created_at || 0).getTime())); setLoading(false);
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const filtered = useMemo(() => rows.filter(row => (type === 'all' || row.ride_type === type) && (!query || JSON.stringify(row).toLowerCase().includes(query.toLowerCase()))), [rows, type, query]);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openDetails = (row: Row) => { setSelected(row); void writeAuditLog({ adminId: user?.id, action: 'view_ride_diagnostic', targetType: 'ride', targetId: String(row.id || row.client_ride_id), notes: 'Diagnosztikai részletek megtekintve.' }); };

  return <section className="ops-collection ops-collection-contained" aria-label="Ride diagnosztika">
    <div className="ops-filterbar ride-diagnostics-filters">
      <label className="ops-filter ride-diagnostics-search"><strong>Keresés</strong><input value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Ride ID, client ID, user ID, model vagy reason" /></label>
      <label className="ops-filter"><strong>Típus</strong><select value={type} onChange={event => { setType(event.target.value); setPage(1); }}><option value="all">Mind</option><option value="normal">Normál</option><option value="diagnostic">Diagnosztikai</option></select></label>
      <button type="button" className="ops-filter-refresh" onClick={() => void load()}>Frissítés</button>
    </div>
    <div className="ops-collection-scroll">
      {error ? <div className="ops-empty"><div><SearchX /><strong>Adatforrás hiba</strong><span>{error}</span></div></div> : loading ? <div className="ops-empty"><div><strong>Betöltés…</strong></div></div> : !pageRows.length ? <div className="ops-empty"><div><SearchX /><strong>Nincs találat</strong><span>Próbálj más keresést vagy szűrést.</span></div></div> : <>
        <div className="ops-list-header ride-diagnostics-grid"><span>Időpont / azonosító</span><span>Típus</span><span>Duration / moving / distance</span><span>Minták total / accepted / rejected</span><span>Műveletek</span></div>
        <div role="list">{pageRows.map(row => <div className="ops-list-row ride-diagnostics-grid" role="listitem" tabIndex={0} data-clickable="true" data-diagnostic={row.ride_type === 'diagnostic'} key={`${row.ride_type}-${row.id}`} onClick={() => openDetails(row)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') openDetails(row); }}>
          <div><strong>{formatDate(row.started_at || row.created_at)}</strong><small>{row.id}<br />{row.client_ride_id || row.user_id || 'Nincs azonosító'}</small></div>
          <span className="ride-diagnostic-type">{row.ride_type === 'diagnostic' ? 'DIAGNOSZTIKAI PRÓBÁLKOZÁS' : 'NORMÁL RIDE'}<small>{row.ride_type === 'diagnostic' ? 'nem mentett ride' : 'mentett ride'}</small></span>
          <span>{number(row.duration_seconds)} mp / {number(row.moving_time_seconds)} mp / {number(row.distance_meters)} m</span>
          <span>{number(row.sample_total)} / {number(row.sample_accepted)} / {number(row.sample_rejected)}</span>
          <div className="ops-inline-actions" onClick={event => event.stopPropagation()}><button type="button" className="ops-icon-action" title="ID másolása" onClick={() => void navigator.clipboard?.writeText(String(row.id || row.client_ride_id))}><Copy /></button><button type="button" className="ops-icon-action" title="Részletek" onClick={() => openDetails(row)}><ChevronRight /></button></div>
        </div>)}</div>
      </>}
    </div>
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelected(null); }}><AdminModalContent variant="inspector"><AdminModalFrame>{selected ? <><AdminModalHeader title={selected.ride_type === 'diagnostic' ? 'Diagnosztikai próbálkozás' : 'Normál ride'} eyebrow="Ride diagnosztika" subtitle={selected.ride_type === 'diagnostic' ? 'Nem mentett ride — technikai hibakeresési rekord' : 'Mentett ride technikai összefoglaló'} /><AdminModalBody><AdminModalSection title="Ride adatok"><dl className="ride-diagnostic-modal-grid"><div><dt>Időpont</dt><dd>{formatDate(selected.started_at || selected.created_at)}</dd></div><div><dt>Ride ID</dt><dd>{selected.id || '—'}</dd></div><div><dt>Client ride ID</dt><dd>{selected.client_ride_id || '—'}</dd></div><div><dt>User ID</dt><dd>{selected.user_id || '—'}</dd></div><div><dt>Duration / moving</dt><dd>{number(selected.duration_seconds)} mp / {number(selected.moving_time_seconds)} mp</dd></div><div><dt>Distance</dt><dd>{number(selected.distance_meters)} m</dd></div><div><dt>Minták</dt><dd>{number(selected.sample_total)} total / {number(selected.sample_accepted)} accepted / {number(selected.sample_rejected)} rejected</dd></div><div><dt>Reason / model</dt><dd>{selected.reason || selected.model || '—'}</dd></div></dl></AdminModalSection></AdminModalBody></> : null}</AdminModalFrame></AdminModalContent></Dialog>
    <footer className="ops-pager"><span>{filtered.length} rekord</span><div className="ops-pager-controls"><span>{page} / {Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))} oldal</span><button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Előző</button><button type="button" disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setPage(value => value + 1)}>Következő</button></div></footer>
  </section>;
}
