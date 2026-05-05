'use client';

import { useState } from 'react';
import {
    Building,
    Camera,
    CheckCircle2,
    ChevronDown,
    Clock,
    Copy,
    DollarSign,
    Droplet,
    Edit,
    ExternalLink,
    Eye,
    Globe,
    Lightbulb,
    MapPin,
    MoreHorizontal,
    Phone,
    Settings,
    Shield,
    Trash2,
    User,
    Wrench,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export type CapacityLevel = 'small' | 'medium' | 'large';

export interface PoiSuggestionDetails {
    covered?: boolean | null;
    is_open_24h?: boolean | null;
    has_camera?: boolean | null;
    capacity_level?: CapacityLevel | null;
    phone?: string | null;
    website?: string | null;
    opening_hours?: string | null;
    services?: string[] | null;
    price_range?: string | null;
    free?: boolean | null;
    [key: string]: unknown;
}

export interface PoiSuggestion {
    id: string;
    user_id: string | null;
    suggested_type: string | null;
    name: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    comment: string | null;
    status: string | null;
    details: PoiSuggestionDetails | null;
    created_at: string;
    reporter_username?: string | null;
    reporter_full_name?: string | null;
    reporter_avatar_url?: string | null;
}

interface PoiSuggestionsTableProps {
    data: PoiSuggestion[];
    onSort: (key: string) => void;
    sortConfig: { key: string; direction: string };
    onSave: (id: string, updates: Partial<PoiSuggestion>) => void;
    onStatusChange: (id: string, newStatus: string) => void;
    onDelete?: (id: string) => void;
    onOpenUser?: (userId: string) => void;
    searchTerm?: string;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    typeFilter: string;
    onTypeFilterChange: (value: string) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Függőben' },
    { value: 'reviewed', label: 'Áttekintve' },
    { value: 'approved', label: 'Elfogadva feldolgozásra' },
    { value: 'rejected', label: 'Elutasítva' },
];

const TYPE_OPTIONS = [
    { value: 'parking', label: 'Parkoló' },
    { value: 'bicycleService', label: 'Szerviz / bolt' },
    { value: 'repairStation', label: 'Javító állomás' },
    { value: 'drinkingFountain', label: 'Ivókút' },
];

const CAPACITY_OPTIONS: { value: CapacityLevel; label: string }[] = [
    { value: 'small', label: 'Kicsi' },
    { value: 'medium', label: 'Közepes' },
    { value: 'large', label: 'Nagy' },
];

type TriState = 'unset' | 'true' | 'false';

function boolToTri(value: boolean | null | undefined): TriState {
    if (value === true) return 'true';
    if (value === false) return 'false';
    return 'unset';
}

function triToBool(value: TriState): boolean | null {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
}

const TRI_OPTIONS: { value: TriState; label: string }[] = [
    { value: 'unset', label: 'Nincs megadva' },
    { value: 'true', label: 'Igen' },
    { value: 'false', label: 'Nem' },
];

function copyId(id: string) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(id).then(
        () => toast.success('ID vágólapra másolva'),
        () => toast.error('Másolás sikertelen')
    );
}

function getTypeLabel(type?: string | null) {
    return TYPE_OPTIONS.find(option => option.value === type)?.label || type || 'Nincs típus';
}

function getStatusLabel(status?: string | null) {
    if (status === 'dismissed') return 'Elvetve';
    return STATUS_OPTIONS.find(option => option.value === status)?.label || status || 'Ismeretlen';
}

const CAPACITY_LABELS: Record<CapacityLevel, string> = {
    small: 'Kicsi',
    medium: 'Közepes',
    large: 'Nagy',
};

