import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const moduleURL=p=>pathToFileURL(process.cwd()+'/src/'+p+'.ts').href;
const registration={supabaseProjectRef:'unkupjzifylpredkenvj',vercelProjectId:'prj_StagingUnitFixture'};
// Unsigned parser fixtures, never supplied to a real SDK or external service.
const token=(role,ref=registration.supabaseProjectRef)=>'fixture.'+Buffer.from(JSON.stringify({role,ref,exp:4102444800})).toString('base64url')+'.not-a-signature';
const valid={AUTH_STAGING_MODE:'true',VERCEL:'1',VERCEL_ENV:'preview',VERCEL_TARGET_ENV:'preview',
 VERCEL_PROJECT_ID:registration.vercelProjectId,VERCEL_URL:'uranova-staging-fixture.vercel.app',
 NEXT_PUBLIC_APP_URL:'https://uranova-staging-fixture.vercel.app',NEXT_PUBLIC_SITE_URL:'https://uranova-staging-fixture.vercel.app',
 NEXT_PUBLIC_SUPABASE_URL:'https://unkupjzifylpredkenvj.supabase.co',
 NEXT_PUBLIC_SUPABASE_ANON_KEY:token('anon'),SUPABASE_SERVICE_ROLE_KEY:token('service_role')};
const originalEnv={...process.env};
let stripeConstructed=0,openaiConstructed=0,supabaseConstructed=0,network=0,authCalls=0;
mock.module(moduleURL('lib/security/staging-registration'),{namedExports:{stagingRegistration:registration}});
mock.module('stripe',{defaultExport:class {constructor(){stripeConstructed++;throw Error('Unexpected Stripe construction')}}});
mock.module('openai',{defaultExport:class {constructor(){openaiConstructed++;throw Error('Unexpected OpenAI construction')}}});
mock.module('@supabase/supabase-js',{namedExports:{createClient(){supabaseConstructed++;throw Error('Unexpected Supabase construction')}}});
mock.module(moduleURL('lib/supabase/server'),{namedExports:{async createClient(){authCalls++;return {auth:{async exchangeCodeForSession(){return {data:{user:{id:'fixture-user'},session:{}},error:null}}}}}}});
mock.module(moduleURL('lib/supabase/middleware'),{namedExports:{async updateSession(){authCalls++;return new Response(null)}}});
const {validateStagingEnvironment,assertIntegrationsEnabled,stagingPreviewOrigin}=await import('../src/lib/security/staging-policy.ts');
const {stripe,assertStripeLive}=await import('../src/lib/stripe.ts');
const {openai}=await import('../src/lib/openai.ts');
const {admin}=await import('../src/lib/supabase/admin.ts');
const {NextRequest}=await import('next/server');
const {middleware}=await import('../src/middleware.ts');
const {GET:callback}=await import('../src/app/auth/callback/route.ts');
const routes=await Promise.all(['stripe/checkout','stripe/webhook','stripe/connect/create','finance/payout','finance/sync','ai/chat','files/upload','files/download'].map(async p=>[p,(await import('../src/app/api/'+p+'/route.ts')).POST]));
const {GET:tracking}=await import('../src/app/checkout/go/[slug]/route.ts');
const payouts=await import('../src/lib/services/payouts.ts');
const processor=await import('../src/lib/services/payment-processor.ts');
const connect=await import('../src/lib/services/stripe-connect.ts');
function setEnv(env){
 for(const k of Object.keys(process.env))if(/STRIPE|OPENAI|SUPABASE|VERCEL|AUTH_STAGING|FUNCTIONAL_STAGING|NEXT_PUBLIC_(APP|SITE)_URL|DATABASE_URL|DIRECT_URL|POSTGRES_/.test(k))delete process.env[k];
 Object.assign(process.env,env);
}
test.after(()=>{for(const k of Object.keys(process.env))if(!(k in originalEnv))delete process.env[k];Object.assign(process.env,originalEnv)});
test('staging: module imports require no Stripe/OpenAI/Supabase credentials or SDK construction',()=>{
 assert.deepEqual([stripeConstructed,openaiConstructed,supabaseConstructed],[0,0,0]);
});

test('functional preparation: incomplete or conflicting activation fails closed in every environment',()=>{
 for(const base of [{}, valid, {VERCEL_ENV:'production',VERCEL_PROJECT_ID:'prj_mDBer36P7vACcz1oUWV4QobYNHI8'}]) {
  for(const value of ['true','TRUE','1','invalid']) {
   assert.throws(()=>validateStagingEnvironment({...base,FUNCTIONAL_STAGING_MODE:value}),/FUNCTIONAL_STAGING_NOT_APPROVED/);
  }
  assert.throws(()=>validateStagingEnvironment({...base,NEXT_PUBLIC_FUNCTIONAL_STAGING_MODE:'true'}),/PUBLIC_FLAG_FORBIDDEN/);
 }
 assert.equal(validateStagingEnvironment({FUNCTIONAL_STAGING_MODE:'false'}),false);
 assert.equal(validateStagingEnvironment({...valid,FUNCTIONAL_STAGING_MODE:'false'}),true);
 assert.throws(()=>validateStagingEnvironment({...valid,AUTH_STAGING_MODE:undefined,FUNCTIONAL_STAGING_MODE:'false'}),/UNVERIFIED/);
});

