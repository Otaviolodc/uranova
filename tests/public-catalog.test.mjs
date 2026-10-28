import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import * as React from 'react';

// No browser, credentials or remote data: exercise the real components with
// controlled hook state and a read-only Supabase double.
globalThis.fetch = () => { throw new Error('Network forbidden in catalog regression tests'); };
let state = [], cursor = 0, effects = [], runEffects = false;
mock.module('react', { namedExports: {
  ...React,
  useState(initial) {
    const index = cursor++;
    if (!(index in state)) state[index] = initial;
    return [state[index], (value) => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
  },
  useEffect(effect) { if (runEffects) effects.push(effect); },
} });

let replies, calls;
const supabase = {
  from(table) {
    calls.push(['from', table]);
    const query = {
      select(columns) { calls.push(['select', columns]); return query; },
      eq(column, value) { calls.push(['eq', column, value]); return query; },
      order(column, options) { calls.push(['order', column, options]); return query; },
      maybeSingle() { return query; },
      then(resolve, reject) {
        const reply = replies.shift();
        return (reply instanceof Error ? Promise.reject(reply) : Promise.resolve(reply)).then(resolve, reject);
      },
    };
    return query;
  },
};
mock.module('@/lib/supabase/client', { namedExports: { supabase } });
mock.module('@/lib/supabase/server', { namedExports: { createClient: async () => supabase } });
mock.module('next/link', { defaultExport: 'a' });
mock.module('next/image', { defaultExport: 'img' });

const { default: StorePage } = await import('../src/app/[username]/store/page.tsx');
const { default: StoreCatalog } = await import('../src/components/marketplace/StoreCatalog.tsx');
const { default: CatalogImage } = await import('../src/components/marketplace/CatalogImage.tsx');
const { default: MarketplacePage } = await import('../src/app/(site)/marketplace/page.tsx');
const { normalizeCategory, categoryLabel, matchesCatalogSearch, publicHttpUrl } = await import('../src/lib/public-catalog.ts');

function reset(...responses) { state = []; cursor = 0; effects = []; runEffects = false; replies = responses; calls = []; }
function render(component, props = {}) { cursor = 0; return component(props); }
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join(' ');
  if (tree == null || typeof tree === 'boolean') return '';
  if (typeof tree !== 'object') return String(tree);
  return text(tree.props?.children);
}
function find(tree, predicate) { const result = nodes(tree).find(predicate); assert.ok(result, 'expected UI element'); return result; }
async function loadMarket(response) {
  reset(response); runEffects = true;
  const initial = render(MarketplacePage);
  runEffects = false;
  const cleanup = effects.pop()();
  await new Promise(setImmediate);
  return { initial, tree: render(MarketplacePage), cleanup };
}
const item = (id, type, price = 10) => ({ id, title: `${type} ${id}`, type, price, checkout_slug: id, image_url: null });

test('canonical and legacy category values keep Portuguese labels', () => {
  for (const [value, canonical, label] of [
    ['course', 'course', 'Curso'], ['Curso', 'course', 'Curso'],
    ['mentoring', 'mentoring', 'Mentoria'], [' mentoria ', 'mentoring', 'Mentoria'],
    ['ebook', 'ebook', 'E-book'], ['e-book', 'ebook', 'E-book'],
    ['pdf', 'pdf', 'PDF'], ['bundle', 'bundle', 'Pack de Arquivos'],
    ['ferramenta', 'ferramenta', 'Ferramenta'],
  ]) { assert.equal(normalizeCategory(value), canonical); assert.equal(categoryLabel(value), label); }
  assert.equal(categoryLabel(null), 'Produto');
  assert.ok(matchesCatalogSearch('Produção Digital', ' producao '));
});

test('async route params identify the exact owner and preserve public projections', async () => {
  reset({ data: { id: 'owner-1', username: 'ana' }, error: null }, { data: [], error: null });
  const tree = await StorePage({ params: Promise.resolve({ username: 'ana' }) });
  assert.ok(text(tree).includes('ana'));
  assert.deepEqual(calls.filter(([method]) => method === 'from'), [['from', 'public_profiles'], ['from', 'products']]);
  assert.ok(calls.some((call) => JSON.stringify(call) === JSON.stringify(['eq', 'username', 'ana'])));
  assert.ok(calls.some((call) => JSON.stringify(call) === JSON.stringify(['eq', 'user_id', 'owner-1'])));
  assert.equal(find(tree, (node) => node.type === StoreCatalog).props.failed, false);
});

test('missing profile preserves not-found behavior without querying products', async () => {
  reset({ data: null, error: null });
  assert.match(text(await StorePage({ params: Promise.resolve({ username: 'missing' }) })), /Loja não encontrada/);
  assert.equal(calls.filter(([method]) => method === 'from').length, 1);
});

