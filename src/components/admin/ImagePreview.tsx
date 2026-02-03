import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
    src: string;
    alt?: string;
    onClose: () => void;
}

export default function ImagePreview({ src, alt = 'Kép előnézet', onClose }: ImagePreviewProps) {
    if (!src) return null;

    return (
        <Dialog open={!!src} onOpenChange={(open) => !open && onClose && onClose()}>
            <DialogContent
                className="p-0 border-0 bg-transparent shadow-none w-fit h-fit max-w-[90vw] max-h-[90vh] flex items-center justify-center outline-none"
                style={{ zIndex: 9999 }}
            >
                <div className="relative">
                    {/* Close button */}
                    <Button
                        onClick={onClose}
                        className="absolute -top-3 -right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-zinc-100 text-zinc-900 shadow-xl ring-2 ring-black/10 hover:ring-black/20 transition-all hover:scale-110 p-0"
                        aria-label="Bezárás"
                    >
                        <X className="h-5 w-5" />
                    </Button>

                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={src}
                        alt={alt}
                        className="max-w-[90vw] max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl bg-zinc-900"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
