import {
    Building2,
    Camera,
    ChartNoAxesCombined,
    Droplet,
    Flag,
    LayoutDashboard,
    Lightbulb,
    MapPin,
    MessageSquare,
    Route,
    ScrollText,
    Settings,
    Store,
    Trophy,
    Users,
    Wrench,
    type LucideIcon,
} from 'lucide-react';

export type AdminNavigationItem = {
    id: string;
    label: string;
    shortLabel: string;
    description: string;
    section: 'Áttekintés' | 'Beérkezett' | 'Térképadatok' | 'Közösség' | 'Elemzés' | 'Rendszer';
    icon: LucideIcon;
    searchable?: boolean;
    createLabel?: string;
};

export const ADMIN_NAVIGATION: AdminNavigationItem[] = [
    {
        id: 'dashboard',
        label: 'Vezérlőpult',
        shortLabel: 'Áttekintés',
        description: 'A rendszer állapota és a legfontosabb admin teendők.',
        section: 'Áttekintés',
        icon: LayoutDashboard,
    },
    {
        id: 'feedback',
        label: 'Visszajelzések',
        shortLabel: 'Visszajelzés',
        description: 'Felhasználói hibajegyek, ötletek és közvetlen kapcsolatfelvétel.',
        section: 'Beérkezett',
        icon: MessageSquare,
        searchable: true,
    },
    {
        id: 'poi_flags',
        label: 'POI bejelentések',
        shortLabel: 'Bejelentés',
        description: 'Hibás vagy pontatlan térképi helyek felülvizsgálata.',
        section: 'Beérkezett',
        icon: Flag,
        searchable: true,
    },
    {
        id: 'poi_suggestions',
        label: 'POI javaslatok',
        shortLabel: 'Javaslat',
        description: 'Új helyjavaslatok ellenőrzése és felvitele OpenStreetMapre.',
        section: 'Beérkezett',
        icon: Lightbulb,
        searchable: true,
    },
    {
        id: 'parking_images',
        label: 'Parkolóképek',
        shortLabel: 'Képek',
        description: 'Felhasználók által beküldött parkolóképek jóváhagyása.',
        section: 'Beérkezett',
        icon: Camera,
        searchable: true,
    },
    {
        id: 'community_routes',
        label: 'Közösségi útvonalak',
        shortLabel: 'Útvonalak',
        description: 'Beküldött kerékpáros útvonalak moderálása és OSM-feldolgozása.',
        section: 'Beérkezett',
        icon: Route,
        searchable: true,
    },
    {
        id: 'parking',
        label: 'Bicikliparkolók',
        shortLabel: 'Parkolók',
        description: 'Kerékpárparkolók létrehozása, ellenőrzése és karbantartása.',
        section: 'Térképadatok',
        icon: MapPin,
        searchable: true,
        createLabel: 'Új parkoló',
    },
    {
        id: 'drinking_fountain',
        label: 'Ivókutak',
        shortLabel: 'Ivókutak',
        description: 'Ivókutak egységes nyilvántartása és karbantartása.',
        section: 'Térképadatok',
        icon: Droplet,
        searchable: true,
        createLabel: 'Új ivókút',
    },
    {
        id: 'services',
        label: 'Szervizek és boltok',
        shortLabel: 'Szervizek',
        description: 'Kerékpárszervizek és üzletek egységes kezelése.',
        section: 'Térképadatok',
        icon: Store,
        searchable: true,
        createLabel: 'Új szerviz vagy bolt',
    },
    {
        id: 'repair',
        label: 'Javítóállomások',
        shortLabel: 'Javítók',
        description: 'Önkiszolgáló javítóállomások egységes kezelése.',
        section: 'Térképadatok',
        icon: Wrench,
        searchable: true,
        createLabel: 'Új javítóállomás',
    },
    {
        id: 'cities',
        label: 'Városok',
        shortLabel: 'Városok',
        description: 'Városi határok, koordináták és aktivitás kezelése.',
        section: 'Térképadatok',
        icon: Building2,
        searchable: true,
        createLabel: 'Új város',
    },
    {
        id: 'users',
        label: 'Felhasználók',
        shortLabel: 'Felhasználók',
        description: 'Profilok, hozzáférés és felhasználói aktivitás áttekintése.',
        section: 'Közösség',
        icon: Users,
        searchable: true,
    },
    {
        id: 'daily_challenges',
        label: 'Napi kihívások',
        shortLabel: 'Kihívások',
        description: 'Automatikusan generált napi kihívások felügyelete.',
        section: 'Közösség',
        icon: Trophy,
        searchable: true,
    },
    {
        id: 'leaderboard',
        label: 'Ranglista',
        shortLabel: 'Ranglista',
        description: 'Teljesítések rangsora és láthatóságkezelése.',
        section: 'Közösség',
        icon: Trophy,
    },
    {
        id: 'route_heatmap',
        label: 'Útvonal-hőtérkép',
        shortLabel: 'Hőtérkép',
        description: 'Anonimizált kerékpáros útvonalforgalom térképi elemzése.',
        section: 'Elemzés',
        icon: ChartNoAxesCombined,
    },
    {
        id: 'audit_log',
        label: 'Auditnapló',
        shortLabel: 'Audit',
        description: 'Adminműveletek kereshető, időrendi naplója.',
        section: 'Rendszer',
        icon: ScrollText,
        searchable: true,
    },
    {
        id: 'app_config',
        label: 'App-konfiguráció',
        shortLabel: 'Konfiguráció',
        description: 'Karbantartás, minimum appverzió és funkciókapcsolók.',
        section: 'Rendszer',
        icon: Settings,
    },
];

export const ADMIN_SECTIONS: AdminNavigationItem['section'][] = [
    'Áttekintés',
    'Beérkezett',
    'Térképadatok',
    'Közösség',
    'Elemzés',
    'Rendszer',
];

export function getAdminNavigationItem(id: string): AdminNavigationItem {
    return ADMIN_NAVIGATION.find((item) => item.id === id) ?? ADMIN_NAVIGATION[0];
}
