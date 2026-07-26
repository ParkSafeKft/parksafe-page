'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, type EmailOtpType } from '@supabase/supabase-js';
import { AlertCircle, ArrowRight, CheckCircle, Lock } from 'lucide-react';
import { AccountAccessLayout } from '@/components/AccountAccessLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const isDev = process.env.NODE_ENV === 'development';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const secureClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});

function ResetPasswordContent() {
    const { t } = useLanguage();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [tokenError, setTokenError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const tokenHash = searchParams.get('token_hash');
    const type = (searchParams.get('type') as EmailOtpType | null) ?? 'recovery';

    useEffect(() => {
        const verifyToken = async () => {
            if (!tokenHash) {
                setVerifying(false);
                setTokenError(t('resetPassword.errorInvalidLink'));
                return;
            }

            try {
                const { error } = await secureClient.auth.verifyOtp({ token_hash: tokenHash, type });
                if (error) setTokenError(error.message);
            } catch (error) {
                if (isDev) console.error(error);
                setTokenError(t('resetPassword.errorInvalidLink'));
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [tokenHash, type, t]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError(t('resetPassword.errorMismatch'));
            return;
        }

        if (password.length < 8) {
            setError(t('resetPassword.errorLength'));
            return;
        }

        setLoading(true);

        try {
            const { error } = await secureClient.auth.updateUser({ password });
            if (error) setError(error.message);
            else {
                setMessage(t('resetPassword.successMessage'));
                await secureClient.auth.signOut();
                setTimeout(() => router.push('/login'), 2000);
            }
        } catch (error) {
            if (isDev) console.error(error);
            setError(t('resetPassword.errorGeneric'));
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <AccountAccessLayout
                backHref="/login"
                backLabel={t('forgotPassword.backToLogin')}
                eyebrow={`ParkSafe / ${t('profile.sendResetLink')}`}
                title={t('resetPassword.title')}
                subtitle={t('resetPassword.verifying')}
            >
                <div role="status" className="flex items-center gap-4 border-t border-[#101512]/20 py-6 text-sm font-semibold text-[#5f6a62]">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#101512]/15 border-t-[#34aa56]" />
                    {t('resetPassword.verifying')}
                </div>
            </AccountAccessLayout>
        );
    }

    return (
        <AccountAccessLayout
            backHref="/login"
            backLabel={t('forgotPassword.backToLogin')}
            eyebrow={`ParkSafe / ${t('profile.sendResetLink')}`}
            title={t('resetPassword.title')}
            subtitle={t('resetPassword.subtitle')}
        >
            <div aria-live="polite">
                {(error || tokenError) && (
                    <div role="alert" className="mb-8 flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-red-800">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium leading-6">{tokenError || error}</p>
                    </div>
                )}

                {message && (
                    <div role="status" className="mb-8 flex items-start gap-3 border border-[#34aa56]/30 bg-[#eaf7ee] p-4 text-[#245d35]">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium leading-6">{message}</p>
                    </div>
                )}
            </div>

            {!message && !tokenError && (
                <form onSubmit={handleSubmit} className="space-y-7">
                    <PasswordField
                        id="password"
                        label={t('resetPassword.passwordLabel')}
                        value={password}
                        onChange={setPassword}
                        autoComplete="new-password"
                        disabled={loading}
                    />
                    <PasswordField
                        id="confirmPassword"
                        label={t('resetPassword.confirmPasswordLabel')}
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        autoComplete="new-password"
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#34aa56] px-5 font-bold text-white transition-colors hover:bg-[#2d964b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#258642] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? `${t('resetPassword.submitButton')}…` : t('resetPassword.submitButton')}
                        {!loading && <ArrowRight className="h-4 w-4" />}
                    </button>
                </form>
            )}

            {tokenError && (
                <Link
                    href="/forgot-password"
                    className="flex h-14 w-full items-center justify-center rounded-xl border border-[#101512]/20 px-5 font-bold text-[#101512] transition-colors hover:border-[#34aa56] hover:bg-[#f7f9f6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                >
                    {t('forgotPassword.title')}
                </Link>
            )}
        </AccountAccessLayout>
    );
}

function PasswordField({
    id,
    label,
    value,
    onChange,
    autoComplete,
    disabled,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete: string;
    disabled: boolean;
}) {
    return (
        <div className="space-y-3">
            <label htmlFor={id} className="block text-sm font-bold text-[#101512]">
                {label}
            </label>
            <div className="group relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7a847c] transition-colors group-focus-within:text-[#258642]" />
                <input
                    type="password"
                    id={id}
                    name={id}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="••••••••"
                    autoComplete={autoComplete}
                    required
                    disabled={disabled}
                    className="block h-14 w-full rounded-xl border border-[#101512]/20 bg-[#f7f9f6] pl-12 pr-4 font-medium text-[#101512] placeholder:text-[#8b958e] focus:border-[#34aa56] focus:outline-none focus:ring-4 focus:ring-[#34aa56]/12 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-white">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#101512]/15 border-t-[#34aa56]" />
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
