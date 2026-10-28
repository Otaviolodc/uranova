import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import * as React from 'react';

let slots = [], cursor = 0, effects = [], collectEffects = false;
mock.module('react', { namedExports: {
  ...React,
  useState(initial) {
    const index = cursor++;
    if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
    return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
  },
  useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
  useCallback(callback) { return callback; },
  useEffect(effect) { if (collectEffects) effects.push(effect); },
} });
mock.module('next/image', { defaultExport: 'img' });
mock.module('next/link', { defaultExport: 'a' });
mock.module('next/navigation', { namedExports: { useParams: () => ({ id: 'product-1' }) } });
let calls, replies, auth, alerts;
const supabase = {
  auth: { getUser: () => auth() },
  from(table) {
    calls.push(['from', table]);
    const query = {
      select(value) { calls.push(['select', value]); return query; },
      eq(key, value) { calls.push(['eq', key, value]); return query; },
      order() { return query; }, single() { return query; }, maybeSingle() { return query; },
      insert(value) { calls.push(['insert', table, value]); return query; },
      update(value) { calls.push(['update', table, value]); return query; },
      delete() { throw new Error('Deletion must not be exercised'); },
      then(resolve, reject) {
        assert.ok(replies.length, 'unexpected query');
        const reply = replies.shift();
        return (reply instanceof Error ? Promise.reject(reply) : Promise.resolve(reply)).then(resolve, reject);
      },
    };
    return query;
  },
};
mock.module('@/lib/supabase/client', { namedExports: { supabase } });
const { validateProductDraft } = await import('../src/lib/products/editor-validation.ts');
const { uploadProductFiles, MAX_PRODUCT_UPLOAD_BYTES } = await import('../src/lib/products/upload.ts');
const { useProductUploads } = await import('../src/hooks/useProductUploads.ts');
const { default: Editor } = await import('../src/app/dashboard/products/page.tsx');
const { default: ProductForm } = await import('../src/components/products/ProductForm.tsx');
const { default: ProductList } = await import('../src/components/products/ProductList.tsx');
const { default: CustomerPage } = await import('../src/app/dashboard/customer/products/[id]/page.tsx');
const CustomerProductContent = CustomerPage().type;

