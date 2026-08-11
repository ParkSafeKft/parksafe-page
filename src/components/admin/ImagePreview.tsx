import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { AdminModalContent } from './AdminModal';

interface ImagePreviewProps {
    src: string;
    alt?: string;
    onClose: () => void;
}

export default function ImagePreview({ src, alt = 'Kép előnézet', onClose }: ImagePreviewProps) {
    if (!src) return null;

    return (
        <Dialog open={!!src} onOpenChange={(open) => !open && onClose()}>
            <AdminModalContent variant="media" aria-label={alt}>
                <figure className="admin-modal-media-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={alt} width={1600} height={1200} />
                    <figcaption>{alt}</figcaption>
                </figure>
            </AdminModalContent>
        </Dialog>
    );
}
