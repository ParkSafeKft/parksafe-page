import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

type ConfigRow = {
    key: string;
    value: string;
    data: Record<string, unknown> | null;
    updated_at: string;
};

const KNOWN_KEYS = new Set(['min_app_version', 'maintenance', 'feature_flags']);
const SEMVER_RE = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;

/**
 * Authenticate the caller, verify admin role, then return a Supabase client
 * scoped to the user's JWT. The DB enforces admin-only writes via the
 * `app_config_admin_update` RLS policy (which uses get_my_role()).
 */
async function authorizeAdmin(request: NextRequest): Promise<
    | { ok: true; supabase: SupabaseClient }
    | { ok: false; response: NextResponse }
> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return {
            ok: false,
            response: NextResponse.json({ error: 'Server configuration error' }, { status: 500 }),
        };
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    const token = authHeader.replace('Bearer ', '');

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) {
        return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    const { data: profile, error: profileError } = await userClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }

    return { ok: true, supabase: userClient };
}

export async function GET(request: NextRequest) {
    try {
        const auth = await authorizeAdmin(request);
        if (!auth.ok) return auth.response;

        const { data, error } = await auth.supabase
            .from('app_config')
            .select('key, value, data, updated_at')
            .order('key');

        if (error) {
            if (isDev) console.error('app_config select error:', error);
            return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
        }

        return NextResponse.json({ items: data as ConfigRow[] });
    } catch (error) {
        if (isDev) console.error('app_config GET exception:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const auth = await authorizeAdmin(request);
        if (!auth.ok) return auth.response;

        const body = (await request.json()) as {
            key?: string;
            value?: string;
            data?: Record<string, unknown> | null;
        };

        if (!body.key || !KNOWN_KEYS.has(body.key)) {
            return NextResponse.json({ error: 'Unknown or missing config key' }, { status: 400 });
        }

        if (typeof body.value !== 'string' || body.value.length === 0 || body.value.length > 64) {
            return NextResponse.json({ error: 'Invalid value' }, { status: 400 });
        }

        if (body.key === 'min_app_version') {
            if (!SEMVER_RE.test(body.value)) {
                return NextResponse.json(
                    { error: 'min_app_version must be MAJOR.MINOR.PATCH (e.g. 1.4.0)' },
                    { status: 400 },
                );
            }
        }
        if (body.key === 'maintenance' || body.key === 'feature_flags') {
            if (body.value !== 'on' && body.value !== 'off') {
                return NextResponse.json(
                    { error: `${body.key}.value must be 'on' or 'off'` },
                    { status: 400 },
                );
            }
            if (body.data != null && (typeof body.data !== 'object' || Array.isArray(body.data))) {
                return NextResponse.json({ error: 'data must be a JSON object' }, { status: 400 });
            }
        }

        const update: { value: string; data?: Record<string, unknown> | null; updated_at: string } = {
            value: body.value,
            updated_at: new Date().toISOString(),
        };
        if ('data' in body) {
            update.data = body.data ?? null;
        }

        const { data, error } = await auth.supabase
            .from('app_config')
            .update(update)
            .eq('key', body.key)
            .select('key, value, data, updated_at')
            .single();

        if (error) {
            if (isDev) console.error('app_config update error:', error);
            return NextResponse.json({ error: error.message || 'Failed to update config' }, { status: 500 });
        }

        return NextResponse.json({ item: data as ConfigRow });
    } catch (error) {
        if (isDev) console.error('app_config PATCH exception:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
