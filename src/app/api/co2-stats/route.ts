import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Refresh once a day. Edge / CDN may cache for the same window.
export const revalidate = 86400;

type Co2Stats = {
    total_rides: number;
    total_meters: number;
    total_co2_grams: number;
    rides_30d: number;
    meters_30d: number;
    co2_grams_30d: number;
    rides_7d: number;
    meters_7d: number;
    co2_grams_7d: number;
    last_ride_at: string | null;
    computed_at: string;
};

const isDev = process.env.NODE_ENV === 'development';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Anon client — get_public_co2_stats is SECURITY DEFINER and granted to anon.
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false },
        });

        const { data, error } = await supabase.rpc('get_public_co2_stats');

        if (error || !data || data.length === 0) {
            if (isDev) console.error('CO2 stats RPC error:', error);
            return NextResponse.json({ error: 'Failed to fetch CO2 stats' }, { status: 500 });
        }

        const stats = data[0] as Co2Stats;

        return NextResponse.json(stats, {
            headers: {
                // Public CDN cache for 24h, allow stale-while-revalidate for another 24h.
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        if (isDev) console.error('CO2 stats API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
