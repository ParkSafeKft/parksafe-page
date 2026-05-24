'use client';

import { Download, Loader2, X } from 'lucide-react';
import type { StreetCount } from './regionExport';

interface RegionExportPanelProps {
    loading: boolean;
    imageUrl: string | null;
    rows: StreetCount[];
    error: 'image' | 'streets' | null;
    onClose: () => void;
    onDownloadPng: () => void;
    onDownloadCsv: () => void;
}

export default function RegionExportPanel({
    loading, imageUrl, rows, error, onClose, onDownloadPng, onDownloadCsv,
}: RegionExportPanelProps) {
    return (
        <div className="absolute inset-0 z-[1200] flex items-center justify-center bg-black/60 p-4">
            <div className="flex w-full max-w-3xl max-h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 p-4">
                    <h3 className="text-sm font-bold text-white">Régió export</h3>
                    <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Bezárás">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-col gap-4 overflow-auto p-4 md:flex-row">
                    <div className="md:w-1/2">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Kép</p>
                        <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
                            {imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imageUrl} alt="Régió előnézet" className="h-auto w-full" />
                            ) : (
                                <div className="flex h-40 items-center justify-center px-4 text-center text-xs text-zinc-500">
                                    {error === 'image' ? 'A kép mentése nem sikerült (csempe CORS).' : 'Nincs kép.'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:w-1/2">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Top utcák</p>
                        <div className="rounded-lg border border-white/10">
                            {loading ? (
                                <div className="flex h-40 items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-green-400" />
                                </div>
                            ) : rows.length === 0 ? (
                                <div className="flex h-40 items-center justify-center px-4 text-center text-xs text-zinc-500">
                                    {error === 'streets' ? 'Az utcaadatok lekérése nem sikerült.' : 'Nincs utca a kijelölt régióban.'}
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                                            <th className="p-2 font-bold">Utca</th>
                                            <th className="p-2 text-right font-bold">Ride-ok</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((r) => (
                                            <tr key={r.name} className="border-b border-white/5 last:border-0">
                                                <td className="p-2 text-zinc-200">{r.name}</td>
                                                <td className="p-2 text-right font-bold text-green-400">{r.rides.toLocaleString('hu-HU')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-white/10 p-4">
                    <button
                        onClick={onDownloadCsv}
                        disabled={loading || rows.length === 0}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-40"
                    >
                        <Download className="h-3.5 w-3.5" /> CSV letöltése
                    </button>
                    <button
                        onClick={onDownloadPng}
                        disabled={!imageUrl}
                        className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/15 px-3 py-2 text-xs font-bold text-green-400 hover:bg-green-500/25 disabled:opacity-40"
                    >
                        <Download className="h-3.5 w-3.5" /> PNG letöltése
                    </button>
                </div>
            </div>
        </div>
    );
}
