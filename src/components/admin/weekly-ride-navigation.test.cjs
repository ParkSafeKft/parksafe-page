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
  const css = { default: new Proxy({}, { get: (_, name) => name }) };
  runInNewContext(ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports, require: name => name.endsWith('.module.css') ? css : mocks[name] || require(name) });
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

test('weekly distance and duration sort independently without mutating the source rides', () => {
  const Modal = component('WeeklyStatsDetailModal', {
    '@/components/ui/dialog': ui, '@/components/ui/avatar': ui,
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
  });
  const rides = [
    { id: 'short-slow', username: 'Short', distance_meters: 1000, duration_seconds: 2400 },
    { id: 'long-fast', username: 'Long', distance_meters: 10000, duration_seconds: 1200 },
  ];
  const stats = { active_users: [], new_users: [], rides };
  const render = metric => renderToStaticMarkup(React.createElement(Modal, { metric, stats, onClose() {} }));
  const distance = render('distance'), duration = render('duration');
  assert.ok(distance.indexOf('ride=long-fast') < distance.indexOf('ride=short-slow'));
  assert.ok(duration.indexOf('ride=short-slow') < duration.indexOf('ride=long-fast'));
  assert.equal(rides[0].id, 'short-slow');
  assert.match(distance, /aria-sort="descending"/);
});

test('all five weekly views expose named tabs and a distinct empty-data state', () => {
  const Modal = component('WeeklyStatsDetailModal', { '@/components/ui/dialog': ui, '@/components/ui/avatar': ui });
  for (const metric of ['active-users', 'rides', 'distance', 'duration', 'new-users']) {
    const html = renderToStaticMarkup(React.createElement(Modal, {
      metric, stats: { active_users: [], new_users: [], rides: [] }, onClose() {},
    }));
    assert.equal((html.match(/role="tab"/g) || []).length, 5);
    assert.equal((html.match(/aria-selected="true"/g) || []).length, 1);
    assert.match(html, /Ez a hét még üres/);
    assert.match(html, /aria-label="Heti statisztika bezárása"/);
  }
  assert.equal(renderToStaticMarkup(React.createElement(Modal, { metric: null, stats: {}, onClose() {} })), '');
});

test('both weekly user lists expose the exact user profile action', () => {
  const Modal = component('WeeklyStatsDetailModal', { '@/components/ui/dialog': ui, '@/components/ui/avatar': ui });
  const user = { id: 'user-exact-123', username: 'Anna', email: 'anna@example.com', ride_count_7d: 1, distance_meters_7d: 1000, duration_seconds_7d: 120 };
  for (const metric of ['active-users', 'new-users']) {
    const html = renderToStaticMarkup(React.createElement(Modal, {
      metric, stats: { active_users: [user], new_users: [user], rides: [] }, onClose() {}, onOpenUser: async () => true,
    }));
    assert.match(html, /data-user-id="user-exact-123"/);
    assert.match(html, /aria-label="Anna profiljának megnyitása"/);
  }
});

