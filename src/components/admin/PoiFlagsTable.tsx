'use client';

import { ChevronRight, ExternalLink, Flag, MapPin, SearchX, Store, UserRound, Wrench } from 'lucide-react';
import BatchStatusActions from './BatchStatusActions';
import { Checkbox } from '@/components/ui/checkbox';

interface PoiFlag {
    id: string;
    poi_id: string;
    poi_type: string;
    user_id: string;
    reason: string;
    comment: string | null;
    reported_latitude: number | null;
    reported_longitude: number | null;
    status: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    reporter_username?: string;
    reporter_full_name?: string;
}

interface PoiFlagsTableProps {
    data: PoiFlag[];
    isLoading: boolean;
    selectedRows: Set<string>;
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string, checked: boolean) => void;
    onSort: (key: string) => void;
    sortConfig: { key: string; direction: string };
    onRowClick: (item: PoiFlag) => void;
    onOpenPoi?: (poiId: string, poiType: string) => void;
    onOpenUser?: (userId: string) => void;
    onStatusChange: (id: string, newStatus: string) => void;
    onBatchStatusChange: (ids: string[], newStatus: string) => Promise<void>;
    batchActionLoading: boolean;
    onDelete?: (id: string) => void;
    searchTerm?: string;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    reasonFilter: string;
    onReasonFilterChange: (value: string) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

const statuses: Record<string, string> = { pending: 'Függőben', reviewed: 'Áttekintve', resolved: 'Megoldva', dismissed: 'Elutasítva' };
const reasons: Record<string, string> = { wrong_location: 'Rossz helyen', doesnt_exist: 'Nem létezik', incorrect_info: 'Hibás információ', duplicate: 'Duplikált', other: 'Egyéb' };
const poiTypes: Record<string, string> = { parking: 'Parkoló', bicycleService: 'Szerviz / bolt', repairStation: 'Javítóállomás', drinkingFountain: 'Ivókút' };

function PoiIcon({ type }: { type: string }) {
    const Icon = type === 'bicycleService' ? Store : type === 'repairStation' ? Wrench : MapPin;
    return <Icon aria-hidden="true" />;
}

function statusTone(status: string) {
    if (status === 'resolved') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'reviewed') return 'info';
    if (status === 'dismissed') return 'danger';
    return 'neutral';
}

export default function PoiFlagsTable({
    data,
    selectedRows,
    onSelectAll,
    onSelectRow,
    onSort,
    onRowClick,
    onOpenPoi,
    onOpenUser,
    onStatusChange,
    onBatchStatusChange,
    batchActionLoading,
    searchTerm,
    statusFilter,
    onStatusFilterChange,
    reasonFilter,
    onReasonFilterChange,
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
}: PoiFlagsTableProps) {
    const allVisibleSelected = data.length > 0 && data.every((item) => selectedRows.has(item.id));
    const someVisibleSelected = data.some((item) => selectedRows.has(item.id));

    return (
        <section className="ops-collection" aria-label="POI bejelentések">
            <div className="ops-filterbar">
                <label className="ops-filter"><strong>Státusz</strong><select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}><option value="">Mind</option>{Object.entries(statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                <label className="ops-filter"><strong>Ok</strong><select value={reasonFilter} onChange={(event) => onReasonFilterChange(event.target.value)}><option value="">Mind</option>{Object.entries(reasons).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                <BatchStatusActions selectedCount={selectedRows.size} isLoading={batchActionLoading} options={Object.entries(statuses).map(([value, label]) => ({ value, label }))} onApply={(status) => onBatchStatusChange(Array.from(selectedRows), status)} onClear={() => onSelectAll(false)} />
            </div>

            {data.length === 0 ? (
                <div className="ops-empty"><div><SearchX aria-hidden="true" /><strong>{searchTerm || statusFilter || reasonFilter ? 'Nincs találat' : 'Nincs POI bejelentés'}</strong><span>Próbálj más keresést vagy szűrést.</span></div></div>
            ) : (
                <>
                    <div className="ops-list-header ops-flag-grid">
                        <Checkbox checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false} onCheckedChange={(checked) => onSelectAll(checked === true)} aria-label="Összes látható bejelentés kijelölése" />
                        <button type="button" onClick={() => onSort('reason')}>Bejelentés</button>
                        <span>Érintett POI</span>
                        <button type="button" onClick={() => onSort('status')}>Állapot</button>
                        <span>Beküldő / dátum</span>
                        <span>Műveletek</span>
                    </div>
                    <div role="list">
                        {data.map((item) => {
                            const reporter = item.reporter_username || item.reporter_full_name || item.user_id || 'Ismeretlen';
                            const hasCoords = Number.isFinite(item.reported_latitude) && Number.isFinite(item.reported_longitude);
                            return (
                                <div className="ops-list-row ops-flag-grid" role="listitem" key={item.id}>
                                    <Checkbox checked={selectedRows.has(item.id)} onCheckedChange={(checked) => onSelectRow(item.id, checked === true)} aria-label={`${reasons[item.reason] || item.reason} kijelölése`} />
                                    <button type="button" className="ops-feedback-subject" onClick={() => onRowClick(item)}>
                                        <span className="ops-feedback-icon"><Flag aria-hidden="true" /></span>
                                        <span className="ops-list-row-title"><strong>{reasons[item.reason] || item.reason}</strong><span>{item.comment || 'A bejelentő nem adott meg megjegyzést.'}</span></span>
                                    </button>
                                    <button type="button" className="ops-entity-link" onClick={() => onOpenPoi?.(item.poi_id, item.poi_type)} disabled={!onOpenPoi}>
                                        <span className="ops-feedback-icon"><PoiIcon type={item.poi_type} /></span>
                                        <span><strong>{poiTypes[item.poi_type] || item.poi_type}</strong><small>{item.poi_id}</small></span>
                                    </button>
                                    <label className="ops-row-select"><span className="ops-status" data-tone={statusTone(item.status)}>{statuses[item.status] || item.status}</span><select value={item.status} onChange={(event) => onStatusChange(item.id, event.target.value)} aria-label="Bejelentés állapota">{Object.entries(statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                                    <div className="ops-feedback-contact"><span>{new Intl.DateTimeFormat('hu-HU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.created_at))}</span><small>{reporter}</small></div>
                                    <div className="ops-inline-actions">
                                        {hasCoords ? <a className="ops-icon-action" href={`https://www.openstreetmap.org/edit?#map=19/${item.reported_latitude}/${item.reported_longitude}`} target="_blank" rel="noopener noreferrer" title="Bejelentett hely az OSM-en" aria-label="Bejelentett hely az OSM-en"><ExternalLink aria-hidden="true" /></a> : null}
                                        {item.user_id && onOpenUser ? <button type="button" className="ops-icon-action" onClick={() => onOpenUser(item.user_id)} title="Bejelentő profilja" aria-label="Bejelentő profilja"><UserRound aria-hidden="true" /></button> : null}
                                        <button type="button" className="ops-icon-action" onClick={() => onRowClick(item)} title="Részletek" aria-label="Részletek"><ChevronRight aria-hidden="true" /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
            <footer className="ops-pager"><label>Sorok&nbsp;<select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>{[5, 10, 20, 50, 100].map((size) => <option value={size} key={size}>{size}</option>)}</select></label><div className="ops-pager-controls"><span>{currentPage} / {Math.max(totalPages, 1)} oldal</span><button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Előző</button><button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Következő</button></div></footer>
        </section>
    );
}