test('functional preparation: direct routes, SDK clients and middleware reject activation before side effects',async()=>{
 const before=[stripeConstructed,openaiConstructed,supabaseConstructed,authCalls];
 for(const env of [
  {...valid,AUTH_STAGING_MODE:undefined,FUNCTIONAL_STAGING_MODE:'true'},
  {...valid,FUNCTIONAL_STAGING_MODE:'true'},
  {FUNCTIONAL_STAGING_MODE:'true',VERCEL_ENV:'production'},
 ]) {
  setEnv(env);
  for(const [path,handler] of routes) {
   assert.equal((await handler(new Request('https://'+valid.VERCEL_URL+'/api/'+path,{method:'POST'}))).status,503,path);
  }
  for(const path of ['/','/marketplace','/dashboard','/api/finance/chart','/api/product-drafts/commit','/checkout/fixture']) {
   const request=new NextRequest('https://'+valid.VERCEL_URL+path,{headers:{host:valid.VERCEL_URL}});
   assert.equal((await middleware(request)).status,503,path);
  }
  for(const run of [()=>admin.from,()=>stripe.checkout,()=>stripe.webhooks,()=>assertIntegrationsEnabled()]) {
   assert.throws(run,/FUNCTIONAL_STAGING_NOT_APPROVED/);
  }
  await assert.rejects(()=>processor.processCheckoutCompleted({}),/FUNCTIONAL_STAGING_NOT_APPROVED/);
  await assert.rejects(()=>payouts.requestProducerPayout(),/FUNCTIONAL_STAGING_NOT_APPROVED/);
  await assert.rejects(()=>connect.createStripeConnectAccount(),/FUNCTIONAL_STAGING_NOT_APPROVED/);
 }
 assert.deepEqual([stripeConstructed,openaiConstructed,supabaseConstructed,authCalls],before);
 setEnv(valid);
});
test('staging: explicit registered Preview environment is required; production cannot opt in',()=>{
 assert.equal(validateStagingEnvironment(valid),true);
 for(const patch of [
  {VERCEL_PROJECT_ID:'prj_mDBer36P7vACcz1oUWV4QobYNHI8'},
  {VERCEL_PROJECT_ID:undefined},{VERCEL_PROJECT_ID:'prj_Unknown'},
  {VERCEL_ENV:'production'},{VERCEL_TARGET_ENV:'production'},{VERCEL:'0'},
  {NEXT_PUBLIC_SUPABASE_URL:'https://opdjpdjettgfndctjcnj.supabase.co'},
  {VERCEL_URL:'www.uranova.com.br'},
  {VERCEL_URL:'uranova-staging.vercel.app'},
  {AUTH_STAGING_MODE:'TRUE'},{AUTH_STAGING_MODE:'false'},{AUTH_STAGING_MODE:undefined},
 ])assert.throws(()=>validateStagingEnvironment({...valid,...patch}),/UNVERIFIED/);
 assert.throws(()=>validateStagingEnvironment(valid,{...registration,vercelProjectId:''}),/UNVERIFIED/);
 assert.equal(validateStagingEnvironment({}),false);
 assert.equal(validateStagingEnvironment({VERCEL_ENV:'production',VERCEL_PROJECT_ID:'prj_mDBer36P7vACcz1oUWV4QobYNHI8'}),false);
});
test('staging: dynamic deployment origin ignores stale public URLs and never falls back',()=>{
 const stale={...valid,NEXT_PUBLIC_APP_URL:'https://www.uranova.com.br',NEXT_PUBLIC_SITE_URL:'https://uranova-staging.vercel.app'};
 assert.equal(validateStagingEnvironment(stale),true);
 assert.equal(stagingPreviewOrigin(stale),'https://'+valid.VERCEL_URL);
 for(const host of [undefined,'','https://x.vercel.app','x.vercel.app/path','x.vercel.app:443','x.vercel.app.evil.test','x@x.vercel.app','x.vercel.app?x','uranova-staging.vercel.app']){
  assert.throws(()=>validateStagingEnvironment({...valid,VERCEL_URL:host,VERCEL_BRANCH_URL:valid.VERCEL_URL}),/UNVERIFIED/);
 }
 assert.throws(()=>validateStagingEnvironment({...valid,VERCEL_PROJECT_PRODUCTION_URL:valid.VERCEL_URL}),/UNVERIFIED/);
});
test('staging: missing, mismatched, expired or opaque keys and inherited external secrets fail closed',()=>{
 for(const patch of [
  {SUPABASE_SERVICE_ROLE_KEY:undefined},
  {SUPABASE_SERVICE_ROLE_KEY:token('service_role','opdjpdjettgfndctjcnj')},
  {NEXT_PUBLIC_SUPABASE_ANON_KEY:token('service_role')},
  {NEXT_PUBLIC_SUPABASE_ANON_KEY:'opaque-fixture'},
  {NEXT_PUBLIC_SUPABASE_ANON_KEY:'fixture.'+Buffer.from(JSON.stringify({role:'anon',ref:registration.supabaseProjectRef,exp:1})).toString('base64url')+'.invalid'},
  {STRIPE_SECRET_KEY:'forbidden-fixture'},{STRIPE_WEBHOOK_SECRET:'forbidden-fixture'},
  {NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:'forbidden-fixture'},
  {OPENAI_API_KEY:'forbidden-fixture'},{OPENAI_ADMIN_KEY:'forbidden-fixture'},
  {SUPABASE_ACCESS_TOKEN:'forbidden-fixture'},{DATABASE_URL:'forbidden-fixture'},
 ])assert.throws(()=>validateStagingEnvironment({...valid,...patch}),/UNVERIFIED/);
});
test('staging: all financial/AI/Storage routes stop before SDK, session, database or network',async()=>{
 setEnv(valid);const saved=globalThis.fetch;globalThis.fetch=()=>{network++;throw Error('Network forbidden')};
 try{
  const before=authCalls;
  for(const [path,handler] of routes){const response=await handler(new Request(valid.NEXT_PUBLIC_APP_URL+'/api/'+path,{method:'POST'}));assert.equal(response.status,503,path);assert.equal(response.headers.get('cache-control'),'no-store')}
  assert.equal((await tracking(new Request(valid.NEXT_PUBLIC_APP_URL+'/checkout/go/fixture'),{params:Promise.resolve({slug:'fixture'})})).status,503);
  for(const run of [
   ()=>payouts.sellerForAccount('fixture'),()=>payouts.recordPayout(),()=>payouts.syncProducerFinance(),()=>payouts.requestProducerPayout(),
   ()=>processor.assertDirectChargeAccount(),()=>processor.processCheckoutCompleted({}),()=>processor.processPaymentIntentSettlement(),
   ()=>connect.createStripeConnectAccount(),()=>connect.createStripeAccountLink(),()=>connect.getStripeConnectAccount(),
  ])await assert.rejects(run,/INTEGRATION_BLOCKED/);
  for(const run of [()=>stripe.checkout,()=>stripe.webhooks,()=>openai.chat,()=>assertStripeLive()])assert.throws(run,/INTEGRATION_BLOCKED/);
  assert.equal(authCalls,before);assert.deepEqual([stripeConstructed,openaiConstructed,supabaseConstructed,network],[0,0,0,0]);
 }finally{globalThis.fetch=saved}
});
test('staging: invalid production activation blocks clients and HTTP before side effects',async()=>{
 setEnv({...valid,VERCEL_PROJECT_ID:'prj_mDBer36P7vACcz1oUWV4QobYNHI8'});
 assert.throws(()=>admin.from,/UNVERIFIED/);assert.throws(()=>stripe.checkout,/UNVERIFIED/);
 assert.throws(()=>assertIntegrationsEnabled(),/UNVERIFIED/);
 assert.equal((await routes[0][1](new Request('https://www.uranova.com.br/api/stripe/checkout',{method:'POST'}))).status,503);
 assert.deepEqual([stripeConstructed,openaiConstructed,supabaseConstructed],[0,0,0]);
});
test('staging: middleware allows Auth only, blocks remote images/tracking and hides finance dashboard',async()=>{
 setEnv(valid);
 const request=path=>new NextRequest(valid.NEXT_PUBLIC_APP_URL+path,{headers:{host:valid.VERCEL_URL}});
 for(const path of ['/api/stripe/checkout','/api/ai/chat','/api/products','/api/files/upload','/checkout/go/test','/_next/image?url=https://example.invalid/image','/dashboard/finance']){
  assert.equal((await middleware(request(path))).status,503,path);
 }
 const response=await middleware(request('/auth/login'));assert.equal(response.status,200);
 assert.ok(response.headers.get('content-security-policy').includes('connect-src \'self\' https://unkupjzifylpredkenvj.supabase.co'));
 assert.equal(new URL((await middleware(request('/dashboard'))).headers.get('location')).pathname,'/auth/staging-status');
 assert.equal((await middleware(new NextRequest(valid.NEXT_PUBLIC_APP_URL+'/auth/login',{headers:{host:'www.uranova.com.br'}}))).status,503);
});
test('staging: PKCE callback retains signup/recovery behavior with isolated mocked Auth',async()=>{
 setEnv(valid);
 for(const [next,path] of [['/auth/reset-password','/auth/reset-password'],['https://evil.invalid','/dashboard']]){
  const response=await callback(new Request(valid.NEXT_PUBLIC_APP_URL+'/auth/callback?code=fixture&next='+encodeURIComponent(next)));
  assert.equal(response.status,303);assert.equal(new URL(response.headers.get('location')).pathname,path);
 }
 assert.deepEqual([stripeConstructed,openaiConstructed,supabaseConstructed,network],[0,0,0,0]);
});