function profileNavigation({ fails = false } = {}) {
  const source = readFileSync(__dirname + '/../../app/admin/[[...slug]]/page.tsx', 'utf8');
  const ast = ts.createSourceFile('admin.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const names = ['openFreshDetail', 'closeDetail', 'goBackDetail', 'handleOpenUserProfile'];
  const initializers = {};
  function visit(node) {
    if (ts.isVariableDeclaration(node) && names.includes(node.name.getText(ast))) initializers[node.name.getText(ast)] = node.initializer.getText(ast);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const exports = {}, linked = [], errors = [], profile = { id: 'user-exact-123', username: 'Anna' };
  const context = {
    exports, useCallback: fn => fn, isDev: false, console,
    detailModalRef: { current: { show: false } }, detailHistoryRef: { current: [] }, weeklyDetailReturnRef: { current: null },
    setDetailModal() {}, setDetailHistory() {}, setHasWeeklyReturn() {}, setDetailReturnLabel() {},
    openLinkedDetail: (...args) => linked.push(args), toast: { error: message => errors.push(message) },
    supabase: { from: table => {
      assert.equal(table, 'profiles');
      return { select: () => ({ eq: (field, id) => {
        assert.equal(field, 'id'); assert.equal(id, profile.id);
        return { single: async () => fails ? { error: new Error('denied') } : { data: profile } };
      } }) };
    } },
  };
  const code = names.map(name => 'const ' + name + ' = ' + initializers[name] + '; exports.' + name + ' = ' + name + ';').join('\n');
  runInNewContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText, context);
  return { ...context, handlers: exports, linked, errors, profile };
}

test('weekly user navigation returns to its origin once and preserves existing detail history behavior', async () => {
  const navigation = profileNavigation();
  let returned = 0;
  const onReturn = () => returned++;
  assert.equal(await navigation.handlers.handleOpenUserProfile('user-exact-123', onReturn), true);
  assert.equal(navigation.detailModalRef.current.item.id, 'user-exact-123');
  assert.equal(navigation.weeklyDetailReturnRef.current, onReturn);
  navigation.handlers.goBackDetail();
  assert.equal(returned, 1);
  assert.equal(navigation.detailModalRef.current.show, false);
  navigation.handlers.closeDetail();
  assert.equal(returned, 1);
  assert.equal(await navigation.handlers.handleOpenUserProfile('user-exact-123'), true);
  assert.equal(navigation.linked[0][0].id, 'user-exact-123');
});

test('cancelled or failed profile loads never replace the weekly list', async () => {
  const navigation = profileNavigation();
  const controller = new AbortController();
  controller.abort();
  assert.equal(await navigation.handlers.handleOpenUserProfile('user-exact-123', () => {}, controller.signal), false);
  assert.equal(navigation.detailModalRef.current.show, false);
  assert.equal(navigation.weeklyDetailReturnRef.current, null);
  const denied = profileNavigation({ fails: true });
  assert.equal(await denied.handlers.handleOpenUserProfile('user-exact-123', () => {}), false);
  assert.equal(denied.detailModalRef.current.show, false);
  assert.equal(denied.errors.length, 1);
});

test('deep link loads the exact ride, audits the view, and handles unavailable rides', async () => {
  for (const fails of [false, true]) {
    const effects = [], states = [], audits = [], filters = [], opened = [];
    const Tab = component('RideDiagnosticsTab', {
      './AdminRecordBrowser': ui,
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
    renderToStaticMarkup(React.createElement(Tab, { onOpenRide: row => opened.push(row) }));
    const cleanup = effects.at(-1)();
    await new Promise(resolve => setImmediate(resolve));
    cleanup();
    assert.deepEqual(filters, [['id', 'outside-first-500']]);
    if (fails) {
      assert.equal(audits.length, 0);
      assert.ok(states.some(value => typeof value === 'string' && value.includes('nem érhető el')));
    } else {
      assert.ok(opened.some(value => value?.id === 'outside-first-500' && value.sample_total === 2));
      assert.equal(opened[0].track_samples, undefined);
      assert.equal(audits[0].targetId, 'outside-first-500');
    }
  }
});

test('weekly ride buttons open the in-modal record while retaining a URL fallback', () => {
  const Modal = component('WeeklyStatsDetailModal', { '@/components/ui/dialog': ui, '@/components/ui/avatar': ui });
  for (const metric of ['rides', 'distance', 'duration']) {
    const html = renderToStaticMarkup(React.createElement(Modal, {
      metric, stats: { active_users: [], new_users: [], rides: [{ id: 'exact-ride', username: 'Anna', distance_meters: 1000, duration_seconds: 120 }] },
      onClose() {}, onOpenRide: async () => true,
    }));
    assert.match(html, /<button[^>]*data-record-id="exact-ride"/);
    assert.doesNotMatch(html, /href="\/admin\/ride-diagnostics/);
  }
});

test('weekly ride rows expose separate user-profile and ride-detail controls', () => {
  const Modal = component('WeeklyStatsDetailModal', { '@/components/ui/dialog': ui, '@/components/ui/avatar': ui });
  const html = renderToStaticMarkup(React.createElement(Modal, {
    metric: 'rides', stats: { active_users: [], new_users: [], rides: [{ id: 'ride-1', user_id: 'user-1', username: 'Anna', favorite_name: 'Tisza-part', distance_meters: 1000, duration_seconds: 120 }] },
    onClose() {}, onOpenRide: async () => true, onOpenUser: async () => true,
  }));
  assert.match(html, /data-record-id="ride-1:user"[^>]*aria-label="Anna profiljának megnyitása"/);
  assert.match(html, /data-record-id="ride-1"[^>]*aria-label="Anna: Tisza-part\. Tekerés részletei"/);
});

function adminHandlers(names, overrides = {}) {
  const source = readFileSync(__dirname + '/../../app/admin/[[...slug]]/page.tsx', 'utf8');
  const ast = ts.createSourceFile('admin.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const initializers = {};
  function visit(node) {
    if (ts.isVariableDeclaration(node) && names.includes(node.name.getText(ast))) initializers[node.name.getText(ast)] = node.initializer.getText(ast);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const context = {
    exports: {}, useCallback: fn => fn, console, isDev: false,
    detailModalRef: { current: { show: false } }, detailHistoryRef: { current: [] }, weeklyDetailReturnRef: { current: null },
    setDetailModal() {}, setDetailHistory() {}, setHasWeeklyReturn() {}, setDetailReturnLabel() {},
    toast: { error() {}, success() {} }, ...overrides,
  };
  const code = names.map(name => `const ${name} = ${initializers[name]}; exports.${name} = ${name};`).join('\n');
  runInNewContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText, context);
  return context;
}

test('record bulk actions keep failed IDs selected and ignore late results after navigation', async () => {
  for (const navigates of [false, true]) {
    let finish;
    const selections = [], refreshes = [], busy = [];
    const state = adminHandlers(['handleRecordAction'], {
      actionLock: {current:false}, dataLoading:false, activeTab:'parking', recordScope:{current:'parking:page1'},
      recordRows:[{id:'good'},{id:'denied'}], adminId:'admin', supabase:{}, writeAuditLog(){},
      applyRecordAction:()=>new Promise(resolve=>{finish=resolve;}),
      setBatchActionLoading:value=>busy.push(value), setSelectedRows:value=>selections.push(Array.from(value)),
      fetchData:silent=>refreshes.push(silent),
    });
    const pending=state.exports.handleRecordAction(['good','denied'],'unavailable');
    assert.equal(state.actionLock.current,true);
    if(navigates)state.recordScope.current='feedback:page1';
    finish({succeeded:['good'],failed:['denied']});await pending;
    assert.equal(state.actionLock.current,false);
    assert.deepEqual(busy,[true,false]);
    assert.deepEqual(selections,navigates?[]:[['denied']]);
    assert.deepEqual(refreshes,navigates?[]:[true]);
  }
});

test('bulk actions reject IDs outside the visible collection and concurrent submissions', async () => {
  let calls=0;
  const state=adminHandlers(['handleRecordAction'],{
    actionLock:{current:false},dataLoading:false,activeTab:'feedback',recordScope:{current:'feedback'},recordRows:[{id:'visible'}],
    applyRecordAction:()=>{calls++;},
  });
  await state.exports.handleRecordAction(['hidden'],'closed');
  state.actionLock.current=true;
  await state.exports.handleRecordAction(['visible'],'closed');
  assert.equal(calls,0);
});

test('weekly ride → user → back → weekly uses one detail history and audits the exact ride', async () => {
  const audits = [], filters = [];
  const navigation = adminHandlers(['openFreshDetail', 'openLinkedDetail', 'closeDetail', 'goBackDetail', 'handleOpenUserProfile', 'handleOpenRide'], {
    profile: { id: 'admin' }, writeAuditLog: entry => audits.push(entry),
    supabase: { from: table => ({ select: () => ({ eq: (field, id) => {
      filters.push([table, field, id]);
      return { single: async () => ({ data: table === 'profiles' ? { id, username: 'Anna' } : { id, user_id: 'user-1' } }) };
    } }) }) },
  });
  const handlers = navigation.exports;
  let returns = 0;
  assert.equal(await handlers.handleOpenRide('ride-1', () => returns++), true);
  assert.equal(navigation.detailModalRef.current.type, 'ride');
  await handlers.handleOpenUserProfile('user-1');
  assert.equal(navigation.detailModalRef.current.type, 'user');
  assert.equal(navigation.detailHistoryRef.current.length, 1);
  handlers.goBackDetail();
  assert.equal(navigation.detailModalRef.current.item.id, 'ride-1');
  assert.equal(returns, 0);
  handlers.goBackDetail();
  assert.equal(returns, 1);
  assert.equal(navigation.detailModalRef.current.show, false);
  assert.equal(audits[0].targetId, 'ride-1');
  assert.deepEqual(filters, [['ride_summaries', 'id', 'ride-1'], ['profiles', 'id', 'user-1']]);
});

test('cancelled ride requests do not open a dialog or create a view audit', async () => {
  const audits = [];
  const navigation = adminHandlers(['handleOpenRide'], {
    profile: null, openFreshDetail: () => assert.fail('opened'), openLinkedDetail: () => assert.fail('opened'), writeAuditLog: entry => audits.push(entry),
    supabase: { from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'ride' } }) }) }) }) },
  });
  assert.equal(await navigation.exports.handleOpenRide('ride', undefined, { aborted: true }), false);
  assert.equal(audits.length, 0);
});

