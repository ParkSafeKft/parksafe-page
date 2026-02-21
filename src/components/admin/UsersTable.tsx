import {
    MoreHorizontal,
    Users,
    ChevronDown,
} from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface UsersTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    users: any[];
    isLoading: boolean;
    selectedRows: Set<string>;
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string, checked: boolean) => void;
    onSort: (key: string) => void;
    sortConfig: { key: string; direction: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRowClick: (item: any) => void;
    searchTerm?: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

export default function UsersTable({
    users,
    // selectedRows,
    // onSelectAll,
    // onSelectRow,
    // onSort,
    // sortConfig,
    onRowClick,
    searchTerm,
    // selectAll,
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
}: UsersTableProps) {
    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                    {searchTerm ? 'Nincs találat' : 'Nincsenek felhasználók'}
                </h3>
                <p className="text-zinc-500 max-w-xs text-center mt-2">
                    {searchTerm
                        ? 'Próbálj meg más keresési kifejezést használni.'
                        : 'Még nem regisztrált senki az alkalmazásba.'}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111]">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#111111]">
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Avatar</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Felhasználónév</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Szerepkör</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Létrehozva</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                onClick={() => onRowClick(user)}
                            >
                                <td className="p-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-green-500/50 transition-colors">
                                        <ImageWithFallback
                                            src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100'}
                                            alt={user.username || user.full_name || 'User'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm font-semibold text-white">{user.username || user.full_name || 'Nincs megadva'}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm text-zinc-400">{user.email || 'Nincs email'}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin'
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm text-zinc-500">
                                        {user.created_at
                                            ? new Date(user.created_at).toLocaleDateString('hu-HU', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })
                                            : 'Ismeretlen'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRowClick(user);
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
                {/* Footer Content */}

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
