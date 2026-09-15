import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { directChargeAmounts, priceToCents, platformFeeCents } from '../src/lib/finance/money.ts';

const seller='00000000-0000-4000-8000-000000000001';
const sale = { seller_id:seller,customer_id:'00000000-0000-4000-8000-000000000002',
 product_id:'00000000-0000-4000-8000-000000000003',checkout_id:'00000000-0000-4000-8000-000000000004',
 account_id:'acct_seller',session_id:'cs_live_fixture',intent_id:'pi_fixture',charge_id:'ch_fixture',transaction_id:'txn_fixture',
 gross:10000,platform_fee:1000,stripe_fee:438,producer_net:8562,currency:'brl',livemode:true,
 available_on:'2020-01-01T00:00:00Z',paid_at:'2020-01-01T00:00:00Z' };
const settle=(db,p=sale)=>db.query('select settle_stripe_sale($1::jsonb) id',[JSON.stringify(p)]);
async function database() {
 const db=new PGlite();
 await db.exec(readFileSync(new URL('./fixtures/finance-schema.sql',import.meta.url),'utf8'));
 await db.exec(readFileSync(new URL('../supabase/migrations/20260913014834_official_finance.sql',import.meta.url),'utf8').replace(/^\uFEFF/,''));
 return db;
}
const sync=(db)=>db.query('select sync_finance_balance($1,$2,8562,0,now())',[seller,'acct_seller']);

test('centavos: 100 reais, 10% intactos, Stripe 4,38 e produtor 85,62',()=>{
 assert.deepEqual(directChargeAmounts(10000,1000,{amount:10000,fee:1438,net:8562,currency:'brl',
 fee_details:[{amount:1000,type:'application_fee',currency:'brl'},{amount:438,type:'stripe_fee',currency:'brl'}]}),
 {gross:10000,platformFee:1000,stripeFee:438,producerNet:8562});
 assert.equal(priceToCents('85.62'),8562);
 assert.equal(platformFeeCents(10005),1001);
 assert.throws(()=>priceToCents('1.005'));
 assert.throws(()=>directChargeAmounts(10000,1000,{amount:10000,fee:1438,net:8562,currency:'brl',fee_details:[]}));
});

test('migration preserva snapshot legado; venda atômica, idempotência e saque concorrente',async()=>{
 const db=await database();
 try {
  const legacy=(await db.query('select available_balance,pending_balance,legacy_snapshot from balances')).rows[0];
  assert.equal(Number(legacy.available_balance),0);
  assert.equal(legacy.legacy_snapshot.pending_balance,-121.82);
  const results=await Promise.all([settle(db),settle(db)]);
  assert.equal(results[0].rows[0].id,results[1].rows[0].id);
  for(const table of ['orders','payments','customer_products']) assert.equal((await db.query('select count(*)::int n from '+table)).rows[0].n,1);
  const p=(await db.query('select * from payments')).rows[0];
  assert.equal(Number(p.platform_fee_cents),1000);assert.equal(Number(p.stripe_fee_cents),438);assert.equal(Number(p.producer_net_cents),8562);
  await sync(db);
  assert.equal(Number((await db.query('select available_balance from balances')).rows[0].available_balance),85.62);
  await assert.rejects(db.query('select reserve_stripe_payout($1,$2,8563)',[seller,'10000000-0000-4000-8000-000000000001']),/Insufficient/);
  const concurrent=await Promise.allSettled([
    db.query('select reserve_stripe_payout($1,$2,8000)',[seller,'10000000-0000-4000-8000-000000000002']),
    db.query('select reserve_stripe_payout($1,$2,8000)',[seller,'10000000-0000-4000-8000-000000000003']),
  ]);
  assert.equal(concurrent.filter(x=>x.status==='fulfilled').length,1);
  assert.equal(Number((await db.query('select available_balance from balances')).rows[0].available_balance),5.62);
 } finally { await db.close(); }
});

test('produto inválido, test mode, moeda e duplicata conflitante não movimentam dinheiro',async()=>{
 const db=await database();
 try {
  await assert.rejects(settle(db,{...sale,product_id:'00000000-0000-4000-8000-000000000099'}),/Invalid product/);
  await assert.rejects(settle(db,{...sale,livemode:false}),/Invalid verified/);
  await assert.rejects(settle(db,{...sale,currency:'usd'}),/Invalid verified/);
  assert.equal((await db.query('select count(*)::int n from orders')).rows[0].n,0);
  // Failure during entitlement grant rolls back the preceding order and payment.
  await db.exec("ALTER TABLE customer_products ADD CONSTRAINT simulate_failure CHECK(status <> 'active')");
  await assert.rejects(settle(db),/simulate_failure/);
  assert.equal((await db.query('select count(*)::int n from payments')).rows[0].n,0);
  await db.exec('ALTER TABLE customer_products DROP CONSTRAINT simulate_failure');
  await settle(db);
  await assert.rejects(settle(db,{...sale,stripe_fee:439,producer_net:8561}),/Conflicting/);
 } finally { await db.close(); }
});

