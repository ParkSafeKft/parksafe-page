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
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
}: DeleteConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AdminModalContent variant="confirm">
                <AdminModalFrame>
                    <AdminModalHeader
                        eyebrow="Visszavonhatatlan művelet"
                        title="Elem törlése"
                        subtitle="A kapcsolódó adatok is véglegesen elveszhetnek."
                        icon={Trash2}
                    />
                    <div className="admin-modal-confirm-copy">
                        <p>Biztosan törölni szeretnéd ezt az elemet?</p>
                        <span>A művelet nem vonható vissza.</span>
                    </div>
                    <AdminModalFooter>
                        <Button variant="outline" onClick={onClose}>
                            Mégse
                        </Button>
                        <Button variant="destructive" onClick={onConfirm}>
                            <Trash2 />
                            Végleges törlés
                        </Button>
                    </AdminModalFooter>
                </AdminModalFrame>
            </AdminModalContent>
        </Dialog>
    );
}
