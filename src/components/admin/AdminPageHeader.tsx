'use client';

import { useEffect, useRef } from 'react';
import { Command, Plus, Search, X } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ADMIN_NAVIGATION, getAdminNavigationItem } from './adminNavigation';

type AdminPageHeaderProps = {
    activeTab: string;
    totalCount: number;
    isRealtimeConnected: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onNavigate: (tab: string) => void;
    onCreate?: () => void;
};

export default function AdminPageHeader({
    activeTab,
    totalCount,
    isRealtimeConnected,
    searchTerm,
    onSearchChange,
    onNavigate,
    onCreate,
}: AdminPageHeaderProps) {
    const item = getAdminNavigationItem(activeTab);
    const searchRef = useRef<HTMLInputElement>(null);
    const showCount = !['dashboard', 'app_config', 'route_heatmap', 'leaderboard'].includes(activeTab);
    const peers = ADMIN_NAVIGATION.filter((candidate) => candidate.section === item.section);

    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && item.searchable) {
                event.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleShortcut);
        return () => window.removeEventListener('keydown', handleShortcut);
    }, [item.searchable]);

    return (
        <header className="ops-header">
            <div className="ops-commandbar">
                <SidebarTrigger className="ops-mobile-trigger" aria-label="Navigáció megnyitása" />

                <div className="ops-page-identity">
                    <span>{item.section}</span>
                    <strong>{item.label}</strong>
                    {showCount ? <b>{totalCount.toLocaleString('hu-HU')}</b> : null}
                </div>

                {item.searchable ? (
                    <label className="ops-command-search">
                        <Search aria-hidden="true" />
                        <input
                            ref={searchRef}
                            type="search"
                            value={searchTerm}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder={`Keresés: ${item.shortLabel.toLocaleLowerCase('hu-HU')}…`}
                            spellCheck={false}
                        />
                        {searchTerm ? (
                            <button type="button" onClick={() => onSearchChange('')} aria-label="Keresés törlése">
                                <X aria-hidden="true" />
                            </button>
                        ) : (
                            <kbd><Command aria-hidden="true" />K</kbd>
                        )}
                    </label>
                ) : (
                    <div className="ops-command-search is-placeholder" aria-hidden="true">
                        <span>{item.description}</span>
                    </div>
                )}

                <div className="ops-header-actions">
                    <span className="ops-connection" data-connected={isRealtimeConnected}>
                        <i aria-hidden="true" />
                        {isRealtimeConnected ? 'Élő adatok' : 'Újracsatlakozás'}
                    </span>
                    {item.createLabel && onCreate ? (
                        <button type="button" className="ops-create" onClick={onCreate}>
                            <Plus aria-hidden="true" />
                            <span>{item.createLabel}</span>
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="ops-scopebar">
                <div className="ops-scope-tabs" role="navigation" aria-label={`${item.section} nézetek`}>
                    {peers.map((peer) => (
                        <button
                            key={peer.id}
                            type="button"
                            data-active={peer.id === activeTab}
                            aria-current={peer.id === activeTab ? 'page' : undefined}
                            onClick={() => onNavigate(peer.id)}
                        >
                            {peer.label}
                        </button>
                    ))}
                </div>
                <p>{item.description}</p>
            </div>
        </header>
    );
}
