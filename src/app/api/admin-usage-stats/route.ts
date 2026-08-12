import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

type RideSummaryRow = {
    id: string;
    user_id: string | null;
    started_at: string | null;
    distance_meters: number | null;
    duration_seconds: number | null;
    moving_time_seconds: number | null;
    average_speed_kmh: number | null;
    favorite_name: string | null;
    kind: string | null;
    track_points: unknown;
};

type ProfileRow = {
    id: string;
    username: string | null;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string | null;
};

function getTrackEndpoint(trackPoints: unknown, index: number): [number, number] | null {
    if (!Array.isArray(trackPoints) || trackPoints.length === 0) return null;
    const point = trackPoints[index < 0 ? trackPoints.length + index : index];
    if (!Array.isArray(point) || point.length < 2) return null;

    const lng = Number(point[0]);
    const lat = Number(point[1]);
    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
}

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
                .select('id, user_id, started_at, distance_meters, duration_seconds, moving_time_seconds, average_speed_kmh, favorite_name, kind, track_points')
                .gte('started_at', sevenDaysAgo)
                .order('started_at', { ascending: false, nullsFirst: false }),
            supabase
                .from('profiles')
                .select('id, username, full_name, email, avatar_url, created_at')
                .gte('created_at', sevenDaysAgo)
                .order('created_at', { ascending: false, nullsFirst: false }),
        ]);

        if (ridesRes.error) throw ridesRes.error;
        if (newUsersRes.error) throw newUsersRes.error;

        const rides = (ridesRes.data ?? []) as RideSummaryRow[];
        const newUsers = (newUsersRes.data ?? []) as ProfileRow[];
        const activeRiders = new Set<string>();

        let totalDistanceMeters = 0;
        let totalDurationSeconds = 0;

        for (const ride of rides) {
            totalDistanceMeters += Number(ride.distance_meters ?? 0);
            totalDurationSeconds += Number(ride.moving_time_seconds ?? ride.duration_seconds ?? 0);
            if (ride.user_id) activeRiders.add(ride.user_id);
        }

        const riderIds = [...activeRiders];
        const { data: riderProfilesData, error: riderProfilesError } = riderIds.length > 0
            ? await supabase
                .from('profiles')
                .select('id, username, full_name, email, avatar_url, created_at')
                .in('id', riderIds)
            : { data: [], error: null };

        if (riderProfilesError) throw riderProfilesError;

        const profileMap = new Map<string, ProfileRow>(
            ((riderProfilesData ?? []) as ProfileRow[]).map(profile => [profile.id, profile]),
        );
        const activityByUser = new Map<string, {
            ride_count_7d: number;
            distance_meters_7d: number;
            duration_seconds_7d: number;
            last_ride_at: string | null;
        }>();

        for (const ride of rides) {
            if (!ride.user_id) continue;
            const current = activityByUser.get(ride.user_id) ?? {
                ride_count_7d: 0,
                distance_meters_7d: 0,
                duration_seconds_7d: 0,
                last_ride_at: null,
            };
            current.ride_count_7d += 1;
            current.distance_meters_7d += Number(ride.distance_meters ?? 0);
            current.duration_seconds_7d += Number(ride.moving_time_seconds ?? ride.duration_seconds ?? 0);
            if (!current.last_ride_at || (ride.started_at && ride.started_at > current.last_ride_at)) {
                current.last_ride_at = ride.started_at;
            }
            activityByUser.set(ride.user_id, current);
        }

        const activeUsers = [...activityByUser.entries()]
            .map(([id, activity]) => ({
                id,
                username: profileMap.get(id)?.username ?? null,
                full_name: profileMap.get(id)?.full_name ?? null,
                email: profileMap.get(id)?.email ?? null,
                avatar_url: profileMap.get(id)?.avatar_url ?? null,
                ...activity,
            }))
            .sort((a, b) => b.distance_meters_7d - a.distance_meters_7d);

        const rideDetails = rides.map(ride => {
            const profile = ride.user_id ? profileMap.get(ride.user_id) : null;
            return {
                id: ride.id,
                user_id: ride.user_id,
                username: profile?.username ?? null,
                full_name: profile?.full_name ?? null,
                email: profile?.email ?? null,
                started_at: ride.started_at,
                distance_meters: Number(ride.distance_meters ?? 0),
                duration_seconds: Number(ride.moving_time_seconds ?? ride.duration_seconds ?? 0),
                average_speed_kmh: Number(ride.average_speed_kmh ?? 0),
                favorite_name: ride.favorite_name,
                kind: ride.kind,
                start_point: getTrackEndpoint(ride.track_points, 0),
                end_point: getTrackEndpoint(ride.track_points, -1),
            };
        });

        return NextResponse.json({
            active_users_7d: activeRiders.size,
            rides_7d: rides.length,
            distance_meters_7d: totalDistanceMeters,
            duration_seconds_7d: totalDurationSeconds,
            new_users_7d: newUsers.length,
            computed_at: new Date().toISOString(),
            active_users: activeUsers,
            rides: rideDetails,
            new_users: newUsers,
        });
    } catch (error) {
        if (isDev) console.error('Admin usage stats API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
