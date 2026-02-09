import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ImagePreview from './ImagePreview';
import {
    Users,
    Shield,
    Mail,
    Phone,
    Calendar,
    CheckCircle,
    XCircle,
    Eye,
    MapPin,
    Clock,
    Camera,
    Star,
    Edit,
    MessageSquare,
    ChevronDown,
    AlertCircle,
    Check
} from 'lucide-react';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEdit: (item: any) => void;
    onStatusChange?: (id: string, newStatus: string) => void;
}


export default function DetailModal({
    isOpen,
    onClose,
    item,
    type,
    onEdit,
    onStatusChange,
}: DetailModalProps) {
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);

    useEffect(() => {
        if (item?.status) {
            setCurrentStatus(item.status);
        }
    }, [item]);

    const handleStatusChange = (newStatus: string) => {
        setCurrentStatus(newStatus);
        if (onStatusChange && item) {
            onStatusChange(item.id, newStatus);
        }
    };

    if (!item) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parseWKBPoint = (wkb: any) => {
        if (!wkb) return null;
        if (typeof wkb === 'object' && wkb.type === 'Point' && Array.isArray(wkb.coordinates)) {
            const [lon, lat] = wkb.coordinates;
            return { lat, lon };
        }
        if (typeof wkb !== 'string') return null;
        try {
            const coordsHex = wkb.substring(18);
            if (coordsHex.length < 32) return null;
            const lonHex = coordsHex.substring(0, 16);
            const latHex = coordsHex.substring(16, 32);
            const lonBuffer = new ArrayBuffer(8);
            const lonView = new DataView(lonBuffer);
            for (let i = 0; i < 8; i++) {
                lonView.setUint8(i, parseInt(lonHex.substr(i * 2, 2), 16));
            }
            const lon = lonView.getFloat64(0, true);
            const latBuffer = new ArrayBuffer(8);
            const latView = new DataView(latBuffer);
            for (let i = 0; i < 8; i++) {
                latView.setUint8(i, parseInt(latHex.substr(i * 2, 2), 16));
            }
            const lat = latView.getFloat64(0, true);
            return { lat, lon };
        } catch (error) {
            console.error('Error parsing WKB:', error);
            return null;
        }
    };

    const getCoordinates = () => {
        if (item.lat && item.lon) {
            return { lat: item.lat, lon: item.lon };
        }
        if (item.coordinate) {
            return parseWKBPoint(item.coordinate);
        }
        return null;
    };

    const coords = getCoordinates();

    if (type === 'feedback') {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="admin-dark max-w-2xl w-[90vw] max-h-[90vh] overflow-hidden bg-card border-border p-0">
                    <div className="flex flex-col h-[85vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-border flex-shrink-0 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                            <DialogTitle className="text-foreground flex items-center justify-between text-xl font-bold">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
                                        <MessageSquare className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-lg font-bold text-foreground truncate leading-tight">
                                            Visszajelzés részletei
                                        </h1>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs font-mono text-muted-foreground truncate opacity-70">
                                                ID: {item.id.substring(0, 8)}...
                                            </p>
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-white/10 bg-white/5">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 pl-4">
                                    {/* Optional: Add status badge here too for quick visibility */}
                                </div>
                            </DialogTitle>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-6">
                                {/* Title & Description */}
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                        Cím
                                    </h3>
                                    <p className="text-lg font-semibold text-white">{item.title}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                        Leírás
                                    </h3>
                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-zinc-300 whitespace-pre-wrap">
                                        {item.description}
                                    </div>
                                </div>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <Shield className="w-3 h-3" /> Típus
                                        </h3>
                                        <div className="flex items-center">
                                            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium capitalize bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border-zinc-700">
                                                {item.type}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" /> Prioritás
                                        </h3>
                                        <div className="flex items-center">
                                            <Badge
                                                className={`px-3 py-1 text-sm font-medium capitalize border-0 ${item.priority === 'high' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                                                    item.priority === 'medium' ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' :
                                                        'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                                    }`}
                                            >
                                                {item.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <Users className="w-3 h-3" /> Kategória
                                        </h3>
                                        <p className="text-sm font-medium text-zinc-200 capitalize pl-1">
                                            {item.category?.replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <CheckCircle className="w-3 h-3" /> Státusz
                                        </h3>
                                        {onStatusChange ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`w-full justify-between border-white/10 bg-zinc-900/50 hover:bg-zinc-900 hover:text-white capitalize font-normal ${currentStatus === 'resolved' ? 'text-green-400 border-green-900/50' :
                                                            currentStatus === 'closed' ? 'text-zinc-400' :
                                                                currentStatus === 'in_progress' ? 'text-blue-400 border-blue-900/50' :
                                                                    'text-zinc-200'
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${currentStatus === 'open' ? 'bg-yellow-500' :
                                                                currentStatus === 'in_progress' ? 'bg-blue-500' :
                                                                    currentStatus === 'resolved' ? 'bg-green-500' :
                                                                        currentStatus === 'closed' ? 'bg-zinc-500' :
                                                                            'bg-purple-500'
                                                                }`} />
                                                            {currentStatus === 'open' ? 'Nyitott' :
                                                                currentStatus === 'in_progress' ? 'Folyamatban' :
                                                                    currentStatus === 'resolved' ? 'Megoldva' :
                                                                        currentStatus === 'closed' ? 'Lezárt' :
                                                                            currentStatus === 'duplicate' ? 'Duplikált' :
                                                                                currentStatus?.replace(/_/g, ' ')}
                                                        </span>
                                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-[180px] bg-zinc-900 border-zinc-800">
                                                    <DropdownMenuItem onClick={() => handleStatusChange('open')} className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 group-hover:shadow-[0_0_8px_rgba(234,179,8,0.6)] transition-shadow" />
                                                        Nyitott
                                                        {currentStatus === 'open' && <Check className="ml-auto h-3 w-3" />}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange('in_progress')} className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-shadow" />
                                                        Folyamatban
                                                        {currentStatus === 'in_progress' && <Check className="ml-auto h-3 w-3" />}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange('resolved')} className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 group-hover:shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-shadow" />
                                                        Megoldva
                                                        {currentStatus === 'resolved' && <Check className="ml-auto h-3 w-3" />}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange('duplicate')} className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                        <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 group-hover:shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-shadow" />
                                                        Duplikált
                                                        {currentStatus === 'duplicate' && <Check className="ml-auto h-3 w-3" />}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange('closed')} className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer group">
                                                        <span className="w-2 h-2 rounded-full bg-zinc-500 mr-2 group-hover:shadow-[0_0_8px_rgba(113,113,122,0.6)] transition-shadow" />
                                                        Lezárt
                                                        {currentStatus === 'closed' && <Check className="ml-auto h-3 w-3" />}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <div className="flex items-center gap-2 text-white capitalize pl-1">
                                                <span className={`w-2 h-2 rounded-full ${item.status === 'open' ? 'bg-yellow-500' :
                                                    item.status === 'in_progress' ? 'bg-blue-500' :
                                                        item.status === 'resolved' ? 'bg-green-500' :
                                                            item.status === 'closed' ? 'bg-zinc-500' :
                                                                'bg-purple-500'
                                                    }`} />
                                                {item.status?.replace(/_/g, ' ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border" />

                            {/* Contact info */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                    Kapcsolat
                                </h3>
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                    {item.contact_email ? (
                                        <div className="flex items-center gap-3 text-white">
                                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <Mail className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground">Email cím</span>
                                                <span className="font-medium break-all">{item.contact_email}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-zinc-500 flex items-center gap-2">
                                            <XCircle className="w-4 h-4" />
                                            Nincs megadva elérhetőség
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* Admin Notes */}
                            {item.admin_notes && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                        Admin Jegyzetek
                                    </h3>
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 rounded-lg text-sm">
                                        {item.admin_notes}
                                    </div>
                                </div>
                            )}
                        </ScrollArea>

                        <div className="p-6 border-t border-border flex justify-end">
                            <Button onClick={onClose} variant="outline">Bezárás</Button>
                        </div>
                    </div>
                </DialogContent >
            </Dialog >
        );
    }

    if (type === 'user') {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="admin-dark max-w-2xl w-[90vw] max-h-[90vh] overflow-hidden bg-card border-border p-0">
                    <div className="flex flex-col h-[85vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-border flex-shrink-0">
                            <DialogTitle className="text-foreground flex items-center gap-4 text-xl font-bold">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl font-bold text-foreground truncate">
                                        {item.username || 'Felhasználó'}
                                    </h1>
                                    <p className="text-muted-foreground text-sm mt-1 truncate">
                                        Felhasználói profil és beállítások
                                    </p>
                                </div>
                            </DialogTitle>
                        </div>

                        {/* Scrollable Content */}
                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* User Profile Section */}
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-4">
                                            <Shield className="h-4 w-4 flex-shrink-0" />
                                            <span>Felhasználói adatok</span>
                                        </h3>
                                        <div className="space-y-6">
                                            {/* Profile Section */}
                                            <div className="flex items-start gap-6">
                                                <Avatar className="h-20 w-20 ring-2 ring-border flex-shrink-0">
                                                    <AvatarImage src={item.avatar_url} alt={item.username || 'User'} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-2xl">
                                                        {(item.username || item.email || 'U').charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0 space-y-3">
                                                    <div>
                                                        <h3 className="font-semibold text-foreground text-2xl">{item.username || 'Nincs megadva'}</h3>
                                                        <p className="text-muted-foreground text-base truncate">{item.email}</p>
                                                    </div>
                                                    <Badge
                                                        variant={item.role === 'admin' ? 'default' : 'secondary'}
                                                        className={`text-sm px-3 py-1 ${item.role === 'admin' ? 'bg-primary hover:bg-primary/80 text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                                                    >
                                                        {item.role === 'admin' ? 'Adminisztrátor' : 'Felhasználó'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <Separator className="bg-border" />

                                            {/* Contact Information */}
                                            <div className="flex flex-col gap-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-medium text-foreground">Email cím</p>
                                                        <p className="text-sm text-muted-foreground truncate mt-1">{item.email || 'Nincs megadva'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-medium text-foreground">Telefonszám</p>
                                                        <p className="text-sm text-muted-foreground mt-1">{item.phone || 'Nincs megadva'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-medium text-foreground">Regisztráció dátuma</p>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {item.created_at
                                                                ? new Date(item.created_at).toLocaleDateString('hu-HU', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })
                                                                : 'Ismeretlen'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional User Stats */}
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-4">
                                            <Users className="h-4 w-4 flex-shrink-0" />
                                            <span>Aktivitás</span>
                                        </h3>
                                        <div className="text-center py-8">
                                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                            <p className="text-muted-foreground text-sm">Jelenleg nincs aktivitási információ elérhető erről a felhasználóról.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </ScrollArea>

                        {/* Action Buttons */}
                        <div className="p-6 border-t border-border flex-shrink-0">
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="px-8"
                                >
                                    Bezárás
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent >
            </Dialog >
        );
    }

    // Location Details (Parking, Service, Repair)
    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="admin-dark max-w-4xl max-h-[90vh] overflow-hidden bg-card border-border p-0 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <DialogTitle className="text-lg font-bold text-foreground">
                                {item.name || 'Helyszín'}
                            </DialogTitle>
                            <Badge variant={item.available ? 'default' : 'destructive'} className="flex items-center gap-1 text-xs">
                                {item.available ? (
                                    <>
                                        <CheckCircle className="h-3 w-3" />
                                        Aktív
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-3 w-3" />
                                        Inaktív
                                    </>
                                )}
                            </Badge>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <ScrollArea className="flex-1 overflow-y-auto">
                        <div className="p-4 space-y-6">
                            {/* Image Gallery */}
                            {item.picture_url && item.picture_url.length > 0 && (
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-semibold mb-3">
                                        <Eye className="h-4 w-4" />
                                        Képek ({item.picture_url.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {item.picture_url.map((url: string, index: number) => (
                                            <div
                                                key={index}
                                                className="relative w-28 h-28 rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors group"
                                                onClick={() => setImagePreviewUrl(url)}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`${item.name} - ${index + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Alapadatok */}
                            <div>
                                <h3 className="text-base font-semibold mb-3">Alapadatok</h3>
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex-1 min-w-[200px]">
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                <MapPin className="h-3 w-3" />
                                                Város
                                            </p>
                                            <p className="text-sm font-medium">{item.city}</p>
                                        </div>

                                        {(type === 'parking' || type === 'repair') && item.covered !== undefined && (
                                            <div className="flex-1 min-w-[200px]">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                    <Shield className="h-3 w-3" />
                                                    Fedett
                                                </p>
                                                <p className="text-sm font-medium">{item.covered ? 'Igen' : 'Nem'}</p>
                                            </div>
                                        )}

                                        {type === 'parking' && item.is_open_24h !== undefined && (
                                            <div className="flex-1 min-w-[200px]">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                    <Clock className="h-3 w-3" />
                                                    24 órás
                                                </p>
                                                <p className="text-sm font-medium">{item.is_open_24h ? 'Igen' : 'Nem'}</p>
                                            </div>
                                        )}

                                        {type === 'parking' && item.has_camera !== undefined && (
                                            <div className="flex-1 min-w-[200px]">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                    <Camera className="h-3 w-3" />
                                                    Kamera
                                                </p>
                                                <p className="text-sm font-medium">{item.has_camera ? 'Igen' : 'Nem'}</p>
                                            </div>
                                        )}

                                        {type === 'parking' && item.capacity_level && (
                                            <div className="flex-1 min-w-[200px]">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                    <Users className="h-3 w-3" />
                                                    Kapacitás
                                                </p>
                                                <p className="text-sm font-medium">
                                                    {item.capacity_level === 'small' ? 'Kis (1-10 hely)' :
                                                        item.capacity_level === 'medium' ? 'Közepes (11-50 hely)' :
                                                            item.capacity_level === 'large' ? 'Nagy (50+ hely)' :
                                                                item.capacity_level}
                                                </p>
                                            </div>
                                        )}

                                        {type === 'repair' && item.free !== undefined && (
                                            <div className="flex-1 min-w-[200px]">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                    <Star className="h-3 w-3" />
                                                    Ingyenes
                                                </p>
                                                <p className="text-sm font-medium">{item.free ? 'Igen' : 'Nem'}</p>
                                            </div>
                                        )}

                                        {type === 'service' && item.phone && (
                                            <div className="flex-1 min-w-[200px]">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                    <Phone className="h-3 w-3" />
                                                    Telefonszám
                                                </p>
                                                <p className="text-sm font-medium">{item.phone}</p>
                                            </div>
                                        )}

                                        {type === 'service' && item.rating && (
                                            <div className="flex-1 min-w-[200px]">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                    <Star className="h-3 w-3" />
                                                    Értékelés
                                                </p>
                                                <p className="text-sm font-medium">{item.rating} / 5</p>
                                            </div>
                                        )}
                                    </div>

                                    {type === 'parking' && item.description && (
                                        <div className="w-full">
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                                <Eye className="h-3 w-3" />
                                                Leírás
                                            </p>
                                            <p className="text-sm">{item.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Coordinates & Map */}
                            {coords ? (
                                <>
                                    <div>
                                        <h3 className="text-base font-semibold mb-3">Koordináták</h3>
                                        <div className="flex gap-6">
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground mb-0.5">Szélesség (Latitude)</p>
                                                <p className="text-sm font-mono font-semibold">{coords.lat.toFixed(6)}</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground mb-0.5">Hosszúság (Longitude)</p>
                                                <p className="text-sm font-mono font-semibold">{coords.lon.toFixed(6)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="flex items-center gap-2 text-base font-semibold mb-3">
                                            <MapPin className="h-4 w-4" />
                                            Térkép
                                        </h3>
                                        <div className="rounded-lg overflow-hidden border border-border mb-3">
                                            <iframe
                                                width="100%"
                                                height="350"
                                                frameBorder="0"
                                                style={{ border: 0 }}
                                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(coords.lon - 0.002).toFixed(6)},${(coords.lat - 0.002).toFixed(6)},${(coords.lon + 0.002).toFixed(6)},${(coords.lat + 0.002).toFixed(6)}&layer=mapnik&marker=${coords.lat.toFixed(6)},${coords.lon.toFixed(6)}`}
                                                allowFullScreen
                                                title="Location Map"
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            size="sm"
                                            onClick={() => window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lon}`, '_blank')}
                                        >
                                            <MapPin className="h-3.5 w-3.5 mr-2" />
                                            Megnyitás Google Maps-en
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <h3 className="text-base font-semibold mb-3">Koordináták</h3>
                                    <p className="text-sm text-muted-foreground">Koordináták nem érhetők el</p>
                                </div>
                            )}

                            {/* Database Info */}
                            <div>
                                <h3 className="text-base font-semibold mb-3">Adatbázis információk</h3>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex-1 min-w-[150px]">
                                        <p className="text-xs text-muted-foreground mb-0.5">ID</p>
                                        <p className="text-xs font-mono text-foreground break-all">{item.id}</p>
                                    </div>
                                    <div className="flex-1 min-w-[150px]">
                                        <p className="text-xs text-muted-foreground mb-0.5">Létrehozva</p>
                                        <p className="text-xs font-medium">
                                            {new Date(item.created_at).toLocaleDateString('hu-HU', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex-1 min-w-[150px]">
                                        <p className="text-xs text-muted-foreground mb-0.5">Módosítva</p>
                                        <p className="text-xs font-medium">
                                            {new Date(item.updated_at).toLocaleDateString('hu-HU', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-border flex justify-end gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Bezárás
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                onEdit(item);
                                onClose();
                            }}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Szerkesztés
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {imagePreviewUrl && (
                <ImagePreview src={imagePreviewUrl} alt="Előnézet" onClose={() => setImagePreviewUrl(null)} />
            )}
        </>
    );
}
