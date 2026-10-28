import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import * as React from 'react';

let slots, cursor, effects, slug, replies, calls, user;
const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
mock.module('react', { namedExports: { ...React,
  useState(initial) {
    const i = cursor++;
    if (!(i in slots)) slots[i] = initial;
    return [slots[i], value => { slots[i] = value; }];
  },
  useEffect(callback, deps) {
    const i = cursor++;
    if (!same(slots[i], deps)) effects.push(callback);
    slots[i] = deps;
  },
  useCallback(callback, deps) {
    const i = cursor++;
    if (!slots[i] || !same(slots[i].deps, deps)) slots[i] = { callback, deps };
    return slots[i].callback;
  },
} });
mock.module('next/navigation', { namedExports: { useParams: () => ({ slug }) } });
const supabase = {
  auth: { getUser: async () => ({ data: { user } }) },
  from(table) {
    calls.push(['from', table]);
    const q = {};
    for (const method of ['select', 'eq', 'neq', 'order', 'limit', 'maybeSingle', 'insert', 'delete']) {
      q[method] = (...args) => { calls.push([method, ...args]); return q; };
    }
    q.then = (resolve, reject) => {
      assert.ok(replies.length, 'Unexpected database query');
      const value = replies.shift();
      return (value instanceof Error ? Promise.reject(value) : Promise.resolve(value)).then(resolve, reject);
    };
    return q;
  },
};
mock.module('@/lib/supabase/client', { namedExports: { supabase } });
const { default: Product } = await import('../src/app/checkout/product/[slug]/page.tsx');
const { default: Checkouts } = await import('../src/app/dashboard/checkouts/page.tsx');
const { default: Coupons } = await import('../src/app/dashboard/coupons/page.tsx');
function reset(...data) {
  slots = []; effects = []; cursor = 0; calls = []; replies = data;
  slug = 'item%20one'; user = { id: 'owner' };
  globalThis.window = { location: { href: 'https://example.invalid/product' }, confirm: () => true };
}
function render(component) { cursor = 0; return component(); }
async function flush() {
  for (const effect of effects.splice(0)) effect();
  await new Promise(resolve => setImmediate(resolve));
}
function text(tree) {
  return Array.isArray(tree) ? tree.map(text).join(' ') : tree && typeof tree === 'object'
    ? text(tree.props?.children) : tree == null ? '' : String(tree);
}
function nodes(tree) {
  return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object'
    ? [tree, ...nodes(tree.props?.children)] : [];
}
const item = { id: 'p1', user_id: 'seller', title: 'Title', price: '12.34', checkout_slug: 'item one' };
test('product effect preserves query, analytics payload, price and purchase destination; stable slug does not refetch', async () => {
  reset({ data: item }, { data: null }, { data: [] });
  assert.match(text(render(Product)), /Carregando/);
  await flush();
  const tree = render(Product);
  assert.match(text(tree), /12.34/);
  assert.ok(nodes(tree).some(n => n.props?.href === '/checkout/item one'));
  assert.ok(calls.some(c => c[0] === 'eq' && c[1] === 'checkout_slug' && c[2] === 'item one'));
  assert.deepEqual(calls.find(c => c[0] === 'insert')[1], {
    user_id: 'seller', product_id: 'p1', event_type: 'product_view', page: 'product',
  });
  await flush();
  assert.equal(calls.filter(c => c[0] === 'insert').length, 1);
  slug = ['second'];
  replies.push({ data: { ...item, id: 'p2', checkout_slug: 'second' } }, { data: null }, { data: [] });
  render(Product); await flush();
  assert.ok(nodes(render(Product)).some(n => n.props?.href === '/checkout/second'));
  assert.equal(calls.filter(c => c[0] === 'insert').length, 2);
});
test('missing product and rejected query end loading without creating analytics', async () => {
  const log = mock.method(console, 'error', () => {});
  try {
    for (const response of [{ data: null }, new Error('local query failure')]) {
      reset(response); render(Product); await flush();
      assert.match(text(render(Product)), /Produto n/);
      assert.equal(calls.some(c => c[0] === 'insert'), false);
    }
  } finally { log.mock.restore(); }
});
test('missing slug retains initial loading and does not query', async () => {
  reset(); slug = undefined; render(Product); await flush();
  assert.match(text(render(Product)), /Carregando/);
  assert.equal(calls.length, 0);
});
test('checkout list keeps owner filtering and mount-only loading', async () => {
  reset({ data: [{ ...item, status: 'active' }] });
  render(Checkouts); await flush(); render(Checkouts); await flush();
  assert.ok(calls.some(c => c[0] === 'eq' && c[1] === 'user_id' && c[2] === 'owner'));
  assert.equal(calls.filter(c => c[0] === 'from').length, 1);
  reset(); user = null; render(Checkouts); await flush(); assert.equal(calls.length, 0);
});
test('coupon loading preserves list on query error and avoids unauthenticated queries', async () => {
  const log = mock.method(console, 'error', () => {});
  try {
    reset({ data: null, error: { message: 'local error' } });
    render(Coupons); slots[0] = [{ id: 'old', code: 'OLD', discount: 10 }]; await flush();
    assert.equal(slots[0][0].id, 'old');
    reset(); user = null; render(Coupons); await flush(); assert.equal(calls.length, 0);
  } finally { log.mock.restore(); }
});
test('coupon creation preserves payload, clears form and reloads owner list using only mocked queries', async () => {
  reset({ data: [] }); render(Coupons); await flush();
  slots[1] = 'SAVE'; slots[2] = '15';
  const button = nodes(render(Coupons)).find(n => n.type === 'button' && /Criar/.test(text(n)));
  assert.ok(button);
  replies.push({ error: null }, { data: [{ id: 'c1', code: 'SAVE', discount: 15 }] });
  await button.props.onClick(); await flush();
  assert.deepEqual(calls.find(c => c[0] === 'insert')[1], [{ user_id: 'owner', code: 'SAVE', discount: 15 }]);
  assert.equal(slots[1], ''); assert.equal(slots[2], '');
  assert.equal(slots[0][0].id, 'c1');
});
