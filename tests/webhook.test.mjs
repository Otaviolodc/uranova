import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import { pathToFileURL } from 'node:url';
const moduleURL=(path)=>pathToFileURL(process.cwd()+'/src/'+path+'.ts').href;
const sdk=new Stripe('sk_test_local_fixture_only');
process.env.STRIPE_WEBHOOK_SECRET='whsec_local_fixture_only';
process.env.STRIPE_CONNECT_WEBHOOK_SECRET='whsec_connect_local_fixture_only';
let calls=[], processCalls=0, fail=false, claim='claimed', sellerFound=true, resultStatus='paid', syncFails=false;
const admin={async rpc(name,args){calls.push({name,args});return {data:name==='claim_stripe_event'?claim:null,error:null}}};
mock.module(moduleURL('lib/supabase/admin'),{namedExports:{admin}});
mock.module(moduleURL('lib/stripe'),{namedExports:{stripe:{webhooks:sdk.webhooks},assertStripeLive(){}}});
mock.module(moduleURL('lib/services/payment-processor'),{namedExports:{
 async processCheckoutCompleted(){processCalls++;if(fail)throw new Error('Database unavailable');return {status:resultStatus};},
 async processPaymentIntentSettlement(){processCalls++;return {status:resultStatus};},
}});
mock.module(moduleURL('lib/services/payouts'),{namedExports:{
 async recordPayout(){},async sellerForAccount(){return sellerFound?{id:'seller'}:null},async syncProducerFinance(){if(syncFails)throw new Error('Sync unavailable');},
}});
const {POST}=await import('../src/app/api/stripe/connect/webhook/route.ts');
const {POST:platformPOST}=await import('../src/app/api/stripe/webhook/route.ts');
const event={id:'evt_fixture',object:'event',type:'checkout.session.completed',livemode:true,account:'acct_seller',
 data:{object:{id:'cs_fixture',metadata:{product_id:'product'}}}};
function request(value=event,valid=true,secret=process.env.STRIPE_CONNECT_WEBHOOK_SECRET){
 const body=JSON.stringify(value);
 const signature=sdk.webhooks.generateTestHeaderString({payload:body,secret});
 return new Request('http://localhost/api/stripe/webhook',{method:'POST',body,
 headers:{'stripe-signature':valid?signature:'invalid'}});
}
test('assinatura inválida e evento Test não acessam banco',async()=>{
 calls=[];processCalls=0;
 assert.equal((await POST(request(event,false))).status,400);
 assert.equal((await POST(request({...event,livemode:false}))).status,200);
 assert.equal(calls.length,0);assert.equal(processCalls,0);
});
test('evento assinado concluído e duplicata usam controle idempotente',async()=>{
 calls=[];processCalls=0;claim='claimed';
 assert.equal((await POST(request())).status,200);assert.equal(processCalls,1);
 claim='processed';assert.equal((await POST(request())).status,200);assert.equal(processCalls,1);
 assert.equal(calls.filter(c=>c.name==='finish_stripe_event').length,1);
});
test('falha devolve 500 e registra erro para retry; lease ocupado não confirma evento',async()=>{
 calls=[];claim='claimed';fail=true;
 assert.equal((await POST(request())).status,500);fail=false;
 assert.equal(calls.find(c=>c.name==='finish_stripe_event').args.p_error,'Database unavailable');
 claim='busy';assert.equal((await POST(request())).status,409);
});
test('unknown seller is retryable failure, never marked processed',async()=>{
 calls=[];processCalls=0;claim='claimed';sellerFound=false;
 assert.equal((await POST(request())).status,500);assert.equal(processCalls,0);
 assert.match(calls.find(c=>c.name==='finish_stripe_event').args.p_error,/Unknown Stripe seller/);sellerFound=true;
});

test('V4.34: Connect dispatch and duplicate use existing claim',async()=>{
 process.env.STRIPE_CONNECT_WEBHOOK_SECRET='whsec_connect_local_fixture_only';
 calls=[];processCalls=0;claim='claimed';
 for(const type of ['checkout.session.completed','payment_intent.succeeded','charge.succeeded']) {
  const value={...event,type,data:{object:{id:'fixture',paid:true,payment_intent:'pi_fixture'}}};
  assert.equal((await POST(request(value,true,process.env.STRIPE_CONNECT_WEBHOOK_SECRET))).status,200);
 }
 assert.equal(processCalls,3);
 assert.ok(calls.filter(c=>c.name==='claim_stripe_event').every(c=>c.args.p_account==='acct_seller'));
 claim='processed';
 const duplicate=await POST(request());
 assert.equal((await duplicate.json()).duplicate,true);assert.equal(processCalls,3);
 claim='claimed';
 assert.equal((await POST(request())).status,200);assert.equal(processCalls,4);
});

test('V4.32: invalid, tampered and expired signatures never access persistence',async()=>{
 calls=[];processCalls=0;
 assert.equal((await POST(request(event,true,'whsec_unknown_fixture'))).status,400);
 const body=JSON.stringify(event);
 const sig=sdk.webhooks.generateTestHeaderString({payload:body,secret:process.env.STRIPE_CONNECT_WEBHOOK_SECRET});
 assert.equal((await POST(new Request('http://localhost',{method:'POST',body:body+' ',headers:{'stripe-signature':sig}}))).status,400);
 const expired=sdk.webhooks.generateTestHeaderString({payload:body,secret:process.env.STRIPE_CONNECT_WEBHOOK_SECRET,timestamp:1});
 assert.equal((await POST(new Request('http://localhost',{method:'POST',body,headers:{'stripe-signature':expired}}))).status,400);
 assert.equal((await POST(new Request('http://localhost',{method:'POST',body}))).status,400);
 assert.equal(calls.length,0);assert.equal(processCalls,0);
});

