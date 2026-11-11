import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createInput, reservationInput, versionInput } from '../src/lib/product-foundation/contracts.ts';
import { createFoundationService } from '../src/lib/product-foundation/service.ts';
import { createLocalFoundationHandlers } from '../src/lib/product-foundation/http.ts';
import { POST } from '../src/app/api/product-drafts/commit/route.ts';
import { GET } from '../src/app/api/product-drafts/requests/[key]/route.ts';

globalThis.fetch = () => { throw new Error('Network prohibited'); };
const owner = '10000000-0000-4000-8000-000000000001';
const other = '20000000-0000-4000-8000-000000000002';
const key = '30000000-0000-4000-8000-000000000003';
const assetId = '40000000-0000-4000-8000-000000000004';
const second = '50000000-0000-4000-8000-000000000005';
const draft = { contract: '1', title: 'Arquivo sintético', description: null, price: '12.30', kind: 'pdf', assetIds: [assetId] };
const result = { productId: key, checkoutId: second, versionId: assetId, replayed: false };
const asset = { id: assetId, seller_id: owner, bucket: 'products', path: `${owner}/${assetId}`, name: 'file.pdf', size_bytes: 12, mime: 'application/pdf', sha256: 'a'.repeat(64), state: 'reserved' };
const evidence = { owner, bucket: asset.bucket, path: asset.path, size: asset.size_bytes, mime: asset.mime, sha256: asset.sha256 };
function setup(overrides = {}) {
  const calls = [];
  const ports = { authenticate: async () => ({ id: owner }),
    rpc: async (name, args) => { calls.push({ name, args }); return { data: result, error: null }; },
    inspectObject: async () => evidence, ...overrides };
  return { service: createFoundationService(ports), ports, calls };
}
const code = (value) => (error) => error.code === value;

