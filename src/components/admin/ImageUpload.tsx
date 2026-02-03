import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import ImagePreview from './ImagePreview';
import { supabase } from '@/lib/supabaseClient';
import { Image as ImageIcon, Plus, X, AlertTriangle, Info, Loader2, GripVertical } from 'lucide-react';
import { ImageUploadProps } from '@/types';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export interface ImageUploadHandle {
    uploadPending: (withLocationId: string) => Promise<string[]>;
}

const ImageUpload = forwardRef<ImageUploadHandle, ImageUploadProps>(function ImageUpload({ existingImages = [], onChange, locationType, locationId = null }, ref) {
    const [images, setImages] = useState<string[]>(existingImages);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]); // files waiting for location id
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Generate unique filename
    const generateFileName = (file: File): string => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop();

        // Include locationId in filename if available
        if (locationId) {
            return `${locationType}_${locationId}_${timestamp}_${randomStr}.${extension}`;
        }

        // Fallback for new locations without ID yet
        return `${locationType}_${timestamp}_${randomStr}.${extension}`;
    };

    // Upload image to Supabase Storage
    const uploadImage = async (file: File, forcedLocationId: string | null = null): Promise<string> => {
        const effectiveId = forcedLocationId || locationId;
        const fileName = effectiveId
            ? `${locationType}_${effectiveId}_${Date.now()}_${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`
            : generateFileName(file);
        const filePath = `${locationType}/${fileName}`;

        const { error } = await supabase.storage
            .from('location-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('location-images')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    // Keep internal state in sync with parent when switching records quickly
    useEffect(() => {
        setImages(existingImages || []);
    }, [existingImages, locationId, locationType]);

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newImageUrls: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Validate file
                if (!file.type.startsWith('image/')) {
                    alert(`${file.name} nem kép fájl!`);
                    continue;
                }

                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`${file.name} túl nagy! Maximum 5MB lehet.`);
                    continue;
                }

                if (!locationId) {
                    // Stage files for later upload when id is available; show preview
                    const preview = URL.createObjectURL(file);
                    newImageUrls.push(preview);
                    setPendingFiles(prev => [...prev, file]);
                } else {
                    setUploading(true);
                    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
                    try {
                        const url = await uploadImage(file);
                        newImageUrls.push(url);
                        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
                    } catch (error) {
                        console.error(`Error uploading ${file.name}:`, error);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        alert(`Hiba ${file.name} feltöltése során: ${(error as any).message}`);
                    } finally {
                        setUploading(false);
                    }
                }
            }

            // Update images array
            const updatedImages = [...images, ...newImageUrls];
            setImages(updatedImages);
            if (locationId) onChange(updatedImages);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Hiba a képek feltöltése során');
        } finally {
            setUploadProgress({});
            // Reset file input
            e.target.value = '';
        }
    };

    // Handle drag start
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    // Handle drag over
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    // Handle drag leave
    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    // Handle drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newImages = [...images];
        const draggedItem = newImages[draggedIndex];

        // Remove dragged item
        newImages.splice(draggedIndex, 1);

        // Insert at new position
        newImages.splice(dropIndex, 0, draggedItem);

        setImages(newImages);
        onChange(newImages);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Handle drag end
    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Delete image
    const handleDeleteImage = async (imageUrl: string, index: number) => {
        if (!confirm('Biztosan törölni szeretnéd ezt a képet?')) {
            return;
        }

        try {
            // Extract file path from URL
            const urlParts = imageUrl.split('/location-images/');
            if (urlParts.length === 2) {
                const filePath = urlParts[1];

                // Delete from storage
                const { error } = await supabase.storage
                    .from('location-images')
                    .remove([filePath]);

                if (error) {
                    console.error('Delete error:', error);
                    // Continue anyway - file might not exist
                }
            }

            // Remove from array
            const updatedImages = images.filter((_, i) => i !== index);
            setImages(updatedImages);
            onChange(updatedImages);

        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Hiba a kép törlése során');
        }
    };

    // Expose method for parent to upload pending files once an id is known
    useImperativeHandle(ref, () => ({
        async uploadPending(withLocationId: string) {
            if (!pendingFiles.length) return [];
            const uploaded: string[] = [];
            try {
                setUploading(true);
                for (let i = 0; i < pendingFiles.length; i++) {
                    const file = pendingFiles[i];
                    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
                    const url = await uploadImage(file, withLocationId);
                    uploaded.push(url);
                    setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
                }
                const updated = images
                    .filter(u => !u.startsWith('blob:'))
                    .concat(uploaded);
                setImages(updated);
                onChange(updated);
                setPendingFiles([]);
                return uploaded;
            } finally {
                setUploading(false);
                setUploadProgress({});
            }
        }
    }));

    return (
        <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center">
                <ImageIcon size={16} className="inline-block mr-1.5 align-middle" />
                Képek ({images.length})
                {images.length < 10 && (
                    <span className="text-xs font-normal text-zinc-500 ml-1"> - Maximum 10 kép tölthető fel</span>
                )}
            </label>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-2">
                    {images.map((url, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative aspect-square rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 transition-all duration-200 group cursor-grab active:cursor-grabbing",
                                draggedIndex === index && "opacity-50",
                                dragOverIndex === index && "border-[#34aa56] border-[3px] scale-105"
                            )}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setPreviewUrl(url)}
                        >
                            <div className="absolute top-1.5 left-1.5 z-10 p-1 bg-black/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical size={14} className="text-white/80" />
                            </div>

                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={url}
                                alt={`Kép ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            <button
                                type="button"
                                className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-sm z-10"
                                onClick={(e) => { e.stopPropagation(); handleDeleteImage(url, index); }}
                                title="Törlés"
                            >
                                <X size={14} className="text-white stroke-[2.5]" />
                            </button>

                            <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {previewUrl && (
                <ImagePreview src={previewUrl} alt="Előnézet" onClose={() => setPreviewUrl(null)} />
            )}

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="flex flex-col gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-lg">
                    {Object.entries(uploadProgress).map(([name, progress]) => (
                        <div key={name} className="flex items-center gap-3">
                            <span className="text-xs font-medium text-emerald-900 dark:text-emerald-100 w-24 truncate">{name}</span>
                            <div className="flex-1 h-1.5 bg-emerald-100 dark:bg-emerald-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 w-8 text-right">{progress}%</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {images.length < 10 && (
                <div className="group">
                    <label
                        htmlFor="image-upload-input"
                        className={cn(
                            "flex items-center gap-2 px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg w-fit select-none",
                            uploading && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Feltöltés...
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Képek hozzáadása
                            </>
                        )}
                    </label>
                    <input
                        id="image-upload-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                    />
                </div>
            )}

            {images.length >= 10 && (
                <p className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-lg border border-amber-200 dark:border-amber-900">
                    <AlertTriangle size={16} />
                    Elérted a maximum 10 kép limitet
                </p>
            )}

            <div className="flex items-start gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                    Megengedett formátumok: JPG, PNG, GIF, WebP | Maximum méret: 5MB képenként
                </span>
            </div>
        </div>
    );
});

export default ImageUpload;
