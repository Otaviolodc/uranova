import {test} from 'node:test';
import assert from 'node:assert/strict';
import {database,migrate,as,A,B,P} from './phase-a-database.mjs';
test('Phase A: migrations on captured schema and isolated fictitious rows',async t=>{
 const db=await database();
 try {
  const before=(await db.query('SELECT to_jsonb(p) row FROM payments p ORDER BY id')).rows;
  await migrate(db);
  await t.test('22: five legacy rows logically identical',async()=>assert.deepEqual((await db.query('SELECT to_jsonb(p) row FROM payments p ORDER BY id')).rows,before));
  await t.test('01: empty account denied safely; no external-checkout proof',async()=>{await assert.rejects(db.query('DELETE FROM auth.users WHERE id=$1',[A]),/preservation review/);assert.equal((await db.query('SELECT count(*)::int n FROM auth.users')).rows[0].n,2);});
  for(const [n,sql] of [
   ['02 buyer/payment',`INSERT INTO payments(user_id,customer_id,status,value) VALUES('${B}','${A}','PAID',10)`],
   ['03 entitlement',`INSERT INTO customer_products(customer_id,product_id,status) VALUES('${A}','${P}','active')`],
   ['04 producer/product',`INSERT INTO products(user_id,title) VALUES('${A}','own')`],
   ['05 balance',`INSERT INTO balances(user_id) VALUES('${A}') ON CONFLICT DO NOTHING`],
   ['06 ledger',`INSERT INTO financial_transactions(user_id,type,amount) VALUES('${A}','sale',10)`],
   ['07 request',`INSERT INTO withdraw_requests(user_id,amount,pix_key,pix_key_type) VALUES('${A}',1,'fixture','email')`],
   ['08 withdrawal',`INSERT INTO withdrawals(user_id,amount,pix_key,pix_type) VALUES('${A}',1,'fixture','email')`],
   ['09 support',`INSERT INTO support_messages(user_id,message) VALUES('${A}','evidence')`],
  ])await t.test(n+' blocks identity deletion',async()=>{await db.exec(sql);await assert.rejects(db.query('DELETE FROM profiles WHERE id=$1',[A]),/preservation review/);await assert.rejects(db.query('DELETE FROM auth.users WHERE id=$1',[A]),/preservation review/);});
  await t.test('10/11/25: cross-owner update/delete denied',async()=>{for(const sql of ['UPDATE products SET title=\'stolen\' WHERE id=$1 RETURNING id','DELETE FROM products WHERE id=$1 RETURNING id'])assert.equal((await as(db,'authenticated',A,sql,[P])).rows.length,0);});
  await t.test('12: links and tracking owner protections',async()=>{await db.query("INSERT INTO links(user_id,title,slug,affiliate_url) VALUES($1,'fixture','test-link','https://example.invalid')",[B]);assert.equal((await as(db,'authenticated',A,"UPDATE links SET affiliate_url='https://bad.invalid' WHERE slug='test-link' RETURNING id")).rows.length,0);await assert.rejects(as(db,'authenticated',B,"UPDATE links SET clicks=99 WHERE slug='test-link'"),/counter/i);await as(db,'service_role',null,"SELECT track_click_with_date('test-link')");assert.equal((await db.query("SELECT clicks FROM links WHERE slug='test-link'")).rows[0].clicks,1);});
  await t.test('13: anon writes denied',async()=>{for(const table of ['products','links'])await assert.rejects(as(db,'anon',null,`DELETE FROM ${table}`),/permission denied/);});
  await t.test('14: private profile hidden, public projection works',async()=>{await assert.rejects(as(db,'anon',null,'SELECT phone FROM profiles'),/permission denied/);assert.equal((await as(db,'anon',null,'SELECT username FROM public_profiles')).rows.length,2);await assert.rejects(as(db,'anon',null,'SELECT stripe_account_id FROM public_profiles'),/does not exist/);assert.equal((await as(db,'authenticated',A,'SELECT id FROM profiles')).rows.length,1);});
  await t.test('15/18: authenticated cannot directly read or write paid storage',async()=>{await db.query("INSERT INTO storage.objects(bucket_id,name,owner_id) VALUES('products','fixture.pdf',$1)",[B]);assert.equal((await as(db,'authenticated',A,"SELECT * FROM storage.objects WHERE bucket_id='products'")).rows.length,0);await assert.rejects(as(db,'authenticated',A,"INSERT INTO storage.objects(bucket_id,name) VALUES('products','injected.pdf')"),/row-level security/);assert.equal((await as(db,'authenticated',A,"DELETE FROM storage.objects RETURNING id")).rows.length,0);await assert.rejects(as(db,'authenticated',A,'SELECT phase_a_file_owned($1,$2)',['fixture.pdf',B]),/permission denied/);});
  await t.test('17: server validates true owner, rejects claimed owner',async()=>{assert.equal((await as(db,'service_role',null,'SELECT phase_a_file_owned($1,$2) owned',['fixture.pdf',B])).rows[0].owned,true);assert.equal((await as(db,'service_role',null,'SELECT phase_a_file_owned($1,$2) owned',['fixture.pdf',A])).rows[0].owned,false);});
  await t.test('19/20/21: closure cannot race or partially delete',async()=>{await assert.rejects(as(db,'service_role',null,'DELETE FROM analytics WHERE user_id=$1',[A]),/permission denied/);await assert.rejects(db.query('DELETE FROM auth.users WHERE id=$1',[B]),/preservation review/);assert.deepEqual((await db.query('SELECT to_jsonb(p) row FROM payments p WHERE customer_id IS NULL ORDER BY id')).rows,before);});
  await t.test('negative: role escalation and ownership reassignment',async()=>{await assert.rejects(as(db,'authenticated',A,"UPDATE profiles SET role='admin' WHERE id=$1",[A]),/Protected profile fields/);await assert.rejects(as(db,'authenticated',B,'UPDATE products SET user_id=$1 WHERE id=$2',[A,P]),/row-level security/);});
  await t.test('negative: product_id reassignment, paid checkout projection and parent ownership',async()=>{
   const ownProduct='50000000-0000-4000-8000-000000000005',checkout='60000000-0000-4000-8000-000000000006';
   await as(db,'authenticated',A,'INSERT INTO products(id,user_id,title) VALUES($1,$2,$3)',[ownProduct,A,'own fixture']);
   await as(db,'authenticated',A,"INSERT INTO products_checkout(id,user_id,product_id,title,checkout_slug,status,is_active) VALUES($1,$2,$3,'owned','owned-checkout','active',true)",[checkout,A,ownProduct]);
   await assert.rejects(as(db,'authenticated',A,'UPDATE products_checkout SET product_id=$1 WHERE id=$2',[P,checkout]),/row-level security/);
   await assert.rejects(as(db,'authenticated',A,"INSERT INTO course_modules(user_id,course_id,title) VALUES($1,$2,'injected')",[A,P]),/row-level security/);
   assert.equal((await as(db,'authenticated',B,'SELECT id FROM products_checkout WHERE id=$1',[checkout])).rows.length,0);
   assert.equal((await as(db,'anon',null,'SELECT id FROM public_checkouts WHERE id=$1',[checkout])).rows.length,1);
   await assert.rejects(as(db,'anon',null,'SELECT file_url FROM public_checkouts'),/does not exist/);
   await assert.rejects(as(db,'authenticated',A,"UPDATE subscriptions SET status='active' WHERE user_id=$1",[A]),/permission denied/);
  });
  await t.test('20: verified settlement, replay and simultaneous closure preserve consistency',async()=>{
   const checkout='40000000-0000-4000-8000-000000000004';
   await db.query("UPDATE profiles SET stripe_account_id='acct_fixture' WHERE id=$1",[B]);
   await db.query("INSERT INTO products_checkout(id,user_id,product_id,title,price,checkout_slug) VALUES($1,$2,$3,'fixture',100,'fixture-sale')",[checkout,B,P]);
   const sale={seller_id:B,customer_id:A,product_id:P,checkout_id:checkout,account_id:'acct_fixture',session_id:'cs_fixture',intent_id:'pi_fixture',charge_id:'ch_fixture',transaction_id:'txn_fixture',gross:10000,platform_fee:1000,stripe_fee:438,producer_net:8562,currency:'brl',livemode:true,available_on:'2020-01-01T00:00:00Z',paid_at:'2020-01-01T00:00:00Z'};
   const results=await Promise.allSettled([db.query('SELECT settle_stripe_sale($1::jsonb) id',[JSON.stringify(sale)]),db.query('DELETE FROM auth.users WHERE id=$1',[B])]);
   assert.equal(results[0].status,'fulfilled');assert.equal(results[1].status,'rejected');
   const replay=await db.query('SELECT settle_stripe_sale($1::jsonb) id',[JSON.stringify(sale)]);
   assert.equal(replay.rows[0].id,results[0].value.rows[0].id);
   assert.equal((await db.query('SELECT count(*)::int n FROM payments WHERE finance_verified')).rows[0].n,1);
   assert.deepEqual((await db.query('SELECT to_jsonb(p) row FROM payments p WHERE NOT finance_verified AND customer_id IS NULL ORDER BY id')).rows,before);
  });
 }finally{await db.close();}
});