test('V4.32: ignored platform/unsupported events are explicit, without processed ledger entries',async()=>{
 calls=[];processCalls=0;
 for(const value of [{...event,type:'customer.created'},{...event,livemode:false}]) {
  const response=await POST(request(value));
  assert.equal(response.status,200);assert.equal((await response.json()).outcome,'ignored');
 }
 assert.equal(calls.length,0);assert.equal(processCalls,0);
});

test('V4.32: unpaid checkout and missing charge intent remain recoverable',async()=>{
 calls=[];claim='claimed';resultStatus='pending';
 let response=await POST(request());
 assert.equal(response.status,500);assert.equal((await response.json()).outcome,'pending_recovery');
 assert.match(calls.find(c=>c.name==='finish_stripe_event').args.p_error,/RECOVERY_REQUIRED/);
 resultStatus='paid';calls=[];
 response=await POST(request({...event,type:'charge.succeeded',data:{object:{paid:true}}}));
 assert.equal(response.status,500);
 assert.match(calls.find(c=>c.name==='finish_stripe_event').args.p_error,/PaymentIntent missing/);
});

test('V4.32: failure after settlement stays retryable and next delivery can finish',async()=>{
 calls=[];claim='claimed';syncFails=true;
 try {
  assert.equal((await POST(request())).status,500);
  assert.equal(calls.find(c=>c.name==='finish_stripe_event').args.p_error,'Sync unavailable');
 } finally {syncFails=false;}
 calls=[];
 assert.equal((await POST(request())).status,200);
 assert.equal(calls.find(c=>c.name==='finish_stripe_event').args.p_error,null);
});

test('V4.34: each route rejects cross-signatures before database or settlement',async()=>{
 calls=[];processCalls=0;
 const principal=process.env.STRIPE_WEBHOOK_SECRET,connect=process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
 for(const value of [event,{...event,account:undefined}]) {
  assert.equal((await POST(request(value,true,principal))).status,400);
  assert.equal((await platformPOST(request(value,true,connect))).status,400);
 }
 assert.equal(calls.length,0);assert.equal(processCalls,0);
});

test('V4.34: authenticated scope rejects main account, malformed account and Connect on principal route',async()=>{
 calls=[];processCalls=0;
 for(const account of [undefined,null,'','acct_','not_an_account',123,{},'acct_x/y']) {
  assert.equal((await POST(request({...event,account}))).status,400);
 }
 for(const account of ['acct_seller',null,'']) {
  assert.equal((await platformPOST(request({...event,account},true,process.env.STRIPE_WEBHOOK_SECRET))).status,400);
 }
 // Scope is checked even when the event would otherwise be ignored.
 assert.equal((await POST(request({...event,account:undefined,livemode:false,type:'customer.created'}))).status,400);
 assert.equal(calls.length,0);assert.equal(processCalls,0);
});

test('V4.34: principal endpoint preserves valid principal events without financial writes',async()=>{
 calls=[];processCalls=0;
 for(let i=0;i<2;i++) {
  const response=await platformPOST(request({...event,account:undefined},true,process.env.STRIPE_WEBHOOK_SECRET));
  assert.equal(response.status,200);assert.equal((await response.json()).outcome,'ignored');
 }
 assert.equal(calls.length,0);assert.equal(processCalls,0);
});

test('V4.34: equal secrets fail closed on both routes',async()=>{
 const principal=process.env.STRIPE_WEBHOOK_SECRET,connect=process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
 calls=[];processCalls=0;
 try {
  process.env.STRIPE_CONNECT_WEBHOOK_SECRET=principal;
  assert.equal((await POST(request())).status,503);
  assert.equal((await platformPOST(request({...event,account:undefined},true,principal))).status,503);
 } finally {process.env.STRIPE_CONNECT_WEBHOOK_SECRET=connect;}
 assert.equal(calls.length,0);assert.equal(processCalls,0);
});

test('V4.34: missing required secret cannot fall back to the other destination',async()=>{
 const principal=process.env.STRIPE_WEBHOOK_SECRET,connect=process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
 calls=[];processCalls=0;
 try {
  delete process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  assert.equal((await POST(request(event,true,principal))).status,503);
  assert.equal((await platformPOST(request({...event,account:undefined},true,principal))).status,200);
  process.env.STRIPE_CONNECT_WEBHOOK_SECRET=connect;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  assert.equal((await platformPOST(request({...event,account:undefined},true,connect))).status,503);
 } finally {process.env.STRIPE_WEBHOOK_SECRET=principal;process.env.STRIPE_CONNECT_WEBHOOK_SECRET=connect;}
 assert.equal(calls.length,0);assert.equal(processCalls,0);
});

test('V4.34: invalid principal signature never reaches financial handlers',async()=>{
 calls=[];processCalls=0;
 assert.equal((await platformPOST(request({...event,account:undefined},false))).status,400);
 assert.equal(calls.length,0);assert.equal(processCalls,0);
});