function renderDetailChips(
    type: string | null | undefined,
    details: PoiSuggestionDetails | null | undefined
): { label: string; title?: string }[] {
    if (!details || typeof details !== 'object') return [];
    const chips: { label: string; title?: string }[] = [];
    const pushBool = (key: keyof PoiSuggestionDetails, yes: string, no: string) => {
        const value = details[key];
        if (value === true) chips.push({ label: yes });
        else if (value === false) chips.push({ label: no });
    };

    if (type === 'parking') {
        pushBool('covered', 'Fedett', 'Nyitott');
        pushBool('is_open_24h', '0–24', 'Nem 0–24');
        pushBool('has_camera', 'Kamerás', 'Kamera nélkül');
        const cap = details.capacity_level;
        if (cap === 'small' || cap === 'medium' || cap === 'large') {
            chips.push({ label: CAPACITY_LABELS[cap], title: 'Kapacitás' });
        }
    } else if (type === 'bicycleService') {
        if (details.phone) chips.push({ label: 'Telefon', title: String(details.phone) });
        if (details.website) chips.push({ label: 'Web', title: String(details.website) });
        if (details.opening_hours) chips.push({ label: 'Nyitvatartás', title: String(details.opening_hours) });
        if (details.price_range) chips.push({ label: String(details.price_range), title: 'Árkategória' });
        if (Array.isArray(details.services) && details.services.length > 0) {
            chips.push({ label: `${details.services.length} szolgáltatás`, title: details.services.join(', ') });
        }
    } else if (type === 'repairStation') {
        pushBool('covered', 'Fedett', 'Nyitott');
        pushBool('free', 'Ingyenes', 'Fizetős');
    }

    return chips;
}

function getStatusStyle(status?: string | null) {
    const styles: Record<string, string> = {
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        reviewed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        accepted: 'bg-green-500/10 text-green-500 border-green-500/20',
        approved: 'bg-green-500/10 text-green-500 border-green-500/20',
        rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
        dismissed: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
    };
    return styles[status || ''] || styles.pending;
}

