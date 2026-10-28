import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import * as React from 'react';

let slots, cursor, pendingEffects, cleanups, auth, replies, calls, writes;
const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
mock.module('react', { namedExports: { ...React,
  useState(initial) {
    const i = cursor++;
    if (!(i in slots)) slots[i] = initial;
    return [slots[i], value => { writes++; slots[i] = typeof value === 'function' ? value(slots[i]) : value; }];
  },
  useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
  useMemo(callback) { return callback(); },
  useEffect(callback, deps) {
    const i = cursor++;
    if (!same(slots[i], deps)) pendingEffects.push(() => { cleanups[i]?.(); cleanups[i] = callback(); });
    slots[i] = deps;
  },
} });
mock.module('recharts', { namedExports: Object.fromEntries(
  ['LineChart','Line','XAxis','YAxis','Tooltip','ResponsiveContainer','CartesianGrid'].map(n => [n,n])
) });
const client = {
  auth: { getUser: () => auth() },
  from(table) {
    calls.push(['from',table]);
    const q = {};
    for (const method of ['select','eq','order','in']) q[method] = (...args) => { calls.push([method,...args]); return q; };
    q.then = (resolve,reject) => {
      assert.ok(replies.length, 'Unexpected query');
      const value = replies.shift();
      return (value instanceof Error ? Promise.reject(value) : Promise.resolve(value)).then(resolve,reject);
    };
    return q;
  },
};
mock.module('@/lib/supabase/client', { namedExports: { supabase: client } });
const { default: Page } = await import('../src/app/dashboard/analytics/page.tsx');
function reset(...data) {
  slots=[]; cursor=0; pendingEffects=[]; cleanups=[]; calls=[]; writes=0; replies=data;
  auth=async()=>({data:{user:{id:'owner'}},error:null});
}
function render() { cursor=0; return Page(); }
async function flush() { for(const run of pendingEffects.splice(0)) run(); await new Promise(resolve=>setImmediate(resolve)); }
function nodes(tree) { return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree==='object' ? [tree,...nodes(tree.props?.children)] : []; }
function text(tree) { return Array.isArray(tree) ? tree.map(text).join(' ') : tree && typeof tree==='object' ? text(tree.props?.children) : tree == null ? '' : String(tree); }
const alert = tree => nodes(tree).find(n=>n.props?.role==='alert');
const retry = tree => nodes(tree).find(n=>n.type==='button' && text(n)==='Tentar novamente').props.onClick;
function deferred() { let resolve, reject; const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject}; }
const event={created_at:new Date().toISOString(),product_id:'p1'};

test('analytics success preserves ranking, price, owner filter and seven-day counts',async()=>{
  reset({data:[event,event]},{data:[{id:'p1',title:'Course',price:'19.90'}]});
  assert.match(text(render()),/Carregando/); await flush(); const tree=render();
  assert.equal(alert(tree),undefined); assert.match(text(tree),/Course/); assert.match(text(tree),/19.90/);
  const chart=nodes(tree).find(n=>n.type==='LineChart');
  assert.equal(chart.props.data.length,7); assert.equal(chart.props.data.reduce((sum,x)=>sum+x.clicks,0),2);
  assert.ok(calls.some(c=>c[0]==='eq' && c[1]==='user_id' && c[2]==='owner'));
  assert.deepEqual(calls.find(c=>c[0]==='in'),['in','id',['p1']]);
});
test('analytics empty result is valid and does not query products',async()=>{
  reset({data:[]});render();await flush();assert.equal(alert(render()),undefined);
  assert.equal(calls.filter(c=>c[0]==='from').length,1);
});
test('missing session and returned auth errors stop before data queries',async()=>{
  for(const result of [{data:{user:null},error:null},{data:{user:{id:'owner'}},error:{message:'private auth detail'}}]) {
    reset();auth=async()=>result;render();await flush();const tree=render();
    assert.match(text(alert(tree)),/sessão/);assert.doesNotMatch(text(tree),/Carregando|private auth detail|Acessos totais/);
    assert.equal(calls.length,0);
  }
});
test('returned query errors at either stage hide partial metrics and offer retry',async()=>{
  for(const responses of [[{error:{message:'private database detail'}}],[{data:[event]},{error:{message:'private database detail'}}]]) {
    reset(...responses);render();await flush();const tree=render();
    assert.ok(alert(tree));assert.equal(typeof retry(tree),'function');
    assert.doesNotMatch(text(tree),/Carregando|private database detail|Acessos totais/);
  }
});
test('promise rejection in authentication, analytics or product query always ends loading',async()=>{
  for(const stage of ['auth','analytics','products']) {
    reset(...(stage==='products'?[{data:[event]},new Error('private rejection')]:[new Error('private rejection')]));
    if(stage==='auth')auth=async()=>{throw Error('private rejection');};
    render();await flush();const tree=render();assert.ok(alert(tree));assert.doesNotMatch(text(tree),/Carregando|private rejection/);
  }
});
test('retry clears error, restores loading and recovers after failure',async()=>{
  reset({error:{message:'failure'}});render();await flush();const click=retry(render());
  replies.push({data:[event]},{data:[{id:'p1',title:'Recovered',price:12}]});click();
  assert.match(text(render()),/Carregando/);await flush();const tree=render();
  assert.equal(alert(tree),undefined);assert.match(text(tree),/Recovered/);
});
test('late success or rejection cannot overwrite newer success or clear its loading',async()=>{
  for(const lateFailure of [false,true]) {
    reset({error:{message:'initial'}});render();await flush();const click=retry(render());
    const old=deferred();replies.push({data:[event]},old.promise);click();render();await flush();
    const current=deferred();replies.push(current.promise);click();render();await flush();
    const before=writes;
    if(lateFailure)old.reject(Error('obsolete'));else old.resolve({data:[{id:'p1',title:'Obsolete',price:999}]});
    await flush();assert.equal(writes,before);assert.match(text(render()),/Carregando/);
    current.resolve({data:[]});await flush();const tree=render();assert.equal(alert(tree),undefined);assert.doesNotMatch(text(tree),/Obsolete|Carregando/);
  }
});
test('an older analytics response after newer success cannot launch product queries or change data',async()=>{
  reset({error:{message:'initial'}});render();await flush();const click=retry(render());
  const old=deferred();replies.push(old.promise);click();render();await flush();
  replies.push({data:[]});click();render();await flush();const before=writes, queryCount=calls.length;
  old.resolve({data:[event]});await flush();assert.equal(writes,before);assert.equal(calls.length,queryCount);
  assert.equal(alert(render()),undefined);
});
test('cleanup invalidates pending authentication before any downstream query or state update',async()=>{
  reset();const waiting=deferred();auth=()=>waiting.promise;render();await flush();
  for(const cleanup of cleanups)cleanup?.();const before=writes;
  waiting.resolve({data:{user:{id:'owner'}},error:null});await flush();
  assert.equal(writes,before);assert.equal(calls.length,0);
});
