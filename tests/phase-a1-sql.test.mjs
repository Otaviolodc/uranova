import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {database,migrate,as,A,B} from './phase-a-database.mjs';
test('A1: additive migration, distributed counters and advisor hardening',async t=>{
 const db=await database();
 try{
  await migrate(db);
  const before=(await db.query('SELECT to_jsonb(p) row FROM payments p ORDER BY id')).rows;
  await db.exec('BEGIN;'+readFileSync(new URL('../supabase/migrations/20261007171001_phase_a1_distributed_limits_and_advisors.sql',import.meta.url),'utf8')+'COMMIT;');
  const key='a'.repeat(64);
  await t.test('shared atomic admission and independent principals',async()=>{
   const results=await Promise.all(Array.from({length:6},()=>db.query("SELECT phase_a1_consume_rate_limit('payout',$1) v",[key])));
   assert.equal(results.filter(r=>r.rows[0].v.allowed).length,5);
   assert.ok(results[5].rows[0].v.retry_after>0);
   assert.equal((await as(db,'service_role',null,"SELECT phase_a1_consume_rate_limit('payout',$1) v",['b'.repeat(64)])).rows[0].v.allowed,true);
  });
  await t.test('hour quota, expiry and reset use database clock',async()=>{
   await db.exec("UPDATE account_security.rate_limit_buckets SET minute_start=date_trunc('minute',clock_timestamp())-interval '1 minute',hour_count=20 WHERE scope='payout'");
   assert.equal((await db.query("SELECT phase_a1_consume_rate_limit('payout',$1) v",[key])).rows[0].v.allowed,false);
   await db.exec("UPDATE account_security.rate_limit_buckets SET minute_start=clock_timestamp()-interval '2 hours',hour_start=clock_timestamp()-interval '2 hours'");
   assert.equal((await db.query("SELECT phase_a1_consume_rate_limit('payout',$1) v",[key])).rows[0].v.allowed,true);
  });
  await t.test('anonymous/authenticated cannot call RPC, read or reset counters',async()=>{
   for(const role of ['anon','authenticated']){
    await assert.rejects(as(db,role,A,"SELECT phase_a1_consume_rate_limit('payout',$1)",[key]),/permission denied/);
    await assert.rejects(as(db,role,A,'SELECT * FROM account_security.rate_limit_buckets'),/permission denied/);
    await assert.rejects(as(db,role,A,'DELETE FROM account_security.rate_limit_buckets'),/permission denied/);
   }
   await assert.rejects(db.query("SELECT phase_a1_consume_rate_limit('unknown',$1)",[key]),/Unknown rate scope/);
   await assert.rejects(db.query("SELECT phase_a1_consume_rate_limit('payout','raw-ip')"),/Invalid rate principal/);
  });
  await t.test('direct support inserts share quota across tables; forged owner denied',async()=>{
   const insert=()=>as(db,'authenticated',A,'INSERT INTO support_messages(user_id,message) VALUES($1,$2)',[A,'fixture']);
   for(let i=0;i<5;i++)await insert();
   await assert.rejects(as(db,'authenticated',A,"INSERT INTO support_feedback(user_id,rating) VALUES($1,5)",[A]),e=>{
    assert.equal(e.code,'PGRST');const d=JSON.parse(e.detail);assert.equal(d.status,429);assert.ok(Number(d.headers['Retry-After'])>0);return true;
   });
   await assert.rejects(as(db,'authenticated',A,"INSERT INTO support_messages(user_id,message) VALUES($1,'spoof')",[B]),/ownership/);
   assert.equal((await db.query('SELECT count(*)::int n FROM support_messages')).rows[0].n,5);
  });
  await t.test('hardened signup trigger still creates profile and preservation identity',async()=>{
   const id='90000000-0000-4000-8000-000000000009';
   await db.query("INSERT INTO auth.users(id,email) VALUES($1,'new@example.invalid')",[id]);
   assert.equal((await db.query('SELECT count(*)::int n FROM profiles WHERE id=$1',[id])).rows[0].n,1);
   assert.equal((await db.query('SELECT count(*)::int n FROM financial_identities WHERE id=$1',[id])).rows[0].n,1);
   for(const name of ['handle_new_user','increment_clicks']){
    assert.equal((await db.query("SELECT has_function_privilege('authenticated',p.oid,'EXECUTE') allowed FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND proname=$1",[name])).rows[0].allowed,false);
   }
   const funcs=(await db.query("SELECT proconfig FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND proname IN ('update_updated_at','handle_new_user','increment_clicks')")).rows;
   assert.equal(funcs.length,3);for(const f of funcs)assert.ok(f.proconfig.some(x=>x.startsWith('search_path=')));
  });
  await t.test('intentional public views expose only projection; no write privileges',async()=>{
   assert.ok((await as(db,'anon',null,'SELECT username FROM public_profiles')).rows.length);
   for(const sql of ['SELECT phone FROM public_profiles','SELECT stripe_account_id FROM public_profiles','SELECT file_url FROM public_checkouts'])await assert.rejects(as(db,'anon',null,sql),/does not exist/);
   await assert.rejects(as(db,'anon',null,"UPDATE public_profiles SET username='spoof'"),/permission denied/);
  });
  await t.test('financial rows and five legacy payments unchanged',async()=>assert.deepEqual((await db.query('SELECT to_jsonb(p) row FROM payments p ORDER BY id')).rows,before));
 }finally{await db.close()}
});
