import {
    MoreHorizontal,
    Building2,
    Eye,
    Edit,
    ChevronDown,
    Trash2,
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

interface CitiesTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRowClick: (item: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
    onToggleActive: (id: string, currentStatus: boolean) => void;
    toggleLoading: string | null;
    searchTerm?: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

export default function CitiesTable({
    data,
    onRowClick,
    onEdit,
    onDelete,
    onToggleActive,
    toggleLoading,
    searchTerm,
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
}: CitiesTableProps) {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                    {searchTerm ? 'Nincs találat' : 'Nincsenek városok'}
                </h3>
                <p className="text-zinc-500 max-w-xs text-center mt-2">
                    {searchTerm
                        ? 'Próbálj meg más keresési kifejezést használni.'
                        : 'Kattints az "Új hozzáadása" gombra az első város létrehozásához.'
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111] pb-0">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#111111]">
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Név</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Slug</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Ország</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Központ</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Időzóna</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Kihívások</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Státusz</th>
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
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-white">{item.name}</span>
                                        {item.name_en && item.name_en !== item.name && (
                                            <span className="text-[10px] text-zinc-500">{item.name_en}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <code className="text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded">{item.slug}</code>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm text-zinc-400 uppercase">{item.country_code || '-'}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-[11px] text-zinc-500 font-mono">
                                        {item.center_lat?.toFixed(4)}, {item.center_lng?.toFixed(4)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-xs text-zinc-500">{item.timezone || 'Europe/Budapest'}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-xs text-zinc-300 font-mono">{item.challenges_count ?? 0}</span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleActive(item.id, item.is_active);
                                        }}
                                        disabled={toggleLoading === item.id}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-opacity hover:opacity-80 disabled:opacity-50 ${item.is_active
                                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-zinc-500'}`} />
                                        {item.is_active ? 'Aktív' : 'Inaktív'}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/10">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#111111] border-white/10 text-zinc-400">
                                                <DropdownMenuLabel className="text-white">Műveletek</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onRowClick(item)} className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white">
                                                    <Eye className="mr-2 h-4 w-4" /> Megtekintés
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(item)} className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white">
                                                    <Edit className="mr-2 h-4 w-4" /> Szerkesztés
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Törlés
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
