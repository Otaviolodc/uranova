import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const url=p=>pathToFileURL(process.cwd()+'/src/'+p+'.ts').href;
const user={id:'10000000-0000-4000-8000-000000000001',email:'owner@example.invalid'};
let session=user,role='user',passwordOK=false,changed=0,attempts=[],signouts=0;
mock.module(url('lib/supabase/server'),{namedExports:{async createClient(){return {auth:{async getUser(){return {data:{user:session},error:null}},async updateUser(){changed++;return {error:null}}}}}}});
mock.module(url('lib/supabase/admin'),{namedExports:{admin:{async rpc(){return {data:{allowed:true,retry_after:0},error:null}},from(){return {select(){return this},eq(){return this},async single(){return {data:{role},error:null}}}}}}});
mock.module('@supabase/supabase-js',{namedExports:{createClient(){return {auth:{async signInWithPassword(args){attempts.push(args);return {data:{user:passwordOK?user:null,session:passwordOK?{}:null},error:passwordOK?null:{message:'wrong'}}},async signOut(){signouts++;return {error:null}}}}}}});
const {requireFinanceAdmin}=await import('../src/lib/finance/access.ts');
const {POST:password}=await import('../src/app/api/account/password/route.ts');
const {POST:closure}=await import('../src/app/api/account/delete/route.ts');
const req=body=>new Request('https://example.invalid/api/account/password',{method:'POST',headers:{origin:'https://example.invalid','content-type':'application/json'},body:JSON.stringify(body)});
test('24: admin requires verified session AND stored role AND configured owner email',async()=>{
 process.env.OWNER_EMAIL=user.email;await assert.rejects(requireFinanceAdmin(),/FORBIDDEN/);role='admin';assert.equal((await requireFinanceAdmin()).id,user.id);process.env.OWNER_EMAIL='other@example.invalid';await assert.rejects(requireFinanceAdmin(),/FORBIDDEN/);session=null;await assert.rejects(requireFinanceAdmin(),/UNAUTHENTICATED/);session=user;role='user';
});
test('26: actual password check before mutation; preserve whitespace; ephemeral session revoked',async()=>{
 const body={currentPassword:' current secret ',newPassword:' new password with spaces '};
 assert.equal((await password(req(body))).status,403);assert.equal(changed,0);passwordOK=true;
 assert.equal((await password(req(body))).status,200);assert.equal(changed,1);assert.equal(attempts.at(-1).password,body.currentPassword);assert.equal(signouts,1);
});
test('negative: extra fields, CSRF origin, malformed JSON, no session',async()=>{
 const b={currentPassword:'x',newPassword:'long password value',role:'admin'};assert.equal((await password(req(b))).status,400);
 assert.equal((await password(new Request('https://example.invalid',{method:'POST',body:'{}'}))).status,403);
 assert.equal((await password(new Request('https://example.invalid',{method:'POST',headers:{origin:'https://example.invalid','content-type':'application/json'},body:'{'}))).status,400);
 session=null;assert.equal((await password(req({}))).status,401);session=user;
});
test('01/19/21: closure has no mutation path even for authenticated empty account',async()=>{assert.equal((await closure()).status,409);session=null;assert.equal((await closure()).status,401);session=user;});
