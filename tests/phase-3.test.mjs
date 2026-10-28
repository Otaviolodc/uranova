import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { courseSequence, orderCourseItems, nextPosition, isCourse, isMentoring, courseVideo, completionCount } from '../src/lib/courses.ts';
import { certificateDocument, certificateName } from '../src/lib/services/certificate-document.ts';
import { activeAccess } from '../src/lib/security/validation.ts';
import { readFileSync } from 'node:fs';

let replies = [], calls = [], signedIn = true;
const client = {
  auth: { getUser: async () => ({ data: { user: signedIn ? { id: '11111111-1111-4111-8111-111111111111' } : null }, error: null }) },
  from(table) {
    calls.push(['from', table]);
    const q = {};
    for (const method of ['select','eq','in','order','single','maybeSingle','upsert']) q[method] = (...args) => { calls.push([method,...args]); return q; };
    q.then = (resolve, reject) => { assert.ok(replies.length, `Unexpected query ${table}`); const result = replies.shift(); return (result instanceof Error ? Promise.reject(result) : Promise.resolve(result)).then(resolve,reject); };
    return q;
  },
};
mock.module('@/lib/supabase/server', { namedExports: { createClient: async () => client } });
mock.module('@/lib/supabase/admin', { namedExports: { admin: client } });
mock.module('@/lib/finance/access', { namedExports: { requireFinanceOwner: async () => { if (!signedIn) throw new Error('FORBIDDEN'); } } });
mock.module('next/link', { defaultExport: 'a' });
const { requireCourseAccess } = await import('../src/lib/security/course-access.ts');
const { completeLesson } = await import('../src/lib/services/lessonProgress.ts');
const { getCourseCompletion } = await import('../src/lib/services/certificate.ts');
const { default: MyCourses } = await import('../src/app/dashboard/my-courses/page.tsx');
const owner='11111111-1111-4111-8111-111111111111', product='22222222-2222-4222-8222-222222222222';
function reset(...data) { signedIn=true; calls=[]; replies=data.map(value=>({data:value,error:null})); }
function text(tree) { return Array.isArray(tree) ? tree.map(text).join(' ') : tree == null || typeof tree==='boolean' ? '' : typeof tree==='object' ? text(tree.props?.children) : String(tree); }

