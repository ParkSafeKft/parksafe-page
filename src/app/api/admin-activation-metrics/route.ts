import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { registrationPeriod, validDate } from '@/lib/activationMetrics';

export async function GET(request: NextRequest) {
    const preset = request.nextUrl.searchParams.get('period');
    let from = request.nextUrl.searchParams.get('from');
    let to = request.nextUrl.searchParams.get('to');
    if (preset !== null ? !['30', '90', 'all'].includes(preset) : (!validDate(from) || !validDate(to) || from > to)) {
        return NextResponse.json({ error: 'Érvénytelen regisztrációs időszak.' }, { status: 400 });
    }

    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ') || !authorization.slice(7).trim()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const client = createClient(url, key, {
            global: { headers: { Authorization: authorization } },
            auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: { user }, error: authError } = await client.auth.getUser(authorization.slice(7));
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile, error: profileError } = await client.from('profiles').select('role').eq('id', user.id).single();
        if (profileError || profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (preset === '30' || preset === '90' || preset === 'all') {
            let firstRegistration: string | null = null;
            if (preset === 'all') {
                const { data: first, error: firstError } = await client.from('profiles')
                    .select('created_at').not('created_at', 'is', null)
                    .order('created_at', { ascending: true }).limit(1).maybeSingle();
                if (firstError) throw firstError;
                firstRegistration = first?.created_at ?? null;
            }
            ({ from, to } = registrationPeriod(preset, new Date(), firstRegistration));
        }

        const { data, error } = await client.rpc('admin_get_activation_metrics', { p_from: from, p_to: to });
        if (error) {
            if (process.env.NODE_ENV === 'development') console.error('Activation metrics RPC:', error);
            return NextResponse.json({ error: 'A mutatók lekérése sikertelen.' }, { status: error.code === '42501' ? 403 : 500 });
        }
        if (!data) throw new Error('Missing activation metrics');
        return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Activation metrics:', error);
        return NextResponse.json({ error: 'A mutatók lekérése sikertelen.' }, { status: 500 });
    }
}
