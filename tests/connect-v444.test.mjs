import {test, beforeEach, after, mock} from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import Stripe from 'stripe';
import {account, session, intent, charge, transaction, eventTypes, snapshot} from './fixtures/stripe-connect-2026-04-22.mjs';

// Real signature verifier, route, processor and money calculations; external I/O is doubled.
// The ledger double checks stable business keys/retries, NOT PostgreSQL atomicity or grants.
const sdk = new Stripe('sk_test_synthetic_only');
const principalSecret = 'whsec_synthetic_platform_v444';
const connectSecret = 'whsec_synthetic_connect_v444';
const previous = [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_CONNECT_WEBHOOK_SECRET];
after(() => {
  for (const [i,key] of ['STRIPE_WEBHOOK_SECRET','STRIPE_CONNECT_WEBHOOK_SECRET'].entries()) {
    if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i];
  }
});
let state;
beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = principalSecret;
  process.env.STRIPE_CONNECT_WEBHOOK_SECRET = connectSecret;
  state = {events:new Map(),sales:new Map(),rpc:[],api:[],sync:0,payouts:0,credits:0,
    session:structuredClone(session),intent:{...intent,latest_charge:{...charge,balance_transaction:transaction}},
    syncFails:false,busy:false,claimFails:false,finishFails:false,payoutFails:false,missingSession:false,
    profileAccount:account,productOwner:'20000000-0000-4000-8000-000000000002'};
});
const admin = {
  from(table) { return {select(){return this;},eq(){return this;},async single(){
    return {data:table === 'products_checkout'
      ? {id:'10000000-0000-4000-8000-000000000001',user_id:state.productOwner,product_id:'40000000-0000-4000-8000-000000000004'}
      : {stripe_account_id:state.profileAccount},error:null};
  }}; },
  async rpc(name,args) {
    state.rpc.push({name,args});
    if (name === 'claim_stripe_event') {
      if (state.claimFails) return {error:{message:'Synthetic claim failure'}};
      const old = state.events.get(args.p_id);
      if (old?.status === 'processed') return {data:'processed'};
      if (state.busy || old?.status === 'processing') return {data:'busy'};
      state.events.set(args.p_id,{status:'processing',token:args.p_token});
      return {data:'claimed'};
    }
    if (name === 'finish_stripe_event') {
      if (state.finishFails) return {error:{message:'Synthetic finish failure'}};
      assert.equal(state.events.get(args.p_id).token,args.p_token);
      state.events.set(args.p_id,{status:args.p_error ? 'failed' : 'processed'});
      return {data:null};
    }
    assert.equal(name,'settle_stripe_sale');
    const p = args.p;
    const old = state.sales.get(p.intent_id);
    if (old) assert.deepEqual(p,old); else {state.sales.set(p.intent_id,p);state.credits += p.producer_net;}
    return {data:'payment_fixture'};
  },
};
function scoped(method,options) {
  assert.equal(options.stripeAccount,account);
  state.api.push(method);
}
const stripe = {webhooks:sdk.webhooks,
  checkout:{sessions:{
    async retrieve(id,params,options){scoped('session',options);assert.equal(id,session.id);return state.session;},
    async list(params,options){scoped('sessions.list',options);assert.equal(params.payment_intent,intent.id);return {data:state.missingSession?[]:[state.session]};},
  }},
  paymentIntents:{async retrieve(id,params,options){scoped('intent',options);assert.equal(id,intent.id);return state.intent;}},
  v2:{core:{accounts:{async retrieve(id){assert.equal(id,account);return {defaults:{responsibilities:{fees_collector:'stripe'}}};}}}},
  payouts:{async retrieve(id,params,options){scoped('payout',options);assert.equal(id,'po_fixture');if(state.payoutFails)throw new Error('Synthetic payout failure');return snapshot('payout.paid').data.object;}},
};
const url = path => pathToFileURL(`${process.cwd()}/src/${path}.ts`).href;
mock.module(url('lib/supabase/admin'),{namedExports:{admin}});
mock.module(url('lib/stripe'),{namedExports:{stripe,assertStripeLive(){}}});
mock.module(url('lib/services/payouts'),{namedExports:{
  async sellerForAccount(id){return id === account ? {id:'20000000-0000-4000-8000-000000000002'} : null;},
  async recordPayout(seller,id,payout){assert.equal(seller,'20000000-0000-4000-8000-000000000002');assert.equal(id,account);assert.equal(payout.status,'paid');state.payouts++;},
  async syncProducerFinance(seller,id){assert.equal(seller,'20000000-0000-4000-8000-000000000002');assert.equal(id,account);state.sync++;if(state.syncFails)throw new Error('Synthetic sync failure');},
}});
const {POST} = await import('../src/app/api/stripe/connect/webhook/route.ts');
const {POST:platformPOST} = await import('../src/app/api/stripe/webhook/route.ts');
function request(event,secret=connectSecret,invalid=false) {
  const body = JSON.stringify(event);
  const signature = sdk.webhooks.generateTestHeaderString({payload:body,secret});
  return new Request('http://localhost/api/stripe/connect/webhook',{method:'POST',body,
    headers:{'stripe-signature':invalid?'invalid':signature}});
}
async function expectResponse(event,status,outcome) {
  const response = await POST(request(event));
  assert.equal(response.status,status);
  const body = await response.json();
  assert.equal(body.outcome,outcome);
  return body;
}
const settlementEvents = ['checkout.session.completed','checkout.session.async_payment_succeeded',
  'payment_intent.succeeded','charge.succeeded','charge.updated'];
