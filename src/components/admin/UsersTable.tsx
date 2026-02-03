import {
    MoreHorizontal,
    Users,
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
    selectAll: boolean;
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
        <div className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#111111]">
                <table className="w-full text-left border-collapse">
                    <thead>
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
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-green-500/50 transition-colors">
                                        <ImageWithFallback
                                            src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100'}
                                            alt={user.username || 'User'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm font-semibold text-white">{user.username || 'Nincs megadva'}</span>
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
                                        onClick={() => onRowClick(user)}
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
            <div className="flex items-center justify-between px-2">
                <p className="text-xs text-zinc-500">1 / 1 oldal</p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg opacity-50 cursor-not-allowed">Előző</button>
                    <button className="px-4 py-2 text-xs font-medium text-white bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors">Következő</button>
                </div>
            </div>
        </div>
    );
}
