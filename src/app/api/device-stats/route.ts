import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';
const monthlyUsersCacheTtl = 5 * 60 * 1000;

type MonthlyUserPoint = { month: string; users: number };
type UserEngagementMetrics = {
    active_this_month: number;
    returning_this_month: number;
    new_this_month: number;
};
type RideUserRow = { id: string; user_id: string };

let monthlyUsersCache: { data: MonthlyUserPoint[]; expiresAt: number } | null = null;
let userEngagementCache: { data: Omit<UserEngagementMetrics, 'new_this_month'>; expiresAt: number } | null = null;

function getBudapestYearMonth(date: Date) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Budapest',
        year: 'numeric',
        month: '2-digit',
    }).formatToParts(date);

    return {
        year: Number(parts.find(part => part.type === 'year')?.value),
        monthIndex: Number(parts.find(part => part.type === 'month')?.value) - 1,
    };
}

function getBudapestMonthStart(year: number, monthIndex: number) {
    const normalized = new Date(Date.UTC(year, monthIndex, 1));
    const utcGuess = Date.UTC(normalized.getUTCFullYear(), normalized.getUTCMonth(), 1);
    const offsetLabel = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Budapest',
        timeZoneName: 'longOffset',
    }).formatToParts(new Date(utcGuess)).find(part => part.type === 'timeZoneName')?.value ?? 'GMT+00:00';
    const match = offsetLabel.match(/GMT([+-])(\d{2}):(\d{2})/);
    const offsetMs = match
        ? (match[1] === '+' ? 1 : -1) * (Number(match[2]) * 60 + Number(match[3])) * 60 * 1000
        : 0;

    return {
        date: new Date(utcGuess - offsetMs),
        key: `${normalized.getUTCFullYear()}-${String(normalized.getUTCMonth() + 1).padStart(2, '0')}-01`,
    };
}

async function fetchRideUserIds(
    client: SupabaseClient,
    filters: { gte?: string; lt?: string; userIds?: string[] },
) {
    const ids = new Set<string>();
    const pageSize = 1000;

    for (let from = 0; ; from += pageSize) {
        let query = client
            .from('ride_summaries')
            .select('id, user_id')
            .order('started_at', { ascending: true })
            .order('id', { ascending: true })
            .range(from, from + pageSize - 1);

        if (filters.gte) query = query.gte('started_at', filters.gte);
        if (filters.lt) query = query.lt('started_at', filters.lt);
        if (filters.userIds) query = query.in('user_id', filters.userIds);

        const { data, error } = await query;
        if (error) throw error;

        const rows = (data ?? []) as RideUserRow[];
        rows.forEach(row => ids.add(row.user_id));
        if (rows.length < pageSize) break;
    }

    return ids;
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
                total_users: 0,
                total_devices: 0,
                registered_users: 0,
                guest_users: 0,
                ios_devices: 0,
                android_devices: 0,
                web_devices: 0,
                active_last_7_days: 0,
                active_last_30_days: 0,
                monthly_users: [],
                user_metrics: { active_this_month: 0, returning_this_month: 0, new_this_month: 0 },
            });
        }

        const now = new Date();
        const { year, monthIndex } = getBudapestYearMonth(now);
        const monthStarts = Array.from({ length: 12 }, (_, index) => (
            getBudapestMonthStart(year, monthIndex - (11 - index))
        ));

        const monthlyUsersPromise = monthlyUsersCache && monthlyUsersCache.expiresAt > Date.now()
            ? Promise.resolve(monthlyUsersCache.data)
            : Promise.all(monthStarts.map((start, index) => {
                const end = index < monthStarts.length - 1
                    ? monthStarts[index + 1]
                    : getBudapestMonthStart(year, monthIndex + 1);

                return supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', start.date.toISOString())
                    .lt('created_at', end.date.toISOString());
            })).then(results => {
                if (results.some(result => result.error)) return [];

                const points = monthStarts.map((start, index) => ({
                    month: start.key,
                    users: results[index].count ?? 0,
                }));
                monthlyUsersCache = { data: points, expiresAt: Date.now() + monthlyUsersCacheTtl };
                return points;
            });

        const currentMonthStart = monthStarts.at(-1)?.date.toISOString();
        const engagementPromise = userEngagementCache && userEngagementCache.expiresAt > Date.now()
            ? Promise.resolve(userEngagementCache.data)
            : (async () => {
                if (!currentMonthStart) return { active_this_month: 0, returning_this_month: 0 };

                const activeUserIds = await fetchRideUserIds(supabase, { gte: currentMonthStart });
                const activeIdList = [...activeUserIds];
                const activeIdBatches = Array.from(
                    { length: Math.ceil(activeIdList.length / 100) },
                    (_, index) => activeIdList.slice(index * 100, (index + 1) * 100),
                );
                const returningBatches = await Promise.all(
                    activeIdBatches.map(userIds => fetchRideUserIds(supabase, { lt: currentMonthStart, userIds })),
                );
                const returningUserIds = new Set(returningBatches.flatMap(ids => [...ids]));
                const metrics = {
                    active_this_month: activeUserIds.size,
                    returning_this_month: returningUserIds.size,
                };
                userEngagementCache = { data: metrics, expiresAt: Date.now() + monthlyUsersCacheTtl };
                return metrics;
            })();

        const [registeredResult, monthlyUsers, engagement] = await Promise.all([
            supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true }),
            monthlyUsersPromise,
            engagementPromise,
        ]);

        const registeredUsers = !registeredResult.error && registeredResult.count !== null
            ? registeredResult.count
            : Number(data[0].registered_users ?? 0);
        const guestUsers = Number(data[0].guest_users ?? 0);

        data[0].registered_users = registeredUsers;
        data[0].total_users = registeredUsers + guestUsers;
        data[0].monthly_users = monthlyUsers;
        data[0].user_metrics = {
            ...engagement,
            new_this_month: monthlyUsers.at(-1)?.users ?? 0,
        } satisfies UserEngagementMetrics;

        return NextResponse.json(data[0]);

    } catch (error) {
        if (isDev) console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
