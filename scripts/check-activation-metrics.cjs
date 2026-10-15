/* eslint-disable @typescript-eslint/no-require-imports -- Standalone SQL fixture generator. */
// Emits SELECT-only fixture checks for the parksafe-self MCP execute_sql tool.
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const migration = readFileSync(join(__dirname, '../supabase/migrations/20261015000729_admin_activation_metrics.sql'), 'utf8');
const body = migration.match(/return \(\s*(with cohort[\s\S]*?)\s*\);\s*end;/)[1];
const quote = value => value === null ? 'null' : `'${String(value).replaceAll("'", "''")}'`;
const reg = '2026-10-01T00:00:00Z';
const cutoff = '2026-10-15T00:00:00Z';
const user = (id, registered = reg, extra = {}) => ({ id, registered, anonymous: false, deleted: null, metadata: {}, ...extra });
const ride = (id, userId, started, extra = {}) => ({ id, userId, started, client: id, created: started, distance: 1000, duration: 300, kind: 'normal', ...extra });
function scenario(name, users, rides, expected, options = {}) {
    const values = (rows, fields) => rows.length ? rows.map(row => `(${fields.map(field => quote(row[field])).join(',')})`).join(',') : `(${fields.map(() => 'null').join(',')})`;
    const fixtures = `fixture_profiles(id, created_at) as (
        select id, registered::timestamptz from (values ${values(users, ['id', 'registered'])}) v(id, registered) where id is not null
    ), fixture_users(id, is_anonymous, deleted_at, raw_app_meta_data) as (
        select id, anonymous::boolean, deleted::timestamptz, metadata::jsonb from (values ${values(users.filter(u => !u.orphan).map(u => ({ ...u, metadata: JSON.stringify(u.metadata) })), ['id', 'anonymous', 'deleted', 'metadata'])}) v(id, anonymous, deleted, metadata) where id is not null
    ), fixture_rides(id, user_id, client_ride_id, started_at, created_at, distance_meters, duration_seconds, kind) as (
        select id, user_id, client, started::timestamptz, created::timestamptz, distance::integer, duration::integer, kind from (values ${values(rides, ['id', 'userId', 'client', 'started', 'created', 'distance', 'duration', 'kind'])}) v(id, user_id, client, started, created, distance, duration, kind) where id is not null
    ), `;
    const sql = body.replace('with cohort', `with ${fixtures}cohort`)
        .replaceAll('public.profiles', 'fixture_profiles').replaceAll('auth.users', 'fixture_users').replaceAll('public.ride_summaries', 'fixture_rides')
        .replace(/\bv_from\b/g, `'${options.from || '2026-10-01'}'::timestamp at time zone 'Europe/Budapest'`)
        .replace(/\bv_to\b/g, `('${options.to || '2026-10-14'}'::date + 1)::timestamp at time zone 'Europe/Budapest'`)
        .replace(/\bp_from\b/g, `'${options.from || '2026-10-01'}'::date`)
        .replace(/\bp_to\b/g, `'${options.to || '2026-10-14'}'::date`)
        .replace(/\bp_cutoff\b/g, `'${options.cutoff || cutoff}'::timestamptz`);
    const checks = Object.entries(expected).map(([path, value]) => `(result #> '{${path}}') = '${JSON.stringify(value)}'::jsonb`).join(' and ');
    return `select ${quote(name)} as scenario, (${checks}) as passed, result from (${sql}) q(result)`;
}
const checks = [
    scenario('inclusive activation and return boundary', [user('a')], [ride('a1', 'a', '2026-10-08T00:00:00Z'), ride('a2', 'a', cutoff)], {
        'activation,numerator': 1, 'activation,denominator': 1, 'return,numerator': 1, 'return,denominator': 1, 'first_ride,median_seconds': 604800,
    }),
    scenario('one second beyond activation; return observation incomplete', [user('a')], [ride('a1', 'a', '2026-10-08T00:00:01Z')], {
        'activation,numerator': 0, 'activation,denominator': 1, 'return,denominator': 0, 'return,percent': null, 'first_ride,sample_users': 1,
    }),
    scenario('same Budapest day cannot return; duplicated client IDs cannot return', [user('a')], [
        ride('a1', 'a', '2026-10-01T22:30:00Z', { client: 'saved' }),
        ride('a2', 'a', '2026-10-02T01:00:00Z'),
        ride('duplicate', 'a', '2026-10-03T01:00:00Z', { client: 'saved' }),
    ], { 'return,numerator': 0, 'return,denominator': 1 }),
    scenario('same UTC date but later Budapest day; missing client IDs retained', [user('a')], [
        ride('a1', 'a', '2026-10-01T21:59:00Z', { client: null }), ride('a2', 'a', '2026-10-01T22:01:00Z', { client: null }),
    ], { 'return,numerator': 1 }),
    scenario('late activation still eligible for return and median', [user('a', '2026-09-01T00:00:00Z')], [
        ride('a1', 'a', '2026-10-01T00:00:00Z'), ride('a2', 'a', '2026-10-02T00:00:00Z'),
    ], { 'activation,numerator': 0, 'return,numerator': 1, 'return,denominator': 1, 'first_ride,median_seconds': 2592000 }, { from: '2026-09-01' }),
    scenario('recent registration omitted from percentages but included in median', [user('a', '2026-10-14T00:00:00Z')], [ride('a1', 'a', '2026-10-14T01:00:00Z')], {
        'activation,denominator': 0, 'activation,percent': null, 'return,denominator': 0, 'first_ride,median_seconds': 3600,
    }),
    scenario('median of even sample differs from mean; never-rider excluded', [user('a'), user('b'), user('c'), user('d'), user('never')], [
        ride('a1', 'a', '2026-10-01T01:00:00Z'), ride('b1', 'b', '2026-10-01T02:00:00Z'),
        ride('c1', 'c', '2026-10-01T03:00:00Z'), ride('d1', 'd', '2026-10-10T00:00:00Z'),
    ], { 'cohort_users': 5, 'activation,denominator': 5, 'activation,numerator': 3, 'return,denominator': 3, 'first_ride,sample_users': 4, 'first_ride,median_seconds': 9000 }),
    scenario('validity, test/import exclusion, upload cutoff and pre-registration start', [user('a')], [
        ride('zero-distance', 'a', reg, { distance: 0 }), ride('zero-time', 'a', reg, { duration: 0 }),
        ride('negative', 'a', reg, { distance: -1 }), ride('test-kind', 'a', reg, { kind: 'test' }),
        ride('import-kind', 'a', reg, { kind: 'imported' }), ride('tagged', 'a', reg, { client: 'test:123' }),
        ride('late-upload', 'a', reg, { created: '2026-10-16T00:00:00Z' }),
        ride('pre-registration', 'a', '2026-09-30T00:00:00Z'), ride('valid', 'a', '2026-10-12T00:00:00Z'),
    ], { 'activation,numerator': 0, 'first_ride,median_seconds': 950400 }),
    scenario('guests, deleted, orphan and explicitly excluded accounts', [user('guest', reg, { anonymous: true }), user('deleted', reg, { deleted: reg }), user('orphan', reg, { orphan: true }), user('test', reg, { metadata: { analytics_exclude: true } })], [], {
        'cohort_users': 0, 'activation,percent': null, 'return,percent': null, 'first_ride,median_seconds': null, 'first_ride,sample_users': 0,
    }),
    scenario('return one second beyond window rejected', [user('a')], [ride('a1', 'a', reg), ride('a2', 'a', '2026-10-08T00:00:01Z')], { 'return,numerator': 0 }),
    scenario('DST: 168 elapsed hours across Budapest fall transition', [user('a', '2026-10-22T00:00:00Z')], [ride('a1', 'a', '2026-10-29T00:00:00Z')], {
        'activation,numerator': 1, 'first_ride,median_seconds': 604800,
    }, { from: '2026-10-22', to: '2026-10-22', cutoff: '2026-11-06T00:00:00Z' }),
    scenario('inclusive Budapest registration dates with exclusive next midnight', [user('included', '2026-09-30T22:00:00Z'), user('excluded', '2026-10-01T22:00:00Z')], [], {
        'cohort_users': 1,
    }, { from: '2026-10-01', to: '2026-10-01' }),
    scenario('same client ID belonging to different users kept separately', [user('a'), user('b')], [ride('a1', 'a', reg, { client: 'same' }), ride('b1', 'b', reg, { client: 'same' })], { 'first_ride,sample_users': 2 }),
];
console.log(JSON.stringify(checks.join('\nunion all\n') + ';'));
