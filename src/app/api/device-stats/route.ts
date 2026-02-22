import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

export async function GET(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            if (isDev) console.error('Missing Supabase environment variables');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Authenticate the requesting user
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');

        // Create a client with the user's token so RLS policies work correctly
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        // Verify the user's JWT and get their identity
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin (RLS now sees the authenticated user)
        const { data: profile, error: profileError } = await supabaseAuth
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Use service role key for the RPC call (bypasses RLS for stats)
        let supabase;
        if (serviceRoleKey) {
            supabase = createClient(supabaseUrl, serviceRoleKey);
        } else {
            // Fallback: use the user's token for the query
            supabase = createClient(supabaseUrl, supabaseAnonKey, {
                global: { headers: { Authorization: `Bearer ${token}` } }
            });
        }

        const { data, error } = await supabase.rpc('get_device_stats');

        if (error) {
            if (isDev) console.error('Supabase RPC Error:', error);
            return NextResponse.json({ error: 'Failed to fetch device statistics' }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({
                total_devices: 0,
                registered_users: 0,
                guest_users: 0,
                ios_devices: 0,
                android_devices: 0,
                web_devices: 0,
                active_last_7_days: 0,
                active_last_30_days: 0
            });
        }

        // Get real registered user count from profiles (bypasses RLS via service role)
        const { count: realUserCount, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (!countError && realUserCount !== null) {
            data[0].registered_users = realUserCount;
        }

        return NextResponse.json(data[0]);

    } catch (error) {
        if (isDev) console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
