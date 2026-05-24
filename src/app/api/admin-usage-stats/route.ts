import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

type RideSummaryRow = {
    user_id: string | null;
    distance_meters: number | null;
    duration_seconds: number | null;
    moving_time_seconds: number | null;
};

export async function GET(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            if (isDev) console.error('Missing Supabase environment variables');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } },
        });

        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabaseAuth
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const supabase = serviceRoleKey
            ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
            : supabaseAuth;

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [ridesRes, newUsersRes] = await Promise.all([
            supabase
                .from('ride_summaries')
                .select('user_id, distance_meters, duration_seconds, moving_time_seconds')
                .gte('started_at', sevenDaysAgo),
            supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', sevenDaysAgo),
        ]);

        if (ridesRes.error) throw ridesRes.error;
        if (newUsersRes.error) throw newUsersRes.error;

        const rides = (ridesRes.data ?? []) as RideSummaryRow[];
        const activeRiders = new Set<string>();

        let totalDistanceMeters = 0;
        let totalDurationSeconds = 0;

        for (const ride of rides) {
            totalDistanceMeters += Number(ride.distance_meters ?? 0);
            totalDurationSeconds += Number(ride.moving_time_seconds ?? ride.duration_seconds ?? 0);
            if (ride.user_id) activeRiders.add(ride.user_id);
        }

        return NextResponse.json({
            active_users_7d: activeRiders.size,
            rides_7d: rides.length,
            distance_meters_7d: totalDistanceMeters,
            duration_seconds_7d: totalDurationSeconds,
            new_users_7d: newUsersRes.count ?? 0,
            computed_at: new Date().toISOString(),
        });
    } catch (error) {
        if (isDev) console.error('Admin usage stats API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
