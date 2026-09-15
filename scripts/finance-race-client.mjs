// A real independent PostgREST/PostgreSQL transaction, only for the isolated fixture.
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const root='.local/supabase-official-update';
const input=JSON.parse(fs.readFileSync(`${root}/race-input.json`,'utf8'));
const fixture=JSON.parse(fs.readFileSync(`${root}/fixtures.json`,'utf8'));
if(!['settle_stripe_sale','reserve_stripe_payout','claim_stripe_event'].includes(input.rpc)) throw new Error('Unexpected RPC');
if(input.fixtureRun!==fixture.run) throw new Error('Fixture mismatch');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const started=new Date().toISOString();
let data,error;
let attempts=0;
const deadline=Date.now()+60000;
do {
 ({data,error}=await db.rpc(input.rpc,input.args));attempts++;
 if(!input.barrier) break;
 const probe=await db.from('stripe_webhook_events').select('id').eq('event_id',input.barrier).maybeSingle();
 if(probe.error) throw new Error('Barrier probe failed');
 if(probe.data) break;
 if(Date.now()>deadline) throw new Error('Concurrency barrier timeout');
 await new Promise(resolve=>setTimeout(resolve,100));
} while(true);
const result={rpc:input.rpc,started,finished:new Date().toISOString(),attempts,data,error:error?{code:error.code,message:error.message}:null};
fs.writeFileSync(`${root}/race-client-${input.label}.json`,JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
