import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  return next(specifier === 'next/navigation' ? 'next/navigation.js' : specifier, context);
} });
const url = p => pathToFileURL(`${process.cwd()}/src/${p}.ts`).href;
let user, role, rows, failure, requests;
process.env.OWNER_EMAIL = 'owner@example.invalid';
mock.module(url('lib/supabase/server'), { namedExports: {
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user }, error: null }) } }),
} });
mock.module(url('lib/supabase/admin'), { namedExports: { admin: {
  from(table) {
    return {
      select(columns, options) {
        this.columns = columns;
        if (options?.head) {
          requests.push({ table, head: true });
          return Promise.resolve({ count: failure ? null : 7, error: failure });
        }
        return this;
      },
      eq() { return this; },
      single: async () => ({ data: { role }, error: null }),
      order() { return this; },
      async range(start, end) {
        requests.push({ table, start, end, columns: this.columns });
        if (failure?.table === table) {
          if (failure.throws) throw Error('Network unavailable');
          return { data: null, count: null, error: failure.error };
        }
        return { data: rows[table].slice(start, end + 1), count: rows[table].length, error: null };
      },
    };
  },
} } });
const { classifyProduct, summarizeProducts, getAdminProductCatalog, getAdminRecordCount } = await import('../src/lib/services/admin-products.ts');
const product = id => ({ id, title: id, price: '10', type: 'pdf', user_id: 'seller', created_at: '2026-10-01', owner: null });
const checkout = (id, product_id, overrides = {}) => ({ id, product_id, is_active: true, status: 'active', is_marketplace: false, ...overrides });
beforeEach(() => {
  user = { id: 'owner', email: process.env.OWNER_EMAIL }; role = 'admin';
  rows = { products: [], products_checkout: [] }; failure = null; requests = [];
});

test('seven historical records with no checkout remain visible, unpublished and unchanged', async () => {
  rows.products = Array.from({ length: 7 }, (_, i) => product(String(i)));
  const before = structuredClone(rows);
  const result = await getAdminProductCatalog();
  assert.deepEqual(result.counts, { registered: 7, active: 0, marketplace: 0, withoutCheckout: 7 });
  assert.ok(result.products.every(p => p.commercialStatus === 'Sem checkout'));
  assert.deepEqual(rows, before);
  assert.match(requests[0].columns, /owner:profiles!user_id\(name,username\)/);
});

test('classification requires both active fields and prioritizes marketplace across multiple checkouts', () => {
  assert.equal(classifyProduct([]), 'Sem checkout');
  for (const change of [{ is_active: false }, { is_active: null }, { status: 'inactive' }, { status: null }]) {
    assert.equal(classifyProduct([checkout('c', 'p', { is_marketplace: true, ...change })]), 'Checkout inativo');
  }
  assert.equal(classifyProduct([checkout('c', 'p')]), 'Ativo fora do Marketplace');
  assert.equal(classifyProduct([checkout('c', 'p'), checkout('d', 'p', { is_marketplace: true })]), 'Publicado no Marketplace');
});

test('counts distinct products and keeps different owners and unrelated checkouts separate', () => {
  const result = summarizeProducts([product('a'), { ...product('b'), user_id: 'other' }, product('c'), product('d')], [
    checkout('1', 'a', { is_marketplace: true }), checkout('2', 'a', { is_marketplace: true }),
    checkout('3', 'b'), checkout('4', 'c', { is_active: false }),
    checkout('5', 'missing', { is_marketplace: true }), checkout('6', null),
  ]);
  assert.deepEqual(result.counts, { registered: 4, active: 2, marketplace: 1, withoutCheckout: 1 });
  assert.equal(result.products[1].user_id, 'other');
  assert.equal(result.products[1].commercialStatus, 'Ativo fora do Marketplace');
});

test('reads beyond the first page of both sources', async () => {
  rows.products = Array.from({ length: 501 }, (_, i) => product(String(i)));
  rows.products_checkout = rows.products.map(p => checkout(p.id, p.id));
  assert.equal((await getAdminProductCatalog()).counts.active, 501);
  assert.equal(requests.filter(r => r.start === 500).length, 2);
});

test('query errors, missing results and network failures never become confirmed zero counts', async () => {
  for (const table of ['products', 'products_checkout']) {
    for (const variant of [{ error: { message: 'unavailable' } }, { error: null }, { throws: true }]) {
      failure = { table, ...variant };
      assert.equal(await getAdminProductCatalog(), null);
    }
  }
  failure = { message: 'unavailable' };
  assert.equal(await getAdminRecordCount('profiles'), null);
  assert.equal(await getAdminRecordCount('orders'), null);
});

test('unauthenticated, non-admin and wrong-owner users cannot read the administrative catalog', async () => {
  for (const variant of [{ user: null, role: 'admin' }, { user, role: 'user' }, { user: { ...user, email: 'other@example.invalid' }, role: 'admin' }]) {
    user = variant.user; role = variant.role;
    await assert.rejects(getAdminProductCatalog, /UNAUTHENTICATED|FORBIDDEN/);
    await assert.rejects(() => getAdminRecordCount('orders'), /UNAUTHENTICATED|FORBIDDEN/);
    assert.deepEqual(requests, []);
  }
});

test('database permission failures propagate instead of presenting an empty catalog', async () => {
  failure = { table: 'products', error: { code: '42501', message: 'permission denied' } };
  await assert.rejects(getAdminProductCatalog, e => e.code === '42501');
});