test('sequence groups lessons by ordered modules, including ties and legacy missing positions',()=>{
 const modules=[{id:'b',position:1},{id:'a',position:0}], lessons=[{id:'b1',module_id:'b',position:0},{id:'a2',module_id:'a',position:1},{id:'a1',module_id:'a',position:0},{id:'orphan',module_id:'x',position:0}];
 assert.deepEqual(courseSequence(modules,lessons).map(x=>x.id),['a1','a2','b1']);
 assert.deepEqual(modules.map(x=>x.id),['b','a']);
 assert.deepEqual(orderCourseItems([{id:'z'},{id:'b',position:0},{id:'a',position:0}]).map(x=>x.id),['a','b','z']);
 assert.equal(nextPosition([{id:'a',position:7}]),8); assert.equal(nextPosition([]),0);
});
test('course and mentoring filters support legacy labels without treating files as courses',()=>{
 for(const type of ['course','curso',' Curso '])assert.equal(isCourse(type),true);
 for(const type of ['pdf','ebook','mentoring',null])assert.equal(isCourse(type),false);
 assert.equal(isMentoring('mentoria'),true); assert.equal(isMentoring('mentoring'),true);
});
test('video URLs validate host and protocol and support YouTube, Vimeo and uploaded video',()=>{
 assert.equal(courseVideo('https://youtu.be/abcdefghijk','youtube').url,'https://www.youtube-nocookie.com/embed/abcdefghijk');
 assert.equal(courseVideo('https://vimeo.com/123456','vimeo').url,'https://player.vimeo.com/video/123456');
 assert.equal(courseVideo('https://youtu.be.attacker.invalid/abcdefghijk','youtube'),null);
 assert.equal(courseVideo('javascript:alert(1)','external'),null);
 assert.equal(courseVideo('https://example.invalid/video.mp4','upload').kind,'video');
 assert.equal(courseVideo('https://example.invalid/material','external').kind,'link');
});
test('completion counts unique known lessons only; empty courses do not complete',()=>{
 assert.deepEqual(completionCount(['a','b'],['a','a','other']),{totalLessons:2,completedLessons:1,completed:false});
 assert.equal(completionCount([],[]).completed,false);
 assert.equal(completionCount(['a'],['a']).completed,true);
});
test('profile name uses persisted name and requires it without email fallback',()=>{
 assert.equal(certificateName({name:'  Joa\u0303o da Conceic\u0327a\u0303o  '}),'João da Conceição');
 assert.throws(()=>certificateName({name:' '}),/NAME_REQUIRED/);
});
test('actual synthetic PDF handles Brazilian accented names and decomposed Unicode',async()=>{
 for(const name of ['João Gonçalves','Márcia D’Ávila','Luís Antônio — São José','Joa\u0303o']){
   const bytes=await certificateDocument(name,'Educação e Gestão',new Date('2026-10-21T12:00:00Z'));
   assert.equal((await PDFDocument.load(bytes)).getPageCount(),1);
   assert.ok(bytes.length>500);
 }
});
test('unsupported Unicode is explicit and never silently transliterated',async()=>{
 await assert.rejects(certificateDocument('李明','Curso'),/UNSUPPORTED_CHARACTER/);
 await assert.rejects(certificateDocument('Ana\nMaria','Curso'),/TEXT_INVALID/);
 await assert.rejects(certificateDocument('A'.repeat(1000),'Curso'),/TEXT_TOO_LONG/);
});
test('access still requires owner or active unexpired purchase; preview flag is not a grant',async()=>{
 reset({user_id:'other'},[]); await assert.rejects(requireCourseAccess(owner,product),/FORBIDDEN/);
 reset({user_id:'other'},[{status:'active',expires_at:'2000-01-01'}]); await assert.rejects(requireCourseAccess(owner,product),/FORBIDDEN/);
 reset({user_id:'other'},[{status:'active',expires_at:null}]); await requireCourseAccess(owner,product);
 reset(); signedIn=false; await assert.rejects(requireCourseAccess(owner,product),/FORBIDDEN/); assert.equal(calls.length,0);
 assert.equal(activeAccess({status:'inactive',expires_at:null}),false);
});
test('completion write rechecks course access even if an individual preview lesson is readable',async()=>{
 reset({id:product,module_id:product},{course_id:product},{user_id:'other'},[]);
 await assert.rejects(completeLesson(owner,product),/FORBIDDEN/);
 assert.equal(calls.some(call=>call[0]==='upsert'),false);
});
test('authorized completion preserves existing idempotent upsert and does not grant rights',async()=>{
 reset({id:product,module_id:product},{course_id:product},{user_id:owner},null);
 await completeLesson(owner,product);
 assert.equal(calls.filter(call=>call[0]==='upsert').length,1);
 assert.ok(!calls.some(call=>call[0]==='from'&&call[1]==='customer_products'));
});
test('completion service handles null collections and counts duplicate progress once',async()=>{
 reset({user_id:owner},null); assert.equal((await getCourseCompletion(owner,product)).completed,false);
 reset({user_id:owner},[{id:'m'}],[{id:'a'},{id:'b'}],[{lesson_id:'a'},{lesson_id:'a'}]);
 assert.equal((await getCourseCompletion(owner,product)).completedLessons,1);
});
test('My Courses filters file/mentoring products and handles empty, error and missing session',async()=>{
 reset([{product_id:product,status:'active',expires_at:null}],[{id:'1',title:'Curso correto',type:'course'},{id:'2',title:'Arquivo indevido',type:'pdf'},{id:'3',title:'Mentoria indevida',type:'mentoring'}]);
 const result=text(await MyCourses());assert.match(result,/Curso correto/);assert.doesNotMatch(result,/indevid/);
 reset([]);assert.match(text(await MyCourses()),/ainda não possui/);
 reset();replies=[{data:null,error:{message:'failure'}}];assert.match(text(await MyCourses()),/Não foi possível/);
 reset();signedIn=false;assert.match(text(await MyCourses()),/Entre na sua conta/);
});
test('preview and mentoring interfaces disclose unavailable delivery without invented rights',()=>{
 const settings=readFileSync('src/components/course/LessonSettings.tsx','utf8');assert.match(settings,/não libera acesso público/);
 const form=readFileSync('src/components/products/ProductForm.tsx','utf8');assert.match(form,/não cria sessões/);
 const buyer=readFileSync('src/app/dashboard/customer/products/[id]/page.tsx','utf8');assert.match(buyer,/Nenhuma sessão foi agendada/);
});

