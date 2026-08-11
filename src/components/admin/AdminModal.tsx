import type { ComponentProps, ReactNode } from 'react';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type AdminModalVariant = 'inspector' | 'form' | 'confirm' | 'media';

interface AdminModalContentProps extends ComponentProps<typeof DialogContent> {
    variant?: AdminModalVariant;
}

export function AdminModalContent({
    variant = 'inspector',
    className,
    children,
    ...props
}: AdminModalContentProps) {
    return (
        <DialogContent
            className={cn('admin-dark admin-modal', `admin-modal--${variant}`, className)}
            {...props}
            aria-describedby={props['aria-describedby']}
        >
            {children}
        </DialogContent>
    );
}

export function AdminModalFrame({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn('admin-modal-frame', className)} {...props} />;
}

interface AdminModalHeaderProps {
    title: ReactNode;
    eyebrow?: ReactNode;
    subtitle?: ReactNode;
    meta?: ReactNode;
    icon?: LucideIcon;
    onBack?: () => void;
    backLabel?: string;
    className?: string;
}

export function AdminModalHeader({
    title,
    eyebrow,
    subtitle,
    meta,
    icon: Icon,
    onBack,
    backLabel = 'Vissza',
    className,
}: AdminModalHeaderProps) {
    return (
        <header className={cn('admin-modal-header', className)}>
            {onBack ? (
                <button
                    type="button"
                    className="admin-modal-back"
                    onClick={onBack}
                    aria-label={backLabel}
                    title={backLabel}
                >
                    <ArrowLeft />
                </button>
            ) : null}
            {Icon ? (
                <div className="admin-modal-mark" aria-hidden="true">
                    <Icon />
                </div>
            ) : null}
            <div className="admin-modal-heading">
                {eyebrow ? <p className="admin-modal-eyebrow">{eyebrow}</p> : null}
                <DialogTitle className="admin-modal-title">{title}</DialogTitle>
                {subtitle ? <p className="admin-modal-subtitle">{subtitle}</p> : null}
                {meta ? <div className="admin-modal-meta">{meta}</div> : null}
            </div>
        </header>
    );
}

interface AdminModalBodyProps extends ComponentProps<'div'> {
    scrollClassName?: string;
}

export function AdminModalBody({ className, scrollClassName, children, ...props }: AdminModalBodyProps) {
    return (
        <ScrollArea className={cn('admin-modal-body', scrollClassName)}>
            <div className={cn('admin-modal-body-inner', className)} {...props}>
                {children}
            </div>
        </ScrollArea>
    );
}

export function AdminModalFooter({ className, ...props }: ComponentProps<'footer'>) {
    return <footer className={cn('admin-modal-footer', className)} {...props} />;
}

interface AdminModalSectionProps extends Omit<ComponentProps<'section'>, 'title'> {
    title?: ReactNode;
    description?: ReactNode;
    icon?: LucideIcon;
}

export function AdminModalSection({
    title,
    description,
    icon: Icon,
    className,
    children,
    ...props
}: AdminModalSectionProps) {
    return (
        <section className={cn('admin-modal-section', className)} {...props}>
            {title || description ? (
                <div className="admin-modal-section-heading">
                    {title ? (
                        <h2>
                            {Icon ? <Icon aria-hidden="true" /> : null}
                            {title}
                        </h2>
                    ) : null}
                    {description ? <p>{description}</p> : null}
                </div>
            ) : null}
            {children}
        </section>
    );
}
