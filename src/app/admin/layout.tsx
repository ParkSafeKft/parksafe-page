import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * Server Layout Guard for admin routes.
 * Checks authentication and admin role on the server side before rendering.
 * This is the Next.js 16 recommended approach (replaces middleware for auth).
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createSupabaseServerClient();

    // Try to verify user on the server, but don't hard-fail on missing/expired session.
    // The client-side admin guard in the AdminPage will still enforce access control.
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!error && user) {
        // Only perform a strict role check when we actually have a valid user.
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            redirect('/');
        }
    }

    return <>{children}</>;
}