function reset(...responses) {
  slots = []; cursor = 0; effects = []; collectEffects = false; calls = []; replies = responses; alerts = [];
  auth = async () => ({ data: { user: { id: 'seller-1' } }, error: null });
  globalThis.alert = (value) => alerts.push(value);
  globalThis.fetch = () => { throw new Error('Unexpected network access'); };
}
function render(component, props = {}) { cursor = 0; return component(props); }
function nodes(tree) { return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object' ? [tree, ...nodes(tree.props?.children)] : []; }
function text(tree) { return Array.isArray(tree) ? tree.map(text).join(' ') : tree == null || typeof tree === 'boolean' ? '' : typeof tree === 'object' ? text(tree.props?.children) : String(tree); }
function find(tree, predicate) { const found = nodes(tree).find(predicate); assert.ok(found, 'expected element'); return found; }
const form = (tree) => find(tree, (node) => node.type === ProductForm).props;
const tick = () => new Promise(setImmediate);
const fixture = (overrides = {}) => ({ id: '', product_id: '', user_id: '', title: 'Guia', description: 'Texto', price: '17.90',
  image_url: null, file_path: 'seller-1/original.pdf', affiliate_url: 'https://example.invalid/?ref=abc', type: 'pdf',
  is_marketplace: false, checkout_slug: '', status: 'active', created_at: '', updated_at: null, ...overrides });
function editorWith(product) { render(Editor); slots[1] = product; return render(Editor); }
const pdf = (name = 'guide.pdf') => new File(['%PDF-fixture'], name, { type: 'application/pdf' });
const response = (path) => Response.json({ path, url: `https://example.invalid/${path}` });

test('form validation requires title and content for new file products without changing fields', () => {
  const original = fixture(); const snapshot = structuredClone(original);
  assert.equal(validateProductDraft(original), null);
  assert.deepEqual(original, snapshot);
  assert.match(validateProductDraft(fixture({ title: '  ' })), /título/);
  assert.match(validateProductDraft(fixture({ file_path: null })), /conteúdo/);
  assert.equal(validateProductDraft(fixture({ id: 'existing', file_path: null })), null);
  assert.equal(validateProductDraft(fixture({ id: 'legacy', type: 'curso' })), null);
  for (const type of ['course', 'mentoring']) assert.equal(validateProductDraft(fixture({ type, file_path: null })), null);
});

test('bundle and single-file validation reject incompatible references without rewriting them', () => {
  for (const file_path of ['broken', '[]', '[1]', '[""]']) assert.match(validateProductDraft(fixture({ type: 'bundle', file_path })), /pack válido/);
  assert.equal(validateProductDraft(fixture({ type: 'bundle', file_path: '["owner/a.pdf","owner/b.pdf"]' })), null);
  assert.match(validateProductDraft(fixture({ file_path: '["owner/a.pdf"]' })), /único arquivo/);
});

test('all files are validated before any upload: empty, oversized, signature and count', async () => {
  reset();
  const large = new File([new Uint8Array(MAX_PRODUCT_UPLOAD_BYTES + 1)], 'large.pdf');
  for (const [files, kind] of [
    [[new File([], 'empty.pdf')], 'pdf'], [[large], 'pdf'], [[pdf(), new File(['bad'], 'bad.pdf')], 'bundle'],
    [[pdf(), pdf()], 'pdf'], [[pdf()], 'cover'], [Array.from({ length: 101 }, () => pdf()), 'bundle'],
  ]) await assert.rejects(uploadProductFiles(files, kind, new AbortController().signal, new Map(), () => {}));
});

test('single file, EPUB and cover retain the exact server reference', async () => {
  reset(); let count = 0;
  globalThis.fetch = async () => { count++; return response('owner/original-reference'); };
  for (const [file, kind, expected] of [
    [pdf(), 'pdf', 'owner/original-reference'],
    [new File([new Uint8Array([80,75,3,4,1])], 'book.epub'), 'ebook', 'owner/original-reference'],
    [new File([new Uint8Array([137,80,78,71,13,10,26,10])], 'cover.png'), 'cover', 'https://example.invalid/owner/original-reference'],
  ]) assert.equal(await uploadProductFiles([file], kind, new AbortController().signal, new Map(), () => {}), expected);
  assert.equal(count, 3);
});

test('bundle partial failure retains confirmed paths and explicit retry avoids reuploading them', async () => {
  reset(); const files = [pdf('a.pdf'), pdf('b.pdf')], cache = new Map(), progress = []; let count = 0;
  globalThis.fetch = async () => ++count === 1 ? response('owner/a.pdf') : new Response('', { status: 503 });
  await assert.rejects(uploadProductFiles(files, 'bundle', new AbortController().signal, cache, (...args) => progress.push(args)));
  assert.equal(cache.get(files[0]), 'owner/a.pdf'); assert.equal(cache.has(files[1]), false);
  globalThis.fetch = async () => { count++; return response('owner/b.pdf'); };
  assert.equal(await uploadProductFiles(files, 'bundle', new AbortController().signal, cache, () => {}), '["owner/a.pdf","owner/b.pdf"]');
  assert.equal(count, 3); assert.deepEqual(progress, [[0, 2], [1, 2]]);
});

test('network failure, invalid JSON and invalid success response never produce a reference', async () => {
  reset();
  for (const fetcher of [async () => { throw new TypeError('offline'); }, async () => new Response('not-json'), async () => Response.json({ path: null })]) {
    globalThis.fetch = fetcher;
    const cache = new Map();
    await assert.rejects(uploadProductFiles([pdf()], 'pdf', new AbortController().signal, cache, () => {}));
    assert.equal(cache.size, 0);
  }
});

test('cancellation before upload and between files never starts the next request', async () => {
  reset(); const controller = new AbortController(); controller.abort();
  await assert.rejects(uploadProductFiles([pdf()], 'pdf', controller.signal, new Map(), () => {}), { name: 'AbortError' });
  const active = new AbortController(); let count = 0;
  globalThis.fetch = async () => { count++; return response('owner/a.pdf'); };
  await assert.rejects(uploadProductFiles([pdf('a.pdf'), pdf('b.pdf')], 'bundle', active.signal, new Map(), (done) => { if (done === 1) active.abort(); }), { name: 'AbortError' });
  assert.equal(count, 1);
});

test('upload hook blocks concurrent uploads and preserves previous reference on network failure', async () => {
  reset(); const updates = []; const update = (...args) => updates.push(args);
  globalThis.fetch = async () => { throw new TypeError('offline'); };
  let hook = render(useProductUploads, update);
  const first = hook.upload([pdf()], 'pdf');
  assert.equal(hook.isUploading(), true);
  await hook.upload([pdf('duplicate.pdf')], 'pdf'); await first;
  hook = render(useProductUploads, update);
  assert.deepEqual(updates, []); assert.equal(hook.uploading, false); assert.equal(hook.canRetry, true);
  assert.match(hook.message, /referências anteriores foram preservadas/);
  globalThis.fetch = async () => response('owner/new.pdf');
  await hook.retry(); assert.deepEqual(updates, [['file_path', 'owner/new.pdf']]);
});

test('cancelled hook upload never replaces existing content and unlocks controls', async () => {
  reset(); const updates = []; let started;
  const ready = new Promise((resolve) => { started = resolve; });
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => {
    started(); signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
  let hook = render(useProductUploads, (...args) => updates.push(args));
  const pending = hook.upload([pdf()], 'pdf'); await ready; hook.cancel(); await pending;
  hook = render(useProductUploads, () => {});
  assert.deepEqual(updates, []); assert.equal(hook.uploading, false); assert.match(hook.message, /cancelado/);
});

test('form exposes editing and uploading states without altering price or publication', () => {
  reset(); const props = { product: fixture(), updateField() {}, loading: false, editingId: 'existing', handleUpload() {}, handleProductFileUpload() {}, handleCreate() {} };
  const tree = ProductForm({ ...props, uploading: true });
  assert.equal(tree.type, 'fieldset'); assert.equal(tree.props.disabled, true);
  assert.match(text(tree), /Editar Produto/); assert.match(text(tree), /Enviando arquivos/);
  assert.equal(find(tree, (node) => node.props?.placeholder === 'Preço').props.value, '17.90');
  assert.equal(find(tree, (node) => node.props?.type === 'checkbox').props.checked, false);
});

test('invalid draft is stopped before auth or persistence', async () => {
  reset(); auth = () => { throw new Error('must not authenticate invalid form'); };
  const tree = editorWith(fixture({ title: '' })); await form(tree).handleCreate();
  assert.deepEqual(calls, []); assert.match(text(render(Editor)), /título/);
});

test('same-tick duplicate submission creates only one pair of unchanged records', async () => {
  reset({ data: { id: 'created-1' }, error: null }, { error: null }, { data: [], error: null });
  const original = fixture(); const tree = editorWith(original);
  await Promise.all([form(tree).handleCreate(), form(tree).handleCreate()]);
  const inserts = calls.filter(([method]) => method === 'insert');
  assert.equal(inserts.length, 2);
  assert.deepEqual(inserts[0], ['insert', 'products', [{ user_id: 'seller-1', title: original.title, price: original.price,
    image_url: null, affiliate_url: original.affiliate_url, file_path: original.file_path, type: 'pdf' }]]);
  const row = inserts[1][2][0];
  assert.equal(row.product_id, 'created-1'); assert.equal(row.price, original.price);
  assert.equal(row.file_path, original.file_path); assert.equal(row.is_marketplace, false); assert.equal(row.status, 'active');
  assert.equal(alerts.length, 1);
});

test('second write failure preserves draft and locks retries without rollback or deletion', async () => {
  reset({ data: { id: 'partial-1' }, error: null }, { error: { message: 'second write failed' } });
  const original = fixture(); const tree = editorWith(original); await form(tree).handleCreate();
  const after = render(Editor);
  assert.match(text(after), /Cadastro incompleto.*partial-1/);
  assert.equal(form(after).saveBlocked, true); assert.deepEqual(form(after).product, original);
  await form(after).handleCreate(); assert.equal(calls.filter(([method]) => method === 'insert').length, 2);
  assert.equal(alerts.length, 0);
});

test('first persistence rejection locks uncertain retries and missing session does not', async () => {
  reset(new TypeError('network lost')); let tree = editorWith(fixture()); await form(tree).handleCreate();
  assert.equal(form(render(Editor)).saveBlocked, true); assert.equal(calls.filter(([method]) => method === 'insert').length, 1);
  reset(); auth = async () => ({ data: { user: null } }); tree = editorWith(fixture()); await form(tree).handleCreate();
  assert.equal(form(render(Editor)).saveBlocked, false); assert.deepEqual(calls, []);
  assert.match(text(render(Editor)), /sessão/);
});

test('editing preserves the original update payload and never synchronizes buyer content', async () => {
  reset({ error: null }, { data: [], error: null }); const product = fixture({ id: 'checkout-1', product_id: 'content-1' });
  await form(editorWith(product)).handleCreate();
  assert.deepEqual(calls.filter(([method]) => method === 'update'), [['update', 'products_checkout', {
    title: product.title, description: product.description, price: product.price, affiliate_url: product.affiliate_url,
    type: product.type, is_marketplace: product.is_marketplace, image_url: product.image_url, file_path: product.file_path,
  }]]);
  assert.ok(!calls.some((call) => call[0] === 'from' && call[1] === 'customer_products'));
  assert.ok(!calls.some((call) => call[0] === 'from' && call[1] === 'products'));
});

test('seller listing distinguishes initial loading, empty response and query failure', async () => {
  for (const response of [{ data: [], error: null }, { data: null, error: { message: 'denied' } }]) {
    reset(response); collectEffects = true; const initial = render(Editor); collectEffects = false;
    assert.match(text(initial), /Carregando produtos/); const cleanups = effects.map((effect) => effect()); await tick();
    assert.match(text(render(Editor)), response.error ? /Não foi possível carregar/ : /Nenhum produto cadastrado/);
    cleanups.forEach((cleanup) => cleanup?.());
  }
});

test('switching product type clears pending retry and file input can be selected again without losing references', async () => {
  reset(); const original = fixture(); let tree = editorWith(original);
  globalThis.fetch = async () => { throw new TypeError('offline'); };
  const event = { target: { files: [pdf()], value: 'selected.pdf' } };
  await form(tree).handleProductFileUpload(event);
  assert.equal(event.target.value, '');
  tree = render(Editor); assert.match(text(tree), /Retomar envio/);
  form(tree).updateField('type', 'ebook');
  assert.doesNotMatch(text(render(Editor)), /Retomar envio/);
  assert.equal(form(render(Editor)).product.file_path, original.file_path);
});

test('unmounting cancels upload and ignores a late successful response', async () => {
  reset(); const updates = []; let finish, started;
  const ready = new Promise((resolve) => { started = resolve; });
  globalThis.fetch = () => new Promise((resolve) => { finish = resolve; started(); });
  collectEffects = true; const hook = render(useProductUploads, (...args) => updates.push(args)); collectEffects = false;
  const cleanup = effects[0]();
  const pending = hook.upload([pdf()], 'pdf'); await ready; cleanup();
  finish(response('owner/late.pdf')); await pending;
  assert.deepEqual(updates, []);
});

test('customer page handles session failure, absent product and no access without null dereference', async () => {
  for (const scenario of ['session', 'product', 'access']) {
    reset(...(scenario === 'product' ? [{ data: [{ id: 'access-1', product_id: 'product-1', status: 'active', expires_at: null, unlocked_at: '2026-01-01' }], error: null }, { data: null, error: null }] : scenario === 'access' ? [{ data: [], error: null }] : []));
    if (scenario === 'session') auth = async () => ({ data: { user: null } });
    collectEffects = true; render(CustomerProductContent, { id: 'product-1' }); collectEffects = false;
    effects.forEach((effect) => effect()); await tick();
    const tree = render(CustomerProductContent, { id: 'product-1' });
    assert.match(text(tree), scenario === 'access' ? /Acesso Negado/ : scenario === 'product' ? /produto não está disponível/ : /Não foi possível carregar/);
  }
});

test('customer bundle with malformed entries does not crash or change access query', async () => {
  reset({ data: [{ id: 'access-1', product_id: 'product-1', status: 'active', expires_at: null, unlocked_at: '2026-01-01' }], error: null }, { data: fixture({ id: 'product-1', type: 'bundle', file_path: '[null,3]' }), error: null });
  collectEffects = true; render(CustomerProductContent, { id: 'product-1' }); collectEffects = false;
  effects.forEach((effect) => effect()); await tick();
  assert.match(text(render(CustomerProductContent, { id: 'product-1' })), /Nenhum arquivo foi encontrado/);
  assert.ok(calls.some((call) => JSON.stringify(call) === '["eq","status","active"]'));
  assert.ok(!calls.some(([method]) => ['insert', 'update', 'delete'].includes(method)));
});

test('seller list image fallback and Portuguese type labels do not change delete callback', () => {
  reset(); const deleted = []; const tree = ProductList({ products: [fixture({ id: 'checkout-1', type: 'bundle' })], editProduct() {}, deleteProduct: (id) => deleted.push(id) });
  assert.match(text(tree), /Pack de Arquivos/);
  // Inspection only: never invoke the delete callback.
  assert.equal(typeof find(tree, (node) => node.type === 'button' && text(node).includes('Excluir')).props.onClick, 'function');
  assert.deepEqual(deleted, []);
});
