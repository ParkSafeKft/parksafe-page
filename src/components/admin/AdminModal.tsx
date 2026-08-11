import type { ComponentProps, ReactNode } from 'react';
import { ArrowLeft, ChevronRight, ExternalLink, type LucideIcon } from 'lucide-react';
import { DialogContent, DialogTitle } from '@/components/ui/dialog';
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
        <div
            className={cn('admin-modal-body', scrollClassName)}
            onWheel={(event) => {
                const container = event.currentTarget;
                const maxScroll = container.scrollHeight - container.clientHeight;
                if (maxScroll <= 0) return;

                const nextScroll = Math.max(0, Math.min(maxScroll, container.scrollTop + event.deltaY));
                if (nextScroll === container.scrollTop) return;

                container.scrollTop = nextScroll;
                event.preventDefault();
                event.stopPropagation();
            }}
        >
            <div className={cn('admin-modal-body-inner', className)} {...props}>
                {children}
            </div>
        </div>
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

interface AdminModalRelationsProps extends Omit<ComponentProps<'section'>, 'title'> {
    title?: ReactNode;
    description?: ReactNode;
}

export function AdminModalRelations({
    title = 'Kapcsolatok',
    description,
    className,
    children,
    ...props
}: AdminModalRelationsProps) {
    return (
        <AdminModalSection
            title={title}
            description={description}
            className={cn('admin-modal-relations', className)}
            {...props}
        >
            <div className="admin-modal-relations-grid">{children}</div>
        </AdminModalSection>
    );
}

interface AdminRelationCardProps {
    label: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    icon: ReactNode;
    onClick?: () => void;
    href?: string;
    external?: boolean;
    action?: ReactNode;
    className?: string;
}

export function AdminRelationCard({
    label,
    title,
    description,
    icon,
    onClick,
    href,
    external = false,
    action,
    className,
}: AdminRelationCardProps) {
    const content = (
        <>
            <span className="admin-relation-icon" aria-hidden="true">{icon}</span>
            <span className="admin-relation-copy">
                <span className="admin-relation-label">{label}</span>
                <span className="admin-relation-title">{title}</span>
                {description ? <span className="admin-relation-description">{description}</span> : null}
            </span>
        </>
    );

    return (
        <div className={cn('admin-relation-card', className)} data-interactive={Boolean(onClick || href)}>
            {onClick ? (
                <button type="button" className="admin-relation-main" onClick={onClick}>
                    {content}
                    {!action ? <ChevronRight className="admin-relation-chevron" aria-hidden="true" /> : null}
                </button>
            ) : href ? (
                <a
                    className="admin-relation-main"
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                >
                    {content}
                    {!action ? external ? <ExternalLink className="admin-relation-chevron" aria-hidden="true" /> : <ChevronRight className="admin-relation-chevron" aria-hidden="true" /> : null}
                </a>
            ) : (
                <div className="admin-relation-main">{content}</div>
            )}
            {action ? <div className="admin-relation-action">{action}</div> : null}
        </div>
    );
}
