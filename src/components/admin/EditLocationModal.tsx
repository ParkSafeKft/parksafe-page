'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ImageUpload from './ImageUpload';
import { AlertCircle, CheckCircle, Loader2, Save, MapPin, Building2, Info, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Location, ParkingLocation, RepairStation, BicycleService } from '@/types';

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
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <DialogTitle className="text-xl font-bold flex items-center justify-between">
                        {getTitle()}
                        <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading} className="h-8 w-8 rounded-full">
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-130px)] bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="px-6 py-6">
                        <p className="text-sm text-zinc-500 mb-6">
                            Módosítsd az adatokat és mentsd el a változtatásokat. A *-gal jelölt mezők kötelezők.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Common fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Név *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Helyszín neve"
                                        required
                                        disabled={isLoading}
                                        className="bg-white dark:bg-zinc-950"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">Város *</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Város neve"
                                        required
                                        disabled={isLoading}
                                        className="bg-white dark:bg-zinc-950"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Leírás</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Rövid leírás a helyszínről"
                                    rows={3}
                                    disabled={isLoading}
                                    className="bg-white dark:bg-zinc-950 resize-none"
                                />
                            </div>

                            {/* Coordinates */}
                            <div className="space-y-4 p-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-sm font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                    <MapPin className="h-4 w-4" />
                                    Koordináták
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="lat">Szélesség (Latitude) *</Label>
                                        <Input
                                            type="number"
                                            id="lat"
                                            name="lat"
                                            value={formData.lat}
                                            onChange={handleChange}
                                            placeholder="47.4979"
                                            step="0.000001"
                                            required
                                            disabled={isLoading}
                                            className="bg-white dark:bg-zinc-950"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="lon">Hosszúság (Longitude) *</Label>
                                        <Input
                                            type="number"
                                            id="lon"
                                            name="lon"
                                            value={formData.lon}
                                            onChange={handleChange}
                                            placeholder="19.0402"
                                            step="0.000001"
                                            required
                                            disabled={isLoading}
                                            className="bg-white dark:bg-zinc-950"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-zinc-500">
                                    <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Tipp: A koordinátákat{' '}
                                        <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                            Google Maps
                                        </a>
                                        -ről vagy{' '}
                                        <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                            OpenStreetMap
                                        </a>
                                        -ről tudod kimásolni
                                    </span>
                                </div>
                            </div>

                            {/* Parking specific fields */}
                            {locationType === 'parking' && (
                                <div className="space-y-3 p-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                        Parkoló információk
                                    </h3>
                                    <div className="flex items-center justify-between py-2">
                                        <Label htmlFor="covered" className="cursor-pointer font-normal">Fedett parkoló</Label>
                                        <Switch
                                            id="covered"
                                            checked={formData.covered}
                                            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, covered: checked }))}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <Label htmlFor="is_open_24h" className="cursor-pointer font-normal">24 órás nyitvatartás</Label>
                                        <Switch
                                            id="is_open_24h"
                                            checked={formData.is_open_24h}
                                            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, is_open_24h: checked }))}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <Label htmlFor="has_camera" className="cursor-pointer font-normal">Kamera biztonság</Label>
                                        <Switch
                                            id="has_camera"
                                            checked={formData.has_camera}
                                            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, has_camera: checked }))}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        <Label htmlFor="capacity_level">Kapacitás szint</Label>
                                        <select
                                            id="capacity_level"
                                            name="capacity_level"
                                            value={formData.capacity_level}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                        >
                                            <option value="">Válassz...</option>
                                            <option value="small">Kis (1-10 hely)</option>
                                            <option value="medium">Közepes (11-50 hely)</option>
                                            <option value="large">Nagy (50+ hely)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Service specific fields */}
                            {locationType === 'services' && (
                                <div className="space-y-4 p-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                        <Building2 className="h-4 w-4" />
                                        Üzlet információk
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Telefonszám</Label>
                                                <Input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+36 20 123 4567"
                                                    disabled={isLoading}
                                                    className="bg-white dark:bg-zinc-950"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="website">Weboldal</Label>
                                                <Input
                                                    type="url"
                                                    id="website"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleChange}
                                                    placeholder="https://pelda.hu"
                                                    disabled={isLoading}
                                                    className="bg-white dark:bg-zinc-950"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="opening_hours">Nyitvatartás</Label>
                                                <Input
                                                    type="text"
                                                    id="opening_hours"
                                                    name="opening_hours"
                                                    value={formData.opening_hours}
                                                    onChange={handleChange}
                                                    placeholder="H-P: 9:00-18:00"
                                                    disabled={isLoading}
                                                    className="bg-white dark:bg-zinc-950"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="rating">Értékelés (1-5)</Label>
                                                <Input
                                                    type="number"
                                                    id="rating"
                                                    name="rating"
                                                    value={formData.rating}
                                                    onChange={handleChange}
                                                    placeholder="4.5"
                                                    min="1"
                                                    max="5"
                                                    step="0.1"
                                                    disabled={isLoading}
                                                    className="bg-white dark:bg-zinc-950"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="price_range">Árkategória</Label>
                                            <select
                                                id="price_range"
                                                name="price_range"
                                                value={formData.price_range}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
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

                            {/* Repair station specific fields */}
                            {locationType === 'repair' && (
                                <div className="space-y-3 p-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                        Szerviz információk
                                    </h3>
                                    <div className="flex items-center justify-between py-2">
                                        <Label htmlFor="covered-repair" className="cursor-pointer font-normal">Fedett állomás</Label>
                                        <Switch
                                            id="covered-repair"
                                            checked={formData.covered}
                                            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, covered: checked }))}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <Label htmlFor="free" className="cursor-pointer font-normal">Ingyenes használat</Label>
                                        <Switch
                                            id="free"
                                            checked={formData.free}
                                            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, free: checked }))}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Image Upload */}
                            <div className="p-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                <ImageUpload
                                    existingImages={pictureUrls}
                                    onChange={setPictureUrls}
                                    locationType={locationType}
                                    locationId={item?.id}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200">
                                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>Helyszín sikeresen frissítve!</span>
                                </div>
                            )}
                        </form>
                    </div>
                </ScrollArea>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end gap-3 flex-shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="bg-white dark:bg-zinc-900"
                    >
                        Mégse
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading || success}
                        className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Mentés...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mentve!
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Mentés
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
