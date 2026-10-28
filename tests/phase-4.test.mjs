import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import * as React from 'react';
import { registerHooks } from 'node:module';
registerHooks({resolve(specifier,context,next){return next(specifier==='next/dynamic'?'next/dynamic.js':specifier,context);}});
import { loadCustomerLibrary, preferredAccess, accessLabel, libraryDestination, readableDate } from '../src/lib/customer-library.ts';
let slots=[],cursor=0,effects=[],collect=false,calls=[],replies=[],auth;
mock.module('react',{namedExports:{...React,
 useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},
 useRef(initial){const i=cursor++;return slots[i]??={current:initial};},
 useMemo(fn){return fn();},useCallback(fn){return fn;},useEffect(fn){if(collect)effects.push(fn);},
}});
mock.module('next/link',{defaultExport:'a'});
mock.module('next/image',{defaultExport:'img'});
mock.module('next/navigation',{namedExports:{notFound:()=>{throw new Error('NOT_FOUND');},useParams:()=>({id:'p'}),usePathname:()=>'/dashboard/customer/products/p',useRouter:()=>({push(){}})}});
const client={auth:{getUser:()=>auth(),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},from(table){calls.push(['from',table]);const q={};
 for(const method of ['select','eq','in','order','range','single','maybeSingle','update'])q[method]=(...args)=>{calls.push([method,...args]);return q;};
 q.then=(resolve,reject)=>{assert.ok(replies.length,`Unexpected query ${table}`);const reply=replies.shift();return (reply instanceof Error?Promise.reject(reply):Promise.resolve(reply)).then(resolve,reject);};return q;}};
mock.module('@/lib/supabase/server',{namedExports:{createClient:async()=>client}});
mock.module('@/lib/supabase/client',{namedExports:{supabase:client}});
mock.module('@/lib/services/storage.service',{namedExports:{uploadFile:async()=>{throw new Error('No uploads allowed');}}});
const {default:Library}=await import('../src/app/dashboard/customer/products/page.tsx');
const {default:Details}=await import('../src/app/dashboard/customer/products/[id]/page.tsx');const DetailContent=Details().type;
const {default:Settings}=await import('../src/app/dashboard/settings/page.tsx');
const {default:Sidebar}=await import('../src/components/layout/Sidebar.tsx');
const {default:Topbar}=await import('../src/components/layout/Topbar.tsx');
function reset(...data){slots=[];cursor=0;effects=[];collect=false;calls=[];replies=data.map(data=>({data,error:null}));auth=async()=>({data:{user:{id:'u'}},error:null});globalThis.fetch=()=>{throw new Error('Unexpected network');};globalThis.document={addEventListener(){},removeEventListener(){}};}
function render(component,props={}){cursor=0;return component(props);}
function nodes(tree){return Array.isArray(tree)?tree.flatMap(nodes):tree&&typeof tree==='object'?[tree,...nodes(tree.props?.children)]:[];}
function text(tree){return Array.isArray(tree)?tree.map(text).join(' '):tree==null||typeof tree==='boolean'?'':typeof tree==='object'?text(tree.props?.children):String(tree);}
function find(tree,predicate){const node=nodes(tree).find(predicate);assert.ok(node);return node;}
const tick=()=>new Promise(setImmediate);
async function mount(component,props={}){collect=true;render(component,props);collect=false;const cleanups=effects.map(effect=>effect());await tick();return {tree:render(component,props),cleanups};}
const access=(overrides={})=>({id:'a',product_id:'p',status:'active',expires_at:null,unlocked_at:'2026-01-01',...overrides});
const product=(overrides={})=>({id:'p',title:'Educação',type:'curso',image_url:null,file_path:null,...overrides});