test('draft validation preserves original price and ordered references without mutating input', () => {
  const input = { ...draft, kind: 'bundle', assetIds: [second, assetId] };
  const copy = structuredClone(input);
  assert.deepEqual(createInput(input), input); assert.deepEqual(input, copy);
});
test('rejects ownership injection, raw paths, missing content, duplicate files and unsupported types', () => {
  for (const input of [{ ...draft, seller_id: other }, { ...draft, file_path: 'secret' }, { ...draft, assetIds: [] },
    { ...draft, assetIds: [assetId, assetId], kind: 'bundle' }, { ...draft, kind: 'course' }, { ...draft, title: ' ' }]) assert.throws(() => createInput(input));
});
test('reserving a file checks limits, signatures metadata and allowed bucket without uploading', () => {
  const file = { name: asset.name, size: 12, mime: asset.mime, sha256: asset.sha256, bucket: 'products' };
  assert.deepEqual(reservationInput(file), file);
  for (const update of [{ size: 0 }, { size: 4186113 }, { sha256: 'fake' }, { bucket: 'avatars' }, { bucket: 'products-images' }]) assert.throws(() => reservationInput({ ...file, ...update }));
});
test('every service operation requires an authenticated principal before RPC', async () => {
  const { service, calls } = setup({ authenticate: async () => null });
  for (const invoke of [() => service.create(key, draft), () => service.status(key), () => service.draft(key, {}), () => service.publish(key, 0),
    () => service.session(key), () => service.reserve(key, key, {}), () => service.recover(assetId), () => service.reconcile(assetId)]) await assert.rejects(invoke(), code('UNAUTHENTICATED'));
  assert.deepEqual(calls, []);
});
test('create makes exactly one transactional RPC with actor bound to authentication', async () => {
  const { service, calls } = setup(); assert.deepEqual(await service.create(key, draft), result);
  assert.deepEqual(calls, [{ name: 'foundation_create_product', args: { p_actor: owner, p_key: key, p_payload: draft } }]);
});
test('mocked durable result can be recovered across service instances with the same key', async () => {
  const ledger = new Map();
  const rpc = async (_name, args) => {
    const previous = ledger.get(args.p_key);
    if (previous && JSON.stringify(previous.payload) !== JSON.stringify(args.p_payload)) return { data: null, error: { message: 'FOUNDATION_CONFLICT' } };
    ledger.set(args.p_key, { payload: args.p_payload }); return { data: { ...result, replayed: !!previous }, error: null };
  };
  const first = setup({ rpc }).service; const secondInstance = setup({ rpc }).service;
  assert.equal((await first.create(key, draft)).replayed, false);
  assert.equal((await secondInstance.create(key, draft)).replayed, true);
  await assert.rejects(secondInstance.create(key, { ...draft, title: 'Outra' }), code('CONFLICT'));
  assert.equal(ledger.size, 1); // Port behavior only; NOT a PostgreSQL concurrency test.
});
test('lost response returns uncertain and recovery consults the original key without rollback', async () => {
  const calls = []; const { service } = setup({ rpc: async (name, args) => {
    calls.push({ name, args }); if (name === 'foundation_create_product') throw new TypeError('lost response');
    return { data: result, error: null };
  } });
  await assert.rejects(service.create(key, draft), code('RESULT_UNCERTAIN'));
  assert.deepEqual(await service.status(key), result);
  assert.deepEqual(calls.map((c) => c.name), ['foundation_create_product', 'foundation_create_status']);
  assert.ok(calls.every((c) => c.args.p_key === key));
});
test('draft and publish forward ownership and revision, preserving legacy denial', async () => {
  const { service, calls } = setup(); const value = versionInput({ title: draft.title, description: null, kind: 'pdf', assetIds: [assetId] });
  await service.draft(key, value); await service.publish(assetId, 2);
  assert.equal(calls[0].args.p_actor, owner); assert.equal(calls[1].args.p_expected_revision, 2);
  await assert.rejects(service.publish(assetId, -1), code('INVALID_INPUT'));
  const blocked = setup({ rpc: async () => ({ data: null, error: { message: 'FOUNDATION_LEGACY_BLOCKED' } }) }).service;
  await assert.rejects(blocked.draft(key, value), code('LEGACY_BLOCKED'));
});
test('published version mutation and stale revision surface explicit errors without fallback', async () => {
  for (const name of ['IMMUTABLE', 'CONFLICT']) {
    const { service } = setup({ rpc: async () => ({ data: null, error: { message: `FOUNDATION_${name}` } }) });
    await assert.rejects(service.publish(assetId, 2), code(name));
  }
});
test('asset ownership is checked before invoking object inspection', async () => {
  let inspected = false;
  const { service } = setup({ rpc: async () => ({ data: { ...asset, seller_id: other }, error: null }), inspectObject: async () => { inspected = true; return evidence; } });
  await assert.rejects(service.reconcile(assetId), code('FORBIDDEN')); assert.equal(inspected, false);
});
test('reconciliation accepts only matching server evidence and confirms via one RPC', async () => {
  const calls = []; const { service } = setup({ rpc: async (name, args) => { calls.push({ name, args }); return { data: asset, error: null }; } });
  await service.reconcile(assetId);
  assert.deepEqual(calls.map((c) => c.name), ['foundation_asset_status', 'foundation_confirm_asset']);
  assert.deepEqual(calls[1].args.p_evidence, evidence);
});
test('reconciliation rejects mismatched owner, bytes, digest, path, bucket and MIME', async () => {
  for (const change of [{ owner: other }, { size: 99 }, { sha256: 'b'.repeat(64) }, { path: 'other/path' }, { bucket: 'other' }, { mime: 'text/html' }]) {
    const names = []; const { service } = setup({ rpc: async (name) => { names.push(name); return { data: asset, error: null }; }, inspectObject: async () => ({ ...evidence, ...change }) });
    await assert.rejects(service.reconcile(assetId), code('EVIDENCE_MISMATCH'));
    assert.deepEqual(names, ['foundation_asset_status']);
  }
});
test('uncertain Storage state is retained and never triggers upload, overwrite or removal', async () => {
  const calls = []; const { service } = setup({ rpc: async (name, args) => { calls.push({ name, args }); return { data: asset, error: null }; }, inspectObject: async () => null });
  await assert.rejects(service.reconcile(assetId), code('UPLOAD_UNCERTAIN'));
  assert.equal(calls[1].args.p_uncertain, true); assert.ok(calls.every((call) => call.name === 'foundation_asset_status'));
});
test('actual Next routes are unconditionally disabled with no cache and no environment opt-in', async () => {
  for (const route of [POST, GET]) { const response = await route(); assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store'); assert.equal((await response.json()).code, 'PRODUCT_FOUNDATION_DISABLED'); }
});
test('local HTTP contract enforces origin and malformed input, reports pending recovery', async () => {
  const { service } = setup({ rpc: async () => ({ data: null, error: null }) });
  const handlers = createLocalFoundationHandlers(service);
  assert.equal((await handlers.commit(new Request('https://local.invalid/api', { method: 'POST' }))).status, 403);
  const response = await handlers.status(key); assert.equal(response.status, 202); assert.equal((await response.json()).retryWithSameKey, true);
});
test('local HTTP create contract returns 201/200 and preserves the key on uncertainty', async () => {
  for (const replayed of [false, true]) {
    const { service } = setup({ rpc: async () => ({ data: { ...result, replayed }, error: null }) });
    const response = await createLocalFoundationHandlers(service).commit(new Request('https://local.invalid/api', { method: 'POST',
      headers: { origin: 'https://local.invalid', 'content-type': 'application/json', 'idempotency-key': key }, body: JSON.stringify(draft) }));
    assert.equal(response.status, replayed ? 200 : 201);
  }
});

const sql = readFileSync('docs/phase-2.2a-foundation.sql', 'utf8');
test('SQL review guard: only six additive tables, all with RLS and no financial DDL', () => {
  const tables = [...sql.matchAll(/CREATE TABLE public\.(\w+)/g)].map((match) => match[1]);
  assert.deepEqual(tables.sort(), ['upload_sessions', 'upload_assets', 'product_delivery_versions', 'delivery_version_files', 'product_delivery_heads', 'product_create_requests'].sort());
  for (const table of tables) assert.ok(sql.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`));
  assert.doesNotMatch(sql, /(?:INSERT INTO|UPDATE|ALTER TABLE|DELETE FROM) public\.(?:payments|orders|customer_products|balances|withdrawals)\b/i);
  assert.doesNotMatch(sql, /(?:CREATE|REPLACE|DROP) FUNCTION public\.settle_stripe_sale/i);
});
test('SQL review guard: transaction uses unique request key and exact JSON comparison', () => {
  assert.match(sql, /PRIMARY KEY\(seller_id,request_key\)/);
  assert.match(sql, /ON CONFLICT\(seller_id,request_key\) DO NOTHING/);
  assert.match(sql, /r\.payload IS DISTINCT FROM p_payload/);
  assert.match(sql, /FOR UPDATE/); assert.match(sql, /completed_at=now\(\)/);
  assert.match(sql, /'draft',false,false,NULL/);
  assert.doesNotMatch(sql, /UPDATE public\.(?:products|products_checkout)\s/);
});
test('SQL review guard: immutable versions/files/assets and composite ownership constraints', () => {
  assert.match(sql, /OLD\.state='published'/);
  assert.match(sql, /IF TG_OP<>'INSERT' THEN RAISE EXCEPTION 'FOUNDATION_IMMUTABLE'/);
  assert.match(sql, /FOREIGN KEY\(asset_id,seller_id\)/);
  assert.match(sql, /FOREIGN KEY\(version_id,product_id,seller_id\)/);
  assert.match(sql, /a\.state<>'verified'/);
  assert.match(sql, /h\.revision=p_expected_revision\+1/);
});
test('SQL review guard: RPCs are invoker and inaccessible to anon/authenticated; no cleanup', () => {
  assert.doesNotMatch(sql, /SECURITY DEFINER/i);
  assert.match(sql, /FROM PUBLIC,anon,authenticated/);
  assert.match(sql, /TO service_role/);
  assert.doesNotMatch(sql, /DELETE FROM|TRUNCATE TABLE|UPDATE storage\.|INSERT INTO storage\./i);
});