const { GET: certificateRoute } = await import('../src/app/api/course/certificate/route.ts');
test('certificate API uses only persisted name, emits PDF and preserves no-store',async()=>{
 reset({user_id:owner},[{id:'m'}],[{id:'a'}],[{lesson_id:'a'}],{title:'Curso de Educação',type:'course'},{name:'João Gonçalves'});
 const response=await certificateRoute(new Request(`https://local.invalid/api/course/certificate?productId=${product}`));
 assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
 assert.equal(response.headers.get('content-type'),'application/pdf');
 assert.ok(calls.some(call=>call[0]==='select'&&call[1]==='name'));
 assert.ok(!calls.some(call=>call[0]==='select'&&String(call[1]).includes('full_name')));
 assert.equal((await PDFDocument.load(await response.arrayBuffer())).getPageCount(),1);
});
test('certificate API denies unauthenticated, incomplete and unsupported names with actionable errors',async()=>{
 reset();signedIn=false;assert.equal((await certificateRoute(new Request('https://local.invalid'))).status,401);
 reset({user_id:owner},[]);assert.equal((await certificateRoute(new Request(`https://local.invalid?productId=${product}`))).status,403);
 reset({user_id:owner},[{id:'m'}],[{id:'a'}],[{lesson_id:'a'}],{title:'Curso',type:'course'},{name:'李明'});
 assert.equal((await certificateRoute(new Request(`https://local.invalid?productId=${product}`))).status,422);
});

import * as React from 'react';
let slots=[], cursor=0;
mock.module('react',{namedExports:{...React,
 useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},
 useRef(initial){const i=cursor++;return slots[i]??={current:initial};},
 useMemo(fn){return fn();},
}});
const {default:Player}=await import('../src/components/course/CoursePlayer.tsx');
const {default:Download}=await import('../src/components/course/CertificateDownload.tsx');
function nodes(tree){return Array.isArray(tree)?tree.flatMap(nodes):tree&&typeof tree==='object'?[tree,...nodes(tree.props?.children)]:[];}
function render(component,props){cursor=0;return component(props);}
function button(tree,label){const found=nodes(tree).find(n=>n.type==='button'&&text(n).includes(label));assert.ok(found,label);return found;}
const playerProps={userId:owner,product:{id:product,title:'Curso'},modules:[{id:'a',title:'A',position:0},{id:'b',title:'B',position:1}],lessons:[{id:'b1',module_id:'b',title:'Aula B',position:0},{id:'a2',module_id:'a',title:'Aula A2',position:1},{id:'a1',module_id:'a',title:'Aula A1',position:0}],completedLessons:[]};
test('player navigation follows modules; failed progress remains incomplete and can retry',async()=>{
 slots=[];let tree=render(Player,playerProps);assert.equal(button(tree,'Anterior').props.disabled,true);
 button(tree,'Próxima').props.onClick();tree=render(Player,playerProps);
 let sent;globalThis.fetch=async(_url,options)=>{sent=JSON.parse(options.body);return new Response('',{status:500});};
 await button(tree,'Marcar').props.onClick();tree=render(Player,playerProps);
 assert.deepEqual(sent,{lessonId:'a2'});assert.match(text(tree),/Não foi possível salvar/);assert.equal(button(tree,'Marcar').props.disabled,false);
 globalThis.fetch=async()=>new Response('',{status:200});await button(tree,'Marcar').props.onClick();tree=render(Player,playerProps);assert.equal(button(tree,'Aula concluída').props.disabled,true);
});
test('empty player disables completion and certificate download displays server error',async()=>{
 slots=[];assert.equal(button(render(Player,{...playerProps,lessons:[]}),'Marcar').props.disabled,true);
 slots=[];globalThis.fetch=async()=>Response.json({error:'Preencha seu nome no perfil.'},{status:422});
 await button(render(Download,{productId:product}),'Baixar').props.onClick();assert.match(text(render(Download,{productId:product})),/Preencha seu nome/);
});
