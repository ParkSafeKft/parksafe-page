'use client';

import React from 'react';
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    MapPin,
    Store,
    Wrench,
    Home,
    LogOut,
    Shield,
    Flag,
    Camera,
} from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useSidebar } from '@/components/ui/sidebar';

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
    const { openMobile, setOpenMobile, isMobile } = useSidebar();

    const menuItems = [
        { id: 'dashboard', label: 'Vezérlőpult', icon: LayoutDashboard, section: 'ÁTTEKINTÉS' },
        { id: 'users', label: 'Felhasználók', icon: Users, section: 'ADATKEZELÉS' },
        { id: 'parking', label: 'Bicikli Parkolók', icon: MapPin, section: 'ADATKEZELÉS' },
        { id: 'parking_images', label: 'Parkoló képek', icon: Camera, section: 'ADATKEZELÉS' },
        { id: 'services', label: 'Szervizek & Boltok', icon: Store, section: 'ADATKEZELÉS' },
        { id: 'repair', label: 'Javító Állomások', icon: Wrench, section: 'ADATKEZELÉS' },
        { id: 'feedback', label: 'Visszajelzések', icon: MessageSquare, section: 'ADATKEZELÉS' },
        { id: 'poi_flags', label: 'POI Bejelentések', icon: Flag, section: 'ADATKEZELÉS' },
        { id: 'home', label: 'Vissza a főoldalra', icon: Home, section: 'EGYÉB' },
    ];

    const sections = ['ÁTTEKINTÉS', 'ADATKEZELÉS', 'EGYÉB'];

    const handleItemClick = (id: string) => {
        if (isMobile) setOpenMobile(false);
        if (id === 'home') {
            onHomeConfig();
        } else {
            setActiveTab(id);
        }
    };

    const asideClasses = isMobile
        ? `fixed left-0 top-0 h-full z-50 w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out ${openMobile ? 'translate-x-0' : '-translate-x-full'}`
        : 'w-72 h-screen bg-[#0a0a0a] border-r border-white/5 flex flex-col shrink-0 overflow-y-auto';

    return (
        <>
        {isMobile && openMobile && (
            <div
                className="fixed inset-0 bg-black/60 z-40"
                onClick={() => setOpenMobile(false)}
            />
        )}
        <aside className={asideClasses}>
            {/* Header */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <Shield className="w-6 h-6 text-green-500" />
                </div>
                <div>
                    <h1 className="text-white font-bold tracking-tight">Admin Panel</h1>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Management</p>
                </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent mb-6" />

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-8">
                {sections.map(section => (
                    <div key={section} className="space-y-2">
                        <h3 className="px-3 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                            {section}
                        </h3>
                        <div className="space-y-1">
                            {menuItems
                                .filter(item => item.section === section)
                                .map(item => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleItemClick(item.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive && item.id !== 'home'
                                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 transition-colors ${isActive && item.id !== 'home' ? 'text-green-500' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                                            <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                                            {isActive && item.id !== 'home' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 mt-auto space-y-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                        <ImageWithFallback
                            src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100"}
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{profile?.username || profile?.full_name || 'Admin'}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{profile?.email}</p>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-sm font-medium">
                    <LogOut className="w-4 h-4" />
                    Kijelentkezés
                </button>
            </div>
        </aside>
        </>
    );
}
