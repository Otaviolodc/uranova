// Explicit local-only integration runner. Requires a dedicated synthetic cluster.
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const exe='C:/Program Files/PostgreSQL/17/bin/psql.exe';
function run(sql,name='v447_observer') {
  const child=spawn(exe,['-X','-w','-h','127.0.0.1','-p','55447','-U','v447_admin','-d','postgres','-At','-v','ON_ERROR_STOP=1','-f','-'],
    {windowsHide:true,env:{...process.env,PGAPPNAME:name}});
  let out='',err='',readyResolve;
  const ready=new Promise(resolve=>{readyResolve=resolve;});
  child.stdout.on('data',d=>{out+=d;if(out.includes('V447_READY'))readyResolve();});
  child.stderr.on('data',d=>{err+=d;});
  const done=new Promise((resolve,reject)=>{
    child.on('error',reject);
    child.on('close',code=>code===0?resolve(out.trim()):reject(new Error(err.trim())));
  });
  child.stdin.end(sql);return {ready,done};
}
const sql=q=>run(q).done;
const json=async q=>JSON.parse(await sql(q));
assert.equal(await sql("SELECT current_user||':'||host(inet_server_addr())||':'||inet_server_port();"),'v447_admin:127.0.0.1:55447');
assert.equal(await sql("SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r';"),'0');
await sql(readFileSync(new URL('./fixtures/finance-schema.sql',import.meta.url),'utf8'));
await sql(readFileSync(new URL('../supabase/migrations/20260914204949_official_finance.sql',import.meta.url),'utf8'));
await sql('GRANT ALL ON products,products_checkout TO authenticated; REVOKE DELETE ON profiles FROM authenticated;');
const snapshot=`SELECT json_agg(x ORDER BY t,r,p) FROM (SELECT t,r,p,has_table_privilege(r,t,p) allowed
 FROM unnest(ARRAY['profiles','products','products_checkout']) t
 CROSS JOIN unnest(ARRAY['authenticated','anon','service_role']) r
 CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p) x;`;
const before=await json(snapshot);
const migration=readFileSync(new URL('../supabase/archive/20261120011844_financial_auxiliary_acl_v446.sql',import.meta.url),'utf8');
await sql(migration);
const after=await json(snapshot);
const target=x=>x.r==='authenticated'&&['TRUNCATE','REFERENCES','TRIGGER'].includes(x.p);
assert.deepEqual(after.filter(x=>!target(x)),before.filter(x=>!target(x)));
assert.equal(after.filter(target).length,9);assert.ok(after.filter(target).every(x=>!x.allowed));
// Explicit post-COMMIT rollback for this synthetic baseline only.
await sql('GRANT TRUNCATE,REFERENCES,TRIGGER ON profiles,products,products_checkout TO authenticated;');
assert.deepEqual(await json(snapshot),before);
await sql(migration);
console.log('PASS: exact nine grants revoked; DML, service_role and MAINTAIN preserved; rollback restores baseline');
await assert.rejects(sql("SET ROLE authenticated; UPDATE profiles SET stripe_account_id='acct_forbidden';"),/Protected profile fields/);
console.log('PASS: existing financial profile trigger still enforces account routing');
const sale={seller_id:'00000000-0000-4000-8000-000000000001',customer_id:'00000000-0000-4000-8000-000000000002',
 product_id:'00000000-0000-4000-8000-000000000003',checkout_id:'00000000-0000-4000-8000-000000000004',
 account_id:'acct_seller',session_id:'cs_v447',intent_id:'pi_v447',charge_id:'ch_v447',transaction_id:'txn_v447',
 gross:10000,platform_fee:1000,stripe_fee:438,producer_net:8562,currency:'brl',livemode:true,
 available_on:'2020-01-01T00:00:00Z',paid_at:'2020-01-01T00:00:00Z'};
const settle=p=>`SELECT settle_stripe_sale('${JSON.stringify(p)}'::jsonb);`;
async function race(a,b,label) {
  const first=run(`BEGIN; SET LOCAL ROLE service_role; ${a} SELECT 'V447_READY'; SELECT pg_sleep(3); COMMIT;`,'v447_first');
  await Promise.race([first.ready,first.done.then(()=>{throw Error('Missing ready marker');})]);
  const second=run(`BEGIN; SET LOCAL ROLE service_role; ${b} COMMIT;`,'v447_second');
  let blocked=false;
  for(let i=0;i<20;i++) {
    const evidence=await json(`SELECT json_build_object('sessions',count(DISTINCT pid),'blocked',bool_or(wait_event_type='Lock'))
      FROM pg_stat_activity WHERE application_name IN ('v447_first','v447_second');`);
    if(evidence.sessions===2&&evidence.blocked){blocked=true;break;}
    await new Promise(resolve=>setTimeout(resolve,50));
  }
  const result=await Promise.all([first.done,second.done]);
  assert.ok(blocked,'Independent sessions must exhibit real PostgreSQL lock contention');
  console.log(`PASS: ${label}; two distinct backend sessions and lock wait observed`);
  return result;
}
await race(settle(sale),settle(sale),'duplicate sale');
assert.equal(await sql('SELECT count(*) FROM payments;'),'1');
assert.equal(await sql('SELECT count(*) FROM orders;'),'1');
const other=n=>({...sale,session_id:`cs_${n}`,intent_id:`pi_${n}`,charge_id:`ch_${n}`,transaction_id:`txn_${n}`});
await race(settle(other(2)),settle(other(3)),'two purchases of same product');
assert.equal(await sql('SELECT count(*) FROM customer_products;'),'1');
assert.equal(await sql('SELECT count(*) FROM payments;'),'3');
assert.equal(await sql('SELECT count(*) FROM orders;'),'3');
assert.equal(Number(await sql('SELECT total_earned FROM balances;')),256.86);
await assert.rejects(sql(settle({...sale,stripe_fee:439,producer_net:8561})),/Conflicting duplicate payment/);
await sql("ALTER TABLE customer_products ADD CONSTRAINT v447_synthetic_failure CHECK(status<>'active') NOT VALID;");
await assert.rejects(sql(settle(other(4))),/v447_synthetic_failure/);
assert.equal(await sql('SELECT count(*) FROM payments;'),'3');
assert.equal(await sql('SELECT count(*) FROM orders;'),'3');
assert.equal(Number(await sql('SELECT total_earned FROM balances;')),256.86);
console.log('PASS: conflicting duplicate and entitlement failure roll back orders/payments/credits');
const claim=token=>`SELECT claim_stripe_event('evt_v447','charge.succeeded','acct_seller','${token}');`;
const lease=await race(claim('10000000-0000-4000-8000-000000000001'),claim('10000000-0000-4000-8000-000000000002'),'same-event lease');
assert.match(lease[0],/claimed/);assert.match(lease[1],/busy/);
console.log('PASS: financial isolated validation complete; no remote connection used');
