// Read-only. Never creates charges, payouts, or changes Supabase records.
// Run: node --env-file=.env.local scripts/audit-stripe-finance.mjs
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { priceToCents } from '../src/lib/finance/money.ts';

if (!/^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY ?? '')) throw new Error('Stripe Live key required');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-06-24.dahlia' });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const report = { accounts: 0, compatibleAccounts: 0, incompatibleAccounts: 0, payments: 0,
  confirmedLive: 0, failedOrUnavailable: 0, missingSession: 0, financialMismatch: 0 };
const profiles = new Map();
for (let offset=0; ; offset+=500) {
  const { data,error } = await db.from('profiles').select('id,stripe_account_id').not('stripe_account_id','is',null)
    .order('id').range(offset,offset+499);
  if(error) throw new Error('Cannot read profiles');
  for(const p of data) {
    profiles.set(p.id,p.stripe_account_id);report.accounts++;
    const account=await stripe.v2.core.accounts.retrieve(p.stripe_account_id,{include:['defaults']});
    if(account.defaults?.responsibilities?.fees_collector==='stripe') report.compatibleAccounts++;
    else report.incompatibleAccounts++;
  }
  if(data.length<500) break;
}
for(let offset=0;;offset+=500) {
  const {data,error}=await db.from('payments').select('id,user_id,payment_provider_id,value,platform_fee,stripe_fee,final_value')
    .order('id').range(offset,offset+499);
  if(error) throw new Error('Cannot read payments');
  for(const p of data) {
    report.payments++;
    try {
      const account=profiles.get(p.user_id);
      if(!account) throw new Error('Account missing');
      const pi=await stripe.paymentIntents.retrieve(p.payment_provider_id,{expand:['latest_charge.balance_transaction']},{stripeAccount:account});
      if(!pi.livemode || pi.status!=='succeeded') throw new Error('Not verified');
      report.confirmedLive++;
      const sessions=await stripe.checkout.sessions.list({payment_intent:pi.id,limit:1},{stripeAccount:account});
      if(!sessions.data[0]?.metadata?.product_id) report.missingSession++;
      const bt=pi.latest_charge?.balance_transaction;
      if(!bt || typeof bt==='string' || bt.amount!==priceToCents(p.value) || bt.net!==priceToCents(p.final_value)) report.financialMismatch++;
    } catch { report.failedOrUnavailable++; }
  }
  if(data.length<500) break;
}
console.log(JSON.stringify(report,null,2));
