import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const url=p=>pathToFileURL(process.cwd()+'/src/'+p+'.ts').href;
let verdict={allowed:true,retry_after:0}, rpcError=null, calls=[], payouts=0, reauth=0, session={id:'10000000-0000-4000-8000-000000000001'};
mock.module(url('lib/supabase/admin'),{namedExports:{admin:{async rpc(name,args){calls.push({name,args});return {data:verdict,error:rpcError}}}}});
mock.module(url('lib/finance/access'),{namedExports:{async requireFinanceUser(){if(!session)throw Error('UNAUTHENTICATED');return session}}});
mock.module('@supabase/supabase-js',{namedExports:{createClient(){reauth++;throw Error('Should not reach Auth')}}});
mock.module(url('lib/services/payouts'),{namedExports:{async requestProducerPayout(){payouts++;throw Error('Should not reach Stripe')}}});
const {rateLimit,trackingPrincipal}=await import('../src/lib/security/rate-limit.ts');
const {safeError}=await import('../src/lib/security/request.ts');
const {POST}=await import('../src/app/api/finance/payout/route.ts');
const req=()=>new Request('https://example.invalid/api/finance/payout',{method:'POST',headers:{origin:'https://example.invalid','content-type':'application/json'},body:JSON.stringify({amount:'10.00',requestKey:'20000000-0000-4000-8000-000000000002',currentPassword:'fixture'})});
test('A1: quota returns 429, Retry-After and no-store; hashed server principal',async()=>{
 verdict={allowed:false,retry_after:45};let caught;
 try{await rateLimit('payout',session.id)}catch(e){caught=e}
 const response=safeError(caught);assert.equal(response.status,429);assert.equal(response.headers.get('retry-after'),'45');assert.equal(response.headers.get('cache-control'),'no-store');
 assert.match(calls.at(-1).args.p_key,/^[a-f0-9]{64}$/);assert.equal(JSON.stringify(calls).includes(session.id),false);
});
test('A1: database unavailable or malformed verdict fails closed with 503',async()=>{
 for(const data of [null,{}, {allowed:true,retry_after:-1},{allowed:'true',retry_after:0}]){
  verdict=data;await assert.rejects(rateLimit('checkout','fixture'),/RATE_LIMIT_UNAVAILABLE/);
 }
 verdict={allowed:true,retry_after:0};rpcError={message:'offline'};
 try{await rateLimit('checkout','fixture');assert.fail()}catch(e){assert.equal(safeError(e).status,503)}
 rpcError=null;
});
test('A1: payout denial precedes reauth, Stripe and idempotent payout mutation',async()=>{
 verdict={allowed:false,retry_after:30};
 assert.equal((await POST(req())).status,429);assert.equal(payouts,0);assert.equal(reauth,0);
 session=null;const before=calls.length;assert.equal((await POST(req())).status,401);assert.equal(calls.length,before);
 session={id:'10000000-0000-4000-8000-000000000001'};
});
test('A1: only trusted Vercel IP accepted, no arbitrary forwarded header; IPv6 /64 stable',()=>{
 const saved={VERCEL:process.env.VERCEL,NODE_ENV:process.env.NODE_ENV};
 try{
  process.env.NODE_ENV='production';delete process.env.VERCEL;
  assert.throws(()=>trackingPrincipal(new Request('https://example.invalid',{headers:{'x-forwarded-for':'1.2.3.4'}})),/UNAVAILABLE/);
  process.env.VERCEL='1';
  assert.throws(()=>trackingPrincipal(new Request('https://example.invalid',{headers:{'x-forwarded-for':'1.2.3.4'}})),/UNAVAILABLE/);
  assert.throws(()=>trackingPrincipal(new Request('https://example.invalid',{headers:{'x-vercel-forwarded-for':'1.2.3.4, 5.6.7.8'}})),/UNAVAILABLE/);
  const ip=v=>trackingPrincipal(new Request('https://example.invalid',{headers:{'x-vercel-forwarded-for':v}}));
  assert.equal(ip('1.2.3.4'),'ip4:1.2.3.4');assert.equal(ip('2001:db8::1'),ip('2001:0db8:0:0::abcd'));
 }finally{for(const [k,v] of Object.entries(saved))if(v===undefined)delete process.env[k];else process.env[k]=v}
});
