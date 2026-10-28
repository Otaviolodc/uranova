import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import * as React from 'react';
import { redirect } from 'next/dist/client/components/redirect.js';
import { unstable_rethrow } from 'next/dist/client/components/unstable-rethrow.js';
import { registerHooks } from 'node:module';
registerHooks({resolve(specifier, context, next) { return next(specifier === 'next/dynamic' ? 'next/dynamic.js' : specifier, context); }});
let slots = [], cursor = 0, effects = [], collect = false, refreshes = 0;
mock.module('react', { namedExports: { ...React,
  useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], v => { slots[i] = typeof v === 'function' ? v(slots[i]) : v; }]; },
  useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
  useCallback(fn) { return fn; }, useEffect(fn) { if (collect) effects.push(fn); },
  useTransition() { return [false, fn => fn()]; },
} });
mock.module('next/navigation', { namedExports: { redirect, unstable_rethrow, usePathname: () => '/dashboard/customer/products', useRouter: () => ({ refresh() { refreshes++; } }) } });
mock.module('next/link', { defaultExport: 'a' });
let session, summary, summaryCalls, responses, calls;
const client = { auth: { async getUser() { if (session instanceof Error) throw session; return session; } }, from(table) {
  calls.push(['from', table]); const q = {};
  for (const method of ['select', 'eq', 'not', 'order', 'limit']) q[method] = (...args) => { calls.push([method, ...args]); return q; };
  q.then = (resolve, reject) => { assert.ok(responses.length, 'Unexpected query'); const result = responses.shift(); return (result instanceof Error ? Promise.reject(result) : Promise.resolve(result)).then(resolve, reject); }; return q;
} };
mock.module('@/lib/supabase/server', { namedExports: { createClient: async () => client } });
mock.module('@/lib/supabase/client', { namedExports: { supabase: client } });
mock.module('@/lib/supabase/admin', { namedExports: { admin: client } });
mock.module('@/lib/finance/access', { namedExports: { async requireFinanceUser() { if (session instanceof Error) throw session; if (!session.data.user) throw Error('UNAUTHENTICATED'); return session.data.user; } } });
mock.module('@/lib/services/balance', { namedExports: { async getUserFinancialSummary(id) { summaryCalls++; assert.equal(id, 'u'); if (summary instanceof Error) throw summary; return summary; } } });
mock.module('@/lib/services/financial', { namedExports: { async getFinancialHistory() { return [{ id: 'p', created_at: '2026-01-01', type: 'sale', description: 'Venda', amount: 85.62 }]; } } });
mock.module('@/lib/services/finance-reader', { namedExports: { async getFinanceSummary() { return { gross_cents: 10000, approved_sales: 1 }; } } });
const { default: Layout } = await import('../src/app/dashboard/layout.tsx');
const { default: Sidebar } = await import('../src/components/layout/Sidebar.tsx');
const { default: Summary } = await import('../src/components/finance/SidebarFinance.tsx');
const { default: Retry } = await import('../src/components/finance/ReadRetry.tsx');
const { default: Orders } = await import('../src/app/dashboard/orders/page.tsx');
const { default: Recent } = await import('../src/components/dashboard/RecentSales.tsx');
const { default: History } = await import('../src/components/finance/FinancialHistory.tsx');
const { default: Achievement } = await import('../src/components/dashboard/AchievementProgress.tsx');
const { default: Dashboard } = await import('../src/app/dashboard/page.tsx');
function reset() { slots = []; cursor = 0; effects = []; collect = false; refreshes = 0; summaryCalls = 0; summary = { total_net: 85.62 }; responses = []; calls = []; session = { data: { user: { id: 'u' } }, error: null }; globalThis.fetch = () => { throw Error('Network prohibited'); }; }
function nodes(t) { return Array.isArray(t) ? t.flatMap(nodes) : t && typeof t === 'object' ? [t, ...nodes(t.props?.children)] : []; }
function text(t) { return Array.isArray(t) ? t.map(text).join(' ') : t == null || typeof t === 'boolean' ? '' : typeof t === 'object' ? text(t.props?.children) : String(t); }
function render(component, props = {}) { cursor = 0; return component(props); }
const tick = () => new Promise(setImmediate);
async function mountOrders() { collect = true; render(Orders); collect = false; const cleanups = effects.map(fn => fn()); await tick(); return { tree: render(Orders), cleanups }; }
const order = overrides => ({ id: 'o', customer_name: 'Cliente sintético', customer_email: null, amount: 100, status: 'PAID', created_at: '2026-01-01', products: { title: 'Produto sintético' }, ...overrides });

