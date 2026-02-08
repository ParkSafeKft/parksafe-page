'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, ArrowRight, AlertCircle, ChevronLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPasswordPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { requestPasswordReset } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const { error } = await requestPasswordReset(email);
            if (error) {
                setError(error.message);
            } else {
                setMessage(t('forgotPassword.successMessage'));
                setEmail('');
            }
        } catch (err) {
            console.error(err);
            setError(t('forgotPassword.errorGeneric'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 pb-12 px-4 font-sans selection:bg-[#34aa56] selection:text-white">

            <div className="w-full max-w-md">

                {/* Back Link */}
                <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {t('forgotPassword.backToLogin')}
                </Link>

                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-200">

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{t('forgotPassword.title')}</h1>
                        <p className="text-slate-500">{t('forgotPassword.subtitle')}</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-red-700">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-green-700">{message}</p>
                        </div>
                    )}

                    {!message && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-bold text-slate-700">{t('forgotPassword.emailLabel')}</label>
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
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-slate-900/10"
                            >
                                {loading ? '...' : t('forgotPassword.submitButton')}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>
                    )}

                    {message && (
                        <div className="text-center mt-6">
                            <Link href="/login" className="inline-flex items-center justify-center w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                                {t('forgotPassword.backToLogin')}
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
