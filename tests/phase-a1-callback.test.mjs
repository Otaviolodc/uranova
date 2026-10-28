import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
let valid=true, calls=0;
mock.module(pathToFileURL(process.cwd()+'/src/lib/supabase/server.ts').href,{namedExports:{async createClient(){return {auth:{async exchangeCodeForSession(){calls++;return {data:{session:valid?{}:null,user:valid?{}:null},error:valid?null:{message:'expired'}}}}}}}});
const {GET}=await import('../src/app/auth/callback/route.ts');
test('A1: PKCE success, recovery allowlist and external redirect rejection',async()=>{
 for(const [next,expected] of [['/auth/reset-password','/auth/reset-password'],['https://evil.invalid','/dashboard'],['//evil.invalid','/dashboard']]){
  const response=await GET(new Request('https://example.invalid/auth/callback?code=fixture&next='+encodeURIComponent(next)));
  assert.equal(response.status,303);assert.equal(response.headers.get('location'),'https://example.invalid'+expected);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('referrer-policy'),'no-referrer');
 }
});
test('A1: missing, expired or failed PKCE never grants access',async()=>{
 valid=false;
 for(const query of ['','?code=expired','?code=fixture&error=access_denied']){
  const response=await GET(new Request('https://example.invalid/auth/callback'+query));
  assert.equal(response.headers.get('location'),'https://example.invalid/auth/login?error=confirmation_failed');
 }
 assert.equal(calls,4);
});
