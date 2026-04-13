import { ChevronDown, ScrollText } from 'lucide-react';

interface AuditLogTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    actionFilter: string;
    onActionFilterChange: (value: string) => void;
    targetTypeFilter: string;
    onTargetTypeFilterChange: (value: string) => void;
    searchTerm?: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

const ACTION_OPTIONS = [
    'hide_from_leaderboard', 'show_on_leaderboard',
    'ban_user', 'unban_user',
    'toggle_city_active', 'toggle_challenge_active', 'delete_challenge', 'delete_city',
    'community_route_status', 'delete_community_route',
    'create_city', 'update_city',
];
const TARGET_OPTIONS = ['challenge_attempt', 'user', 'daily_challenge', 'city', 'community_bike_lane'];

const actionBadge = (a: string) => {
    if (a.startsWith('approve') || a === 'unban_user' || a === 'show_on_leaderboard') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (a.startsWith('reject') || a === 'ban_user' || a === 'hide_from_leaderboard' || a.startsWith('delete')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
};

export default function AuditLogTable({
    data, actionFilter, onActionFilterChange, targetTypeFilter, onTargetTypeFilterChange,
    searchTerm, currentPage, totalPages, onPageChange, pageSize, onPageSizeChange,
}: AuditLogTableProps) {
    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-wrap items-center gap-3 px-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Művelet:</span>
                    <div className="relative">
                        <select
                            value={actionFilter}
                            onChange={(e) => onActionFilterChange(e.target.value)}
                            className="appearance-none bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-green-500/50 cursor-pointer hover:border-white/20 transition-colors"
                        >
                            <option value="">Mind</option>
                            {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Cél:</span>
                    <div className="relative">
                        <select
                            value={targetTypeFilter}
                            onChange={(e) => onTargetTypeFilterChange(e.target.value)}
                            className="appearance-none bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-green-500/50 cursor-pointer hover:border-white/20 transition-colors"
                        >
                            <option value="">Mind</option>
                            {TARGET_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                        <ScrollText className="w-8 h-8 text-zinc-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                        {searchTerm || actionFilter || targetTypeFilter ? 'Nincs találat' : 'Nincsenek bejegyzések'}
                    </h3>
                </div>
            ) : (
                <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111] pb-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-[#111111]">
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Időpont</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Admin</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Művelet</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Cél típus</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Cél ID</th>
                                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Megjegyzés</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.map((item) => {
                                const adminName = item.profiles?.username || item.profiles?.full_name || (item.admin_id ? String(item.admin_id).slice(0, 8) : '-');
                                return (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 text-xs text-zinc-500 whitespace-nowrap font-mono">
                                            {item.created_at ? new Date(item.created_at).toLocaleString('hu-HU') : '-'}
                                        </td>
                                        <td className="p-4 text-sm text-zinc-200">{adminName}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider font-mono ${actionBadge(item.action)}`}>
                                                {item.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-zinc-400 font-mono">{item.target_type}</td>
                                        <td className="p-4 text-[10px] text-zinc-600 font-mono">{String(item.target_id).slice(0, 8)}…</td>
                                        <td className="p-4 text-xs text-zinc-400 max-w-xs">
                                            <span className="line-clamp-2">{item.notes || '-'}</span>
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
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500">{currentPage} / {Math.max(1, totalPages)} oldal</span>
                    <div className="flex gap-2">
                        <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${currentPage === 1 ? 'text-zinc-600 bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed' : 'text-zinc-400 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white'}`}>Előző</button>
                        <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${currentPage === totalPages || totalPages === 0 ? 'text-zinc-600 bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed' : 'text-white bg-zinc-800 border-zinc-700 hover:bg-zinc-700'}`}>Következő</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
