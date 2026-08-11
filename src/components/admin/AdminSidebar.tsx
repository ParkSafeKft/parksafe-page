'use client';

import { ArrowUpRight, Home, LogOut, ShieldCheck } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { ADMIN_NAVIGATION, ADMIN_SECTIONS } from './adminNavigation';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    profile: {
        username?: string;
        full_name?: string;
        email?: string;
        avatar_url?: string;
    } | null;
    onHomeConfig: () => void;
}

export default function AdminSidebar({
    activeTab,
    setActiveTab,
    onLogout,
    profile,
    onHomeConfig,
}: AdminSidebarProps) {
    const { openMobile, setOpenMobile, isMobile } = useSidebar();

    const navigate = (id: string) => {
        if (isMobile) setOpenMobile(false);
        setActiveTab(id);
    };

    return (
        <>
            {isMobile && openMobile ? (
                <button
                    type="button"
                    className="ops-rail-backdrop"
                    onClick={() => setOpenMobile(false)}
                    aria-label="Navigáció bezárása"
                />
            ) : null}

            <aside
                className={`ops-rail ${isMobile ? (openMobile ? 'is-open' : '') : ''}`}
                aria-label="Admin navigáció"
            >
                <button
                    type="button"
                    className="ops-rail-brand"
                    onClick={() => navigate('dashboard')}
                    aria-label="ParkSafe vezérlőpult"
                    data-tooltip="ParkSafe Control"
                >
                    <ShieldCheck aria-hidden="true" />
                </button>

                <nav className="ops-rail-nav">
                    {ADMIN_SECTIONS.map((section) => (
                        <div className="ops-rail-group" key={section} aria-label={section}>
                            {ADMIN_NAVIGATION.filter((item) => item.section === section).map((item) => {
                                const Icon = item.icon;
                                const active = item.id === activeTab;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="ops-rail-item"
                                        data-active={active}
                                        data-tooltip={item.label}
                                        onClick={() => navigate(item.id)}
                                        aria-current={active ? 'page' : undefined}
                                        aria-label={item.label}
                                    >
                                        <Icon aria-hidden="true" />
                                        <span className="ops-rail-label">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="ops-rail-footer">
                    <button
                        type="button"
                        className="ops-rail-item"
                        data-tooltip={profile?.username || profile?.full_name || profile?.email || 'Profil'}
                        onClick={() => navigate('users')}
                        aria-label="Saját profil megnyitása"
                    >
                        <span className="ops-avatar" aria-hidden="true">
                            {(profile?.username || profile?.full_name || profile?.email || 'A').slice(0, 1).toUpperCase()}
                        </span>
                        <span className="ops-rail-label">Profil</span>
                    </button>
                    <button type="button" className="ops-rail-item" data-tooltip="Főoldal" onClick={onHomeConfig} aria-label="Főoldal">
                        <Home aria-hidden="true" />
                        <span className="ops-rail-label">Főoldal</span>
                        <ArrowUpRight className="ops-external-mark" aria-hidden="true" />
                    </button>
                    <button type="button" className="ops-rail-item" data-tooltip="Kilépés" onClick={onLogout} aria-label="Kilépés">
                        <LogOut aria-hidden="true" />
                        <span className="ops-rail-label">Kilépés</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
