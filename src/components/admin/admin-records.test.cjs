/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node test runner. */
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const ts = require('typescript');
function load(file,mocks={}) {
    const exports={};
    const code=ts.transpileModule(readFileSync(`${__dirname}/${file}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    runInNewContext(code,{exports,require:name=>mocks[name]||require(name),Uint8Array,DataView,Date,Set,Number});
    return exports;
}
const model=load('adminRecordModel');
const {applyRecordAction}=load('adminRecordMutations',{'./adminRecordModel':model});
test('bulk controls are absent until a visible record is selected, including read-only exports',()=>{
    const React=require('react');
    const {renderToStaticMarkup}=require('react-dom/server');
    const exports={};
    const code=ts.transpileModule(readFileSync(`${__dirname}/AdminRecordBrowser.tsx`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    runInNewContext(code,{exports,require:name=>name==='./adminRecordModel'?model:name.endsWith('.module.css')?{default:new Proxy({},{get:(_,key)=>key})}:name==='@/components/ui/ImageWithFallback'?{ImageWithFallback:props=>React.createElement('img',props)}:name==='@/components/ui/avatar'?{Avatar:props=>React.createElement('span',props),AvatarImage:props=>React.createElement('img',props),AvatarFallback:props=>React.createElement('span',props)}:require(name)});
    const props={kind:'feedback',rows:[{id:'visible',title:'Teszt',status:'open'}],title:'Visszajelzések',total:1,onSelect(){},page:1,pages:1,pageSize:20,onPage(){},onPageSize(){},onAction:async()=>{}};
    const render=(selected,extra={})=>renderToStaticMarkup(React.createElement(exports.default,{...props,selected:new Set(selected),...extra}));
    for(const html of [render([]),render(['hidden'])]){
        assert.doesNotMatch(html,/Tömeges művelet|Jelölj ki rekordokat|CSV|Alkalmazás/);
    }
    assert.match(render(['visible']),/Tömeges művelet/);
    assert.match(render(['visible']),/>CSV</);
    const readOnly=render(['visible'],{kind:'audit_log',onAction:undefined});
    assert.match(readOnly,/>CSV</);assert.doesNotMatch(readOnly,/Tömeges művelet|Alkalmazás/);
    const audit=render([],{kind:'audit_log',onAction:undefined,rows:[{
        id:'audit-123',action:'view_exact_ride_route',admin_id:'admin-456',
        profiles:{username:'Teszt Admin'},target_type:'ride',target_id:'ride-789',
        created_at:'2026-10-24T10:23:45Z',
        notes:'Pontos rögzített és finomított GPS-útvonal megtekintve. Admin indoklása: gyenge gps',
    }]});
    assert.match(audit,/Pontos GPS-útvonal megtekintése/);
    assert.match(audit,/<summary>Bejegyzés részletei<\/summary>/);
    assert.match(audit,/<dt>Végrehajtó admin<\/dt><dd>Teszt Admin<\/dd>/);
    assert.match(audit,/<dt>Érintett rekord azonosítója<\/dt><dd>ride-789<\/dd>/);
    assert.match(audit,/Admin indoklása: gyenge gps/);
    assert.match(audit,/23:45/);
});
function backend(failedIds=[],rpcError=false){
    const writes=[],audits=[];let active=0,maxActive=0;
    return {writes,audits,get maxActive(){return maxActive;},audit:async entry=>audits.push(entry),client:{
        from:table=>({update:payload=>({eq:(_key,id)=>({select:()=>({single:async()=>{
            active++;maxActive=Math.max(maxActive,active);await new Promise(resolve=>setImmediate(resolve));active--;
            writes.push({table,id,payload});return failedIds.includes(id)?{data:null,error:{message:'Denied'}}:{data:{id},error:null};
        }})})})}),
        rpc:async(name,args)=>{writes.push({name,args});return {data:rpcError?{error:'Not allowed'}:{success:true},error:null};},
    }};
}
test('bulk writes report partial failure and only successful records are audited',async()=>{
    const b=backend(['b']);const result=await applyRecordAction(b.client,b.audit,'community_routes',['a','b','a','c'],'accepted','admin');
    assert.deepEqual(Array.from(result.succeeded).sort(),['a','c']);assert.deepEqual(Array.from(result.failed),['b']);
    assert.equal(b.writes.length,3);assert.ok(b.writes.every(write=>write.table==='community_bike_lanes'&&write.payload.status==='accepted'));
    assert.deepEqual(b.audits.map(entry=>entry.targetId).sort(),['a','c']);
});
test('RLS zero-row updates are failures rather than false successes',async()=>{
    const b=backend(['locked']);const result=await applyRecordAction(b.client,b.audit,'users',['locked'],'banned','admin');
    assert.equal(result.succeeded.length,0);assert.equal(result.failed[0],'locked');assert.equal(b.audits.length,0);
});
test('image approvals and supporter changes retain their RPC side effects and surface RPC failures',async()=>{
    const b=backend([],true);
    const result=await applyRecordAction(b.client,b.audit,'parking_images',['image'],'approved','admin');
    assert.equal(b.writes[0].name,'parking_image_submission_set_status');assert.equal(b.writes[0].args.p_submission_id,'image');assert.equal(result.failed[0],'image');
    await applyRecordAction(b.client,b.audit,'users',['user'],'grant_supporter','admin');assert.equal(b.writes[1].name,'set_supporter_status');assert.equal(b.audits.length,0);
});
test('invalid statuses, self-ban, read-only records and excessive batches never reach the backend',async()=>{
    const b=backend();
    for(const args of [['users',['admin'],'banned'],['poi_flags',['a'],'rejected'],['audit_log',['a'],'closed'],['parking_images',['a'],'pending'],['parking',Array.from({length:101},(_,i)=>String(i)),'available']]){
        await assert.rejects(()=>applyRecordAction(b.client,b.audit,...args,'admin'));
    }
    assert.equal(b.writes.length,0);
});
test('large batches cap parallel writes and map boolean fields correctly',async()=>{
    const b=backend();await applyRecordAction(b.client,b.audit,'parking',Array.from({length:17},(_,i)=>String(i)),'unavailable','admin');
    assert.ok(b.maxActive<=4);assert.ok(b.writes.every(write=>write.payload.available===false));
    await applyRecordAction(b.client,b.audit,'cities',['city'],'inactive','admin');assert.equal(b.writes.at(-1).payload.is_active,false);
    await applyRecordAction(b.client,b.audit,'leaderboard',['person'],'hidden','admin');assert.equal(b.writes.at(-1).payload.show_on_regional_leaderboard,false);assert.equal(b.audits.at(-1).action,'regional_visibility_off');
});
test('CSV escapes spreadsheet formulas, delimiters and quotes',()=>{
    const csv=model.recordCsv('users',[{id:'a',username:'=HYPERLINK("bad")',created_at:null},{id:'b',username:'+CMD;quoted'}]);
    assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"\'=HYPERLINK(""bad"")"'));assert.ok(csv.includes('"\'+CMD;quoted"'));
});
test('audit notes preserve stored reasons and support legacy GPS actions and unknown action codes',()=>{
    const notes='Többsoros indoklás\nGPS pontosság ellenőrzése';
    for(const action of ['view_exact_ride_route','view_user_ride_metrics','future_action']){
        assert.equal(model.recordMetadata('audit_log',{id:'a',action,notes}),notes);
    }
    assert.match(model.recordMetadata('audit_log',{id:'a',action:'view_ride_location',notes:'gyenge gps'}),/Admin indoklása: gyenge gps/);
    assert.equal(model.recordTitle('audit_log',{id:'a',action:'future_action'}),'future_action');
    assert.equal(model.auditActor({id:'a',admin_id:'full-admin-id'}),'full-admin-id');
});
test('coordinates reject missing, blank and out-of-range values while accepting GeoJSON and PostGIS EWKB',()=>{
    for(const row of [{lat:null,lon:null},{lat:'',lon:''},{lat:91,lon:19},{coordinate:'broken'}])assert.equal(model.recordCoordinates(row),null);
    assert.equal(model.recordCoordinates({coordinate:{type:'Point',coordinates:[19,47]}}).lat,47);
    const bytes=Buffer.alloc(25);bytes.writeUInt8(1,0);bytes.writeUInt32LE(0x20000001,1);bytes.writeUInt32LE(4326,5);bytes.writeDoubleLE(19,9);bytes.writeDoubleLE(47,17);
    assert.equal(model.recordCoordinates({coordinate:bytes.toString('hex')}).lon,19);
});
