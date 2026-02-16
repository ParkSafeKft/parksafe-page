'use client';

import {
    MoreHorizontal,
    Flag,
    MapPin,
    AlertTriangle,
    Clock,
    ChevronDown,
    User,
    Wrench,
    Store
} from 'lucide-react';

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
    // Joined fields
    reporter_username?: string;
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
    onStatusChange: (id: string, newStatus: string) => void;
    onDelete?: (id: string) => void;
    searchTerm?: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

export default function PoiFlagsTable({
    data,
    onSort,
    sortConfig,
    onRowClick,
    onStatusChange,
    onDelete,
    searchTerm,
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
}: PoiFlagsTableProps) {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <Flag className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                    {searchTerm ? 'Nincs találat' : 'Nincs POI bejelentés'}
                </h3>
                <p className="text-zinc-500 max-w-xs text-center mt-2">
                    {searchTerm
                        ? 'Próbálj meg más keresési kifejezést használni.'
                        : 'Még nem érkezett POI bejelentés.'}
                </p>
            </div>
        );
    }

    const getPoiTypeIcon = (poiType: string) => {
        switch (poiType) {
            case 'parking': return <MapPin className="w-4 h-4 text-green-500" />;
            case 'bicycleService': return <Store className="w-4 h-4 text-blue-500" />;
            case 'repairStation': return <Wrench className="w-4 h-4 text-orange-500" />;
            default: return <MapPin className="w-4 h-4 text-zinc-500" />;
        }
    };

    const getPoiTypeLabel = (poiType: string) => {
        switch (poiType) {
            case 'parking': return 'Parkoló';
            case 'bicycleService': return 'Szerviz';
            case 'repairStation': return 'Javító';
            default: return poiType;
        }
    };

    const getReasonLabel = (reason: string) => {
        const labels: Record<string, string> = {
            wrong_location: 'Rossz helyen van',
            doesnt_exist: 'Nem létezik',
            incorrect_info: 'Hibás információ',
            duplicate: 'Duplikált',
            other: 'Egyéb',
        };
        return labels[reason] || reason;
    };

    const getReasonStyle = (reason: string) => {
        const styles: Record<string, string> = {
            wrong_location: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            doesnt_exist: 'bg-red-500/10 text-red-500 border-red-500/20',
            incorrect_info: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            duplicate: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            other: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        };
        return styles[reason] || styles.other;
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            reviewed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
            dismissed: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
        };

        const labels: Record<string, string> = {
            pending: 'Függőben',
            reviewed: 'Áttekintve',
            resolved: 'Megoldva',
            dismissed: 'Elutasítva',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111]">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#111111]">
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-12">
                                {/* POI Type Icon */}
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('poi_type')}
                            >
                                POI Típus
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('reason')}
                            >
                                Ok
                            </th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                Megjegyzés
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('status')}
                            >
                                Státusz
                            </th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                Bejelentő
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('created_at')}
                            >
                                Dátum
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
                                        {getPoiTypeIcon(item.poi_type)}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm font-medium text-white">
                                        {getPoiTypeLabel(item.poi_type)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getReasonStyle(item.reason)}`}>
                                        {getReasonLabel(item.reason)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm text-zinc-400 max-w-[200px] truncate block" title={item.comment || '-'}>
                                        {item.comment || '-'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(item.status)}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <User className="w-3.5 h-3.5" />
                                        <span className="text-xs">{item.reporter_username || 'Ismeretlen'}</span>
                                    </div>
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
