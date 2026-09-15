import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const session={id:'cs_live',livemode:true,mode:'payment',payment_status:'paid',amount_total:10000,payment_intent:'pi_live',
 metadata:{product_id:'checkout',seller_id:'seller',customer_id:'buyer'}};
const transaction={id:'txn_live',amount:10000,fee:1438,net:8562,currency:'brl',available_on:1700000000,
 fee_details:[{amount:1000,type:'application_fee',currency:'brl'},{amount:438,type:'stripe_fee',currency:'brl'}]};
let writes=[], invalidProduct=false;
let intent={id:'pi_live',livemode:true,status:'succeeded',currency:'brl',amount_received:10000,
 latest_charge:{id:'ch_live',livemode:true,paid:true,captured:true,status:'succeeded',amount:10000,currency:'brl',
  amount_refunded:0,disputed:false,application_fee_amount:1000,balance_transaction:transaction,created:1700000000}};
const admin={from(table){return {select(){return this},eq(){return this},async single(){
 return table==='products_checkout' ? {data:invalidProduct?null:{id:'checkout',user_id:'seller',product_id:'product'},error:null}:
 {data:{stripe_account_id:'acct_seller'},error:null};
}}},async rpc(name,args){writes.push({name,args});return {data:'payment-id',error:null}}};
const stripe={checkout:{sessions:{retrieve:async()=>session}},paymentIntents:{retrieve:async()=>intent},
 v2:{core:{accounts:{retrieve:async()=>({defaults:{responsibilities:{fees_collector:'stripe'}}})}}}};
mock.module(pathToFileURL(root+'/src/lib/supabase/admin.ts').href,{namedExports:{admin}});
mock.module(pathToFileURL(root+'/src/lib/stripe.ts').href,{namedExports:{stripe,assertStripeLive(){}}});
const {processCheckoutCompleted}=await import('../src/lib/services/payment-processor.ts');
const run=()=>processCheckoutCompleted({session,stripeAccountId:'acct_seller'});

test('processor: só uma RPC atômica com valores verificados',async()=>{
 writes=[];await run();assert.equal(writes.length,1);assert.equal(writes[0].name,'settle_stripe_sale');
 assert.equal(writes[0].args.p.producer_net,8562);assert.equal(writes[0].args.p.platform_fee,1000);
});
test('processor: pagamento falhou ou pendente não cria pedido, saldo nem acesso',async()=>{
 writes=[];
 session.payment_status='unpaid';assert.equal((await run()).status,'pending');assert.equal(writes.length,0);
 session.payment_status='paid';const original=intent;intent={...intent,status:'requires_payment_method'};
 await assert.rejects(run(),/Payment not confirmed/);assert.equal(writes.length,0);intent=original;
});
test('processor: produto inválido, conta trocada e taxa ausente não movimentam financeiro',async()=>{
 writes=[];invalidProduct=true;await assert.rejects(run(),/Invalid product/);invalidProduct=false;
 await assert.rejects(processCheckoutCompleted({session,stripeAccountId:'acct_wrong'}),/account mismatch/);
 const original=intent;intent={...intent,latest_charge:{...intent.latest_charge,balance_transaction:null}};
 await assert.rejects(run(),/not available/);intent=original;assert.equal(writes.length,0);
});
test('processor: modo Test nunca chega ao banco',async()=>{
 writes=[];await assert.rejects(processCheckoutCompleted({session:{...session,livemode:false},stripeAccountId:'acct_seller'}),/Live Connect/);
 assert.equal(writes.length,0);
});
