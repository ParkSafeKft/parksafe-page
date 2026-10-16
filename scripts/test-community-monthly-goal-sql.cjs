/* eslint-disable @typescript-eslint/no-require-imports -- Standalone, in-memory PostgreSQL integration test. */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { PGlite } = require('@electric-sql/pglite');

async function main() {
    const db = new PGlite();
    try {
        await db.exec(`
            create role anon; create role authenticated; create role service_role;
            create schema auth;
            create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
            grant usage on schema auth to authenticated;
            create table public.profiles (id uuid primary key, role text);
            insert into public.profiles values ('00000000-0000-0000-0000-000000000001', 'admin'), ('00000000-0000-0000-0000-000000000002', 'user');
            create table public.ride_summaries (distance_meters integer, started_at timestamptz, kind text);
            create table public.admin_audit_log (id uuid default gen_random_uuid(), admin_id uuid not null, action text not null, target_type text not null, target_id uuid not null, notes text);
        `);
        await db.exec(readFileSync(resolve(__dirname, '../../parksafe/supabase/migrations/20261009120000_community_monthly_goal.sql'), 'utf8'));
        const original = (await db.query(`select pg_get_functiondef('public.get_current_community_monthly_goal()'::regprocedure) as body`)).rows[0].body;
        await db.exec(readFileSync(resolve(__dirname, '../supabase/migrations/20261016120000_admin_community_monthly_goal.sql'), 'utf8'));
        assert.equal((await db.query(`select pg_get_functiondef('public.get_current_community_monthly_goal()'::regprocedure) as body`)).rows[0].body, original);
        const month = (await db.query(`select date_trunc('month', now() at time zone 'Europe/Budapest')::date::text as value`)).rows[0].value;
        await db.exec(`set role authenticated; set test.uid = '00000000-0000-0000-0000-000000000002'`);
        await assert.rejects(db.query(`select public.admin_get_community_monthly_goal($1)`, [month]), /Admin access/);
        await assert.rejects(db.query(`select public.admin_set_community_monthly_goal($1,4000000,true,null)`, [month]), /Admin access/);
        await assert.rejects(db.query(`select * from public.community_monthly_goals`), /permission denied/);
        await db.exec(`set test.uid = '00000000-0000-0000-0000-000000000001'`);
        assert.equal((await db.query(`select public.admin_get_community_monthly_goal($1) as value`, [month])).rows[0].value, null);
        const created = (await db.query(`select public.admin_set_community_monthly_goal($1,4000000,true,null) as value`, [month])).rows[0].value;
        assert.equal(created.target_meters, 4000000); assert.equal(created.enabled, true);
        const mobile = (await db.query(`select public.get_current_community_monthly_goal() as value`)).rows[0].value;
        assert.equal(mobile.target_distance_meters, 4000000); assert.equal(mobile.total_distance_meters, 0);
        await assert.rejects(db.query(`select public.admin_set_community_monthly_goal($1,5000000,true,null)`, [month]), /Goal changed/);
        await assert.rejects(db.query(`select public.admin_set_community_monthly_goal($1,0,true,$2)`, [month, created.updated_at]), /Invalid goal/);
        await assert.rejects(db.query(`select public.admin_set_community_monthly_goal('2000-01-01',4000000,true,null)`), /Invalid goal/);
        const updated = (await db.query(`select public.admin_set_community_monthly_goal($1,5000000,false,$2) as value`, [month, created.updated_at])).rows[0].value;
        assert.equal(updated.enabled, false); assert.equal(updated.target_meters, 5000000);
        assert.equal((await db.query(`select public.get_current_community_monthly_goal() as value`)).rows[0].value.enabled, false);
        await assert.rejects(db.query(`select public.admin_set_community_monthly_goal($1,6000000,true,$2)`, [month, created.updated_at]), /Goal changed/);
        await db.exec(`reset role`);
        const audit = (await db.query(`select * from public.admin_audit_log`)).rows;
        assert.equal(audit.length, 2); assert.equal(JSON.parse(audit[1].notes).before.target_meters, 4000000);
        assert.equal(JSON.parse(audit[1].notes).after.target_meters, 5000000);
        const grants = (await db.query(`select has_function_privilege('anon','public.admin_get_community_monthly_goal(date)','EXECUTE') as anon, has_table_privilege('authenticated','public.community_monthly_goals','UPDATE') as writes`)).rows[0];
        assert.equal(grants.anon, false); assert.equal(grants.writes, false);
        await db.exec(`alter table public.admin_audit_log add constraint fail_audit check (action <> 'set_community_monthly_goal') not valid; set role authenticated`);
        await assert.rejects(db.query(`select public.admin_set_community_monthly_goal($1,6000000,true,$2)`, [month, updated.updated_at]), /fail_audit/);
        assert.equal((await db.query(`select public.admin_get_community_monthly_goal($1) as value`, [month])).rows[0].value.target_meters, 5000000);
        console.log('PASS: isolated PostgreSQL role checks, create/update, stale writes, invalid inputs, mobile compatibility, atomic audit rollback and unchanged grants/mobile RPC.');
    } finally { await db.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