test('nova compra do mesmo produto cria novo pedido, preserva um acesso; histórico não é promovido',async()=>{
 const db=await database();
 try {
  await settle(db);
  await settle(db,{...sale,intent_id:'pi_2',session_id:'cs_2',charge_id:'ch_2',transaction_id:'txn_2'});
  assert.equal((await db.query('select count(*)::int n from orders')).rows[0].n,2);
  assert.equal((await db.query('select count(*)::int n from customer_products')).rows[0].n,1);
  await db.query("insert into payments(user_id,payment_provider_id,status,value) values($1,'pi_old','PAID',100)",[seller]);
  await sync(db);
  const b=(await db.query('select * from balances')).rows[0];
  assert.equal(b.reconciliation_required,true);assert.equal(Number(b.available_balance),0);
  const summary=(await db.query('select finance_summary($1) s',[seller])).rows[0].s;
  assert.equal(summary.gross_cents,20000);assert.equal(summary.unverified_payments,1);
 } finally { await db.close(); }
});

test('payout duplicado/fora de ordem, falha tardia, reserva idempotente e lease recuperável',async()=>{
 const db=await database();
 try {
  await settle(db);await sync(db);
  const key='10000000-0000-4000-8000-000000000001';
  const w=(await db.query('select (reserve_stripe_payout($1,$2,8562)).*',[seller,key])).rows[0];
  assert.equal((await db.query('select (reserve_stripe_payout($1,$2,8562)).id id',[seller,key])).rows[0].id,w.id);
  const payout={id:'po_1',livemode:true,currency:'brl',amount:8562,status:'paid',metadata:{uranova_withdrawal_id:w.id}};
  const record=(p,date)=>db.query('select record_stripe_payout($1,$2,$3::jsonb,$4)',[seller,'acct_seller',JSON.stringify(p),date]);
  await record(payout,'2025-01-02');await record(payout,'2025-01-02');
  await record({...payout,status:'pending'},'2025-01-01');
  assert.equal((await db.query('select status from withdrawals')).rows[0].status,'paid');
  await sync(db);assert.equal(Number((await db.query('select total_withdrawn from balances')).rows[0].total_withdrawn),85.62);
  await record({...payout,status:'failed'},'2025-01-03');await sync(db);
  assert.equal(Number((await db.query('select available_balance from balances')).rows[0].available_balance),85.62);
  const token='10000000-0000-4000-8000-000000000008';
  const claim=()=>db.query("select claim_stripe_event('evt_1','charge.updated','acct_seller',$1) c",[token]);
  assert.equal((await claim()).rows[0].c,'claimed');assert.equal((await claim()).rows[0].c,'busy');
  await db.exec("update stripe_webhook_events set lease_until=now()-interval '1 second'");
  assert.equal((await claim()).rows[0].c,'claimed');
 } finally { await db.close(); }
});

test('Data API não escreve financeiro, RPC não pública, perfil não muda conta/role',async()=>{
 const db=await database();
 try {
  await db.exec("ALTER TABLE profiles ADD COLUMN is_pro boolean DEFAULT false, ADD COLUMN stripe_customer_id text, ADD COLUMN subscription_plan text DEFAULT 'free', ADD COLUMN subscription_status text DEFAULT 'free', ADD COLUMN subscription_end_date timestamptz");
  await db.exec('SET ROLE authenticated');
  await assert.rejects(settle(db),/permission denied/);
  await assert.rejects(db.exec("insert into payments(value) values(100)"),/permission denied/);
  await assert.rejects(db.query("update profiles set role='admin' where id=$1",[seller]),/Protected/);
  await assert.rejects(db.query("update profiles set stripe_account_id='acct_attacker' where id=$1",[seller]),/Protected/);
  for (const assignment of ["is_pro=true", "stripe_customer_id='cus_attacker'", "subscription_plan='pro'", "subscription_status='active'", "subscription_end_date=now()+interval '1 year'"]) {
   await assert.rejects(db.query(`update profiles set ${assignment} where id=$1`,[seller]),/Protected/);
  }
  await assert.rejects(db.exec("insert into profiles(id,is_pro) values('00000000-0000-4000-8000-000000000099',true)"),/Protected/);
 } finally { await db.close(); }
});

test('sincronização com lease: snapshot antigo não sobrescreve conciliação nova',async()=>{
 const db=await database();
 try {
  await settle(db);
  const old='10000000-0000-4000-8000-000000000004', fresh='10000000-0000-4000-8000-000000000005';
  const claim=(token)=>db.query('select claim_finance_sync($1,$2) ok',[seller,token]);
  assert.equal((await claim(old)).rows[0].ok,true);
  assert.equal((await claim(fresh)).rows[0].ok,false);
  await db.exec("update balances set sync_until=now()-interval '1 second'");
  assert.equal((await claim(fresh)).rows[0].ok,true);
  await assert.rejects(db.query("select complete_finance_sync($1,$2,'acct_seller',8562,0,now())",[seller,old]),/lease expired/);
  await db.query("select complete_finance_sync($1,$2,'acct_seller',8562,0,now())",[seller,fresh]);
  assert.equal(Number((await db.query('select available_balance from balances')).rows[0].available_balance),85.62);
  await db.exec("update balances set synced_at=now()-interval '6 minutes'");
  assert.equal((await db.query('select finance_summary($1) s',[seller])).rows[0].s.available_cents,0);
 } finally { await db.close(); }
});
