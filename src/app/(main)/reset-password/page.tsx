'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Lock, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [validToken, setValidToken] = useState(false);
    const [checkingToken, setCheckingToken] = useState(true);

    useEffect(() => {
        // Check if we have a valid session from the email link
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error || !session) {
                    setError(t('resetPassword.invalidLink'));
                    setValidToken(false);
                } else {
                    setValidToken(true);
                }
            } catch (err) {
                console.error('Session check error:', err);
                setError(t('resetPassword.errorGeneric'));
                setValidToken(false);
            } finally {
                setCheckingToken(false);
            }
        };

        checkSession();
    }, [searchParams, t]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password.length < 6) {
            setError(t('resetPassword.passwordTooShort'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('resetPassword.passwordMismatch'));
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(t('resetPassword.errorGeneric'));
            setLoading(false);
        }
    };

    if (checkingToken) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 pb-12 px-4 font-sans">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34aa56] mx-auto"></div>
                    <p className="mt-4 text-slate-600">{t('resetPassword.verifying')}</p>
                </div>
            </div>
        );
    }

    if (!validToken) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 pb-12 px-4 font-sans selection:bg-[#34aa56] selection:text-white">
                <div className="w-full max-w-md">
                    <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {t('login.backToHome')}
                    </Link>

                    <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-200">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                                {t('resetPassword.invalidLinkTitle')}
                            </h1>
                            <p className="text-slate-600 mb-8">
                                {error || t('resetPassword.invalidLinkDesc')}
                            </p>
                            <Link
                                href="/forgot-password"
                                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/10"
                            >
                                {t('resetPassword.requestNew')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 pb-12 px-4 font-sans selection:bg-[#34aa56] selection:text-white">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-200">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                                {t('resetPassword.successTitle')}
                            </h1>
                            <p className="text-slate-600 mb-2">
                                {t('resetPassword.successDesc')}
                            </p>
                            <p className="text-sm text-slate-400">
                                {t('resetPassword.redirecting')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 pb-12 px-4 font-sans selection:bg-[#34aa56] selection:text-white">
            <div className="w-full max-w-md">
                <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {t('login.backToHome')}
                </Link>

                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-200">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                            {t('resetPassword.title')}
                        </h1>
                        <p className="text-slate-500">
                            {t('resetPassword.subtitle')}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                                {t('resetPassword.newPasswordLabel')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#34aa56] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#34aa56]/20 focus:border-[#34aa56] transition-all font-medium"
                                />
                            </div>
                            <p className="text-xs text-slate-500">{t('resetPassword.passwordHint')}</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700">
                                {t('resetPassword.confirmPasswordLabel')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#34aa56] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#34aa56]/20 focus:border-[#34aa56] transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-slate-900/10"
                        >
                            {loading ? t('resetPassword.submitting') : t('resetPassword.submitButton')}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-slate-400 text-sm">
                    {t('footer.rights')}
                </p>
            </div>
        </div>
    );
}
