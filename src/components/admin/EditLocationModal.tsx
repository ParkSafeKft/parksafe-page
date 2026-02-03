'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ImageUpload from './ImageUpload';
import {
    XCircle,
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
    DollarSign
} from 'lucide-react';
import { Location, ParkingLocation, RepairStation, BicycleService } from '@/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface EditLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    locationType: string;
    item: Location | ParkingLocation | RepairStation | BicycleService | null;
    onSuccess: () => void;
}

export default function EditLocationModal({ isOpen, onClose, locationType, item, onSuccess }: EditLocationModalProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formData, setFormData] = useState<any>({
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

    const [pictureUrls, setPictureUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parseCoordinates = (item: any) => {
        if (!item) return { lat: '', lon: '' };

        if (item.lat && item.lon) {
            return { lat: item.lat, lon: item.lon };
        }

        if (item.coordinate) {
            if (typeof item.coordinate === 'object' && item.coordinate.type === 'Point') {
                const [lon, lat] = item.coordinate.coordinates;
                return { lat, lon };
            }

            if (typeof item.coordinate === 'string') {
                try {
                    const coordsHex = item.coordinate.substring(18);
                    if (coordsHex.length >= 32) {
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
                    }
                } catch (error) {
                    console.error('Error parsing coordinates:', error);
                }
            }
        }

        return { lat: '', lon: '' };
    };

    useEffect(() => {
        if (item) {
            const coords = parseCoordinates(item);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const i = item as any;

            setFormData({
                name: i.name || '',
                description: i.description || '',
                city: i.city || '',
                lat: coords.lat ? coords.lat.toString() : '',
                lon: coords.lon ? coords.lon.toString() : '',
                covered: i.covered || false,
                is_open_24h: i.is_open_24h || false,
                capacity_level: i.capacity_level || '',
                has_camera: i.has_camera || false,
                phone: i.phone || '',
                website: i.website || '',
                opening_hours: i.opening_hours || '',
                rating: i.rating ? i.rating.toString() : '',
                price_range: i.price_range || '',
                free: i.free || false,
            });

            setPictureUrls(Array.isArray(i.picture_url) ? i.picture_url : []);
        }
    }, [item]);

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
        if (!item) return;

        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            const lat = parseFloat(formData.lat);
            const lon = parseFloat(formData.lon);

            if (isNaN(lat) || isNaN(lon)) {
                throw new Error('Érvénytelen koordináták');
            }

            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                throw new Error('Koordináták tartományon kívül');
            }

            let tableName = 'parkingSpots'; // Default to satisfy TS
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData: any = {
                name: formData.name,
                description: formData.description || null,
                city: formData.city,
                picture_url: pictureUrls.length > 0 ? pictureUrls : null,
            };

            if (locationType === 'parking') {
                tableName = 'parkingSpots';
                updateData.covered = formData.covered;
                updateData.is_open_24h = formData.is_open_24h;
                updateData.capacity_level = formData.capacity_level || null;
                updateData.has_camera = formData.has_camera;
            } else if (locationType === 'services') {
                tableName = 'bicycleService';
                updateData.phone = formData.phone || null;
                updateData.website = formData.website || null;
                updateData.opening_hours = formData.opening_hours || null;
                updateData.rating = formData.rating ? parseFloat(formData.rating) : null;
                updateData.price_range = formData.price_range || null;
            } else if (locationType === 'repair') {
                tableName = 'repairStation';
                updateData.covered = formData.covered;
                updateData.free = formData.free;
            }

            const { error: updateError } = await supabase
                .from(tableName)
                .update({
                    ...updateData,
                    coordinate: `SRID=4326;POINT(${lon} ${lat})`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', item.id);

            if (updateError) {
                console.error('Update error:', updateError);

                if (updateError.code === '42501' || updateError.message?.includes('policy')) {
                    throw new Error('Nincs jogosultságod a helyszín szerkesztéséhez. Csak admin felhasználók szerkeszthetnek helyszíneket.');
                }

                throw new Error(updateError.message || 'Hiba történt az adatbázis művelet során');
            }

            setSuccess(true);

            setTimeout(() => {
                setSuccess(false);
                onSuccess();
                onClose();
            }, 1500);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error updating location:', err);
            setError(err.message || 'Hiba történt a helyszín frissítése során');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !item) return null;

    const getTitle = () => {
        if (locationType === 'parking') return 'Parkoló Szerkesztése';
        if (locationType === 'services') return 'Szerviz Szerkesztése';
        if (locationType === 'repair') return 'Javító Állomás Szerkesztése';
        return 'Helyszín Szerkesztése';
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
            <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] p-0 bg-[#111111] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {getTitle()}
                                <span className="text-zinc-600 text-xs font-normal">#{item.id}</span>
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">Módosítsd az adatokat és mentsd el a változtatásokat. A *-gal jelölt mezők kötelezőek.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Scrollable Form */}
                    <div className="p-8 overflow-y-auto space-y-8">
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
                                existingImages={pictureUrls}
                                onChange={setPictureUrls}
                                locationType={locationType}
                                locationId={item?.id}
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
                                <span>Helyszín sikeresen frissítve!</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-black/30 border-t border-white/5 flex gap-4 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl transition-all border border-zinc-800"
                        >
                            Mégse
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isLoading || success}
                            className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Mentés...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    Mentve!
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    Mentés
                                </>
                            )}
                        </button>
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
