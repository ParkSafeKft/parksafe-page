import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const sql = readFileSync(new URL('../../supabase/migrations/20261028170000_admin_gps_device_diagnostics.sql', import.meta.url), 'utf8');
const userCountsSql = readFileSync(new URL('../../supabase/migrations/20261028210000_gps_device_user_counts.sql', import.meta.url), 'utf8');
test('table labels unknown and small samples and never renders unselected private properties', () => {
    const require = createRequire(import.meta.url);
    const source = readFileSync(new URL('../../src/components/admin/GpsDeviceDiagnostics.tsx', import.meta.url), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const module = { exports: {} };
    new Function('require', 'module', 'exports', compiled)(name => name.endsWith('.css') ? { default: {} }
        : name === '@/lib/supabaseClient' ? {} : require(name), module, module.exports);
    const render = groups => renderToStaticMarkup(React.createElement(module.exports.GpsGroupTable, { groups }));
    assert.match(render([]), /nem jelent hibamentes/);
    const html = render([{ manufacturer: 'Test', model: 'Phone', os: 'android', os_version: '16', app_version: '1',
        rides: 2, users: 1, measured_rides: 0, partial_rides: 0, gap_rides: 0, legacy_gap_rides: 1,
        gap_percent: null, accepted_percent: null, accepted_samples: null, raw_samples: null,
        count_rides: 0, poor_accuracy: null, stale_gap: null, teleport: null, rejection_measured_rides: 0,
        storage_measured_rides: 0, storage_mismatch_rides: 0, battery_saver_on: null, doze_whitelisted: null,
        latitude: 47.12345, user_id: 'private-user' }]);
    assert.match(html, /Kevés adat/); assert.match(html, /Nincs mért arány/); assert.match(html, /Ismeretlen/);
    assert.doesNotMatch(html, /47\.12345|private-user|0%/);
    assert.match(html, /1 felhasználótól/);
});
test('real RPC enforces authorization, audits and aggregates without exposing private data', async () => {
    const db = new PGlite();
    try {
        await db.exec(`create role anon; create role authenticated; create schema auth;
          create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
          create function public.is_admin() returns boolean language sql as $$ select current_setting('test.admin', true) = 'yes' $$;
          create table admin_audit_log(admin_id uuid not null, action text not null, target_type text not null, target_id uuid not null, notes text);
          create table ride_summaries(id uuid primary key, started_at timestamptz, track_samples jsonb);
          create table ride_telemetry(ride_id uuid unique, manufacturer text, model text, os text, os_version text,
            app_version text, battery_saver_on boolean, doze_whitelisted boolean, tracking_diagnostics jsonb,
            heartbeat_gaps jsonb, sample_count_total integer, sample_count_accepted integer, sample_count_rejected jsonb,
            user_id uuid not null default '00000000-0000-0000-0000-000000000001');`);
        await db.exec(sql);
        await db.exec(userCountsSql);
        await assert.rejects(db.query('select admin_get_gps_device_diagnostics(30)'), /Admin privileges/);
        await db.exec(`set test.uid = '00000000-0000-0000-0000-000000000001'; set test.admin = 'no'`);
        await assert.rejects(db.query('select admin_get_gps_device_diagnostics(30)'), /Admin privileges/);
        await db.exec(`set test.admin = 'yes'`);
        await assert.rejects(db.query('select admin_get_gps_device_diagnostics(365)'), /Invalid period/);
        for (let i = 1; i <= 7; i++) {
            const id = `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`;
            await db.query(`insert into ride_summaries values ($1, now(), '[{"latitude":47.12345,"longitude":19.12345}]')`, [id]);
            if (i === 7) continue;
            const evidence = i <= 5 ? { schema_version: 1, observed_interval_count: 9, coverage: i === 2 ? 'partial' : 'complete', sample_gaps: i === 1 ? [{ start_ms: 1, end_ms: 40001 }] : [], dropped_gaps: 0 } : null;
            await db.query(`insert into ride_telemetry values ($1, 'TestMaker', 'TestModel', 'android', '16', '1.2', true, false, $2, '[]', 10, 8, '{"poor_accuracy":2,"teleport":0}', default)`, [id, evidence]);
        }
        const result = (await db.query('select admin_get_gps_device_diagnostics(30) as result')).rows[0].result;
        assert.equal(result.total_rides, 7);
        assert.equal(result.telemetry_rides, 6);
        const g = result.groups[0];
        assert.equal(g.rides, 6); assert.equal(g.measured_rides, 5); assert.equal(g.gap_rides, 1);
        assert.equal(g.partial_rides, 1); assert.equal(g.gap_percent, 20); assert.equal(g.accepted_percent, 80);
        assert.equal(g.poor_accuracy, 12); assert.equal(g.stale_gap, null);
        assert.equal(g.storage_mismatch_rides, 6);
        assert.equal(g.users, 1); assert.equal(g.measured_users, 1); assert.equal(g.gap_users, 1);
        await db.exec(`update ride_telemetry set user_id = '00000000-0000-0000-0000-000000000002'
          where ride_id = '00000000-0000-0000-0000-000000000002'`);
        const multipleUsers = (await db.query('select admin_get_gps_device_diagnostics(30) as result')).rows[0].result.groups[0];
        assert.equal(multipleUsers.users, 2); assert.equal(multipleUsers.measured_users, 2); assert.equal(multipleUsers.gap_users, 1);
        assert.doesNotMatch(JSON.stringify(result), /latitude|longitude|47\.12345|user_id|ride_id|start_ms/);
        assert.equal((await db.query('select count(*)::int as n from admin_audit_log')).rows[0].n, 2);
        assert.equal((await db.query(`select has_function_privilege('anon', 'admin_get_gps_device_diagnostics(integer)', 'execute') as allowed`)).rows[0].allowed, false);
        await db.exec(`update ride_telemetry set tracking_diagnostics = null, sample_count_total = null, sample_count_accepted = null`);
        const legacy = (await db.query('select admin_get_gps_device_diagnostics(30) as result')).rows[0].result.groups[0];
        assert.equal(legacy.gap_percent, null); assert.equal(legacy.accepted_percent, null);
        await db.exec(`update ride_telemetry set battery_saver_on = false, doze_whitelisted = null,
          model = 'OtherPhone', app_version = '2' where ride_id = '00000000-0000-0000-0000-000000000001'`);
        const split = (await db.query('select admin_get_gps_device_diagnostics(30) as result')).rows[0].result;
        assert.equal(split.groups.length, 2);
        assert.deepEqual(split.groups.map(g => g.rides).sort(), [1, 5]);
        await db.exec(`update ride_summaries set started_at = now() - interval '40 days'`);
        const empty = (await db.query('select admin_get_gps_device_diagnostics(30) as result')).rows[0].result;
        assert.equal(empty.total_rides, 0); assert.deepEqual(empty.groups, []);
        assert.equal((await db.query('select admin_get_gps_device_diagnostics(90) as result')).rows[0].result.total_rides, 7);
    } finally { await db.close(); }
});
