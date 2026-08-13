'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InlineStatusMenuProps {
    value: string;
    options: Record<string, string>;
    ariaLabel: string;
    toneFor: (status: string) => string;
    onValueChange: (value: string) => void;
}

const SIDEBAR_SELECTOR = '.ops-rail, .ops-rail-backdrop, [data-sidebar]';

export default function InlineStatusMenu({
    value,
    options,
    ariaLabel,
    toneFor,
    onValueChange,
}: InlineStatusMenuProps) {
    const [open, setOpen] = useState(false);
    const openRef = useRef(open);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const suppressNextClickRef = useRef(false);

    useEffect(() => {
        openRef.current = open;
    }, [open]);

    useEffect(() => {
        const isInsideMenu = (target: Node) => (
            triggerRef.current?.contains(target) || contentRef.current?.contains(target)
        );

        const handlePointerDown = (event: PointerEvent) => {
            if (!openRef.current || !(event.target instanceof Node) || isInsideMenu(event.target)) return;

            setOpen(false);

            if (event.target instanceof Element && event.target.closest(SIDEBAR_SELECTOR)) return;

            suppressNextClickRef.current = true;
            event.preventDefault();
            event.stopImmediatePropagation();
        };

        const handlePointerUp = (event: PointerEvent) => {
            if (!suppressNextClickRef.current) return;
            event.preventDefault();
            event.stopImmediatePropagation();
        };

        const handleClick = (event: MouseEvent) => {
            if (!suppressNextClickRef.current) return;

            suppressNextClickRef.current = false;
            event.preventDefault();
            event.stopImmediatePropagation();
        };

        document.addEventListener('pointerdown', handlePointerDown, true);
        document.addEventListener('pointerup', handlePointerUp, true);
        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
            document.removeEventListener('pointerup', handlePointerUp, true);
            document.removeEventListener('click', handleClick, true);
        };
    }, []);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
            <DropdownMenuTrigger asChild>
                <button
                    ref={triggerRef}
                    type="button"
                    className="ops-row-select"
                    onClick={(event) => event.stopPropagation()}
                    aria-label={ariaLabel}
                >
                    <span className="ops-status" data-tone={toneFor(value)}>{options[value] || value}</span>
                    <ChevronDown className="ops-row-select-chevron" aria-hidden="true" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                ref={contentRef}
                align="start"
                sideOffset={5}
                collisionPadding={8}
                className="ops-status-menu"
            >
                {Object.entries(options).map(([optionValue, label]) => (
                    <DropdownMenuItem
                        className="ops-status-menu-item"
                        key={optionValue}
                        onSelect={() => {
                            if (optionValue !== value) onValueChange(optionValue);
                        }}
                    >
                        <span className="ops-status" data-tone={toneFor(optionValue)}>{label}</span>
                        {optionValue === value ? <Check aria-hidden="true" /> : null}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