test('duplicate presentation prefers a valid access without mutating input or rights',()=>{const entries=[access({id:'old',expires_at:'2000-01-01'}),access({id:'valid'}),access({id:'revoked',status:'inactive',unlocked_at:'2030-01-01'})];assert.equal(preferredAccess(entries).id,'valid');assert.equal(entries[0].id,'old');assert.equal(accessLabel(entries[0]),'Expirado');assert.equal(accessLabel(entries[2]),'Indisponível');assert.equal(readableDate('invalid'),'—');assert.equal(libraryDestination(product()),'/dashboard/my-courses/p');});
test('library returns missing/expired states and one entry per product',async()=>{reset([access(),access({id:'b'}),access({id:'c',product_id:'missing'}),access({id:'d',product_id:'expired',expires_at:'2000-01-01'})],[product(),product({id:'expired'})]);const result=await loadCustomerLibrary(client);assert.equal(result.length,3);assert.equal(result.find(p=>p.id==='p').available,true);assert.equal(result.find(p=>p.id==='expired').accessLabel,'Expirado');assert.equal(result.find(p=>p.id==='missing').missing,true);assert.ok(calls.some(c=>c[0]==='eq'&&c[1]==='customer_id'&&c[2]==='u'));assert.ok(!calls.some(c=>c[0]==='update'));});
test('library paginates accesses and deduplicates product reads',async()=>{reset(Array.from({length:200},(_,i)=>access({id:String(i)})),[access({id:'last'})],[product()]);assert.equal((await loadCustomerLibrary(client)).length,1);assert.deepEqual(calls.filter(c=>c[0]==='range'),[['range',0,199],['range',200,399]]);});
test('missing session and query failure are errors, null successful response is empty',async()=>{reset();auth=async()=>({data:{user:null}});await assert.rejects(loadCustomerLibrary(client),/SESSION_REQUIRED/);assert.equal(calls.length,0);reset();replies=[{data:null,error:{message:'denied'}}];await assert.rejects(loadCustomerLibrary(client),/LIBRARY_READ_FAILED/);reset(null);assert.deepEqual(await loadCustomerLibrary(client),[]);});
test('library displays query error without empty library and retry loads aliases',async()=>{reset();replies=[{data:null,error:{message:'failure'}}];let {tree}=await mount(Library);assert.match(text(tree),/Não foi possível carregar/);assert.doesNotMatch(text(tree),/biblioteca está vazia/);replies=[{data:[access()],error:null},{data:[product()],error:null}];find(tree,n=>n.type==='button'&&text(n).includes('Tentar')).props.onClick();effects=[];({tree}=await mount(Library));assert.equal(find(tree,n=>n.type==='a'&&text(n).includes('Acessar Curso')).props.href,'/dashboard/my-courses/p');});
test('library ignores late results after unmount',async()=>{reset();let finish;auth=()=>new Promise(resolve=>{finish=resolve;});collect=true;render(Library);collect=false;const cleanup=effects[0]();const before=JSON.stringify(slots);cleanup();finish({data:{user:null}});await tick();assert.equal(JSON.stringify(slots),before);});
test('details deny expired access, allow valid duplicate, distinguish absent product',async()=>{reset([access({expires_at:'2000-01-01'})]);assert.match(text((await mount(DetailContent,{id:'p'})).tree),/Acesso Negado/);assert.equal(calls.filter(c=>c[0]==='from').length,1);reset([access({expires_at:'2000-01-01'}),access({id:'valid'})],product());assert.match(text((await mount(DetailContent,{id:'p'})).tree),/Acessar curso/);reset([access()],null);assert.match(text((await mount(DetailContent,{id:'p'})).tree),/produto não está disponível/);});
test('settings cannot render an editable form after failed profile load',async()=>{reset();replies=[{data:null,error:{message:'failure'}}];const {tree}=await mount(Settings);assert.match(text(tree),/Não foi possível carregar seu perfil/);assert.ok(!nodes(tree).some(n=>n.type?.name==='SettingsForm'));assert.ok(!calls.some(c=>c[0]==='update'));});
test('settings saves only allowed fields to authenticated owner and confirms returned row',async()=>{reset({id:'u',username:'owner',name:'Ana',is_pro:true,role:'admin'});let {tree}=await mount(Settings);const form=find(tree,n=>n.type?.name==='SettingsForm');replies=[{data:{id:'u'},error:null}];await form.props.handleSave();const update=calls.find(c=>c[0]==='update')[1];assert.ok(!('role' in update));assert.ok(!('is_pro' in update));assert.match(text(render(Settings)),/Perfil atualizado/);auth=async()=>({data:{user:{id:'other'}}});const before=calls.length;await form.props.handleSave();assert.equal(calls.length,before);assert.match(text(render(Settings)),/Não foi possível confirmar/);});
test('topbar reports notification read error instead of empty and sidebar links courses',async()=>{reset({id:'u',name:'Ana'});replies.push({data:null,error:{message:'failure'}});let {tree}=await mount(Topbar);find(tree,n=>n.type==='button'&&n.props['aria-label']==='Abrir notificações').props.onClick();tree=render(Topbar);assert.match(text(tree),/Não foi possível carregar/);assert.doesNotMatch(text(tree),/Nenhuma notificação/);reset();const sidebar=render(Sidebar,{userId:'u',totalEarned:0});assert.ok(nodes(sidebar).some(n=>n.props?.href==='/dashboard/my-courses'));});

const {default:CourseEditor}=await import('../src/app/dashboard/products/[id]/edit/page.tsx');
test('course editor verifies authentication, ownership and category on server',async()=>{
 reset();auth=async()=>({data:{user:null}});await assert.rejects(CourseEditor({params:Promise.resolve({id:'p'})}),/NOT_FOUND/);assert.equal(calls.length,0);
 reset(null);await assert.rejects(CourseEditor({params:Promise.resolve({id:'p'})}),/NOT_FOUND/);
 reset(product({type:'pdf'}));await assert.rejects(CourseEditor({params:Promise.resolve({id:'p'})}),/NOT_FOUND/);
 reset(product());const tree=await CourseEditor({params:Promise.resolve({id:'p'})});assert.match(text(tree),/Editor da/);assert.ok(calls.some(c=>c[0]==='eq'&&c[1]==='user_id'&&c[2]==='u'));
});
test('mentoring materials keep protected endpoint and reference index; blocked download has feedback',async()=>{
 reset([access()],product({type:'mentoria',file_path:'["u/a.pdf","u/b.pdf"]'}));let {tree}=await mount(DetailContent,{id:'p'});
 const popup={opener:{},location:{href:''},close(){this.closed=true;}};let opened=false,sent;
 globalThis.window={open(){opened=true;return popup;}};
 globalThis.fetch=async(url,options)=>{assert.equal(opened,true);assert.equal(url,'/api/files/download');sent=JSON.parse(options.body);return Response.json({url:'https://example.invalid/signed'});};
 await find(tree,n=>n.type==='button'&&/complementar\s+2/.test(text(n))).props.onClick();assert.deepEqual(sent,{productId:'p',index:1});assert.equal(popup.opener,null);assert.equal(popup.location.href,'https://example.invalid/signed');
 globalThis.fetch=async()=>Response.json({error:'denied'},{status:403});await find(tree,n=>n.type==='button'&&/complementar\s+1/.test(text(n))).props.onClick();tree=render(DetailContent,{id:'p'});assert.match(text(tree),/Download indispon/);assert.equal(popup.closed,true);
});
