'use client';

import { ChevronDown, Loader2, X } from 'lucide-react';
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
            className="flex min-h-8 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-l border-white/10 pl-3 max-[720px]:w-full max-[720px]:border-l-0 max-[720px]:border-t max-[720px]:pl-0 max-[720px]:pt-2"
            role="region"
            aria-label="Csoportos műveletek"
        >
            <div
                className="inline-flex h-8 shrink-0 items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.025] px-2.5 text-xs text-zinc-400"
                aria-live="polite"
            >
                <span className="grid h-5 min-w-5 place-items-center rounded bg-green-500 px-1.5 text-[11px] font-bold tabular-nums text-[#071008]">
                    {selectedCount}
                </span>
                <span className="font-medium">kijelölve</span>
            </div>

            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 max-[520px]:w-full max-[520px]:basis-full">
                <div className="relative max-[520px]:min-w-0 max-[520px]:flex-1">
                    <label htmlFor="batch-status" className="sr-only">Új státusz</label>
                    <select
                        id="batch-status"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        disabled={isLoading}
                        className="h-8 appearance-none rounded-md border border-white/10 bg-[#0a0d0b] pl-3 pr-8 text-xs text-zinc-200 outline-none transition-colors hover:border-white/20 focus-visible:border-green-500/60 focus-visible:ring-2 focus-visible:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-60 max-[520px]:w-full"
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
                    className="inline-flex h-8 items-center gap-2 rounded-md bg-green-500 px-3 text-xs font-semibold text-[#071008] transition-colors hover:bg-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d0b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                    {isLoading ? 'Frissítés…' : 'Alkalmaz'}
                </button>

                <button
                    type="button"
                    onClick={onClear}
                    disabled={isLoading}
                    className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Kijelölés megszüntetése"
                    title="Kijelölés megszüntetése"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