test('V4.44: exactly 14 distinct April snapshot contracts',() => {
  assert.equal(eventTypes.length,14);
  assert.equal(new Set(eventTypes.map(type=>snapshot(type).id)).size,14);
  for (const type of eventTypes) {
    const event = snapshot(type);
    assert.equal(event.api_version,'2026-04-22.dahlia');
    assert.equal(event.account,account);assert.equal(event.livemode,true);assert.equal(event.type,type);
    assert.equal(event.data.object.object,type.startsWith('checkout.')?'checkout.session':
      type.startsWith('charge.dispute.')?'dispute':type.split('.')[0]);
  }
});
for (const type of eventTypes) {
  test(`V4.44 ${type}: signed dispatch, financial effect and duplicate`,async () => {
    const event = snapshot(type);
    await expectResponse(event,200,'processed');
    assert.equal(state.sales.size,settlementEvents.includes(type)?1:0);
    assert.equal(state.credits,settlementEvents.includes(type)?4261:0);
    assert.equal(state.payouts,type.startsWith('payout.')?1:0);
    assert.equal(state.sync,1);
    assert.equal(state.events.get(event.id).status,'processed');
    const before = {api:state.api.length,rpc:state.rpc.length};
    assert.equal((await expectResponse(event,200,'processed')).duplicate,true);
    assert.equal(state.api.length,before.api);assert.equal(state.rpc.length,before.rpc+1);
    assert.equal(state.sync,1);
  });
  test(`V4.44 ${type}: bad/cross signatures and wrong scope have no side effects`,async () => {
    const event = snapshot(type);
    assert.equal((await POST(request(event,connectSecret,true))).status,400);
    assert.equal((await POST(request(event,principalSecret))).status,400);
    assert.equal((await platformPOST(request(event,connectSecret))).status,400);
    assert.equal((await platformPOST(request(event,principalSecret))).status,400);
    for (const accountValue of [undefined,null,'', 'acct_', 'platform']) {
      assert.equal((await POST(request({...event,account:accountValue}))).status,400);
    }
    assert.equal(state.rpc.length,0);assert.equal(state.api.length,0);assert.equal(state.sync,0);
  });
  test(`V4.44 ${type}: unauthorized seller stays recoverable without financial effects`,async () => {
    const event = {...snapshot(type),account:'acct_unauthorized'};
    await expectResponse(event,500,'pending_recovery');
    assert.equal(state.events.get(event.id).status,'failed');
    assert.equal(state.api.length,0);assert.equal(state.sales.size,0);assert.equal(state.sync,0);
  });
  test(`V4.44 ${type}: reconciliation failure retries without another credit`,async () => {
    const event = snapshot(type);state.syncFails=true;
    await expectResponse(event,500,'pending_recovery');
    assert.equal(state.events.get(event.id).status,'failed');
    state.syncFails=false;
    await expectResponse(event,200,'processed');
    assert.equal(state.sales.size,settlementEvents.includes(type)?1:0);
    assert.equal(state.credits,settlementEvents.includes(type)?4261:0);
  });
}
test('V4.44: different event IDs for one sale preserve settlement keys and 10% commission',async () => {
  for (const type of settlementEvents) await expectResponse(snapshot(type),200,'processed');
  const sale = state.sales.get(intent.id);
  assert.equal(state.sales.size,1);assert.equal(state.credits,4261);
  assert.deepEqual([sale.gross,sale.platform_fee,sale.stripe_fee,sale.producer_net],[5000,500,239,4261]);
  assert.deepEqual([sale.account_id,sale.checkout_id,sale.seller_id,sale.customer_id,sale.product_id],
    [account,'10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000003','40000000-0000-4000-8000-000000000004']);
});
test('V4.44: pending checkout, missing session and balance transaction can retry',async () => {
  const event = snapshot('checkout.session.completed');state.session.payment_status='unpaid';
  await expectResponse(event,500,'pending_recovery');assert.equal(state.sales.size,0);
  state.session.payment_status='paid';state.intent.latest_charge.balance_transaction=null;
  await expectResponse(event,500,'pending_recovery');assert.equal(state.sales.size,0);
  state.intent.latest_charge.balance_transaction=transaction;
  await expectResponse(event,200,'processed');
  state.missingSession=true;
  await expectResponse(snapshot('payment_intent.succeeded'),500,'pending_recovery');
  state.missingSession=false;
  await expectResponse(snapshot('payment_intent.succeeded'),200,'processed');
  assert.equal(state.credits,4261);
});
test('V4.44: seller/product/account mismatch cannot settle platform or another account sale',async () => {
  const event = snapshot('checkout.session.completed');
  for (const otherAccount of [null,'acct_otherSeller']) {
    state.profileAccount=otherAccount;
    await expectResponse(event,500,'pending_recovery');
  }
  state.profileAccount=account;state.productOwner='other_seller';
  await expectResponse(event,500,'pending_recovery');
  assert.equal(state.sales.size,0);assert.equal(state.credits,0);
});
test('V4.44: refunded/disputed charge.updated only reconciles; charge.succeeded requires recovery',async () => {
  for (const flags of [{amount_refunded:5000,refunded:true},{disputed:true},{paid:false}]) {
    const event = snapshot('charge.updated');event.id += JSON.stringify(flags);
    Object.assign(event.data.object,flags);await expectResponse(event,200,'processed');
    event.type='charge.succeeded';event.id += '_succeeded';
    await expectResponse(event,500,'pending_recovery');
  }
  assert.equal(state.sales.size,0);assert.equal(state.credits,0);
});
test('V4.44: busy/failed claim and unavailable payout do not acknowledge completion',async () => {
  const event = snapshot('payout.paid');state.busy=true;
  await expectResponse(event,409,'pending_recovery');assert.equal(state.api.length,0);
  state.busy=false;state.claimFails=true;
  await expectResponse(event,500,'pending_recovery');assert.equal(state.events.size,0);
  state.claimFails=false;state.payoutFails=true;
  await expectResponse(event,500,'pending_recovery');assert.equal(state.payouts,0);
  state.payoutFails=false;await expectResponse(event,200,'processed');
});
test('V4.44: finish unavailable returns 500 then 409 until lease recovery',async () => {
  const event = snapshot('checkout.session.completed');state.finishFails=true;
  await expectResponse(event,500,'pending_recovery');
  state.finishFails=false;await expectResponse(event,409,'pending_recovery');
  // Explicit lease expiry simulation; real expiration is a PostgreSQL responsibility.
  state.events.set(event.id,{status:'failed'});
  await expectResponse(event,200,'processed');assert.equal(state.credits,4261);
});
test('V4.44: missing/equal secrets fail closed; missing Connect secret preserves platform',async () => {
  const event = snapshot('balance.available');
  delete process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  assert.equal((await POST(request(event))).status,503);
  const platform = {...event};delete platform.account;
  assert.equal((await platformPOST(request(platform,principalSecret))).status,200);
  process.env.STRIPE_CONNECT_WEBHOOK_SECRET=principalSecret;
  assert.equal((await POST(request(event,principalSecret))).status,503);
  assert.equal((await platformPOST(request(platform,principalSecret))).status,503);
  assert.equal(state.rpc.length,0);
});
test('V4.44: test mode and unsupported events are ignored without claims',async () => {
  await expectResponse({...snapshot('balance.available'),livemode:false},200,'ignored');
  await expectResponse({...snapshot('balance.available'),type:'customer.created'},200,'ignored');
  assert.equal(state.rpc.length,0);
});
