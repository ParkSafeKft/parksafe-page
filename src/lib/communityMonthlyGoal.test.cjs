/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node test harness. */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function load(file, mocks = {}) {
    const exports = {};
    runInNewContext(ts.transpileModule(readFileSync(join(__dirname, file), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText, { exports, process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'http://supabase.test', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-key' } },
        require: name => mocks[name] || require(name) });
    return exports;
}
const helpers = load('communityMonthlyGoal.ts');
const snapshot = { month_key: '2026-10', timezone: 'Europe/Budapest', period_start: '2026-09-30T22:00:00Z',
    period_end: '2026-10-31T23:00:00Z', computed_at: '2026-10-16T12:00:00Z', enabled: true,
    target_distance_meters: 4000000, total_distance_meters: 2000000 };

test('kilometer input converts exactly to safe integer meters and rejects invalid/overflow values', () => {
    for (const [input, expected] of [['4000', 4000000], ['1,001', 1001], ['0.001', 1], ['9007199254740.991', Number.MAX_SAFE_INTEGER]]) {
        assert.equal(helpers.goalMeters(input), expected);
        assert.equal(helpers.goalMeters(helpers.goalKilometersInput(expected)), expected);
    }
    for (const input of ['', '0', '-1', '1e3', '1.0001', 'NaN', 'Infinity', '9007199254740.992', 4000, null]) assert.equal(helpers.goalMeters(input), null);
    for (const input of ['2026-00', '2026-13', '2026-1', '1999-12', '2026-10-01', null]) assert.equal(helpers.validGoalMonth(input), false);
});

test('percent matches mobile, floors before completion and caps only the bar', () => {
    for (const [meters, percent, bar, completed] of [[0,0,0,false], [2000000,50,50,false], [3999999,99.9,99.999975,false], [4000000,100,100,true], [5000000,125,100,true]]) {
        const actual = helpers.goalProgress({ ...snapshot, total_distance_meters: meters });
        assert.equal(actual.percent, percent); assert.ok(Math.abs(actual.bar - bar) < 0.000001); assert.equal(actual.completed, completed);
    }
});

test('snapshot distinguishes inactive configuration, real zero, malformed payload and expired period', () => {
    assert.equal(helpers.validGoalSnapshot(snapshot), true);
    assert.equal(helpers.validGoalSnapshot({ ...snapshot, total_distance_meters: 0 }), true);
    assert.equal(helpers.validGoalSnapshot({ ...snapshot, enabled: false, target_distance_meters: null, total_distance_meters: null }), true);
    for (const change of [{ total_distance_meters: -1 }, { target_distance_meters: 0 }, { total_distance_meters: '2000000' }, { enabled: false }, { computed_at: snapshot.period_end }, { timezone: 'UTC' }, { computed_at: null }]) {
        assert.equal(helpers.validGoalSnapshot({ ...snapshot, ...change }), false);
    }
});

function api(fixture = {}) {
    const calls = [];
    const routes = load('../app/api/admin-community-monthly-goal/route.ts', {
        '@/lib/communityMonthlyGoal': helpers,
        'next/server': { NextResponse: { json: (data, options) => ({ data, ...options }) } },
        '@supabase/supabase-js': { createClient: () => ({
            auth: { getUser: async () => ({ data: { user: fixture.noUser ? null : { id: 'admin' } }, error: fixture.authError }) },
            from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role: fixture.role ?? 'admin' }, error: fixture.roleError }) }) }) }),
            rpc: async (name, args) => { calls.push({ name, args }); return { data: fixture.data === undefined ? snapshot : fixture.data, error: fixture.rpcError }; },
        }) },
    });
    const request = (body, query = '') => ({ nextUrl: new URL(`http://localhost/api${query}`),
        headers: { get: () => fixture.header === undefined ? 'Bearer valid' : fixture.header }, json: async () => body });
    return { ...routes, calls, request };
}

test('both routes reject unauthenticated/non-admin callers before reaching RPC', async () => {
    for (const fixture of [{ header: null, status: 401 }, { noUser: true, status: 401 }, { authError: true, status: 401 }, { role: 'user', status: 403 }, { roleError: true, status: 403 }]) {
        const { GET, PATCH, calls, request } = api(fixture);
        assert.equal((await GET(request())).status, fixture.status);
        assert.equal((await PATCH(request({}))).status, fixture.status);
        assert.equal(calls.length, 0);
    }
});

test('read uses the unchanged mobile RPC; config read selects a single validated month', async () => {
    const { GET, calls, request } = api();
    const response = await GET(request());
    assert.equal(response.status, 200); assert.equal(response.headers['Cache-Control'], 'private, no-store');
    assert.equal(calls[0].name, 'get_current_community_monthly_goal');
    await GET(request(null, '?month=2026-11'));
    assert.equal(calls[1].name, 'admin_get_community_monthly_goal'); assert.equal(calls[1].args.p_month, '2026-11-01');
    assert.equal((await GET(request(null, '?month=invalid'))).status, 400); assert.equal(calls.length, 2);
    const invalid = api({ data: {} }); assert.equal((await invalid.GET(invalid.request())).status, 502);
});

test('save validates inputs, passes version and meters, and reports conflicts/backend failures', async () => {
    const body = { month: '2026-11', target_km: '4000,001', enabled: true, expected_updated_at: null };
    const { PATCH, calls, request } = api();
    assert.equal((await PATCH(request(body))).status, 200);
    assert.equal(calls[0].name, 'admin_set_community_monthly_goal'); assert.equal(calls[0].args.p_target_meters, 4000001);
    assert.equal(calls[0].args.p_expected_updated_at, null);
    for (const change of [{ month: '2026-13' }, { target_km: '0' }, { enabled: 'true' }, { expected_updated_at: undefined }, { expected_updated_at: 'invalid' }]) {
        assert.equal((await PATCH(request({ ...body, ...change }))).status, 400);
    }
    assert.equal(calls.length, 1);
    for (const [code, status] of [['40001', 409], ['42501', 403], ['22023', 400], ['PGRST202', 503], ['XX000', 500]]) {
        const route = api({ rpcError: { code } }); assert.equal((await route.PATCH(route.request(body))).status, status);
    }
});
