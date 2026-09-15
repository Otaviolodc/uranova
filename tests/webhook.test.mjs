import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import { pathToFileURL } from 'node:url';
const moduleURL=(path)=>pathToFileURL(process.cwd()+'/src/'+path+'.ts').href;
const sdk=new Stripe('sk_test_local_fixture_only');
process.env.STRIPE_WEBHOOK_SECRET='whsec_local_fixture_only';
let calls=[], processCalls=0, fail=false, claim='claimed';
const admin={async rpc(name,args){calls.push({name,args});return {data:name==='claim_stripe_event'?claim:null,error:null}}};
mock.module(moduleURL('lib/supabase/admin'),{namedExports:{admin}});
mock.module(moduleURL('lib/stripe'),{namedExports:{stripe:{webhooks:sdk.webhooks},assertStripeLive(){}}});
mock.module(moduleURL('lib/services/payment-processor'),{namedExports:{
 async processCheckoutCompleted(){processCalls++;if(fail)throw new Error('Database unavailable');},
 async processPaymentIntentSettlement(){processCalls++;},
}});
mock.module(moduleURL('lib/services/payouts'),{namedExports:{
 async recordPayout(){},async sellerForAccount(){return {id:'seller'}},async syncProducerFinance(){},
}});
const {POST}=await import('../src/app/api/stripe/webhook/route.ts');
const event={id:'evt_fixture',object:'event',type:'checkout.session.completed',livemode:true,account:'acct_seller',
 data:{object:{id:'cs_fixture',metadata:{product_id:'product'}}}};
function request(value=event,valid=true){
 const body=JSON.stringify(value);
 const signature=sdk.webhooks.generateTestHeaderString({payload:body,secret:process.env.STRIPE_WEBHOOK_SECRET});
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
