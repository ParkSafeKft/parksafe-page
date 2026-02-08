'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AuthRedirectHandler() {
    const router = useRouter();

    useEffect(() => {
        // Check if we have auth tokens in the URL hash (regular login or magic link)
        if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token=')) {
            // The Supabase client (initialized in AuthContext) will automatically pick up the session 
            // from the hash when it initializes or when the hash changes.
            // We just need to give it a moment to process, then clean the URL and redirect.

            const timer = setTimeout(() => {
                // Redirect to profile after successful login
                // Replace current history entry to remove hash
                router.replace('/profile');
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [router]);

    return null;
}
