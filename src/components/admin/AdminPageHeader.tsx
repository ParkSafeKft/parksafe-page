'use client';

import { Plus, Search, X } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAdminNavigationItem } from './adminNavigation';

type AdminPageHeaderProps = {
    activeTab: string;
    totalCount: number;
    isRealtimeConnected: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onCreate?: () => void;
};

export default function AdminPageHeader({
    activeTab,
    totalCount,
    isRealtimeConnected,
    searchTerm,
    onSearchChange,
    onCreate,
}: AdminPageHeaderProps) {
    const item = getAdminNavigationItem(activeTab);
    const Icon = item.icon;
    const showCount = !['dashboard', 'app_config', 'route_heatmap', 'leaderboard'].includes(activeTab);

    return (
        <header className="admin-page-header">
            <div className="admin-page-heading">
                <SidebarTrigger className="admin-sidebar-trigger" aria-label="Navigáció megnyitása" />
                <div className="admin-page-icon" aria-hidden="true">
                    <Icon />
                </div>
                <div className="min-w-0">
                    <div className="admin-breadcrumb">
                        <span>{item.section}</span>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page">{item.shortLabel}</span>
                    </div>
                    <div className="admin-title-line">
                        <h1>{item.label}</h1>
                        {showCount ? <span className="admin-count">{totalCount.toLocaleString('hu-HU')}</span> : null}
                        {showCount ? (
                            <span className="admin-live-status" data-connected={isRealtimeConnected}>
                                <span aria-hidden="true" />
                                {isRealtimeConnected ? 'Élő' : 'Kapcsolódás'}
                            </span>
                        ) : null}
                    </div>
                    <p>{item.description}</p>
                </div>
            </div>

            <div className="admin-page-actions">
                {item.searchable ? (
                    <label className="admin-search">
                        <span className="sr-only">Keresés ezen az oldalon</span>
                        <Search aria-hidden="true" />
                        <Input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder={`Keresés: ${item.shortLabel.toLocaleLowerCase('hu-HU')}…`}
                            spellCheck={false}
                        />
                        {searchTerm ? (
                            <button type="button" onClick={() => onSearchChange('')} aria-label="Keresés törlése">
                                <X />
                            </button>
                        ) : (
                            <kbd>⌘ K</kbd>
                        )}
                    </label>
                ) : null}

                {item.createLabel && onCreate ? (
                    <Button onClick={onCreate} className="admin-primary-action">
                        <Plus aria-hidden="true" />
                        <span>{item.createLabel}</span>
                    </Button>
                ) : null}
            </div>
        </header>
    );
}
