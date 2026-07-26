'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types';
import {
    User,
    Mail,
    Shield,
    LogOut,
    Trash2,
    AlertTriangle,
    Calendar,
    Clock,
    Hash,
    LayoutDashboard,
    Lock
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Delete a file from Supabase Storage given its public URL.
 * Works for any public bucket by extracting bucket + path from the URL.
 */
async function deleteSupabasePublicFile(publicUrl: string) {
    try {
        const marker = '/storage/v1/object/public/';
        const idx = publicUrl.indexOf(marker);
        if (idx === -1) return;

        const withoutPrefix = publicUrl.slice(idx + marker.length).split('?')[0];
        const [bucket, ...rest] = withoutPrefix.split('/');
        const path = rest.join('/');

        if (!bucket || !path) return;

        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error && isDev) {
            console.error('Avatar storage delete error:', error);
        }
    } catch (e) {
        if (isDev) console.error('Error while deleting avatar from storage:', e);
    }
}

export default function ProfilePage() {
    const { t, language } = useLanguage();
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<Partial<Profile> | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const [showResetModal, setShowResetModal] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');

    useEffect(() => {
        // Redirect to login if not logged in
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        // Fetch profile data from Supabase
        const fetchProfile = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('avatar_url, role')
                        .eq('id', user.id)
                        .single();

                    if (error) {
                        if (isDev) console.error('Error fetching profile:', error);
                    } else {
                        setProfile(data);
                    }
                } catch (error) {
                    if (isDev) console.error('Error:', error);
                } finally {
                    setProfileLoading(false);
                }
            }
        };

        fetchProfile();
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        setDeleteError('');
        setDeleteLoading(true);

        try {
            // Delete avatar image from storage (if exists)
            const avatarUrlToDelete = profile?.avatar_url || user.user_metadata?.avatar_url;
            if (avatarUrlToDelete) {
                await deleteSupabasePublicFile(avatarUrlToDelete);
            }

            // Delete the user account from Supabase Auth
            const { error } = await supabase
                .rpc('delete_user_account', { user_id: user.id });

            if (error) {
                if (isDev) console.error('Error deleting account:', error);
                setDeleteError(t('login.errorGeneric'));
                setDeleteLoading(false);
                return;
            }

            // Sign out and redirect
            await signOut();
            router.push('/');
        } catch (error) {
            if (isDev) console.error('Error deleting account:', error);
            setDeleteError(t('login.errorGeneric'));
            setDeleteLoading(false);
        }
    };

    const handleSendResetLink = async () => {
        if (!user?.email) return;

        setResetLoading(true);
        setResetError('');
        setResetSuccess('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setResetSuccess(t('profile.resetLinkSent'));
            setTimeout(() => {
                setShowResetModal(false);
                setResetSuccess('');
            }, 3000);

        } catch (error) {
            if (isDev) console.error('Error sending reset link:', error);
            setResetError(t('login.errorGeneric'));
        } finally {
            setResetLoading(false);
        }
    };

    if (loading || profileLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div role="status" className="h-8 w-8 animate-spin rounded-full border-2 border-[#101512]/15 border-t-[#34aa56]" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
    const isAdmin = profile?.role === 'admin';

    return (
        <div className="min-h-screen bg-white pb-28 pt-36 font-sans text-[#101512] selection:bg-[#34aa56] selection:text-white">
            <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">

                {/* Header Section */}
                <div className="grid gap-8 border-b border-[#101512]/20 pb-12 md:grid-cols-[auto_1fr] md:items-end lg:pb-16">
                    <div className="relative">
                        <div className="relative h-28 w-28 overflow-hidden rounded-[1.5rem] border border-[#101512]/15 bg-[#f2f6f1] md:h-36 md:w-36">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt="Profile"
                                    fill
                                    unoptimized
                                    sizes="(max-width: 768px) 112px, 144px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-4xl font-black text-[#7b867e]">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {isAdmin && (
                            <div className="absolute -bottom-3 left-3 flex items-center gap-2 rounded-full bg-[#101512] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                                <Shield size={12} />
                                Admin
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#258642]">
                            ParkSafe / {t('nav.profile')}
                        </p>
                        <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-[#101512] text-balance sm:text-6xl">
                            {t('profile.greeting')}, {user.username || user.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || 'Felhasználó'}!
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-8 text-[#626e66]">
                            {t('profile.subtitle')}
                        </p>
                    </div>
                </div>

                <div className="grid gap-14 py-14 lg:grid-cols-12 lg:gap-12 lg:py-20">

                    {/* Main Info Column */}
                    <div className="lg:col-span-8">
                        <div>
                            <div className="mb-8 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf7ee]">
                                    <User className="h-5 w-5 text-[#258642]" />
                                </div>
                                <h2 className="text-2xl font-black tracking-[-0.03em] text-[#101512]">{t('profile.accountInfo')}</h2>
                            </div>

                            <div className="border-t border-[#101512]/20">

                                {user.user_metadata?.full_name && (
                                    <div className="grid gap-3 border-b border-[#101512]/15 py-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center">
                                        <div className="flex items-center gap-3">
                                            <User size={16} className="text-[#7a847c]" />
                                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#667169]">{t('profile.fullName')}</span>
                                        </div>
                                        <div className="font-semibold text-[#101512]">{user.user_metadata.full_name}</div>
                                    </div>
                                )}

                                <div className="grid gap-3 border-b border-[#101512]/15 py-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center">
                                    <div className="flex items-center gap-3">
                                        <Mail size={16} className="text-[#7a847c]" />
                                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#667169]">{t('profile.email')}</span>
                                    </div>
                                    <div className="break-all font-semibold text-[#101512]">{user.email}</div>
                                </div>

                                {user.app_metadata?.provider && (
                                    <div className="grid gap-3 border-b border-[#101512]/15 py-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center">
                                        <div className="flex items-center gap-3">
                                            <Shield size={16} className="text-[#7a847c]" />
                                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#667169]">{t('profile.loginMethod')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 font-semibold text-[#101512]">
                                            {user.app_metadata.provider === 'google' ? (
                                                <>
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                                    Google
                                                </>
                                            ) : (
                                                <>
                                                    <Mail size={16} className="text-[#667169]" />
                                                    Email / Password
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-3 border-b border-[#101512]/15 py-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={16} className="text-[#7a847c]" />
                                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#667169]">{t('profile.registration')}</span>
                                    </div>
                                    <div className="font-semibold text-[#101512]">
                                        {user.created_at && new Date(user.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'hu-HU', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>

                                <div className="grid gap-3 border-b border-[#101512]/15 py-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center">
                                    <div className="flex items-center gap-3">
                                        <Clock size={16} className="text-[#7a847c]" />
                                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#667169]">{t('profile.lastLogin')}</span>
                                    </div>
                                    <div className="font-semibold text-[#101512]">
                                        {user.last_sign_in_at && new Date(user.last_sign_in_at).toLocaleDateString(language === 'en' ? 'en-US' : 'hu-HU', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="grid gap-3 border-b border-[#101512]/15 py-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center">
                                        <div className="flex items-center gap-3">
                                            <Hash size={16} className="text-[#7a847c]" />
                                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#667169]">ID</span>
                                        </div>
                                        <div className="select-all break-all font-mono text-sm text-[#667169]">
                                            {user.id}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* Actions Column */}
                    <div className="lg:col-span-4 lg:border-l lg:border-[#101512]/20 lg:pl-10">

                        {/* Action Card */}
                        <div>
                            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-[#667169]">{t('profile.actions')}</h3>

                            <div className="border-t border-[#101512]/20">
                                {isAdmin && (
                                    <button
                                        onClick={() => router.push('/admin')}
                                        className="group flex w-full items-center gap-3 border-b border-[#101512]/15 py-4 text-left font-bold text-[#101512] transition-colors hover:text-[#258642] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                                    >
                                        <LayoutDashboard size={20} className="text-[#258642]" />
                                        <span>{t('profile.adminPanel')}</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowResetModal(true)}
                                    className="group flex w-full items-center gap-3 border-b border-[#101512]/15 py-4 text-left font-bold text-[#101512] transition-colors hover:text-[#258642] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                                >
                                    <Lock size={20} className="text-[#667169] group-hover:text-[#258642]" />
                                    <span>{t('profile.sendResetLink')}</span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="group flex w-full items-center gap-3 border-b border-[#101512]/15 py-4 text-left font-bold text-[#101512] transition-colors hover:text-[#258642] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                                >
                                    <LogOut size={20} className="text-[#667169] group-hover:text-[#258642]" />
                                    <span>{t('profile.logout')}</span>
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="mt-12 border-t border-red-200 pt-8">
                            <div className="mb-4 flex items-center gap-2 text-red-900">
                                <AlertTriangle size={20} className="text-red-600" />
                                <h3 className="font-bold">{t('profile.dangerZone')}</h3>
                            </div>

                            <p className="mb-6 text-sm leading-6 text-red-800/80">
                                {t('profile.deleteDesc')}
                            </p>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-300 font-bold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600"
                            >
                                <Trash2 size={18} />
                                {t('profile.deleteAccount')}
                            </button>
                        </div>

                    </div>
                </div>

            </div>

            {/* Delete Account Modal */}
            {
                showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101512]/55 p-4 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="delete-account-title"
                            className="w-full max-w-lg rounded-[1.5rem] bg-white p-7 shadow-[0_24px_80px_rgba(16,21,18,0.22)] sm:p-9"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-red-50">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>

                            <h2 id="delete-account-title" className="mb-4 text-3xl font-black tracking-[-0.04em] text-[#101512]">
                                {t('profile.deleteModalTitle')}
                            </h2>

                            <div className="mb-6 border-y border-red-200 py-5">
                                <p className="mb-3 font-semibold text-red-900">{t('profile.deleteModalWarning')}</p>
                                <ul className="list-inside list-disc space-y-1 text-sm text-red-800">
                                    <li>{t('profile.deleteProfileData')}</li>
                                    <li>{t('profile.deleteLoginData')}</li>
                                    <li>{t('profile.deleteSettings')}</li>
                                </ul>
                            </div>

                            <p className="mb-8 leading-7 text-[#626e66]">
                                {t('profile.deleteModalConfirm')}
                            </p>

                            {deleteError && (
                                <div className="mb-6 p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium text-center">
                                    {deleteError}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteLoading}
                                    className="rounded-xl border border-[#101512]/20 px-4 py-3 font-bold text-[#101512] hover:bg-[#f7f9f6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                                >
                                    {t('profile.cancel')}
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteLoading}
                                    className="rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 disabled:opacity-60"
                                >
                                    {deleteLoading ? t('profile.deleting') : t('profile.verify')}
                                </button>
                            </div>

                        </div>
                    </div>
                )
            }

            {/* Reset Password Link Modal */}
            {
                showResetModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101512]/55 p-4 backdrop-blur-sm" onClick={() => setShowResetModal(false)}>
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="reset-password-title"
                            className="w-full max-w-lg rounded-[1.5rem] bg-white p-7 shadow-[0_24px_80px_rgba(16,21,18,0.22)] sm:p-9"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#eaf7ee]">
                                <Lock className="h-7 w-7 text-[#258642]" />
                            </div>

                            <h2 id="reset-password-title" className="mb-4 text-3xl font-black tracking-[-0.04em] text-[#101512]">
                                {t('profile.sendResetLink')}
                            </h2>

                            <p className="mb-8 leading-7 text-[#626e66]">
                                {t('profile.resetLinkDescription')}
                            </p>

                            {resetError && (
                                <div className="mb-6 p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium text-center">
                                    {resetError}
                                </div>
                            )}

                            {resetSuccess && (
                                <div className="mb-6 p-3 rounded-lg bg-green-100 text-green-700 text-sm font-medium text-center">
                                    {resetSuccess}
                                </div>
                            )}

                            {!resetSuccess && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setShowResetModal(false)}
                                        disabled={resetLoading}
                                        className="rounded-xl border border-[#101512]/20 px-4 py-3 font-bold text-[#101512] hover:bg-[#f7f9f6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                                    >
                                        {t('profile.cancel')}
                                    </button>
                                    <button
                                        onClick={handleSendResetLink}
                                        disabled={resetLoading}
                                        className="rounded-xl bg-[#34aa56] px-4 py-3 font-bold text-white hover:bg-[#2d964b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#258642] disabled:opacity-60"
                                    >
                                        {resetLoading ? '…' : t('profile.sendResetLink')}
                                    </button>
                                </div>
                            )}

                            {resetSuccess && (
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    className="w-full rounded-xl border border-[#101512]/20 px-4 py-3 font-bold text-[#101512] hover:bg-[#f7f9f6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                                >
                                    {t('profile.cancel')}
                                </button>
                            )}
                        </div>
                    </div>
                )
            }

        </div >
    );
}
