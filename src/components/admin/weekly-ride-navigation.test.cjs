/* eslint-disable @typescript-eslint/no-require-imports -- Node's standalone CommonJS test harness. */
// Run: node --test src/components/admin/weekly-ride-navigation.test.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const passthrough = ({ children }) => children;
const ui = new Proxy({}, { get: () => passthrough });
function component(file, mocks) {
  const source = readFileSync(`${__dirname}/${file}.tsx`, 'utf8');
  const exports = {};
  runInNewContext(ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports, require: name => mocks[name] || require(name) });
  return exports.default;
}

test('all weekly ride views link to the ride itself, including rides without GPS', () => {
  const Modal = component('WeeklyStatsDetailModal', {
    './AdminModal': ui, '@/components/ui/dialog': ui, '@/components/ui/avatar': ui,
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
  });
  const ride = { id: 'ride-123', username: 'Test', started_at: null, distance_meters: 1000, duration_seconds: 120, average_speed_kmh: 30 };
  for (const metric of ['rides', 'distance', 'duration']) {
    const html = renderToStaticMarkup(React.createElement(Modal, {
      metric, stats: { active_users: [], new_users: [], rides: [ride] }, onClose() {},
    }));
    assert.match(html, /href="\/admin\/ride-diagnostics\?ride=ride-123"/);
    assert.doesNotMatch(html, /google\.com\/maps|Térkép|GPS útvonal/);
  }
});

test('deep link loads the exact ride, audits the view, and handles unavailable rides', async () => {
  for (const fails of [false, true]) {
    const effects = [], states = [], audits = [], filters = [];
    const Tab = component('RideDiagnosticsTab', {
      react: { ...React, useEffect: effect => effects.push(effect), useState: initial => [initial, value => states.push(value)] },
      // This component uses memo/callback only for derived data and function identity.
      'next/navigation': { useSearchParams: () => new URLSearchParams('ride=outside-first-500') },
      '@/contexts/AuthContext': { useAuth: () => ({ user: { id: 'admin' } }) },
      '@/lib/adminAuditLog': { writeAuditLog: entry => audits.push(entry) },
      '@/lib/supabaseClient': { supabase: { from: table => {
        assert.equal(table, 'ride_summaries');
        return { select: () => ({ eq: (field, id) => {
          filters.push([field, id]);
          return { single: async () => fails ? { error: new Error('Denied') } : { data: { id, track_samples: [1, 2] } } };
        } }) };
      } } },
      './AdminModal': ui, '@/components/ui/dialog': ui,
    });
    renderToStaticMarkup(React.createElement(Tab));
    const cleanup = effects.at(-1)();
    await new Promise(resolve => setImmediate(resolve));
    cleanup();
    assert.deepEqual(filters, [['id', 'outside-first-500']]);
    if (fails) {
      assert.equal(audits.length, 0);
      assert.ok(states.some(value => typeof value === 'string' && value.includes('nem érhető el')));
    } else {
      assert.ok(states.some(value => value?.id === 'outside-first-500' && value.sample_total === 2));
      assert.equal(audits[0].targetId, 'outside-first-500');
    }
  }
});
