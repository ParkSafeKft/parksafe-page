'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { AccountAccessLayout } from '@/components/AccountAccessLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabaseClient';

const isDev = process.env.NODE_ENV === 'development';

export default function LoginPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState<string | null>(null);
    const [checkingProvider, setCheckingProvider] = useState(false);
    const { signInWithEmail, signInWithGoogle, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) router.push('/profile');
    }, [user, router]);

    const checkEmailProvider = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setCheckingProvider(true);

        try {
            const { data, error } = await supabase
                .rpc('get_provider_by_email', { p_email: email });

            if (error) {
                if (isDev) console.error('Error checking provider:', error);
                setError(t('login.errorGeneric'));
                return;
            }

            setProvider(data === 'false' ? 'email' : data);
        } catch (error) {
            if (isDev) console.error('Error:', error);
            setError(t('login.errorGeneric'));
        } finally {
            setCheckingProvider(false);
        }
    };

    const handleEmailLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await signInWithEmail(email, password);
            if (error) setError(error.message);
            else router.push('/profile');
        } catch (error) {
            if (isDev) console.error(error);
            setError(t('login.errorGeneric'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const { error } = await signInWithGoogle();
            if (error) {
                setError(error.message);
                setLoading(false);
            }
        } catch (error) {
            if (isDev) console.error(error);
            setError(t('login.errorGeneric'));
            setLoading(false);
        }
    };

    const handleChangeEmail = () => {
        setProvider(null);
        setPassword('');
        setError('');
    };

    const inputClassName = 'block h-14 w-full rounded-xl border border-[#101512]/20 bg-[#f7f9f6] pl-12 pr-4 font-medium text-[#101512] placeholder:text-[#8b958e] focus:border-[#34aa56] focus:outline-none focus:ring-4 focus:ring-[#34aa56]/12 disabled:cursor-not-allowed disabled:opacity-60';
    const primaryButtonClassName = 'flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#34aa56] px-5 font-bold text-white transition-colors hover:bg-[#2d964b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#258642] disabled:cursor-not-allowed disabled:opacity-60';

    return (
        <AccountAccessLayout
            backHref="/"
            backLabel={t('login.backToHome')}
            eyebrow={`ParkSafe / ${t('nav.login')}`}
            title={t('login.title')}
            subtitle={t('login.subtitle')}
        >
            <div aria-live="polite">
                {error && (
                    <div role="alert" className="mb-8 flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-red-800">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium leading-6">{error}</p>
                    </div>
                )}
            </div>

            {provider === null && (
                <form onSubmit={checkEmailProvider} className="space-y-7">
                    <div className="space-y-3">
                        <label htmlFor="email" className="block text-sm font-bold text-[#101512]">
                            {t('login.emailLabel')}
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
                                disabled={checkingProvider}
                                className={inputClassName}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={checkingProvider} className={primaryButtonClassName}>
                        {checkingProvider ? t('login.checking') : t('login.nextButton')}
                        {!checkingProvider && <ArrowRight className="h-4 w-4" />}
                    </button>
                </form>
            )}

            {provider === 'email' && (
                <div className="space-y-7">
                    <SelectedEmail
                        email={email}
                        label={t('login.changeEmail')}
                        disabled={loading}
                        onChange={handleChangeEmail}
                    />

                    <form onSubmit={handleEmailLogin} className="space-y-7">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <label htmlFor="password" className="text-sm font-bold text-[#101512]">
                                    {t('login.passwordLabel')}
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-semibold text-[#258642] hover:text-[#1f6f36] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                                >
                                    {t('forgotPassword.title')}
                                </Link>
                            </div>
                            <div className="group relative">
                                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7a847c] transition-colors group-focus-within:text-[#258642]" />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                    disabled={loading}
                                    className={inputClassName}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={primaryButtonClassName}>
                            {loading ? `${t('login.loginButton')}…` : t('login.loginButton')}
                        </button>
                    </form>
                </div>
            )}

            {provider === 'google' && (
                <div className="space-y-7">
                    <SelectedEmail
                        email={email}
                        label={t('login.changeEmail')}
                        disabled={loading}
                        onChange={handleChangeEmail}
                    />

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#101512]/20 bg-white px-5 font-bold text-[#101512] transition-colors hover:border-[#34aa56] hover:bg-[#f7f9f6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <GoogleIcon />
                        {loading ? `${t('login.loginButton')}…` : t('login.googleButton')}
                    </button>
                </div>
            )}
        </AccountAccessLayout>
    );
}

function SelectedEmail({
    email,
    label,
    disabled,
    onChange,
}: {
    email: string;
    label: string;
    disabled: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-[#101512]/15 pb-5">
            <span className="min-w-0 truncate text-sm font-semibold text-[#4f5a52]">{email}</span>
            <button
                type="button"
                onClick={onChange}
                disabled={disabled}
                className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-[#258642] hover:text-[#1f6f36] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
            >
                {label}
            </button>
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}
