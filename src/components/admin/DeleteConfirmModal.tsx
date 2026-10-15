'use client';

import { Trash2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    AdminModalContent,
    AdminModalFooter,
    AdminModalFrame,
    AdminModalHeader,
} from './AdminModal';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    loading?: boolean;
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Elem törlése',
    description = 'Biztosan törölni szeretnéd ezt az elemet?',
    loading = false,
}: DeleteConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
            <AdminModalContent variant="confirm">
                <AdminModalFrame>
                    <AdminModalHeader
                        eyebrow="Visszavonhatatlan művelet"
                        title={title}
                        subtitle="A kapcsolódó adatok is véglegesen elveszhetnek."
                        icon={Trash2}
                    />
                    <div className="admin-modal-confirm-copy">
                        <p>{description}</p>
                        <span>A művelet nem vonható vissza.</span>
                    </div>
                    <AdminModalFooter>
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Mégse
                        </Button>
                        <Button variant="destructive" onClick={onConfirm} disabled={loading}>
                            <Trash2 />
                            {loading ? 'Törlés…' : 'Végleges törlés'}
                        </Button>
                    </AdminModalFooter>
                </AdminModalFrame>
            </AdminModalContent>
        </Dialog>
    );
}
