/* eslint-disable @typescript-eslint/no-require-imports -- Standalone React lifecycle test harness. */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const stats = {
    registration_from: '2025-07-23', registration_to: '2026-10-15', cutoff: '2026-10-15T00:00:00Z', timezone: 'Europe/Budapest', cohort_users: 2279,
    activation: { numerator: 189, denominator: 2274, percent: 8.3 }, return: { numerator: 111, denominator: 308, percent: 36 },
    first_ride: { median_seconds: 388800, sample_users: 311 },
};
function mount(fetch, initialStats = stats) {
    const exports = {}, effects = [], writes = [];
    const states = ['30', 0, initialStats, true, null];
    let hook = 0;
    const source = readFileSync(`${__dirname}/ActivationMetricsOverview.tsx`, 'utf8');
    runInNewContext(ts.transpileModule(source, {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText, { exports, fetch, AbortController, require: name => ({
        react: { ...React, useEffect: effect => effects.push(effect), useState: () => {
            const index = hook++;
            return [states[index], value => writes.push({ index, value })];
        } },
        'next/navigation': { useRouter: () => ({ replace() {} }) },
        '@/lib/supabaseClient': { supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'test-token' } } }) } } },
        '@/lib/activationMetrics': { ANALYTICS_TIMEZONE: 'Europe/Budapest', formatMedianTime: () => '4,5 nap' },
    }[name] || require(name)) });
    const html = renderToStaticMarkup(React.createElement(exports.default));
    return { html, start: () => effects[0](), writes };
}

test('refresh retains metrics; a cancelled older response cannot overwrite them', async () => {
    let resolve;
    const mounted = mount(() => new Promise(done => { resolve = done; }));
    assert.match(mounted.html, /8,3%/);
    assert.match(mounted.html, /Frissítés/);
    assert.doesNotMatch(mounted.html, /Mit jelentenek|<details/);
    const cleanup = mounted.start();
    await new Promise(done => setImmediate(done));
    assert.equal(mounted.writes.filter(write => write.index === 2).length, 0);
    cleanup();
    resolve({ ok: true, status: 200, json: async () => ({ ...stats, cohort_users: 37 }) });
    await new Promise(done => setImmediate(done));
    assert.equal(mounted.writes.filter(write => write.index === 2).length, 0);
});

test('initial skeleton keeps all metric slots; failed refresh preserves existing data', async () => {
    const initial = mount(async () => ({ ok: false, status: 500 }), null);
    assert.equal((initial.html.match(/<article>/g) || []).length, 3);
    assert.match(initial.html, /Betöltés/);
    const mounted = mount(async () => ({ ok: false, status: 500 }));
    const cleanup = mounted.start();
    await new Promise(done => setImmediate(done));
    assert.equal(mounted.writes.filter(write => write.index === 2).length, 0);
    assert.ok(mounted.writes.some(write => write.index === 4 && write.value === 'Nem sikerült frissíteni.'));
    cleanup();
});
