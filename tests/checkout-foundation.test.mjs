import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';
import dgram from 'node:dgram';
import { checkoutFoundation, applyTrustedCheckoutEvent } from '../src/lib/checkout-foundation/service.ts';
import { transition, recovery, metadataFor } from '../src/lib/checkout-foundation/domain.ts';
import { MemoryCheckoutRepository, FakeCheckoutProvider } from './checkout-foundation-fakes.ts';

const noNetwork = () => { throw new Error('NETWORK_FORBIDDEN'); };
mock.method(globalThis, 'fetch', noNetwork);
for (const [target, methods] of [[http, ['request','get']], [https, ['request','get']], [net, ['connect','createConnection']], [net.Socket.prototype, ['connect']], [tls, ['connect']], [dgram, ['createSocket']]]) for (const method of methods) mock.method(target, method, noNetwork);
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const payload = { checkoutSlug: 'synthetic-offer', kind: 'resume' };
function fixture() {
  const repo = new MemoryCheckoutRepository(), provider = new FakeCheckoutProvider();
  let buyer = id(1), counter = 100, clock = 1000, reads = 0;
  const snapshot = { buyerId: id(1), sellerId: id(2), offerId: id(3), offerSlug: payload.checkoutSlug, productId: id(4), connectAccountId: 'acct_synthetic', providerMode: 'test', paymentMode: 'payment', amountCents: 1000, applicationFeeCents: 100, currency: 'brl', financeVersion: '2', binding: { mode: 'versioned', versionId: id(5), manifestDigest: 'a'.repeat(64), headRevision: 1 }, title: 'Synthetic', successUrl: 'https://example.invalid/success', cancelUrl: 'https://example.invalid/cancel' };
  const dependencies = { repository: repo, authenticatedBuyer: async () => buyer, resolveOfferId: async () => snapshot.offerId, snapshot: async () => { reads++; return snapshot; }, nextId: () => id(counter++), now: () => ++clock };
  const service = checkoutFoundation(dependencies);
  const prepare = (key = id(10), body = payload) => service.prepare(key, body);
  const event = (a, e) => applyTrustedCheckoutEvent(repo, a.id, a.revision, e, ++clock);
  const observe = (a, patch = {}, source = 'webhook') => event(a, { kind: 'provider_observation', source, token: 'worker', epoch: 1, observation: provider.observation(a, patch) });
  return { repo, provider, snapshot, service, prepare, event, observe, reads: () => reads, switchBuyer: b => { buyer = b; }, restart: () => checkoutFoundation(dependencies) };
}
const rejects = (promise, code) => assert.rejects(promise, e => e.code === code);
test('double click serializes to one reservation without provider calls', async () => {
  const f = fixture(); const [a,b] = await Promise.all([f.prepare(), f.prepare()]);
  assert.equal(a.attempt.id,b.attempt.id); assert.equal(f.repo.attempts.size,1); assert.equal(f.reads(),1); assert.deepEqual(f.provider.calls,[]);
});
test('two tabs alias different keys to same active offer', async () => {
  const f = fixture(); const [a,b] = await Promise.all([f.prepare(),f.prepare(id(11))]);
  assert.equal(a.attempt.id,b.attempt.id); assert.equal(b.aliased,true); assert.equal(f.repo.keys.size,2);
});
test('repeat key recovers after service recreation', async () => {
  const f = fixture(), a = await f.prepare(); const b = await f.restart().prepare(id(10),payload);
  assert.deepEqual(b.attempt,a.attempt); assert.equal(b.replayed,true);
});
test('same key divergent payload fails without side effects', async () => {
  const f = fixture(); await f.prepare(); await rejects(f.prepare(id(10),{...payload,checkoutSlug:'other'}),'PAYLOAD_CONFLICT'); assert.equal(f.repo.keys.size,1);
});
test('timeout before response retains intent and provider key', async () => {
  const f = fixture(); let a = (await f.prepare()).attempt;
  a = await f.event(a,{kind:'claim',token:'worker',epoch:1}); const key = a.providerKey;
  a = await f.event(a,{kind:'timeout',token:'worker',epoch:1});
  assert.equal(a.state,'uncertain'); assert.equal((await f.prepare(id(11))).attempt.providerKey,key); assert.equal(recovery(a).action,'review');
});
test('crash after reservation leaves a recoverable reservation', async () => {
  const f = fixture(); const a = (await f.prepare()).attempt;
  const recovered = await f.restart().recoverByKey(id(10)); assert.equal(recovered.attempt.id,a.id); assert.equal(recovered.action,'ready_for_claim');
});
test('synthetic early webhook confirms payment before worker response', async () => {
  const f = fixture(); let a = (await f.prepare()).attempt; a = await f.event(a,{kind:'claim',token:'worker',epoch:1});
  a = await f.observe(a,{outcome:'paid',paymentIntentId:'pi_synthetic'}); assert.equal(a.paymentState,'confirmed'); assert.equal(a.settlementState,'pending');
  assert.deepEqual(await f.observe(a,{},'worker'),a);
});
test('late open cannot regress terminal expiry', async () => {
  const f = fixture(); let a = (await f.prepare()).attempt; a = await f.observe(a,{outcome:'expired'}); assert.deepEqual(await f.observe(a),a);
});
test('stale worker and stale CAS revision are rejected', async () => {
  const f = fixture(), before = (await f.prepare()).attempt; const a = await f.event(before,{kind:'claim',token:'worker',epoch:1});
  await rejects(f.event(a,{kind:'timeout',token:'old',epoch:1}),'STALE_WORKER');
  await rejects(f.event(before,{kind:'cancel_before_send'}),'STALE_REVISION'); assert.equal(f.repo.attempts.get(a.id).state,'creating');
});
test('explicit repurchase consumes trusted confirmation and uses new intent', async () => {
  const f = fixture(); let a = (await f.prepare()).attempt; a = await f.observe(a,{outcome:'paid',paymentIntentId:'pi_synthetic'});
  await rejects(f.prepare(id(11)),'REPURCHASE_CONFIRMATION_REQUIRED');
  const body = {...payload,kind:'repurchase',previousAttemptId:a.id,confirmationId:id(20)};
  await rejects(f.prepare(id(11),body),'REPURCHASE_CONFIRMATION_REQUIRED');
  f.repo.confirmations.add(`${id(1)}/${a.id}/${id(20)}`);
  const b = (await f.prepare(id(11),body)).attempt; assert.notEqual(a.id,b.id); assert.notEqual(a.providerKey,b.providerKey); assert.equal(b.previousAttemptId,a.id); assert.equal(f.repo.confirmations.size,0);
  assert.equal((await f.prepare()).attempt.id,a.id);
});
test('paid fact survives expiry and conflicting external IDs', async () => {
  const f = fixture(); let a = (await f.prepare()).attempt; a = await f.observe(a,{outcome:'paid',paymentIntentId:'pi_synthetic'});
  assert.deepEqual(await f.observe(a,{outcome:'expired'}),a);
  a = await f.observe(a,{sessionId:'cs_conflict',paymentIntentId:'pi_other'}); assert.equal(a.state,'payment_confirmed'); assert.equal(a.paymentState,'confirmed'); assert.equal(a.review.required,true); assert.equal(a.sessionId,'cs_synthetic'); assert.equal(a.paymentIntentId,'pi_synthetic');
});
test('Connect mismatch quarantines without binding IDs', async () => {
  const f = fixture(), a = (await f.prepare()).attempt; const b = await f.observe(a,{connectAccountId:'acct_other'});
  assert.equal(b.state,'needs_review'); assert.equal(b.sessionId,null);
});
test('changed price cannot alter reserved snapshot', async () => {
  const f = fixture(), a = (await f.prepare()).attempt; f.snapshot.amountCents = 2000;
  const b = (await f.prepare(id(11))).attempt; assert.equal(b.snapshot.amountCents,1000); assert.deepEqual(a.snapshot,b.snapshot); assert.equal(f.reads(),1);
});
test('content version is deeply immutable and never upgraded on replay', async () => {
  const f = fixture(), a = (await f.prepare()).attempt; f.snapshot.binding.versionId = id(6);
  assert.throws(() => { a.snapshot.binding.versionId = id(7); },TypeError);
  assert.equal((await f.prepare()).attempt.snapshot.binding.versionId,id(5));
});
test('expired lease is uncertainty, never safe retry or local cancel', async () => {
  const f = fixture(); let a = (await f.prepare()).attempt; a = await f.event(a,{kind:'claim',token:'worker',epoch:1}); a = await f.event(a,{kind:'lease_expired',token:'worker',epoch:1});
  assert.equal(recovery(a).action,'review'); await rejects(f.event(a,{kind:'claim',token:'new',epoch:2}),'INVALID_TRANSITION'); await rejects(f.event(a,{kind:'cancel_before_send'}),'INVALID_TRANSITION'); assert.deepEqual(f.provider.calls,[]);
});
test('buyer projection rejects IDOR for attempts and key recovery', async () => {
  const f = fixture(), a = (await f.prepare()).attempt; f.switchBuyer(id(9));
  await rejects(f.service.inspect(a.id),'NOT_FOUND'); await rejects(f.service.recoverByKey(id(10)),'NOT_FOUND'); f.switchBuyer(null); await rejects(f.service.inspect(a.id),'UNAUTHENTICATED');
});
test('no v2 fallback to legacy; metadata product_id remains offer ID', async () => {
  const f = fixture(); f.snapshot.financeVersion = '1'; f.snapshot.binding = {mode:'legacy_unversioned',versionId:null};
  assert.equal(metadataFor(f.snapshot,id(100)).product_id,id(3)); await rejects(f.prepare(),'LEGACY_NOT_CREATABLE'); assert.equal(f.repo.attempts.size,0);
  f.snapshot.financeVersion = '2'; const a = (await f.prepare()).attempt; assert.equal(a.snapshot.binding.versionId,null); assert.equal(a.metadata.finance_version,'2');
});
test('transaction failure rolls back attempts, aliases, slots and events', async () => {
  const f = fixture(); f.repo.failAppend = true; await assert.rejects(f.prepare(),/INJECTED_APPEND_FAILURE/);
  assert.equal(f.repo.attempts.size,0); assert.equal(f.repo.keys.size,0); assert.equal(f.repo.slots.size,0); assert.equal(f.repo.events.length,0);
});
test('cancel URL is not cancellation; browser monetary authority rejected', async () => {
  const f = fixture(), a = (await f.prepare()).attempt; assert.equal(transition(a,{kind:'cancel_url'},a.updatedAt),a);
  await rejects(f.prepare(id(11),{...payload,amountCents:1}),'INVALID_INPUT');
});
test('session association write-once and asynchronous terminal conflict', async () => {
  const f = fixture(); let a = (await f.prepare()).attempt; a = await f.observe(a);
  assert.equal(recovery(a).action,'retrieve_known_session'); const b = await f.observe(a,{sessionId:'cs_other'}); assert.equal(b.sessionId,a.sessionId); assert.equal(b.review.required,true);
  const g = fixture(), c = (await g.prepare()).attempt; assert.equal((await g.observe(c,{outcome:'expired',paymentPending:true})).state,'needs_review');
});
test('network guard rejects HTTP, fetch and sockets', async () => {
  assert.throws(() => http.request('https://example.invalid'),/NETWORK_FORBIDDEN/); assert.throws(() => fetch('https://example.invalid'),/NETWORK_FORBIDDEN/); assert.throws(() => net.connect(443),/NETWORK_FORBIDDEN/);
});
test('external evidence contradicting a pre-send failure requires review', async () => {
  const f = fixture(); let a = (await f.prepare()).attempt;
  a = await f.event(a,{kind:'definitive_failure_before_send'});
  a = await f.observe(a,{outcome:'paid',paymentIntentId:'pi_synthetic'});
  assert.equal(a.state,'needs_review'); assert.equal(a.review.reason,'EXTERNAL_EVIDENCE_AFTER_NO_SEND');
});
