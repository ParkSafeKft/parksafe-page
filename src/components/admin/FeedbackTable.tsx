'use client';

import { AlertCircle, ChevronRight, HelpCircle, Mail, MessageSquare, SearchX, TrendingUp, UserRound } from 'lucide-react';
import BatchStatusActions from './BatchStatusActions';
import InlineStatusMenu from './InlineStatusMenu';
import { Checkbox } from '@/components/ui/checkbox';

interface Feedback {
    id: string;
    type: string;
    category: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    created_at: string;
    contact_email?: string;
    user_id?: string;
}

interface FeedbackTableProps {
    data: Feedback[];
    isLoading: boolean;
    selectedRows: Set<string>;
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string, checked: boolean) => void;
    onSort: (key: string) => void;
    sortConfig: { key: string; direction: string };
    onRowClick: (item: Feedback) => void;
    onOpenUser?: (userId: string) => void;
    onStatusChange: (id: string, newStatus: string) => void;
    onBatchStatusChange: (ids: string[], newStatus: string) => Promise<void>;
    batchActionLoading: boolean;
    searchTerm?: string;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    priorityFilter: string;
    onPriorityFilterChange: (value: string) => void;
    categoryFilter: string;
    onCategoryFilterChange: (value: string) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

const statusLabels: Record<string, string> = {
    open: 'Nyitott',
    in_progress: 'Folyamatban',
    resolved: 'Megoldva',
    closed: 'Lezárt',
    duplicate: 'Duplikált',
};

const priorityLabels: Record<string, string> = { high: 'Magas', medium: 'Közepes', low: 'Alacsony' };
const categoryLabels: Record<string, string> = { bug: 'Hiba', feature: 'Funkció', ui_ux: 'UI / UX', content: 'Tartalom', other: 'Egyéb' };

function TypeIcon({ type }: { type: string }) {
    const Icon = type === 'bug' ? AlertCircle : type === 'feature' ? TrendingUp : type === 'question' ? HelpCircle : MessageSquare;
    return <Icon aria-hidden="true" />;
}

function statusTone(status: string) {
    if (status === 'resolved') return 'success';
    if (status === 'open') return 'warning';
    if (status === 'in_progress') return 'info';
    if (status === 'duplicate') return 'danger';
    return 'neutral';
}

export default function FeedbackTable({
    data,
    selectedRows,
    onSelectAll,
    onSelectRow,
    onSort,
    onRowClick,
    onOpenUser,
    onStatusChange,
    onBatchStatusChange,
    batchActionLoading,
    searchTerm,
    statusFilter,
    onStatusFilterChange,
    priorityFilter,
    onPriorityFilterChange,
    categoryFilter,
    onCategoryFilterChange,
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
}: FeedbackTableProps) {
    const allVisibleSelected = data.length > 0 && data.every((item) => selectedRows.has(item.id));
    const someVisibleSelected = data.some((item) => selectedRows.has(item.id));

    return (
        <section className="ops-collection ops-collection-contained" aria-label="Visszajelzések">
            <div className="ops-filterbar">
                <label className="ops-filter"><strong>Státusz</strong><select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}><option value="">Mind</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                <label className="ops-filter"><strong>Prioritás</strong><select value={priorityFilter} onChange={(event) => onPriorityFilterChange(event.target.value)}><option value="">Mind</option>{Object.entries(priorityLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                <label className="ops-filter"><strong>Kategória</strong><select value={categoryFilter} onChange={(event) => onCategoryFilterChange(event.target.value)}><option value="">Mind</option>{Object.entries(categoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                <BatchStatusActions
                    selectedCount={selectedRows.size}
                    isLoading={batchActionLoading}
                    options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
                    onApply={(status) => onBatchStatusChange(Array.from(selectedRows), status)}
                    onClear={() => onSelectAll(false)}
                />
            </div>

            <div className="ops-collection-scroll">
                {data.length === 0 ? (
                    <div className="ops-empty"><div><SearchX aria-hidden="true" /><strong>{searchTerm || statusFilter || priorityFilter || categoryFilter ? 'Nincs találat' : 'Nincs visszajelzés'}</strong><span>Próbálj más keresést vagy szűrést.</span></div></div>
                ) : (
                    <>
                        <div className="ops-list-header ops-feedback-grid">
                            <Checkbox
                                checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                                onCheckedChange={(checked) => onSelectAll(checked === true)}
                                aria-label="Az oldalon látható összes visszajelzés kijelölése"
                            />
                            <button type="button" onClick={() => onSort('title')}>Visszajelzés</button>
                            <button type="button" onClick={() => onSort('status')}>Állapot</button>
                            <button type="button" onClick={() => onSort('priority')}>Prioritás</button>
                            <button type="button" onClick={() => onSort('created_at')}>Beküldő / dátum</button>
                            <span>Műveletek</span>
                        </div>

                        <div role="list">
                            {data.map((item) => (
                                <div className="ops-list-row ops-feedback-grid" role="listitem" data-clickable="true" key={item.id}>
                                    <button type="button" className="ops-row-open-hit" onClick={() => onRowClick(item)} aria-label={`${item.title} részleteinek megnyitása`} />
                                    <div onClick={(event) => event.stopPropagation()}>
                                        <Checkbox checked={selectedRows.has(item.id)} onCheckedChange={(checked) => onSelectRow(item.id, checked === true)} aria-label={`${item.title} kijelölése`} />
                                    </div>

                                    <button type="button" className="ops-feedback-subject" onClick={(event) => { event.stopPropagation(); onRowClick(item); }}>
                                        <span className="ops-feedback-icon"><TypeIcon type={item.type} /></span>
                                        <span className="ops-list-row-title">
                                            <strong>{item.title}</strong>
                                            <span>{item.description}</span>
                                        </span>
                                    </button>

                                    <InlineStatusMenu
                                        value={item.status}
                                        options={statusLabels}
                                        toneFor={statusTone}
                                        onValueChange={(status) => onStatusChange(item.id, status)}
                                        ariaLabel={`${item.title} állapota`}
                                    />

                                    <span className="ops-priority" data-priority={item.priority}>{priorityLabels[item.priority] || item.priority}<small>{categoryLabels[item.category] || item.category}</small></span>

                                    <div className="ops-feedback-contact">
                                        <span>{new Intl.DateTimeFormat('hu-HU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.created_at))}</span>
                                        <small>{item.contact_email || item.user_id || 'Nincs kapcsolat'}</small>
                                    </div>

                                    <div className="ops-inline-actions" onClick={(event) => event.stopPropagation()}>
                                        {item.contact_email ? <a className="ops-icon-action" href={`mailto:${item.contact_email}?subject=${encodeURIComponent(`ParkSafe: ${item.title}`)}`} title="Email írása" aria-label="Email írása"><Mail aria-hidden="true" /></a> : null}
                                        {item.user_id && onOpenUser ? <button type="button" className="ops-icon-action" onClick={() => onOpenUser(item.user_id!)} title="Beküldő profilja" aria-label="Beküldő profilja"><UserRound aria-hidden="true" /></button> : null}
                                        <button type="button" className="ops-icon-action" onClick={() => onRowClick(item)} title="Részletek" aria-label="Részletek"><ChevronRight aria-hidden="true" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <footer className="ops-pager">
                <label>Sorok&nbsp;<select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>{[5, 10, 20, 50, 100].map((size) => <option value={size} key={size}>{size}</option>)}</select></label>
                <div className="ops-pager-controls"><span>{currentPage} / {Math.max(totalPages, 1)} oldal</span><button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Előző</button><button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Következő</button></div>
            </footer>
        </section>
    );
}
