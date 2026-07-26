'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle, Mail } from 'lucide-react';
import { AccountAccessLayout } from '@/components/AccountAccessLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const isDev = process.env.NODE_ENV === 'development';

export default function ForgotPasswordPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { requestPasswordReset } = useAuth();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const { error } = await requestPasswordReset(email);
            if (error) setError(error.message);
            else {
                setMessage(t('forgotPassword.successMessage'));
                setEmail('');
            }
        } catch (error) {
            if (isDev) console.error(error);
            setError(t('forgotPassword.errorGeneric'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AccountAccessLayout
            backHref="/login"
            backLabel={t('forgotPassword.backToLogin')}
            eyebrow={`ParkSafe / ${t('profile.sendResetLink')}`}
            title={t('forgotPassword.title')}
            subtitle={t('forgotPassword.subtitle')}
        >
            <div aria-live="polite">
                {error && (
                    <div role="alert" className="mb-8 flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-red-800">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium leading-6">{error}</p>
                    </div>
                )}

                {message && (
                    <div role="status" className="mb-8 flex items-start gap-3 border border-[#34aa56]/30 bg-[#eaf7ee] p-4 text-[#245d35]">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium leading-6">{message}</p>
                    </div>
                )}
            </div>

            {!message ? (
                <form onSubmit={handleSubmit} className="space-y-7">
                    <div className="space-y-3">
                        <label htmlFor="email" className="block text-sm font-bold text-[#101512]">
                            {t('forgotPassword.emailLabel')}
                        </label>
                        <div className="group relative">
                            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7a847c] transition-colors group-focus-within:text-[#258642]" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="pelda@email.com"
                                autoComplete="email"
                                spellCheck={false}
                                required
                                disabled={loading}
                                className="block h-14 w-full rounded-xl border border-[#101512]/20 bg-[#f7f9f6] pl-12 pr-4 font-medium text-[#101512] placeholder:text-[#8b958e] focus:border-[#34aa56] focus:outline-none focus:ring-4 focus:ring-[#34aa56]/12 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#34aa56] px-5 font-bold text-white transition-colors hover:bg-[#2d964b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#258642] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? `${t('forgotPassword.submitButton')}…` : t('forgotPassword.submitButton')}
                        {!loading && <ArrowRight className="h-4 w-4" />}
                    </button>
                </form>
            ) : (
                <Link
                    href="/login"
                    className="flex h-14 w-full items-center justify-center rounded-xl border border-[#101512]/20 px-5 font-bold text-[#101512] transition-colors hover:border-[#34aa56] hover:bg-[#f7f9f6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                >
                    {t('forgotPassword.backToLogin')}
                </Link>
            )}
        </AccountAccessLayout>
    );
}
