'use client';

import { CheckCircle2, ChevronDown, Loader2, X } from 'lucide-react';
import { useState } from 'react';

export interface BatchStatusOption {
    value: string;
    label: string;
}

interface BatchStatusActionsProps {
    selectedCount: number;
    options: BatchStatusOption[];
    isLoading: boolean;
    onApply: (status: string) => Promise<void>;
    onClear: () => void;
}

export default function BatchStatusActions({
    selectedCount,
    options,
    isLoading,
    onApply,
    onClear,
}: BatchStatusActionsProps) {
    const [status, setStatus] = useState('');

    if (selectedCount === 0) return null;

    const handleApply = async () => {
        if (!status || isLoading) return;
        await onApply(status);
        setStatus('');
    };

    return (
        <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-500/20 bg-green-500/[0.06] px-3 py-2.5"
            role="region"
            aria-label="Csoportos műveletek"
        >
            <div className="flex items-center gap-2 text-sm text-green-300" aria-live="polite">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span className="font-semibold">{selectedCount} kijelölve</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <label htmlFor="batch-status" className="sr-only">Új státusz</label>
                    <select
                        id="batch-status"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        disabled={isLoading}
                        className="h-9 appearance-none rounded-lg border border-white/10 bg-[#111111] pl-3 pr-9 text-xs text-zinc-200 outline-none transition-colors hover:border-white/20 focus-visible:border-green-500/60 focus-visible:ring-2 focus-visible:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <option value="">Státusz kiválasztása…</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
                </div>

                <button
                    type="button"
                    onClick={handleApply}
                    disabled={!status || isLoading}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-green-500 px-3 text-xs font-semibold text-black transition-colors hover:bg-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                    {isLoading ? 'Frissítés…' : 'Alkalmaz'}
                </button>

                <button
                    type="button"
                    onClick={onClear}
                    disabled={isLoading}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Törlés
                </button>
            </div>
        </div>
    );
}
