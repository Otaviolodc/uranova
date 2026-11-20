// Synthetic, reduced snapshot contracts: no captured customer data or credentials.
// Fields consumed by Uranova are included; this is not a full Stripe schema validator.
export const account = 'acct_fixtureSeller';
export const session = {id:'cs_fixture',object:'checkout.session',livemode:true,mode:'payment',
  status:'complete',payment_status:'paid',amount_total:5000,currency:'brl',payment_intent:'pi_fixture',
  metadata:{product_id:'10000000-0000-4000-8000-000000000001',seller_id:'20000000-0000-4000-8000-000000000002',customer_id:'30000000-0000-4000-8000-000000000003'},
  customer_details:{name:'Synthetic buyer',email:'buyer@example.invalid'}};
export const transaction = {id:'txn_fixture',object:'balance_transaction',amount:5000,fee:739,net:4261,
  currency:'brl',available_on:1776902400,fee_details:[
    {amount:500,currency:'brl',type:'application_fee',description:'Platform commission',application:null},
    {amount:239,currency:'brl',type:'stripe_fee',description:'Processing fee',application:null}]};
export const charge = {id:'ch_fixture',object:'charge',livemode:true,created:1776816000,
  amount:5000,amount_captured:5000,amount_refunded:0,currency:'brl',paid:true,captured:true,
  status:'succeeded',refunded:false,disputed:false,payment_intent:'pi_fixture',
  application_fee_amount:500,balance_transaction:'txn_fixture',metadata:{}};
export const intent = {id:'pi_fixture',object:'payment_intent',livemode:true,created:1776816000,
  amount:5000,amount_received:5000,currency:'brl',status:'succeeded',latest_charge:'ch_fixture',
  application_fee_amount:500,metadata:{}};
const dispute = {id:'dp_fixture',object:'dispute',livemode:true,created:1776816000,
  amount:5000,currency:'brl',charge:'ch_fixture',payment_intent:'pi_fixture',reason:'fraudulent',
  status:'needs_response',is_charge_refundable:true,metadata:{},balance_transactions:[],
  evidence:{},evidence_details:{due_by:1777420800,has_evidence:false,past_due:false,submission_count:0}};
const payout = {id:'po_fixture',object:'payout',livemode:true,created:1776816000,
  amount:4261,currency:'brl',arrival_date:1776902400,automatic:true,method:'standard',
  type:'bank_account',status:'pending',balance_transaction:'txn_payoutFixture',
  destination:'ba_fixture',failure_code:null,failure_message:null,metadata:{}};
const objects = {
  'checkout.session.completed':session,
  'checkout.session.async_payment_succeeded':session,
  'payment_intent.succeeded':intent,
  'charge.succeeded':charge,
  'charge.updated':charge,
  'charge.refunded':{...charge,refunded:true,amount_refunded:5000},
  'charge.dispute.created':dispute,
  'charge.dispute.closed':{...dispute,status:'won'},
  'balance.available':{object:'balance',livemode:true,
    available:[{amount:4261,currency:'brl',source_types:{card:4261}}],pending:[]},
  'payout.created':payout,
  'payout.updated':{...payout,status:'in_transit'},
  'payout.paid':{...payout,status:'paid'},
  'payout.failed':{...payout,status:'failed',failure_code:'account_closed',failure_message:'Synthetic failure'},
  'payout.canceled':{...payout,status:'canceled'},
};
export const eventTypes = Object.keys(objects);
export function snapshot(type) {
  if (!objects[type]) throw new Error('Unknown fixture event');
  return structuredClone({id:`evt_fixture_${type.replaceAll('.', '_')}`,object:'event',
    api_version:'2026-04-22.dahlia',account,livemode:true,created:1776816000,
    pending_webhooks:1,request:{id:null,idempotency_key:null},type,data:{object:objects[type]}});
}
