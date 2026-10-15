import type { ComponentProps, ReactNode } from 'react';
import { createContext, useContext, useLayoutEffect, useRef } from 'react';
import { ArrowLeft, ChevronRight, ExternalLink, X, type LucideIcon } from 'lucide-react';
import { DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import weeklyStyles from './WeeklyStatsDetailModal.module.css';
import styles from './AdminModal.module.css';

const ScrollPosition = createContext({ current: 0 });
const ReturnFocus = createContext<(() => boolean) | null>(null);
const controlName = (element: Element) => element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent;

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
    const scrollPosition = useRef(0);
    const focusLabel = useRef<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const restoreParentFocus = useContext(ReturnFocus);
    function restoreFocus() {
        if (!contentRef.current?.isConnected || !focusLabel.current) return false;
        const control = [...contentRef.current.querySelectorAll<HTMLElement>('button, a')].find(element => controlName(element) === focusLabel.current);
        if (!control) return false;
        control.focus({ preventScroll: true });
        return true;
    }
    return (
        <ScrollPosition.Provider value={scrollPosition}>
        <ReturnFocus.Provider value={restoreFocus}>
        <DialogContent
            ref={contentRef}
            className={cn(weeklyStyles.modal, styles.dialog, styles[variant], className)}
            data-slot="admin-dialog"
            {...props}
            showCloseButton={false}
            aria-describedby={props['aria-describedby']}
            onClickCapture={event => {
                props.onClickCapture?.(event);
                const control = (event.target as HTMLElement).closest('button, a');
                if (control) focusLabel.current = controlName(control);
            }}
            onOpenAutoFocus={event => {
                props.onOpenAutoFocus?.(event);
                if (event.defaultPrevented || !focusLabel.current || !(event.target instanceof HTMLElement)) return;
                const control = [...event.target.querySelectorAll<HTMLElement>('button, a')].find(element => controlName(element) === focusLabel.current);
                if (control) { event.preventDefault(); control.focus({ preventScroll: true }); }
            }}
            onCloseAutoFocus={event => {
                props.onCloseAutoFocus?.(event);
                if (!event.defaultPrevented && restoreParentFocus?.()) event.preventDefault();
            }}
        >
            {children}
            {variant === 'media' ? <DialogClose className={styles.mediaClose} aria-label="Képnézet bezárása"><X aria-hidden="true" /></DialogClose> : null}
        </DialogContent>
        </ReturnFocus.Provider>
        </ScrollPosition.Provider>
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
    onBack,
    backLabel = 'Vissza',
    className,
}: AdminModalHeaderProps) {
    return (
        <header className={cn(styles.header, className)}>
            <div className={styles.topbar}>
            {onBack ? (
                <button
                    type="button"
                    className={styles.back}
                    onClick={onBack}
                    aria-label={backLabel}
                    title={backLabel}
                >
                    <ArrowLeft aria-hidden="true" /><span>Vissza</span>
                </button>
            ) : null}
            {eyebrow ? <p className={weeklyStyles.period}>{eyebrow}</p> : <span />}
            <DialogClose className={weeklyStyles.close} aria-label="Ablak bezárása"><span aria-hidden="true">Esc</span><X aria-hidden="true" /></DialogClose>
            </div>
            <div className={styles.heading}>
                <DialogTitle className={weeklyStyles.title}>{title}</DialogTitle>
                {subtitle ? <p className={weeklyStyles.description}>{subtitle}</p> : null}
                {meta ? <div className="admin-modal-meta">{meta}</div> : null}
            </div>
        </header>
    );
}

interface AdminModalBodyProps extends ComponentProps<'div'> {
    scrollClassName?: string;
}

export function AdminModalBody({ className, scrollClassName, children, ...props }: AdminModalBodyProps) {
    const positionRef = useContext(ScrollPosition);
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (ref.current) ref.current.scrollTop = positionRef.current;
    }, [positionRef]);
    return (
        <div
            ref={ref}
            tabIndex={0}
            className={cn('admin-modal-body', scrollClassName)}
            onScroll={event => { positionRef.current = event.currentTarget.scrollTop; }}
        >
            <div className={cn('admin-modal-body-inner', className)} {...props}>
                {children}
            </div>
        </div>
    );
}

export function AdminToggle({ label, icon: Icon, active, onClick, isLoading }: {
    label: string; icon: LucideIcon; active: boolean; onClick?: () => void; isLoading: boolean;
}) {
    return <button type="button" className={styles.toggle} role="switch" aria-checked={active} disabled={isLoading} onClick={onClick}>
        <span><Icon aria-hidden="true" />{label}</span><i aria-hidden="true"><b /></i>
    </button>;
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
