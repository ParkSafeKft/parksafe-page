'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ImageUpload, { ImageUploadHandle } from './ImageUpload';
import {
    Save,
    MapPin,
    Info,
    Camera,
    Clock,
    ShieldCheck,
    Building2,
    Wrench,
    AlertCircle,
    CheckCircle,
    Loader2,
    Phone,
    Globe,
    Star,
    DollarSign,
    Plus
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface AddLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    locationType: string;
    onSuccess: () => void;
}

export default function AddLocationModal({ isOpen, onClose, locationType, onSuccess }: AddLocationModalProps) {
    const imageUploadRef = useRef<ImageUploadHandle>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formData, setFormData] = useState<any>({
        name: '',
        description: '',
        city: '',
        lat: '',
        lon: '',
        // Parking specific
        covered: false,
        is_open_24h: false,
        capacity_level: '',
        has_camera: false,
        // Service specific
        phone: '',
        website: '',
        opening_hours: '',
        rating: '',
        price_range: '',
        // Repair station specific
        free: false,
    });

    const [pictureUrls, setPictureUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle checkbox separately
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const toggleBoolean = (field: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Validate coordinates
            const lat = parseFloat(formData.lat);
            const lon = parseFloat(formData.lon);

            if (isNaN(lat) || isNaN(lon)) {
                throw new Error('Érvénytelen koordináták');
            }

            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                throw new Error('Koordináták tartományon kívül');
            }

            // Determine table name based on location type
            let tableName = 'parkingSpots';
            const insertData = {
                name: formData.name,
                description: formData.description || null,
                city: formData.city,
                available: true, // Default available
                picture_url: pictureUrls.length > 0 ? pictureUrls : null,
            };

            // Add location type specific fields
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const finalData: any = { ...insertData };
            if (locationType === 'parking') {
                tableName = 'parkingSpots';
                finalData.covered = formData.covered;
                finalData.is_open_24h = formData.is_open_24h;
                finalData.capacity_level = formData.capacity_level || null;
                finalData.has_camera = formData.has_camera;
            } else if (locationType === 'services') {
                tableName = 'bicycleService';
                finalData.phone = formData.phone || null;
                finalData.website = formData.website || null;
                finalData.opening_hours = formData.opening_hours || null;
                finalData.rating = formData.rating ? parseFloat(formData.rating) : null;
                finalData.price_range = formData.price_range || null;
            } else if (locationType === 'repair') {
                tableName = 'repairStation';
                finalData.covered = formData.covered;
                finalData.free = formData.free;
            }

            // Insert with PostGIS coordinate
            const { data: inserted, error: insertError } = await supabase
                .from(tableName)
                .insert([{
                    ...finalData,
                    // PostGIS POINT format: POINT(longitude latitude)
                    coordinate: `SRID=4326;POINT(${lon} ${lat})`
                }])
                .select('id')
                .single();

            if (insertError) {
                console.error('Insert error:', insertError);

                // Handle specific RLS policy errors
                if (insertError.code === '42501' || insertError.message?.includes('policy')) {
                    throw new Error('Nincs jogosultságod új helyszín hozzáadásához. Csak admin felhasználók adhatnak hozzá új helyszíneket.');
                }

                throw new Error(insertError.message || 'Hiba történt az adatbázis művelet során');
            }

            // If there are staged files (no id earlier), upload them with new id
            if (imageUploadRef.current && inserted?.id) {
                const newly = await imageUploadRef.current.uploadPending(inserted.id);
                if (newly.length > 0) {
                    await supabase.from(tableName).update({ picture_url: newly }).eq('id', inserted.id);
                }
            }

            setSuccess(true);

            // Reset form
            setTimeout(() => {
                setFormData({
                    name: '',
                    description: '',
                    city: '',
                    lat: '',
                    lon: '',
                    covered: false,
                    is_open_24h: false,
                    capacity_level: '',
                    has_camera: false,
                    phone: '',
                    website: '',
                    opening_hours: '',
                    rating: '',
                    price_range: '',
                    free: false,
                });
                setPictureUrls([]);
                setSuccess(false);
                onSuccess();
                onClose();
            }, 1500);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error adding location:', err);
            setError(err.message || 'Hiba történt a helyszín hozzáadása során');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const getTitle = () => {
        if (locationType === 'parking') return 'Parkoló hozzáadása';
        if (locationType === 'services') return 'Szerviz hozzáadása';
        if (locationType === 'repair') return 'Javító állomás hozzáadása';
        return 'Helyszín hozzáadása';
    };

    const Icon = locationType === 'parking' ? MapPin : locationType === 'services' ? Building2 : Wrench;
    const iconGradient = locationType === 'parking'
        ? 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400'
        : locationType === 'services'
            ? 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400'
            : 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
            <DialogContent className="admin-dark max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden bg-card border-border p-0">
                <div className="flex flex-col h-[85vh]">
                    {/* Header - same as POI / DetailModal */}
                    <div className="p-6 border-b border-border flex-shrink-0 bg-background/50 backdrop-blur-sm">
                        <DialogTitle className="text-foreground flex items-center justify-between text-xl font-bold">
                            <div className="flex items-center gap-4 min-w-0 pr-8">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconGradient} border flex items-center justify-center flex-shrink-0 shadow-inner`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-lg font-bold text-foreground truncate leading-tight">
                                        {getTitle()}
                                    </h1>
                                    <p className="text-xs text-muted-foreground mt-1">Töltsd ki az alábbi mezőket. A *-gal jelölt mezők kötelezőek.</p>
                                </div>
                            </div>
                        </DialogTitle>
                    </div>

                    {/* Scrollable Form - same ScrollArea pattern as POI modal */}
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="p-6 space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Név *</label>
                                <input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900/50 border border-white/5 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 rounded-xl px-4 py-3 text-sm text-white transition-all outline-none"
                                    placeholder="Helyszín neve"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="city" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Város *</label>
                                <input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900/50 border border-white/5 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 rounded-xl px-4 py-3 text-sm text-white transition-all outline-none"
                                    placeholder="Város neve"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="description" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Leírás</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-zinc-900/50 border border-white/5 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 rounded-xl px-4 py-3 text-sm text-white transition-all outline-none resize-none"
                                placeholder="Írjon egy rövid leírást..."
                                disabled={isLoading}
                            />
                        </div>

                        {/* Coordinates Group */}
                        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4">
                            <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                <MapPin className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">Koordináták</span>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label htmlFor="lat" className="text-[10px] text-zinc-500 uppercase tracking-widest">Szélesség (Latitude) *</label>
                                    <input
                                        type="number"
                                        id="lat"
                                        name="lat"
                                        value={formData.lat}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-300 font-mono focus:border-green-500/50 outline-none"
                                        placeholder="47.4979"
                                        step="0.000001"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="lon" className="text-[10px] text-zinc-500 uppercase tracking-widest">Hosszúság (Longitude) *</label>
                                    <input
                                        type="number"
                                        id="lon"
                                        name="lon"
                                        value={formData.lon}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-300 font-mono focus:border-green-500/50 outline-none"
                                        placeholder="19.0402"
                                        step="0.000001"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Info className="w-3.5 h-3.5 text-blue-400" />
                                <p className="text-[10px] text-zinc-500">
                                    Tipp: A koordinátákat <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">Google Maps</a>-ről vagy <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">OpenStreetMap</a>-ről tudod kimásolni.
                                </p>
                            </div>
                        </div>

                        {/* Type Specific Settings */}
                        {locationType === 'parking' && (
                            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-6">
                                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Parkoló információk</span>
                                </div>

                                <ToggleItem label="Fedett parkoló" icon={Info} active={formData.covered} onClick={() => toggleBoolean('covered')} isLoading={isLoading} />
                                <ToggleItem label="24 órás nyitvatartás" icon={Clock} active={formData.is_open_24h} onClick={() => toggleBoolean('is_open_24h')} isLoading={isLoading} />
                                <ToggleItem label="Kamera biztonság" icon={Camera} active={formData.has_camera} onClick={() => toggleBoolean('has_camera')} isLoading={isLoading} />

                                <div className="space-y-1.5 pt-2">
                                    <label htmlFor="capacity_level" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Kapacitás szint</label>
                                    <select
                                        id="capacity_level"
                                        name="capacity_level"
                                        value={formData.capacity_level}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:border-green-500/50 outline-none"
                                    >
                                        <option value="">Válassz...</option>
                                        <option value="small">Kis (1-10 hely)</option>
                                        <option value="medium">Közepes (11-50 hely)</option>
                                        <option value="large">Nagy (50+ hely)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {locationType === 'services' && (
                            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-6">
                                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                    <Building2 className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Üzlet információk</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="phone" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Telefonszám</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <input
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-zinc-900/50 border border-white/5 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white transition-all outline-none"
                                                placeholder="+36 20 123 4567"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="website" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Weboldal</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <input
                                                id="website"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className="w-full bg-zinc-900/50 border border-white/5 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white transition-all outline-none"
                                                placeholder="https://pelda.hu"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="opening_hours" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Nyitvatartás</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <input
                                                id="opening_hours"
                                                name="opening_hours"
                                                value={formData.opening_hours}
                                                onChange={handleChange}
                                                className="w-full bg-zinc-900/50 border border-white/5 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white transition-all outline-none"
                                                placeholder="H-P: 9:00-18:00"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="rating" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Értékelés (1-5)</label>
                                        <div className="relative">
                                            <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <input
                                                type="number"
                                                id="rating"
                                                name="rating"
                                                value={formData.rating}
                                                onChange={handleChange}
                                                className="w-full bg-zinc-900/50 border border-white/5 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white transition-all outline-none"
                                                placeholder="4.5"
                                                min="1"
                                                max="5"
                                                step="0.1"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="price_range" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Árkategória</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                        <select
                                            id="price_range"
                                            name="price_range"
                                            value={formData.price_range}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white appearance-none cursor-pointer focus:border-green-500/50 outline-none"
                                        >
                                            <option value="">Válassz...</option>
                                            <option value="$">$ - Olcsó</option>
                                            <option value="$$">$$ - Közepes</option>
                                            <option value="$$$">$$$ - Drága</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {locationType === 'repair' && (
                            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-6">
                                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                    <Wrench className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Szerviz információk</span>
                                </div>

                                <ToggleItem label="Fedett állomás" icon={Info} active={formData.covered} onClick={() => toggleBoolean('covered')} isLoading={isLoading} />
                                <ToggleItem label="Ingyenes használat" icon={DollarSign} active={formData.free} onClick={() => toggleBoolean('free')} isLoading={isLoading} />
                            </div>
                        )}

                        {/* Image Upload */}
                        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                Képek
                            </h3>
                            <ImageUpload
                                ref={imageUploadRef}
                                existingImages={pictureUrls}
                                onChange={setPictureUrls}
                                locationType={locationType}
                                locationId={null}
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-500 text-sm border border-green-500/20">
                                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                <span>Helyszín sikeresen létrehozva!</span>
                            </div>
                        )}
                        </div>
                    </ScrollArea>

                    {/* Footer - same as other modals */}
                    <div className="p-6 border-t border-border flex justify-end gap-2 flex-shrink-0">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Mégse
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading || success}
                            className="gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Mentés...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    Létrehozva!
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    Létrehozás
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ToggleItem = ({ label, icon: Icon, active, onClick, isLoading }: { label: string, icon: any, active: boolean, onClick?: () => void, isLoading: boolean }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-zinc-500 group-hover:text-green-500'}`}>
                <Icon className="w-4 h-4" />
            </div>
            <span className={`text-sm font-medium transition-colors ${active ? 'text-white' : 'text-zinc-300'}`}>{label}</span>
        </div>
        <div
            onClick={isLoading ? undefined : onClick}
            className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${active ? 'bg-green-600' : 'bg-zinc-800'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${active ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
    </div>
);