test('profile errors and product errors are not represented as empty stores', async () => {
  reset({ data: null, error: { message: 'denied' } });
  assert.match(text(await StorePage({ params: Promise.resolve({ username: 'ana' }) })), /Não foi possível/);
  reset({ data: { id: 'owner-1', username: 'ana' } }, { data: null, error: { message: 'failed' } });
  const tree = await StorePage({ params: Promise.resolve({ username: 'ana' }) });
  assert.equal(find(tree, (node) => node.type === StoreCatalog).props.failed, true);
});

test('store search combines with platform filter and keeps affiliate tracking URL intact', () => {
  reset();
  const url = 'https://example.com/product?affiliate=abc&campaign=phase1';
  const products = [
    { id: 'a', title: 'Produção', marketplace: 'shopee', affiliate_url: url },
    { id: 'b', title: 'Produção', marketplace: 'Amazon', affiliate_url: null },
  ];
  let tree = render(StoreCatalog, { products });
  assert.equal(find(tree, (node) => node.type === 'a').props.href, url);
  find(tree, (node) => node.type === 'button' && text(node) === 'Shopee').props.onClick();
  tree = render(StoreCatalog, { products });
  assert.equal(nodes(tree).filter((node) => node.type === 'article').length, 1);
  find(tree, (node) => node.type === 'input').props.onChange({ target: { value: ' producao ' } });
  assert.equal(nodes(render(StoreCatalog, { products })).filter((node) => node.type === 'article').length, 1);
  find(tree, (node) => node.type === 'input').props.onChange({ target: { value: 'missing' } });
  assert.match(text(render(StoreCatalog, { products })), /Nenhum produto corresponde/);
  assert.match(text(render(StoreCatalog, { products: [], failed: true })), /Não foi possível carregar/);
  assert.equal(publicHttpUrl('javascript:alert(1)'), null);
  assert.equal(publicHttpUrl(url), url);
});

test('marketplace loading, canonical and legacy filters, sorting and existing detail links', async () => {
  const products = [item('a', 'course', 30), item('b', 'curso', 10), item('c', 'mentoring'), item('d', 'mentoria'), item('e', 'bundle')];
  const { initial } = await loadMarket({ data: products, error: null });
  assert.match(text(initial), /Carregando produtos/);
  assert.doesNotMatch(text(initial), /Nenhum produto encontrado/);
  for (const [label, expected] of [['Curso', 2], ['Mentoria', 2], ['Pack de Arquivos', 1]]) {
    let tree = render(MarketplacePage);
    find(tree, (node) => node.type === 'button' && text(node).trim() === label).props.onClick();
    tree = render(MarketplacePage);
    const links = nodes(tree).filter((node) => node.props?.href?.startsWith('/checkout/product/'));
    assert.equal(links.length, expected);
    assert.doesNotMatch(text(tree), /Novidades do Marketplace/);
  }
  let tree = render(MarketplacePage);
  find(tree, (node) => node.type === 'button' && text(node).trim() === 'Curso').props.onClick();
  find(tree, (node) => node.type === 'select').props.onChange({ target: { value: 'menor-preco' } });
  tree = render(MarketplacePage);
  assert.deepEqual(nodes(tree).filter((node) => node.props?.href?.startsWith('/checkout/product/')).map((node) => node.props.href), ['/checkout/product/b', '/checkout/product/a']);
  assert.deepEqual(calls.filter(([method]) => method === 'eq'), [['eq', 'status', 'active'], ['eq', 'is_marketplace', true]]);
});

test('marketplace query error, retry, network rejection and empty success have distinct states', async () => {
  let { tree } = await loadMarket({ data: null, error: { message: 'unavailable' } });
  assert.match(text(tree), /Não foi possível carregar/);
  assert.doesNotMatch(text(tree), /Nenhum produto encontrado/);
  find(tree, (node) => node.type === 'button' && text(node) === 'Tentar novamente').props.onClick();
  replies.push({ data: [], error: null }); runEffects = true;
  tree = render(MarketplacePage); runEffects = false;
  assert.match(text(tree), /Carregando produtos/);
  effects.pop()(); await new Promise(setImmediate);
  assert.match(text(render(MarketplacePage)), /Nenhum produto encontrado/);
  ({ tree } = await loadMarket(new Error('network unavailable')));
  assert.match(text(tree), /Não foi possível carregar/);
});

test('late marketplace responses do not update an unmounted page', async () => {
  reset({ data: [item('late', 'course')], error: null }); runEffects = true;
  render(MarketplacePage); runEffects = false;
  const cleanup = effects.pop()(); cleanup();
  await new Promise(setImmediate);
  assert.deepEqual(state[0], []);
});

test('missing and broken images show fallback, and a new source can recover', () => {
  reset();
  assert.match(text(render(CatalogImage, { src: null, alt: 'Produto', className: '' })), /Sem imagem/);
  const props = { src: 'https://example.com/broken.jpg', alt: 'Produto', className: '' };
  find(render(CatalogImage, props), (node) => node.type === 'img').props.onError();
  assert.match(text(render(CatalogImage, props)), /Sem imagem/);
  find(render(CatalogImage, { ...props, src: 'https://example.com/new.jpg' }), (node) => node.type === 'img');
});