const Filters = ({
    statusValue,
    onStatusChange,
    typeValue,
    onTypeChange,
}: {
    statusValue: string;
    onStatusChange: (value: string) => void;
    typeValue: string;
    onTypeChange: (value: string) => void;
}) => (
    <div className="flex flex-wrap items-center gap-3 px-2">
        <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Státusz:</span>
            <div className="relative">
                <select
                    value={statusValue}
                    onChange={(event) => onStatusChange(event.target.value)}
                    className="appearance-none bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-green-500/50 cursor-pointer hover:border-white/20 transition-colors"
                >
                    <option value="">Mind</option>
                    {STATUS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Típus:</span>
            <div className="relative">
                <select
                    value={typeValue}
                    onChange={(event) => onTypeChange(event.target.value)}
                    className="appearance-none bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-green-500/50 cursor-pointer hover:border-white/20 transition-colors"
                >
                    <option value="">Mind</option>
                    {TYPE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>
        </div>
    </div>
);

function TriStateSelect({
    label,
    value,
    onChange,
    icon,
}: {
    label: string;
    value: TriState;
    onChange: (next: TriState) => void;
    icon?: React.ReactNode;
}) {
    return (
        <label className="space-y-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5">
                {icon}
                {label}
            </span>
            <div className="relative">
                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value as TriState)}
                    className="w-full appearance-none bg-[#111111] border border-white/10 text-zinc-200 text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:border-green-500/50"
                >
                    {TRI_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
        </label>
    );
}

function buildDetailsForType(
    type: string,
    state: {
        covered: TriState;
        isOpen24h: TriState;
        hasCamera: TriState;
        capacityLevel: CapacityLevel | '';
        phone: string;
        website: string;
        openingHours: string;
        services: string;
        priceRange: string;
        free: TriState;
    }
): PoiSuggestionDetails {
    const trim = (value: string) => {
        const v = value.trim();
        return v === '' ? null : v;
    };

    if (type === 'parking') {
        return {
            covered: triToBool(state.covered),
            is_open_24h: triToBool(state.isOpen24h),
            has_camera: triToBool(state.hasCamera),
            capacity_level: state.capacityLevel === '' ? null : state.capacityLevel,
        };
    }

    if (type === 'bicycleService') {
        const services = state.services
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        return {
            phone: trim(state.phone),
            website: trim(state.website),
            opening_hours: trim(state.openingHours),
            services: services.length > 0 ? services : null,
            price_range: trim(state.priceRange),
        };
    }

    if (type === 'repairStation') {
        return {
            covered: triToBool(state.covered),
            free: triToBool(state.free),
        };
    }

    return {};
}

function EditSuggestionModal({
    item,
    isOpen,
    onClose,
    onSave,
    onStatusChange,
    onOpenUser,
}: {
    item: PoiSuggestion | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, updates: Partial<PoiSuggestion>) => void;
    onStatusChange: (id: string, newStatus: string) => void;
    onOpenUser?: (userId: string) => void;
}) {
    const initialDetails = (item?.details ?? {}) as PoiSuggestionDetails;

    const [suggestedType, setSuggestedType] = useState(item?.suggested_type || '');
    const [status, setStatus] = useState(item?.status || 'pending');
    const [name, setName] = useState(item?.name || '');
    const [city, setCity] = useState(item?.city || '');
    const [latitude, setLatitude] = useState(item?.latitude == null ? '' : String(item.latitude));
    const [longitude, setLongitude] = useState(item?.longitude == null ? '' : String(item.longitude));
    const [comment, setComment] = useState(item?.comment || '');

    const [covered, setCovered] = useState<TriState>(boolToTri(initialDetails.covered));
    const [isOpen24h, setIsOpen24h] = useState<TriState>(boolToTri(initialDetails.is_open_24h));
    const [hasCamera, setHasCamera] = useState<TriState>(boolToTri(initialDetails.has_camera));
    const [capacityLevel, setCapacityLevel] = useState<CapacityLevel | ''>(
        (initialDetails.capacity_level as CapacityLevel | null | undefined) || ''
    );
    const [phone, setPhone] = useState(initialDetails.phone || '');
    const [website, setWebsite] = useState(initialDetails.website || '');
    const [openingHours, setOpeningHours] = useState(initialDetails.opening_hours || '');
    const [services, setServices] = useState((initialDetails.services || []).join(', '));
    const [priceRange, setPriceRange] = useState(initialDetails.price_range || '');
    const [free, setFree] = useState<TriState>(boolToTri(initialDetails.free));

    if (!item) return null;

    const reporterName = item.reporter_username || item.reporter_full_name || (item.user_id ? `${item.user_id.slice(0, 8)}...` : 'Ismeretlen');
    const latNumber = latitude.trim() === '' ? null : Number(latitude);
    const lonNumber = longitude.trim() === '' ? null : Number(longitude);
    const hasValidCoords = latNumber !== null && lonNumber !== null && Number.isFinite(latNumber) && Number.isFinite(lonNumber);

    const saveStatus = (newStatus: string) => {
        setStatus(newStatus);
        onStatusChange(item.id, newStatus);
    };

    const handleSubmit = () => {
        if ((latitude.trim() !== '' && !Number.isFinite(latNumber)) || (longitude.trim() !== '' && !Number.isFinite(lonNumber))) {
            toast.error('Érvénytelen koordináta');
            return;
        }
        if (name.length > 100) {
            toast.error('A név maximum 100 karakter lehet');
            return;
        }
        if (city.length > 80) {
            toast.error('A város maximum 80 karakter lehet');
            return;
        }
        if (comment.length > 1000) {
            toast.error('A komment maximum 1000 karakter lehet');
            return;
        }

        const details = buildDetailsForType(suggestedType, {
            covered,
            isOpen24h,
            hasCamera,
            capacityLevel,
            phone,
            website,
            openingHours,
            services,
            priceRange,
            free,
        });

        onSave(item.id, {
            suggested_type: suggestedType || null,
            status,
            name: name.trim() || null,
            city: city.trim() || null,
            latitude: latNumber,
            longitude: lonNumber,
            comment: comment || null,
            details,
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="admin-dark max-w-3xl w-[90vw] max-h-[90vh] overflow-hidden bg-card border-border p-0">
                <div className="flex flex-col h-[85vh]">
                    <div className="p-6 border-b border-border bg-background/50 flex-shrink-0">
                        <DialogTitle className="text-foreground flex items-center gap-4 text-xl font-bold">
                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                                <Lightbulb className="h-6 w-6 text-green-400" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg font-bold text-foreground truncate">POI javaslat moderálása</h1>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-xs font-mono text-muted-foreground">ID: {item.id.slice(0, 8)}...</span>
                                    <button
                                        type="button"
                                        onClick={() => copyId(item.id)}
                                        className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                                        title="ID másolása"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusStyle(status)}`}>
                                        {getStatusLabel(status)}
                                    </span>
                                </div>
                            </div>
                        </DialogTitle>
                    </div>

                    <div className="flex-1 overflow-auto p-6 space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Beküldő
                            </h3>
                            {onOpenUser && item.user_id ? (
                                <button
                                    type="button"
                                    onClick={() => onOpenUser(item.user_id!)}
                                    className="w-full p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors flex items-center justify-between gap-4 text-left"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-white">{reporterName}</p>
                                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.user_id}</p>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </button>
                            ) : (
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-sm font-semibold text-white">{reporterName}</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="space-y-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Típus</span>
                                <div className="relative">
                                    <select
                                        value={suggestedType}
                                        onChange={(event) => setSuggestedType(event.target.value)}
                                        className="w-full appearance-none bg-[#111111] border border-white/10 text-zinc-200 text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:border-green-500/50"
                                    >
                                        <option value="">Nincs megadva</option>
                                        {TYPE_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </label>
                            <label className="space-y-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Státusz</span>
                                <div className="relative">
                                    <select
                                        value={status}
                                        onChange={(event) => setStatus(event.target.value)}
                                        className="w-full appearance-none bg-[#111111] border border-white/10 text-zinc-200 text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:border-green-500/50"
                                    >
                                        {STATUS_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </label>
                            <label className="space-y-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Név</span>
                                <Input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    maxLength={100}
                                    placeholder="POI neve (opcionális)"
                                />
                            </label>
                            <label className="space-y-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Város</span>
                                <Input
                                    value={city}
                                    onChange={(event) => setCity(event.target.value)}
                                    maxLength={80}
                                    placeholder="Budapest"
                                />
                            </label>
                            <label className="space-y-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Latitude</span>
                                <Input value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="47.497912" />
                            </label>
                            <label className="space-y-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Longitude</span>
                                <Input value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="19.040235" />
                            </label>
                        </div>

                        <label className="block space-y-2">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Komment</span>
                            <Textarea
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                rows={6}
                                maxLength={1000}
                                placeholder="Felhasználói megjegyzés vagy admin pontosítás"
                            />
                        </label>

                        {suggestedType === 'parking' && (
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    Parkoló részletek
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TriStateSelect
                                        label="Fedett"
                                        value={covered}
                                        onChange={setCovered}
                                        icon={<Shield className="w-3.5 h-3.5" />}
                                    />
                                    <TriStateSelect
                                        label="0–24 nyitva"
                                        value={isOpen24h}
                                        onChange={setIsOpen24h}
                                        icon={<Clock className="w-3.5 h-3.5" />}
                                    />
                                    <TriStateSelect
                                        label="Kamerás"
                                        value={hasCamera}
                                        onChange={setHasCamera}
                                        icon={<Camera className="w-3.5 h-3.5" />}
                                    />
                                    <label className="space-y-2">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5">
                                            <Settings className="w-3.5 h-3.5" />
                                            Kapacitás
                                        </span>
                                        <div className="relative">
                                            <select
                                                value={capacityLevel}
                                                onChange={(event) => setCapacityLevel(event.target.value as CapacityLevel | '')}
                                                className="w-full appearance-none bg-[#111111] border border-white/10 text-zinc-200 text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:border-green-500/50"
                                            >
                                                <option value="">Nincs megadva</option>
                                                {CAPACITY_OPTIONS.map(option => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {suggestedType === 'bicycleService' && (
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Wrench className="h-4 w-4" />
                                    Szerviz részletek
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="space-y-2">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5" />
                                            Telefon
                                        </span>
                                        <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+36 1 234 5678" />
                                    </label>
                                    <label className="space-y-2">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5" />
                                            Weboldal
                                        </span>
                                        <Input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://..." />
                                    </label>
                                    <label className="space-y-2">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            Nyitvatartás
                                        </span>
                                        <Input value={openingHours} onChange={(event) => setOpeningHours(event.target.value)} placeholder="H–P 9–18" />
                                    </label>
                                    <label className="space-y-2">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5">
                                            <DollarSign className="w-3.5 h-3.5" />
                                            Árkategória
                                        </span>
                                        <Input value={priceRange} onChange={(event) => setPriceRange(event.target.value)} placeholder="$ / $$ / $$$" />
                                    </label>
                                </div>
                                <label className="block space-y-2 mt-4">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                        Szolgáltatások (vesszővel elválasztva)
                                    </span>
                                    <Input
                                        value={services}
                                        onChange={(event) => setServices(event.target.value)}
                                        placeholder="javítás, alkatrész, kerékpárkölcsönzés"
                                    />
                                </label>
                            </div>
                        )}

                        {suggestedType === 'repairStation' && (
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Wrench className="h-4 w-4" />
                                    Javító állomás részletek
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TriStateSelect
                                        label="Fedett"
                                        value={covered}
                                        onChange={setCovered}
                                        icon={<Shield className="w-3.5 h-3.5" />}
                                    />
                                    <TriStateSelect
                                        label="Ingyenes"
                                        value={free}
                                        onChange={setFree}
                                        icon={<DollarSign className="w-3.5 h-3.5" />}
                                    />
                                </div>
                            </div>
                        )}

                        {suggestedType === 'drinkingFountain' && (
                            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3 text-zinc-400">
                                <Droplet className="w-4 h-4 text-blue-400 shrink-0" />
                                <span className="text-xs">Az ivókúthoz nincs típus-specifikus mező — a név, város és koordináták elegendőek.</span>
                            </div>
                        )}

                        {hasValidCoords && (
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                                    <MapPin className="h-4 w-4" />
                                    Hely a térképen
                                </h3>
                                <div className="rounded-lg overflow-hidden border border-border mb-3">
                                    <iframe
                                        width="100%"
                                        height="260"
                                        frameBorder="0"
                                        style={{ border: 0, pointerEvents: 'none' }}
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${(lonNumber! - 0.002).toFixed(6)},${(latNumber! - 0.002).toFixed(6)},${(lonNumber! + 0.002).toFixed(6)},${(latNumber! + 0.002).toFixed(6)}&layer=mapnik&marker=${latNumber!.toFixed(6)},${lonNumber!.toFixed(6)}`}
                                        title="POI suggestion map"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                    onClick={() => window.open(`https://www.google.com/maps?q=${latNumber},${lonNumber}`, '_blank')}
                                >
                                    <MapPin className="h-3.5 w-3.5 mr-2" />
                                    Megnyitás Google Maps-en
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-border flex justify-end gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={onClose}>Bezárás</Button>
                        {status !== 'rejected' && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                onClick={() => saveStatus('rejected')}
                            >
                                <XCircle className="w-4 h-4" />
                                Elutasítás
                            </Button>
                        )}
                        {status !== 'reviewed' && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                                onClick={() => saveStatus('reviewed')}
                            >
                                <Eye className="w-4 h-4" />
                                Áttekintve
                            </Button>
                        )}
                        {status !== 'approved' && (
                            <Button
                                size="sm"
                                className="gap-2 bg-green-600 hover:bg-green-500 text-white"
                                onClick={() => saveStatus('approved')}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Elfogadás feldolgozásra
                            </Button>
                        )}
                        <Button size="sm" variant="outline" className="gap-2" onClick={handleSubmit}>
                            <Edit className="w-4 h-4" />
                            Mentés
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function PoiSuggestionsTable({
    data,
    onSort,
    onSave,
    onStatusChange,
    onDelete,
    onOpenUser,
    searchTerm,
    statusFilter,
    onStatusFilterChange,
    typeFilter,
    onTypeFilterChange,
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
}: PoiSuggestionsTableProps) {
    const [editingItem, setEditingItem] = useState<PoiSuggestion | null>(null);

    if (data.length === 0) {
        return (
            <div className="flex flex-col gap-4 h-full">
                <Filters
                    statusValue={statusFilter}
                    onStatusChange={onStatusFilterChange}
                    typeValue={typeFilter}
                    onTypeChange={onTypeFilterChange}
                />
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                        <Lightbulb className="w-8 h-8 text-zinc-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                        {searchTerm || statusFilter || typeFilter ? 'Nincs találat' : 'Nincs POI javaslat'}
                    </h3>
                    <p className="text-zinc-500 max-w-xs text-center mt-2">
                        {searchTerm || statusFilter || typeFilter
                            ? 'Próbálj más szűrési feltételt.'
                            : 'Még nem érkezett felhasználói POI javaslat.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <Filters
                statusValue={statusFilter}
                onStatusChange={onStatusFilterChange}
                typeValue={typeFilter}
                onTypeChange={onTypeFilterChange}
            />
            <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-white/5 bg-[#111111]">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#111111]">
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Típus</th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('name')}
                            >
                                Név
                            </th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('city')}
                            >
                                Város
                            </th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Részletek</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Koordináták</th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('status')}
                            >
                                Státusz
                            </th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Beküldő</th>
                            <th
                                className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                                onClick={() => onSort('created_at')}
                            >
                                Dátum
                            </th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((item) => {
                            const reporterName = item.reporter_username || item.reporter_full_name || 'Ismeretlen';
                            const hasCoords = item.latitude != null && item.longitude != null;
                            const detailChips = renderDetailChips(item.suggested_type, item.details);
                            return (
                                <tr
                                    key={item.id}
                                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                    onClick={() => setEditingItem(item)}
                                >
                                    <td className="p-4">
                                        <span className="text-sm font-medium text-white">{getTypeLabel(item.suggested_type)}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="max-w-[220px]">
                                            <span className="text-sm text-white truncate block" title={item.name || ''}>
                                                {item.name || <span className="text-zinc-600">—</span>}
                                            </span>
                                            {item.comment && (
                                                <span className="text-xs text-zinc-500 truncate block mt-0.5" title={item.comment}>
                                                    {item.comment}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-zinc-400 truncate block max-w-[140px]" title={item.city || ''}>
                                            {item.city || <span className="text-zinc-600">—</span>}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {detailChips.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                {detailChips.map((chip, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/10 bg-white/5 text-zinc-300"
                                                        title={chip.title}
                                                    >
                                                        {chip.label}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-zinc-600">—</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {hasCoords ? (
                                            <span className="text-xs font-mono text-zinc-400">
                                                {item.latitude!.toFixed(5)}, {item.longitude!.toFixed(5)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-zinc-600">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(item.status)}`}>
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <User className="w-3.5 h-3.5" />
                                            <span className="text-xs">{reporterName}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-zinc-500">
                                            {new Date(item.created_at).toLocaleDateString('hu-HU', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right" onClick={(event) => event.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#111111] border-white/10 text-zinc-400">
                                                <DropdownMenuLabel className="text-white">Műveletek</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => setEditingItem(item)}
                                                    className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Megnyitás / szerkesztés
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                {item.status !== 'reviewed' && (
                                                    <DropdownMenuItem
                                                        onClick={() => onStatusChange(item.id, 'reviewed')}
                                                        className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4 text-blue-400" />
                                                        Áttekintve
                                                    </DropdownMenuItem>
                                                )}
                                                {item.status !== 'approved' && (
                                                    <DropdownMenuItem
                                                        onClick={() => onStatusChange(item.id, 'approved')}
                                                        className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white"
                                                    >
                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" />
                                                        Elfogadás feldolgozásra
                                                    </DropdownMenuItem>
                                                )}
                                                {item.status !== 'rejected' && (
                                                    <DropdownMenuItem
                                                        onClick={() => onStatusChange(item.id, 'rejected')}
                                                        className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white"
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4 text-red-400" />
                                                        Elutasítás
                                                    </DropdownMenuItem>
                                                )}
                                                {onDelete && (
                                                    <>
                                                        <DropdownMenuSeparator className="bg-white/10" />
                                                        <DropdownMenuItem
                                                            onClick={() => onDelete(item.id)}
                                                            className="text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Törlés
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">Sorok:</span>
                        <div className="relative">
                            <select
                                value={pageSize}
                                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                                className="appearance-none bg-[#111111] border border-white/10 text-zinc-300 text-xs rounded-lg pl-2 pr-6 py-1 focus:outline-none focus:border-green-500/50 cursor-pointer hover:border-white/20 transition-colors"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs text-zinc-500">{currentPage} / {totalPages} oldal</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 text-xs font-medium border rounded-lg transition-colors ${currentPage === 1
                                    ? 'text-zinc-600 bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed'
                                    : 'text-zinc-400 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                                    }`}
                            >
                                Előző
                            </button>
                            <button
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 text-xs font-medium border rounded-lg transition-colors ${currentPage === totalPages
                                    ? 'text-zinc-600 bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed'
                                    : 'text-white bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                                    }`}
                            >
                                Következő
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <EditSuggestionModal
                key={editingItem?.id || 'empty'}
                item={editingItem}
                isOpen={!!editingItem}
                onClose={() => setEditingItem(null)}
                onSave={onSave}
                onStatusChange={onStatusChange}
                onOpenUser={onOpenUser}
            />
        </div>
    );
}
