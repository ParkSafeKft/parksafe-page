'use client';

import { ArrowUpRight, Home, LogOut, ShieldCheck } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useSidebar } from '@/components/ui/sidebar';
import { ADMIN_NAVIGATION, ADMIN_SECTIONS } from './adminNavigation';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: any;
    onLogout: () => void;
    onHomeConfig: () => void;
}

export default function AdminSidebar({
    activeTab,
    setActiveTab,
    profile,
    onLogout,
    onHomeConfig,
}: AdminSidebarProps) {
    const { open, openMobile, setOpenMobile, isMobile } = useSidebar();

    const navigate = (id: string) => {
        if (isMobile) setOpenMobile(false);
        setActiveTab(id);
    };

    const asideClasses = isMobile
        ? `admin-sidebar fixed inset-y-0 left-0 z-50 w-[17rem] transition-transform duration-200 ${openMobile ? 'translate-x-0' : '-translate-x-full'}`
        : `admin-sidebar ${open ? 'w-[17rem]' : 'hidden'} h-screen shrink-0`;

    const displayName = profile?.username || profile?.full_name || 'Admin';

    return (
        <>
            {isMobile && openMobile ? (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/70"
                    onClick={() => setOpenMobile(false)}
                    aria-label="Navigáció bezárása"
                />
            ) : null}

            <aside className={asideClasses} aria-label="Admin navigáció">
                <div className="admin-sidebar-brand">
                    <div className="admin-brand-mark" aria-hidden="true">
                        <ShieldCheck />
                    </div>
                    <div>
                        <strong>ParkSafe</strong>
                        <span>Operations</span>
                    </div>
                </div>

                <nav className="admin-sidebar-nav">
                    {ADMIN_SECTIONS.map((section) => (
                        <section key={section} aria-labelledby={`admin-section-${section}`}>
                            <h2 id={`admin-section-${section}`}>{section}</h2>
                            <div>
                                {ADMIN_NAVIGATION.filter((item) => item.section === section).map((item) => {
                                    const Icon = item.icon;
                                    const active = item.id === activeTab;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => navigate(item.id)}
                                            data-active={active}
                                            aria-current={active ? 'page' : undefined}
                                        >
                                            <Icon aria-hidden="true" />
                                            <span>{item.label}</span>
                                            {active ? <i aria-hidden="true" /> : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <button type="button" className="admin-profile" onClick={() => navigate('users')}>
                        <ImageWithFallback
                            src={profile?.avatar_url || '/logo_64.png'}
                            alt=""
                            className="h-9 w-9 rounded-md object-cover"
                        />
                        <span>
                            <strong>{displayName}</strong>
                            <small>{profile?.email || 'Adminisztrátor'}</small>
                        </span>
                        <ArrowUpRight aria-hidden="true" />
                    </button>
                    <div className="admin-sidebar-utilities">
                        <button type="button" onClick={onHomeConfig}>
                            <Home aria-hidden="true" />
                            Főoldal
                        </button>
                        <button type="button" onClick={onLogout}>
                            <LogOut aria-hidden="true" />
                            Kilépés
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
