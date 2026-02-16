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

    // Verify user is authenticated
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/');
    }

    // Verify user has admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        redirect('/');
    }

    return <>{children}</>;
}
