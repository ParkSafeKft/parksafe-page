'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

const isDev = process.env.NODE_ENV === 'development';

// Create a local Supabase client that doesn't persist sessions.
// This prevents the password reset flow from logging the user in on other tabs.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const secureClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // Don't save session to localStorage
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});

function ResetPasswordContent() {
    const { t } = useLanguage();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    // We don't need useAuth here because we're using a local client
    // const { updatePassword, signOut } = useAuth(); 

    const successRef = useRef(false);

    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as any || 'recovery';

    useEffect(() => {
        const verifyToken = async () => {
            if (!token_hash) {
                setVerifying(false);
                setError('Missing token');
                return;
            }

            try {
                // Verify against the secure, local client
                const { error } = await secureClient.auth.verifyOtp({ token_hash, type });
                if (error) {
                    setError(error.message);
                }
            } catch (err) {
                if (isDev) console.error(err);
                setError(t('resetPassword.errorGeneric'));
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();

        // No cleanup needed for signOut because session is not persisted!
    }, [token_hash, type, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            // Update user using the secure client (which has the session in memory)
            const { error } = await secureClient.auth.updateUser({
                password: password,
            });

            if (error) {
                setError(error.message);
            } else {
                setMessage(t('resetPassword.successMessage'));
                successRef.current = true;

                // We don't need to sign out locally, but it's good practice to clear the in-memory session
                await secureClient.auth.signOut();

                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (err) {
            if (isDev) console.error(err);
            setError(t('resetPassword.errorGeneric'));
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200">
                    <p className="text-slate-500 font-medium">Verifying token...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 pb-12 px-4 font-sans selection:bg-[#34aa56] selection:text-white">

            <div className="w-full max-w-md">

                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-200">

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{t('resetPassword.title')}</h1>
                        <p className="text-slate-500">{t('resetPassword.subtitle')}</p>
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

                    {!message && !error && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-bold text-slate-700">{t('resetPassword.passwordLabel')}</label>
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
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#34aa56]/20 focus:border-[#34aa56] transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700">{t('resetPassword.confirmPasswordLabel')}</label>
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
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#34aa56]/20 focus:border-[#34aa56] transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-slate-900/10"
                            >
                                {loading ? '...' : t('resetPassword.submitButton')}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>
                    )}

                    {error && (
                        <div className="text-center mt-6">
                            <Link href="/forgot-password" className="inline-flex items-center justify-center w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                                {t('forgotPassword.title')}
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200">
                    <p className="text-slate-500 font-medium">Loading...</p>
                </div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
