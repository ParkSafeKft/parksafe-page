'use client';

import { MoreHorizontal, Camera, MapPin, User, CheckCircle2, XCircle, ChevronDown, ExternalLink, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ParkingImageSubmission {
    id: string;
    parking_spot_id: string;
    user_id: string;
    image_url: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    parking_name?: string | null;
    parking_city?: string | null;
    parking_coordinate?: unknown;
    reporter_username?: string | null;
    reporter_full_name?: string | null;
}

interface ParkingImageSubmissionsTableProps {
    data: ParkingImageSubmission[];
    isLoading: boolean;
    onStatusChange: (id: string, newStatus: 'approved' | 'rejected') => void;
    onOpenParkingEdit: (parkingSpotId: string) => void;
    onDelete: (submission: ParkingImageSubmission) => void;
    searchTerm?: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

export default function ParkingImageSubmissionsTable({
    data,
    isLoading,
    onStatusChange,
    onOpenParkingEdit,
    onDelete,
    searchTerm,
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
}: ParkingImageSubmissionsTableProps) {
    if (!isLoading && data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                    {searchTerm ? 'Nincs találat' : 'Nincsenek jóváhagyásra váró képek'}
                </h3>
                <p className="text-zinc-500 max-w-xs text-center mt-2">
                    {searchTerm
                        ? 'Próbálj meg más keresési kifejezést használni.'
                        : 'Ha a felhasználók képeket töltenek fel a parkolókhoz, itt fognak megjelenni.'}
                </p>
            </div>
        );
    }

    const getStatusBadge = (status: ParkingImageSubmission['status']) => {
        const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
        if (status === 'pending') {
            return (
                <span className={`${base} bg-yellow-500/10 text-yellow-500 border-yellow-500/20`}>
                    Függőben
                </span>
            );
        }
        if (status === 'approved') {
            return (
                <span className={`${base} bg-green-500/10 text-green-500 border-green-500/20`}>
                    Jóváhagyva
                </span>
            );
        }
        return (
            <span className={`${base} bg-red-500/10 text-red-500 border-red-500/20`}>
                Elutasítva
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111]">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#111111]">
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-20">Kép</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Parkoló</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Felhasználó</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Státusz</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Dátum</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-zinc-900">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.image_url}
                                            alt="Parkoló kép"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-green-500" />
                                            <span className="text-sm font-semibold text-white">
                                                {item.parking_name || 'Ismeretlen parkoló'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-zinc-500">
                                            {item.parking_city || 'Nincs város megadva'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <User className="w-3.5 h-3.5" />
                                        <span className="text-xs">
                                            {item.reporter_username || item.reporter_full_name || 'Ismeretlen'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(item.status)}
                                </td>
                                <td className="p-4">
                                    <span className="text-sm text-zinc-500">
                                        {new Date(item.created_at).toLocaleDateString('hu-HU', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#111111] border-white/10 text-zinc-400">
                                            <DropdownMenuLabel className="text-white">Műveletek</DropdownMenuLabel>
                                            {item.status !== 'approved' && (
                                                <DropdownMenuItem
                                                    onClick={() => onStatusChange(item.id, 'approved')}
                                                    className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white"
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" />
                                                    Jóváhagyás
                                                </DropdownMenuItem>
                                            )}
                                            {item.status !== 'rejected' && (
                                                <DropdownMenuItem
                                                    onClick={() => onStatusChange(item.id, 'rejected')}
                                                    className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white"
                                                >
                                                    <XCircle className="mr-2 h-4 w-4 text-red-400" />
                                                    Elutasítás
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                onClick={() => onOpenParkingEdit(item.parking_spot_id)}
                                                className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white"
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Marker megnyitása
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem
                                                onClick={() => onDelete(item)}
                                                className="text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Kérelem és kép törlése
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex-shrink-0">
                {totalPages > 1 && (
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
                                    className={`px-4 py-2 text-xs font-medium border rounded-lg transition-colors ${
                                        currentPage === 1
                                            ? 'text-zinc-600 bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed'
                                            : 'text-zinc-400 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                                    }`}
                                >
                                    Előző
                                </button>
                                <button
                                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className={`px-4 py-2 text-xs font-medium border rounded-lg transition-colors ${
                                        currentPage === totalPages || totalPages === 0
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

