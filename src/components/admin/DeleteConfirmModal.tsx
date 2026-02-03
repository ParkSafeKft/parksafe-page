import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';

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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <Card className="bg-card border-border w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-destructive/20 border-2 border-destructive/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <Trash2 className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-foreground text-xl font-semibold">
                        Megerősítés szükséges
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2 leading-relaxed">
                        Biztosan törölni szeretnéd ezt az elemet? Ez a művelet nem vonható
                        vissza, és az összes kapcsolódó adat is elvész!
                    </CardDescription>
                </CardHeader>

                <Separator className="bg-border" />

                <CardContent className="pt-6">
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 min-w-[80px]"
                        >
                            Mégse
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg hover:shadow-destructive/25 transition-all duration-200 min-w-[80px]"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Törlés
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