test('cross-navigation deletion targets the selected record table, preserving the editor on failure', async () => {
  for (const fails of [false, true]) {
    const deleted = [], editors = [], confirmations = [];
    const navigation = adminHandlers(['confirmDelete'], {
      deletingRecord: false, deleteModal: { id: 'parking-1', table: 'parkingSpots' }, detailModal: { item: null },
      getTableForTab: () => assert.fail('must not derive deletion target from current tab'),
      setDeletingRecord() {}, setDeleteModal: value => confirmations.push(value), setEditLocationModal: value => editors.push(value), closeDetail() {}, fetchData() {},
      supabase: { from: table => ({ delete: () => ({ eq: async (field, id) => {
        deleted.push([table, field, id]); return { error: fails ? new Error('denied') : null };
      } }) }) },
    });
    await navigation.exports.confirmDelete();
    assert.deepEqual(deleted, [['parkingSpots', 'id', 'parking-1']]);
    assert.equal(editors.length, fails ? 0 : 1);
    assert.equal(confirmations.length, fails ? 0 : 1);
  }
});

test('late related-record responses cannot reopen a closed detail or replace a newer record', async () => {
  for (const name of ['handleOpenUserProfile', 'handleOpenRide', 'handleOpenPoiDetail', 'handleOpenParkingSpotDetail']) {
    let resolve;
    const navigation = adminHandlers([name], {
      profile: null, openFreshDetail: () => assert.fail('stale request opened a detail'), openLinkedDetail: () => assert.fail('stale request replaced a detail'), writeAuditLog: () => assert.fail('stale view audit'),
      supabase: { from: () => ({ select: () => ({ eq: () => ({ single: () => new Promise(r => { resolve = r; }) }) }) }) },
    });
    const request = navigation.exports[name]('record-1', ...(name === 'handleOpenPoiDetail' ? ['parking'] : []));
    navigation.detailModalRef.current = { show: false };
    resolve({ data: { id: 'record-1' } });
    await request;
    assert.equal(navigation.detailModalRef.current.show, false);
  }
});
