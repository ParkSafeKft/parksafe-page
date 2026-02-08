'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Mail, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPasswordPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            setSuccess(true);
            setLoading(false);
        } catch (err) {
            console.error('Password reset request error:', err);
            setError(t('forgotPassword.errorGeneric'));
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 pb-12 px-4 font-sans selection:bg-[#34aa56] selection:text-white">
                <div className="w-full max-w-md">
                    <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {t('login.backToHome')}
                    </Link>

                    <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-200">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                                {t('forgotPassword.successTitle')}
                            </h1>
                            <p className="text-slate-600 mb-2">
                                {t('forgotPassword.successDesc')}
                            </p>
                            <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100 mt-6">
                                <strong className="text-slate-700">{email}</strong>
                            </p>
                            <p className="text-xs text-slate-400 mt-6">
                                {t('forgotPassword.checkSpam')}
                            </p>
                            <Link
                                href="/login"
                                className="mt-8 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/10"
                            >
                                {t('forgotPassword.backToLogin')}
                            </Link>
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
                            {t('forgotPassword.title')}
                        </h1>
                        <p className="text-slate-500">
                            {t('forgotPassword.subtitle')}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleForgotPassword} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                                {t('login.emailLabel')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#34aa56] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="pelda@email.com"
                                    required
                                    disabled={loading}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#34aa56]/20 focus:border-[#34aa56] transition-all font-medium"
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                {t('forgotPassword.emailHint')}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-slate-900/10"
                        >
                            {loading ? t('forgotPassword.sending') : t('forgotPassword.submitButton')}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500">
                            {t('forgotPassword.rememberPassword')}{' '}
                            <Link href="/login" className="font-bold text-[#34aa56] hover:text-emerald-700 transition-colors">
                                {t('forgotPassword.backToLogin')}
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-400 text-sm">
                    {t('footer.rights')}
                </p>
            </div>
        </div>
    );
}
