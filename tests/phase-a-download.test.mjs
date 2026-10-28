import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const moduleURL=p=>pathToFileURL(process.cwd()+'/src/'+p+'.ts').href;
const owner='10000000-0000-4000-8000-000000000001',buyer='20000000-0000-4000-8000-000000000002',id='30000000-0000-4000-8000-000000000003';
let entitlement=[],owned=true,path='owner/file.pdf',signed=[],missing=false;
const admin={from(table){const query={select(){return this},eq(){return this},single(){return Promise.resolve({data:table==='products'?(missing?null:{id,user_id:owner,file_path:path}):{role:'user'},error:null})},then(resolve){resolve({data:entitlement,error:null})}};return query},async rpc(){return {data:owned,error:null}},storage:{from(){return {async createSignedUrl(p,seconds,options){signed.push({p,seconds,options});return {data:{signedUrl:'https://example.invalid/signed'},error:null}}}}}};
mock.module(moduleURL('lib/supabase/admin'),{namedExports:{admin}});
const {authorizedDownload}=await import('../src/lib/services/authorized-download.ts');
test('15/16: no purchase denied; active buyer signs only stored path for 60 seconds',async()=>{
 signed=[];entitlement=[];await assert.rejects(authorizedDownload({id:buyer},id,0),/FORBIDDEN/);assert.equal(signed.length,0);
 entitlement=[{status:'active',expires_at:null}];assert.equal(await authorizedDownload({id:buyer},id,0),'https://example.invalid/signed');assert.deepEqual(signed,[{p:path,seconds:60,options:{download:true}}]);
});
test('17/18: owner allowed, different owner or orphan file denied',async()=>{
 assert.equal(await authorizedDownload({id:owner},id,0),'https://example.invalid/signed');owned=false;
 await assert.rejects(authorizedDownload({id:owner},id,0),/FORBIDDEN/);owned=true;
});
test('negative: expiry, inactive entitlement, missing product and path traversal',async()=>{
 for(const access of [{status:'active',expires_at:'2000-01-01'},{status:'inactive',expires_at:null}]){entitlement=[access];await assert.rejects(authorizedDownload({id:buyer},id,0),/FORBIDDEN/);}
 missing=true;await assert.rejects(authorizedDownload({id:owner},id,0),/FORBIDDEN/);missing=false;
 for(const p of ['../secret','owner/%2e%2e/secret','https://external.invalid/file','owner\\secret']){path=p;await assert.rejects(authorizedDownload({id:owner},id,0));}
 path='owner/file.pdf';await assert.rejects(authorizedDownload({id:owner},'invalid',0),/INVALID_INPUT/);await assert.rejects(authorizedDownload({id:owner},id,-1),/INVALID_INPUT/);
});