test('7B-A: layout renders independent children and navigation without awaiting summary', async () => {
  reset(); summary = new Error('SYNTHETIC_DB_DETAIL');
  for (const destination of ['/dashboard/customer/products', '/dashboard/my-courses', '/dashboard/settings']) {
    const child = React.createElement('p', null, destination);
    const tree = await Layout({ children: child });
    assert.ok(nodes(tree).includes(child)); assert.equal(summaryCalls, 0);
    const sidebar = nodes(tree).find(n => n.type === Sidebar);
    const menu = render(Sidebar, sidebar.props);
    assert.ok(nodes(menu).some(n => n.props?.href === destination));
    assert.equal(sidebar.props.financialSummary.type, React.Suspense);
    assert.match(text(sidebar.props.financialSummary.props.fallback), /Carregando resumo/);
  }
  const failed = await Summary({ userId: 'u' });
  assert.match(text(failed), /Resumo financeiro indisponível/);
  assert.doesNotMatch(text(failed), /SYNTHETIC|R\$|0,00/);
  assert.ok(!nodes(failed).some(n => n.type === Achievement));
});
test('7B-A: summary preserves actual value; read retry refreshes without mutation', async () => {
  reset(); const tree = await Summary({ userId: 'u' }); assert.equal(tree.props.totalEarned, 85.62);
  render(Retry).props.onClick(); assert.equal(refreshes, 1); assert.equal(calls.length, 0);
  summary = new Error('offline'); await Summary({ userId: 'u' }); summary = { total_net: 0 };
  assert.equal((await Summary({ userId: 'u' })).props.totalEarned, 0);
});
test('7B-A: session, permission and Next control flow are never converted to financial fallback', async () => {
  reset(); session = { data: { user: null }, error: null }; await assert.rejects(Layout({ children: 'private' }), /NEXT_REDIRECT/);
  reset(); session = Error('session unavailable'); await assert.rejects(Layout({ children: 'private' }), /session unavailable/);
  for (const message of ['UNAUTHENTICATED', 'FORBIDDEN', 'permission denied for table payments']) {
    reset(); summary = Error(message); await assert.rejects(Summary({ userId: 'u' }), error => error === summary);
  }
  reset(); summary = Object.assign(Error('provider failure'), { __isAuthError: true }); await assert.rejects(Summary({ userId: 'u' }), error => error === summary);
  try { redirect('/auth/login'); } catch (error) { summary = error; }
  await assert.rejects(Summary({ userId: 'u' }), /NEXT_REDIRECT/);
});
test('7B-A: Orders loading, failed, retried and empty states are distinct with identical query', async () => {
  reset(); assert.match(text(render(Orders)), /Carregando pedidos/);
  responses = [{ data: null, error: { message: 'SYNTHETIC_DB_DETAIL' } }];
  let { tree } = await mountOrders(); assert.match(text(tree), /Não foi possível carregar/);
  assert.doesNotMatch(text(tree), /Nenhum pedido|SYNTHETIC|Vendas confirmadas/);
  const originalQuery = structuredClone(calls); responses = [{ data: [], error: null }]; calls = [];
  nodes(tree).find(n => n.type === 'button').props.onClick(); await tick(); tree = render(Orders);
  assert.match(text(tree), /Nenhum pedido ainda/); assert.deepEqual(calls, originalQuery);
  assert.deepEqual(calls.filter(c => c[0] === 'eq'), [['eq', 'user_id', 'u']]);
  assert.ok(!calls.some(c => ['insert', 'update', 'delete', 'rpc'].includes(c[0])));
});
test('7B-A: Orders shows data, handles network and session errors and ignores late completion', async () => {
  reset(); responses = [{ data: [order()], error: null }]; assert.match(text((await mountOrders()).tree), /Cliente sintético/);
  reset(); responses = [Error('SYNTHETIC_NETWORK')]; assert.match(text((await mountOrders()).tree), /Não foi possível carregar/);
  reset(); session = { data: { user: null }, error: null }; assert.match(text((await mountOrders()).tree), /sessão/); assert.equal(calls.length, 0);
  reset(); let finish; const previous = client.auth.getUser; client.auth.getUser = () => new Promise(resolve => { finish = resolve; });
  collect = true; render(Orders); collect = false; const cleanup = effects[0](); await tick(); cleanup(); const before = JSON.stringify(slots);
  finish({ data: { user: { id: 'u' } }, error: null }); await tick(); assert.equal(JSON.stringify(slots), before); assert.equal(calls.length, 0); client.auth.getUser = previous;
});
test('7B-A: RecentSales accepts object, array and missing product without changing query or amount', async () => {
  for (const [products, title] of [[{ title: 'Objeto' }, 'Objeto'], [[{ title: 'Array' }], 'Array'], [null, 'Produto indisponível'], [[], 'Produto indisponível']]) {
    reset(); responses = [{ data: [order({ products })], error: null }]; const tree = await Recent(); assert.match(text(tree), new RegExp(title)); assert.match(text(tree), /APROVADA/); assert.match(text(tree), /100,00/);
    assert.deepEqual(calls, [['from', 'orders'], ['select', 'id,customer_name,amount,status,created_at,products(title)'], ['eq', 'user_id', 'u'], ['not', 'stripe_payment_intent_id', 'is', null], ['order', 'created_at', { ascending: false }], ['limit', 10]]);
  }
});
test('7B-A: RecentSales does not invent approval; query failure and permission denial remain distinct', async () => {
  for (const [status, label] of [['PENDING', 'PENDENTE'], ['CANCELED', 'CANCELADA'], ['UNRECOGNIZED', 'Status desconhecido'], [null, 'Status desconhecido']]) {
    reset(); responses = [{ data: [order({ status })], error: null }]; const tree = await Recent(); assert.match(text(tree), new RegExp(label)); assert.doesNotMatch(text(tree), /APROVADA/);
  }
  reset(); responses = [{ data: null, error: { message: 'SYNTHETIC_DB_DETAIL' } }]; const tree = await Recent(); assert.match(text(tree), /Não foi possível carregar/); assert.doesNotMatch(text(tree), /Nenhuma venda|SYNTHETIC/);
  reset(); responses = [{ data: null, error: { message: 'permission denied' } }]; await assert.rejects(Recent(), /permission denied/);
  reset(); session = { data: { user: null } }; await assert.rejects(Recent(), /UNAUTHENTICATED/); assert.equal(calls.length, 0);
});
test('7B-A: History explains limit and monetary meaning without changing returned value', async () => {
  reset(); const tree = await History({ userId: 'u' }); assert.match(text(tree), /Últimas 100 vendas verificadas/); assert.match(text(tree), /não é um extrato completo/); assert.match(text(tree), /85,62/);
  assert.match(text(Achievement({ totalEarned: 85.62 })), /Receita líquida acumulada do produtor/);
});
test('7B-A: Dashboard labels existing gross and ticket values without changing arithmetic', async () => {
  reset(); const cards = nodes(await Dashboard()).filter(n => n.props?.title);
  const gross = cards.find(n => n.props.title.includes('Faturamento bruto'));
  assert.equal(gross.props.value, 'R$ 100.00'); assert.match(gross.props.subtitle, /GMV/);
  assert.equal(cards.find(n => n.props.title.includes('Ticket')).props.value, 'R$ 100.00');
});
