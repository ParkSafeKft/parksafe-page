'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (session: any) => {
        if (!session?.user) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile) {
                // Merge auth user with profile data.
                // Profile data takes precedence for fields like 'role'.
                setUser({
                    ...session.user,
                    ...profile,
                } as User);
            } else {
                setUser(session.user as User);
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Error fetching user profile:', error);
            setUser(session.user as User);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Get initial session
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase.auth.getSession().then(({ data: { session } }: any) => {
            fetchUserProfile(session);
        });

        // Listen for auth changes
        const {
            data: { subscription },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            fetchUserProfile(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    };

    const signInWithGoogle = async () => {
        // Ensure window is defined (client-side)
        const redirectTo = typeof window !== 'undefined'
            ? `${window.location.origin}/profile`
            : undefined;

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
            },
        });
        return { data, error };
    };

    const signOut = async (): Promise<void> => {
        await supabase.auth.signOut();
    };

    const requestPasswordReset = async (email: string) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { data, error };
    };

    const updatePassword = async (password: string) => {
        const { data, error } = await supabase.auth.updateUser({
            password: password,
        });
        return { data, error };
    };

    const value: AuthContextType = {
        user,
        loading,
        signInWithEmail,
        signInWithGoogle,
        signOut,
        requestPasswordReset,
        updatePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
