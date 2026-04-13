import {
    MoreHorizontal,
    Route,
    Eye,
    ChevronDown,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CommunityRoutesTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRowClick: (item: any) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, newStatus: string) => void;
    toggleLoading: string | null;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    dateFrom: string;
    onDateFromChange: (v: string) => void;
    dateTo: string;
    onDateToChange: (v: string) => void;
    searchTerm?: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

const statusMeta: Record<string, { label: string; className: string; icon: typeof Clock }> = {
    pending: { label: 'Függőben', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
    in_review: { label: 'Vizsgálat alatt', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Search },
    accepted: { label: 'Elfogadva', className: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
    rejected: { label: 'Elutasítva', className: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
};

export default function CommunityRoutesTable({
    data,
    onRowClick,
    onDelete,
    onStatusChange,
    toggleLoading,
    statusFilter,
    onStatusFilterChange,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    searchTerm,
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
}: CommunityRoutesTableProps) {
    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-wrap items-center gap-3 px-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Státusz:</span>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                            className="appearance-none bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-green-500/50 cursor-pointer hover:border-white/20 transition-colors"
                        >
                            <option value="">Mind</option>
                            <option value="pending">Függőben</option>
                            <option value="in_review">Vizsgálat alatt</option>
                            <option value="accepted">Elfogadva</option>
                            <option value="rejected">Elutasítva</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Beküldve:</span>
                    <input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)}
                        className="bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500/50" />
                    <span className="text-zinc-500 text-xs">→</span>
                    <input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)}
                        className="bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500/50" />
                </div>
            </div>

            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                        <Route className="w-8 h-8 text-zinc-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                        {searchTerm || statusFilter ? 'Nincs találat' : 'Nincsenek beküldött útvonalak'}
                    </h3>
                    <p className="text-zinc-500 max-w-xs text-center mt-2">
                        {searchTerm || statusFilter
                            ? 'Próbálj más szűrési feltételt.'
                            : 'A felhasználók által beküldött kerékpárutak itt jelennek meg moderálásra.'
                        }
                    </p>
                </div>
            ) : (
                <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111] pb-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-[#111111]">
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Név</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Beküldő</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Felület</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Minőség</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Státusz</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Beküldve</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Műveletek</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.map((item) => {
                                const meta = statusMeta[item.status] || statusMeta.pending;
                                const Icon = meta.icon;
                                return (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                        onClick={() => onRowClick(item)}
                                    >
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-white">{item.name || 'Névtelen útvonal'}</span>
                                                {item.description && (
                                                    <span className="text-[11px] text-zinc-500 line-clamp-1 max-w-xs">{item.description}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-zinc-400">
                                                {item.profiles?.username || item.profiles?.full_name || (item.user_id ? String(item.user_id).slice(0, 8) : '-')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-zinc-500">{item.surface_type || '-'}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-zinc-400">
                                                {item.quality_rating ? `${item.quality_rating}/5` : '-'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.className}`}>
                                                <Icon className="w-3 h-3" />
                                                {meta.label}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-zinc-500">
                                                {item.created_at ? new Date(item.created_at).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/10" disabled={toggleLoading === item.id}>
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-[#111111] border-white/10 text-zinc-400">
                                                        <DropdownMenuLabel className="text-white">Státusz</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => onStatusChange(item.id, 'in_review')} className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white">
                                                            <Search className="mr-2 h-4 w-4" /> Vizsgálat alá vesz
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onStatusChange(item.id, 'accepted')} className="text-green-500 hover:bg-green-500/10 hover:text-green-400 cursor-pointer focus:bg-green-500/10 focus:text-green-400">
                                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Elfogad
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onStatusChange(item.id, 'rejected')} className="text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400">
                                                            <XCircle className="mr-2 h-4 w-4" /> Elutasít
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/10" />
                                                        <DropdownMenuLabel className="text-white">Egyéb</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => onRowClick(item)} className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white">
                                                            <Eye className="mr-2 h-4 w-4" /> Részletek
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Törlés
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex items-center justify-between px-2 pb-2">
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
                    <span className="text-xs text-zinc-500">
                        {currentPage} / {Math.max(1, totalPages)} oldal
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${currentPage === 1
                                ? 'text-zinc-600 bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed'
                                : 'text-zinc-400 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                                }`}
                        >
                            Előző
                        </button>
                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${currentPage === totalPages || totalPages === 0
                                ? 'text-zinc-600 bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed'
                                : 'text-white bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                                }`}
                        >
                            Következő
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
