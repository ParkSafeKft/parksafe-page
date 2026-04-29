'use client';

import {
    MoreHorizontal,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    HelpCircle,
    ChevronDown,
    Mail
} from 'lucide-react';


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
    onStatusChange: (id: string, newStatus: string) => void;
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

const Filters = ({
    statusValue,
    onStatusChange,
    priorityValue,
    onPriorityChange,
    categoryValue,
    onCategoryChange,
}: {
    statusValue: string;
    onStatusChange: (v: string) => void;
    priorityValue: string;
    onPriorityChange: (v: string) => void;
    categoryValue: string;
    onCategoryChange: (v: string) => void;
}) => (
    <div className="flex flex-wrap items-center gap-3 px-2">
        <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Státusz:</span>
            <div className="relative">
                <select
                    value={statusValue}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="appearance-none bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-green-500/50 cursor-pointer hover:border-white/20 transition-colors"
                >
                    <option value="">Mind</option>
                    <option value="open">Nyitott</option>
                    <option value="in_progress">Folyamatban</option>
                    <option value="resolved">Megoldva</option>
                    <option value="closed">Lezárt</option>
                    <option value="duplicate">Duplikált</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Prioritás:</span>
            <div className="relative">
                <select
                    value={priorityValue}
                    onChange={(e) => onPriorityChange(e.target.value)}
                    className="appearance-none bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-green-500/50 cursor-pointer hover:border-white/20 transition-colors"
                >
                    <option value="">Mind</option>
                    <option value="high">Magas</option>
                    <option value="medium">Közepes</option>
                    <option value="low">Alacsony</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Kategória:</span>
            <div className="relative">
                <select
                    value={categoryValue}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="appearance-none bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-green-500/50 cursor-pointer hover:border-white/20 transition-colors"
                >
                    <option value="">Mind</option>
                    <option value="bug">Hiba</option>
                    <option value="feature">Funkció</option>
                    <option value="ui_ux">UI / UX</option>
                    <option value="content">Tartalom</option>
                    <option value="other">Egyéb</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>
        </div>
    </div>
);

export default function FeedbackTable({
    data,
    // selectedRows,
    // onSelectAll,
    // onSelectRow,
    onSort,
    sortConfig,
    onRowClick,
    onStatusChange,
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
    if (data.length === 0) {
        return (
            <div className="flex flex-col gap-4 h-full">
                <Filters
                    statusValue={statusFilter}
                    onStatusChange={onStatusFilterChange}
                    priorityValue={priorityFilter}
                    onPriorityChange={onPriorityFilterChange}
                    categoryValue={categoryFilter}
                    onCategoryChange={onCategoryFilterChange}
                />
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-zinc-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                        {searchTerm || statusFilter || priorityFilter || categoryFilter ? 'Nincs találat' : 'Nincs visszajelzés'}
                    </h3>
                    <p className="text-zinc-500 max-w-xs text-center mt-2">
                        {searchTerm || statusFilter || priorityFilter || categoryFilter
                            ? 'Próbálj más szűrési feltételt.'
                            : 'Még nem érkezett visszajelzés.'}
                    </p>
                </div>
            </div>
        );
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bug': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'feature': return <HelpCircle className="w-4 h-4 text-purple-500" />; // Bulb icon would be better but HelpCircle is ok
            case 'improvement': return <TrendingUpIcon className="w-4 h-4 text-blue-500" />;
            default: return <MessageSquare className="w-4 h-4 text-zinc-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            open: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
            closed: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
            duplicate: 'bg-red-500/10 text-red-500 border-red-500/20'
        };

        const labels = {
            open: 'Nyitott',
            in_progress: 'Folyamatban',
            resolved: 'Megoldva',
            closed: 'Lezárt',
            duplicate: 'Duplikált'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.closed}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const styles = {
            high: 'text-red-500',
            medium: 'text-yellow-500',
            low: 'text-blue-500'
        };
        const labels = {
            high: 'Magas',
            medium: 'Közepes',
            low: 'Alacsony'
        };

        return (
            <span className={`text-xs font-medium ${styles[priority as keyof typeof styles] || 'text-zinc-500'}`}>
                {labels[priority as keyof typeof labels] || priority}
            </span>
        );
    };

    const getCategoryBadge = (category: string) => {
        const styles: Record<string, string> = {
            bug: 'text-red-500',
            feature: 'text-purple-500',
            ui_ux: 'text-blue-500',
            content: 'text-emerald-500',
            other: 'text-zinc-400',
        };
        const labels: Record<string, string> = {
            bug: 'Hiba',
            feature: 'Funkció',
            ui_ux: 'UI / UX',
            content: 'Tartalom',
            other: 'Egyéb',
        };

        return (
            <span className={`text-xs font-medium ${styles[category] || 'text-zinc-500'}`}>
                {labels[category] || category}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <Filters
                statusValue={statusFilter}
                onStatusChange={onStatusFilterChange}
                priorityValue={priorityFilter}
                onPriorityChange={onPriorityFilterChange}
                categoryValue={categoryFilter}
                onCategoryChange={onCategoryFilterChange}
            />
            <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111]">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#111111]">
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-12">
                                {/* Type Icon */}
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('title')}
                            >
                                Tárgy
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('status')}
                            >
                                Státusz
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('priority')}
                            >
                                Prioritás
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('category')}
                            >
                                Kategória
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('created_at')}
                            >
                                Dátum
                            </th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                Kapcsolat
                            </th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                onClick={() => onRowClick(item)}
                            >
                                <td className="p-4">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/10">
                                        {getTypeIcon(item.type)}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-white max-w-[200px] truncate" title={item.title}>
                                            {item.title}
                                        </span>
                                        <span className="text-xs text-zinc-500 max-w-[200px] truncate" title={item.description}>
                                            {item.description}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(item.status)}
                                </td>
                                <td className="p-4">
                                    {getPriorityBadge(item.priority)}
                                </td>
                                <td className="p-4">
                                    {getCategoryBadge(item.category)}
                                </td>
                                <td className="p-4">
                                    <span className="text-sm text-zinc-500">
                                        {new Date(item.created_at).toLocaleDateString('hu-HU', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {item.contact_email ? (
                                        <div className="flex items-center gap-2 text-zinc-400" title={item.contact_email}>
                                            <Mail className="w-4 h-4" />
                                            <span className="text-xs max-w-[100px] truncate">{item.contact_email}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-zinc-600">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRowClick(item);
                                        }}
                                        className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex-shrink-0">
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">Sorok:</span>
                            <div className="relative">
                                <select
                                    value={pageSize}
                                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                    className="appearance-none bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg pl-2 pr-6 py-1 focus:outline-none focus:border-green-500/50 cursor-pointer hover:border-white/20 transition-colors"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-xs text-zinc-500">{currentPage} / {totalPages} oldal</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 text-xs font-medium border rounded-lg transition-colors ${currentPage === 1
                                        ? 'text-zinc-600 bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed'
                                        : 'text-zinc-400 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                                        }`}
                                >
                                    Előző
                                </button>
                                <button
                                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 text-xs font-medium border rounded-lg transition-colors ${currentPage === totalPages
                                        ? 'text-zinc-600 bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed'
                                        : 'text-white bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                                        }`}
                                >
                                    Következő
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Missing icon component
function TrendingUpIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    )
}
