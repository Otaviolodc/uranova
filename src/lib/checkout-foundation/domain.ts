import type { CheckoutAttempt, CheckoutAttemptSnapshot, CheckoutDomainEvent, CheckoutMetadata, CheckoutRecoveryResult, CheckoutRequestPayload } from "./contracts";

export class CheckoutFoundationError extends Error {
  constructor(public readonly code: string) { super(code); }
}
function fail(code: string): never { throw new CheckoutFoundationError(code); }
export function identifier(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) fail("INVALID_ID");
  return value.toLowerCase();
}
export function requestPayload(value: unknown): CheckoutRequestPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("INVALID_INPUT");
  const b = value as Record<string, unknown>;
  if (Object.keys(b).some(k => !["checkoutSlug", "kind", "previousAttemptId", "confirmationId"].includes(k)) || typeof b.checkoutSlug !== "string" || !b.checkoutSlug || b.checkoutSlug.length > 500) fail("INVALID_INPUT");
  if (b.kind === "resume") {
    if (b.previousAttemptId !== undefined || b.confirmationId !== undefined) fail("INVALID_INPUT");
    return { checkoutSlug: b.checkoutSlug, kind: "resume" };
  }
  if (b.kind !== "repurchase") fail("INVALID_INPUT");
  return { checkoutSlug: b.checkoutSlug, kind: "repurchase", previousAttemptId: identifier(b.previousAttemptId), confirmationId: identifier(b.confirmationId) };
}
export function immutable<T>(value: T): T {
  const copy = structuredClone(value);
  const freeze = (v: unknown) => { if (v && typeof v === "object") { for (const child of Object.values(v)) freeze(child); Object.freeze(v); } };
  freeze(copy); return copy;
}
export function validateSnapshot(s: CheckoutAttemptSnapshot): CheckoutAttemptSnapshot {
  if (!s || !s.binding) fail("INVALID_SNAPSHOT");
  for (const id of [s.buyerId, s.sellerId, s.offerId, s.productId]) identifier(id);
  if ([s.connectAccountId, s.offerSlug, s.title].some(v => typeof v !== "string" || !v) || s.paymentMode !== "payment" || s.currency !== "brl" || !["test", "live"].includes(s.providerMode) || !["1", "2"].includes(s.financeVersion)) fail("INVALID_SNAPSHOT");
  if (!Number.isSafeInteger(s.amountCents) || s.amountCents <= 0 || !Number.isSafeInteger(s.applicationFeeCents) || s.applicationFeeCents <= 0 || s.applicationFeeCents > s.amountCents) fail("INVALID_MONEY");
  for (const u of [s.successUrl, s.cancelUrl]) { try { const url = new URL(u); if (url.protocol !== "https:" || url.username || url.password) fail("INVALID_URL"); } catch { fail("INVALID_URL"); } }
  if (s.binding.mode === "legacy_unversioned") { if (s.binding.versionId !== null) fail("INVALID_BINDING"); }
  else if (s.binding.mode === "versioned") {
    if (s.financeVersion !== "2") fail("INVALID_BINDING");
    identifier(s.binding.versionId);
    if (!/^[a-f0-9]{64}$/.test(s.binding.manifestDigest) || !Number.isSafeInteger(s.binding.headRevision) || s.binding.headRevision < 1) fail("INVALID_BINDING");
  } else fail("INVALID_BINDING");
  return immutable(s);
}
export function metadataFor(snapshot: CheckoutAttemptSnapshot, id: string): CheckoutMetadata {
  const common = { product_id: snapshot.offerId, seller_id: snapshot.sellerId, customer_id: snapshot.buyerId, seller_stripe_account_id: snapshot.connectAccountId };
  return snapshot.financeVersion === "1" ? { ...common, finance_version: "1" } : { ...common, finance_version: "2", checkout_attempt_id: id };
}
export function newAttempt(id: string, key: string, snapshot: CheckoutAttemptSnapshot, at: number, previousAttemptId: string | null): CheckoutAttempt {
  identifier(id); identifier(key); validateTime(at);
  const s = validateSnapshot(snapshot);
  // Only v2 is reservable here. v1 is represented for compatibility, never synthesized as fallback.
  if (s.financeVersion !== "2") fail("LEGACY_NOT_CREATABLE");
  return immutable({ id, canonicalKey: key, snapshot: s, providerKey: `uranova-checkout-v2-${id}`, metadata: metadataFor(s, id), state: "created", paymentState: "unconfirmed", settlementState: "not_started", review: { required: false, reason: null }, sessionId: null, paymentIntentId: null, worker: null, revision: 0, createdAt: at, updatedAt: at, previousAttemptId });
}
function validateTime(at: number) { if (!Number.isSafeInteger(at) || at < 0) fail("INVALID_TIME"); }
export function isClosed(a: CheckoutAttempt): boolean { return ["expired", "cancelled", "payment_confirmed", "failed_definitive"].includes(a.state) && !a.review.required; }
export function transition(a: CheckoutAttempt, e: CheckoutDomainEvent, at: number): CheckoutAttempt {
  validateTime(at); if (at < a.updatedAt) fail("STALE_TIME");
  const finish = (patch: Partial<CheckoutAttempt>) => immutable({ ...a, ...patch, revision: a.revision + 1, updatedAt: at });
  const review = (reason: string) => finish({ state: a.paymentState === "confirmed" ? "payment_confirmed" : "needs_review", review: { required: true, reason } });
  const currentWorker = (token: string, epoch: number) => a.worker?.token === token && a.worker.epoch === epoch;
  if (e.kind === "cancel_url") return a;
  if (e.kind === "reserve") { if (a.state !== "created") fail("INVALID_TRANSITION"); return finish({ state: "reserved" }); }
  if (e.kind === "claim") {
    if (a.state !== "reserved" || a.review.required || !e.token || !Number.isSafeInteger(e.epoch) || e.epoch <= (a.worker?.epoch ?? 0)) fail("INVALID_TRANSITION");
    return finish({ state: "creating", worker: { token: e.token, epoch: e.epoch } });
  }
  if (e.kind === "timeout" || e.kind === "lease_expired") {
    if (!currentWorker(e.token, e.epoch)) fail("STALE_WORKER");
    if (a.state !== "creating") return a;
    return finish({ state: "uncertain" });
  }
  if (e.kind === "cancel_before_send" || e.kind === "definitive_failure_before_send") {
    if (!["created", "reserved"].includes(a.state) || a.worker || a.sessionId) fail("INVALID_TRANSITION");
    return finish({ state: e.kind === "cancel_before_send" ? "cancelled" : "failed_definitive" });
  }
  if (e.kind !== "provider_observation") fail("INVALID_EVENT");
  if (e.source === "worker" && !currentWorker(e.token, e.epoch)) fail("STALE_WORKER");
  const o = e.observation;
  if (!["open", "paid", "expired", "cancelled"].includes(o.outcome) || typeof o.paymentPending !== "boolean" || !o.sessionId || (o.paymentIntentId !== null && !o.paymentIntentId)) return review("INVALID_OBSERVATION");
  if (o.attemptId !== a.id || o.connectAccountId !== a.snapshot.connectAccountId || o.providerMode !== a.snapshot.providerMode || o.amountCents !== a.snapshot.amountCents || o.applicationFeeCents !== a.snapshot.applicationFeeCents || o.currency !== a.snapshot.currency) return review("SNAPSHOT_MISMATCH");
  const m = o.metadata;
  if (!m || m.finance_version !== a.metadata.finance_version || m.product_id !== a.snapshot.offerId || m.seller_id !== a.snapshot.sellerId || m.customer_id !== a.snapshot.buyerId || m.seller_stripe_account_id !== a.snapshot.connectAccountId || m.finance_version !== "2" || m.checkout_attempt_id !== a.id) return review("METADATA_MISMATCH");
  if ((a.sessionId && a.sessionId !== o.sessionId) || (a.paymentIntentId && o.paymentIntentId && a.paymentIntentId !== o.paymentIntentId)) return review("EXTERNAL_ID_CONFLICT");
  if (a.review.required) return a; // Manual resolution requires a later, separately approved contract.
  if (o.outcome === "paid" && (!o.paymentIntentId || o.paymentPending)) return review("PAYMENT_EVIDENCE_INCOMPLETE");
  if (a.paymentState === "confirmed") return a; // Late open/expiry cannot erase a paid fact.
  if (a.state === "failed_definitive" || (a.state === "cancelled" && !a.sessionId)) return review("EXTERNAL_EVIDENCE_AFTER_NO_SEND");
  if (["expired", "cancelled"].includes(o.outcome) && o.paymentPending) return review("PAYMENT_STILL_PENDING");
  if (isClosed(a) && o.outcome !== "paid") return a;
  if (a.state === "created") return review("UNRESERVED_EXTERNAL_SESSION");
  const ids = { sessionId: a.sessionId ?? o.sessionId, paymentIntentId: a.paymentIntentId ?? o.paymentIntentId };
  if (o.outcome === "paid") return finish({ ...ids, state: "payment_confirmed", paymentState: "confirmed", settlementState: "pending" });
  return finish({ ...ids, state: o.outcome === "open" ? "session_created" : o.outcome });
}
export function recovery(a: CheckoutAttempt): CheckoutRecoveryResult {
  if (a.review.required || a.state === "needs_review") return { action: "review", attempt: a };
  if (isClosed(a)) return { action: "terminal", attempt: a };
  if (a.sessionId) return { action: "retrieve_known_session", attempt: a, sessionId: a.sessionId, connectAccountId: a.snapshot.connectAccountId };
  if (a.state === "uncertain") return { action: "review", attempt: a }; // No external retention window has been validated.
  return { action: a.state === "reserved" ? "ready_for_claim" : "wait", attempt: a };
}
