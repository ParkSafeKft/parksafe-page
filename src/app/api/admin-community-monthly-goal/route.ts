import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { goalMeters, validGoalMonth, validGoalSnapshot } from '@/lib/communityMonthlyGoal';

const headers = { 'Cache-Control': 'private, no-store' };
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers });

async function authorize(request: NextRequest) {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ') || !authorization.slice(7).trim()) return { response: json({ error: 'Jelentkezz be újra.' }, 401) };
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return { response: json({ error: 'Hiányzó szerverbeállítás.' }, 500) };
    const client = createClient(url, key, {
        global: { headers: { Authorization: authorization } },
        auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error } = await client.auth.getUser(authorization.slice(7));
    if (error || !user) return { response: json({ error: 'Jelentkezz be újra.' }, 401) };
    const { data: profile, error: roleError } = await client.from('profiles').select('role').eq('id', user.id).single();
    if (roleError || profile?.role !== 'admin') return { response: json({ error: 'Adminisztrátori jogosultság szükséges.' }, 403) };
    return { client };
}

function rpcError(code?: string) {
    if (code === '42501') return json({ error: 'Nincs jogosultság a művelethez.' }, 403);
    if (code === '40001') return json({ error: 'A célt közben módosították. Töltsd újra a beállításokat.' }, 409);
    if (code === '22023' || code === '22003') return json({ error: 'Érvénytelen cél vagy már lezárt hónap.' }, 400);
    if (code === 'PGRST202' || code === '42883') return json({ error: 'A cél szerkesztéséhez szükséges adatbázis-frissítés még nincs telepítve.' }, 503);
    return json({ error: 'A havi cél művelete sikertelen. Próbáld újra.' }, 500);
}

export async function GET(request: NextRequest) {
    try {
        const auth = await authorize(request);
        if (auth.response) return auth.response;
        const month = request.nextUrl.searchParams.get('month');
        if (month !== null && !validGoalMonth(month)) return json({ error: 'Érvénytelen hónap.' }, 400);
        const { data, error } = month === null
            ? await auth.client!.rpc('get_current_community_monthly_goal')
            : await auth.client!.rpc('admin_get_community_monthly_goal', { p_month: `${month}-01` });
        if (error) return rpcError(error.code);
        if (month === null && !validGoalSnapshot(data)) return json({ error: 'A havi cél válasza érvénytelen.' }, 502);
        return json(data);
    } catch {
        return rpcError();
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const auth = await authorize(request);
        if (auth.response) return auth.response;
        let body;
        try { body = await request.json(); } catch { return json({ error: 'Érvénytelen kérés.' }, 400); }
        const meters = goalMeters(body?.target_km);
        const updatedAt = body?.expected_updated_at;
        if (!validGoalMonth(body?.month) || meters === null || typeof body?.enabled !== 'boolean' ||
            !(updatedAt === null || (typeof updatedAt === 'string' && updatedAt.length <= 40 && Number.isFinite(Date.parse(updatedAt))))) {
            return json({ error: 'Adj meg érvényes hónapot és pozitív célt, legfeljebb három tizedesjeggyel.' }, 400);
        }
        const { data, error } = await auth.client!.rpc('admin_set_community_monthly_goal', {
            p_month: `${body.month}-01`, p_target_meters: meters, p_enabled: body.enabled,
            p_expected_updated_at: updatedAt,
        });
        if (error) return rpcError(error.code);
        if (!data) return rpcError();
        return json(data);
    } catch {
        return rpcError();
    }
}
