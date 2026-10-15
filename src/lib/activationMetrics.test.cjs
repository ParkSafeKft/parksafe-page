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
    }).outputText, { exports, process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'http://supabase.test', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-key', NODE_ENV: 'test' } },
        require: name => mocks[name] || require(name) });
    return exports;
}
const helpers = load('activationMetrics.ts');

test('30/90 day periods include exactly that many Budapest calendar days; all time uses earliest registration', () => {
    const now = new Date('2026-10-14T22:30:00Z');
    for (const [preset, expectedFrom] of [['30', '2026-09-16'], ['90', '2026-07-18'], ['all', '2025-09-29']]) {
        const period = helpers.registrationPeriod(preset, now, '2025-09-29T11:01:28Z');
        assert.equal(period.from, expectedFrom);
        assert.equal(period.to, '2026-10-15');
    }
    assert.equal(helpers.registrationPeriod('all', now, null).from, '2026-10-15');
});

test('date validation rejects malformed and overflowing dates', () => {
    for (const date of [null, '', '2026-2-01', '2026-02-29', '2026-13-01', '2026-04-31']) assert.equal(helpers.validDate(date), false);
    for (const date of ['2024-02-29', '2026-10-01']) assert.equal(helpers.validDate(date), true);
    assert.equal(helpers.budapestDate(new Date('2026-09-30T22:30:00Z')), '2026-10-01');
});

test('API presets resolve all time after admin authorization and fail on oldest-registration query errors', async () => {
    for (const fixture of [
        { preset: '30', status: 200 }, { preset: '90', status: 200 }, { preset: 'all', status: 200 },
        { preset: 'all', first: null, status: 200 }, { preset: 'all', queryError: true, status: 500 },
        { preset: 'all', role: 'user', status: 403 }, { preset: 'invalid', status: 400 },
    ]) {
        let oldestReads = 0, rpcCalls = 0;
        const { GET } = load('../app/api/admin-activation-metrics/route.ts', {
            '@/lib/activationMetrics': helpers,
            'next/server': { NextResponse: { json: (data, options = {}) => ({ status: options.status || 200, data }) } },
            '@supabase/supabase-js': { createClient: () => ({
                auth: { getUser: async () => ({ data: { user: { id: 'admin' } } }) },
                from: () => ({ select: field => field === 'role'
                    ? { eq: () => ({ single: async () => ({ data: { role: fixture.role || 'admin' } }) }) }
                    : { not: () => ({ order: () => ({ limit: limit => {
                        assert.equal(limit, 1);
                        return { maybeSingle: async () => {
                            oldestReads++;
                            return { data: fixture.first === null ? null : { created_at: '2025-09-29T11:01:28Z' }, error: fixture.queryError };
                        } };
                    } }) }) },
                }),
                rpc: async (_, args) => {
                    rpcCalls++;
                    const expected = helpers.registrationPeriod(fixture.preset, new Date(), fixture.first === null ? null : '2025-09-29T11:01:28Z');
                    assert.equal(args.p_from, expected.from);
                    assert.equal(args.p_to, expected.to);
                    return { data: { cohort_users: 10 } };
                },
            }) },
        });
        const response = await GET({ nextUrl: new URL(`http://localhost/api?period=${fixture.preset}`), headers: { get: () => 'Bearer valid' } });
        assert.equal(response.status, fixture.status);
        assert.equal(oldestReads, fixture.preset === 'all' && !fixture.role ? 1 : 0);
        assert.equal(rpcCalls, fixture.status === 200 ? 1 : 0);
    }
});

test('median has meaningful units and an explicit empty state', () => {
    assert.equal(helpers.formatMedianTime(null), 'Nincs adat');
    assert.equal(helpers.formatMedianTime(0), '1 percnél kevesebb');
    assert.equal(helpers.formatMedianTime(90), '1,5 perc');
    assert.equal(helpers.formatMedianTime(5400), '1,5 óra');
    assert.equal(helpers.formatMedianTime(129600), '1,5 nap');
});

test('API validates inputs, rejects unauthenticated/non-admin callers and propagates RPC errors', async () => {
    for (const fixture of [
        { from: '2026-02-29', status: 400 }, { from: '2026-11-01', status: 400 },
        { header: null, status: 401 }, { header: 'Bearer invalid', authError: true, status: 401 },
        { role: 'user', status: 403 }, { rpcError: { code: '42501' }, status: 403 },
        { rpcError: { code: 'XX000' }, status: 500 }, { status: 200 },
    ]) {
        let rpcCalls = 0;
        const { GET } = load('../app/api/admin-activation-metrics/route.ts', {
            '@/lib/activationMetrics': helpers,
            'next/server': { NextResponse: { json: (data, options = {}) => ({ status: options.status || 200, data, headers: options.headers }) } },
            '@supabase/supabase-js': { createClient: () => ({
                auth: { getUser: async () => ({ data: { user: { id: 'user' } }, error: fixture.authError }) },
                from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role: fixture.role || 'admin' } }) }) }) }),
                rpc: async (name, args) => {
                    rpcCalls++;
                    assert.equal(name, 'admin_get_activation_metrics');
                    assert.equal(args.p_from, '2026-10-01');
                    assert.equal(args.p_to, '2026-10-15');
                    return { data: { cohort_users: 10 }, error: fixture.rpcError };
                },
            }) },
        });
        const response = await GET({
            nextUrl: new URL(`http://localhost/api?from=${fixture.from || '2026-10-01'}&to=2026-10-15`),
            headers: { get: () => fixture.header === undefined ? 'Bearer valid' : fixture.header },
        });
        assert.equal(response.status, fixture.status);
        assert.equal(rpcCalls, fixture.status === 200 || fixture.rpcError ? 1 : 0);
        if (response.status === 200) assert.equal(response.headers['Cache-Control'], 'private, no-store');
    }
});
