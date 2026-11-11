import type { CheckoutAttempt, CheckoutAttemptRepository, CheckoutAttemptResult, CheckoutAttemptSnapshot, CheckoutDomainEvent, CheckoutRecoveryResult } from "./contracts";
import { CheckoutFoundationError, identifier, immutable, isClosed, newAttempt, recovery, requestPayload, transition } from "./domain";

export interface CheckoutFoundationDependencies {
  repository: CheckoutAttemptRepository;
  /** Trusted server authentication port. Browser data must never implement this authority. */
  authenticatedBuyer(): Promise<string | null>;
  /** Trusted pricing/catalog port. Called only when creating a genuinely new intent. */
  snapshot(buyerId: string, slug: string): Promise<CheckoutAttemptSnapshot>;
  /** Trusted catalog identity lookup; never browser authority. */
  resolveOfferId(slug: string): Promise<string>;
  nextId(): string;
  now(): number;
}
export function checkoutFoundation(deps: CheckoutFoundationDependencies) {
  async function buyer() { const id = await deps.authenticatedBuyer(); if (!id) throw new CheckoutFoundationError("UNAUTHENTICATED"); return identifier(id); }
  function owned(a: CheckoutAttempt | null, id: string): CheckoutAttempt { if (!a || a.snapshot.buyerId !== id) throw new CheckoutFoundationError("NOT_FOUND"); return a; }
  return {
    async prepare(keyInput: unknown, input: unknown): Promise<CheckoutAttemptResult> {
      const buyerId = await buyer(), key = identifier(keyInput), payload = requestPayload(input);
      return deps.repository.transaction(async tx => {
        const prior = await tx.findKey(buyerId, key);
        if (prior) {
          if (JSON.stringify(prior.payload) !== JSON.stringify(payload)) throw new CheckoutFoundationError("PAYLOAD_CONFLICT");
          const attempt = owned(await tx.getAttempt(prior.attemptId), buyerId);
          return immutable({ attempt, replayed: true, aliased: key !== attempt.canonicalKey });
        }
        const offerId = identifier(await deps.resolveOfferId(payload.checkoutSlug));
        const slot = await tx.findSlot(buyerId, offerId);
        const active = slot ? owned(await tx.getAttempt(slot.attemptId), buyerId) : null;
        if (active && !isClosed(active)) {
          if (payload.kind !== "resume") throw new CheckoutFoundationError("ACTIVE_ATTEMPT_EXISTS");
          await tx.insertKey({ buyerId, key, payload, attemptId: active.id });
          return immutable({ attempt: active, replayed: true, aliased: true });
        }
        if (active && payload.kind !== "repurchase") throw new CheckoutFoundationError("REPURCHASE_CONFIRMATION_REQUIRED");
        if (payload.kind === "repurchase") {
          const previous = owned(await tx.getAttempt(payload.previousAttemptId!), buyerId);
          if (!isClosed(previous) || previous.snapshot.offerId !== offerId || !active || active.id !== previous.id) throw new CheckoutFoundationError("INVALID_PREDECESSOR");
          if (!await tx.consumeRepurchaseConfirmation(buyerId, previous.id, payload.confirmationId!)) throw new CheckoutFoundationError("REPURCHASE_CONFIRMATION_REQUIRED");
        }
        const snapshot = await deps.snapshot(buyerId, payload.checkoutSlug);
        if (snapshot.buyerId !== buyerId || snapshot.offerSlug !== payload.checkoutSlug || snapshot.offerId !== offerId) throw new CheckoutFoundationError("SNAPSHOT_MISMATCH");
        const created = newAttempt(identifier(deps.nextId()), key, snapshot, deps.now(), payload.previousAttemptId ?? null);
        const attempt = transition(created, { kind: "reserve" }, deps.now());
        await tx.insertAttempt(attempt);
        await tx.insertKey({ buyerId, key, payload, attemptId: attempt.id });
        await tx.setSlot({ buyerId, offerId, attemptId: attempt.id });
        await tx.appendEvent({ attemptId: attempt.id, revision: attempt.revision, at: attempt.updatedAt, kind: "reserve", from: "created", to: "reserved", reason: null });
        return immutable({ attempt, replayed: false, aliased: false });
      });
    },
    async recoverByKey(keyInput: unknown): Promise<CheckoutRecoveryResult> {
      const buyerId = await buyer(), key = identifier(keyInput);
      return deps.repository.transaction(async tx => {
        const found = await tx.findKey(buyerId, key);
        if (!found) throw new CheckoutFoundationError("NOT_FOUND");
        return immutable(recovery(owned(await tx.getAttempt(found.attemptId), buyerId)));
      });
    },
    async inspect(attemptId: unknown): Promise<CheckoutRecoveryResult> {
      const buyerId = await buyer(), id = identifier(attemptId);
      return deps.repository.transaction(async tx => immutable(recovery(owned(await tx.getAttempt(id), buyerId))));
    },
  };
}

/** Internal trusted-event boundary ONLY, not exposed by the buyer service or any HTTP route.
 * A future adapter must verify provider signature/evidence before using this function. */
export async function applyTrustedCheckoutEvent(repository: CheckoutAttemptRepository, id: string, expectedRevision: number, event: CheckoutDomainEvent, at: number): Promise<CheckoutAttempt> {
  return repository.transaction(async tx => {
    const before = await tx.getAttempt(identifier(id));
    if (!before) throw new CheckoutFoundationError("NOT_FOUND");
    if (before.revision !== expectedRevision) throw new CheckoutFoundationError("STALE_REVISION");
    const after = transition(before, event, at);
    if (after === before) return immutable(before);
    if (!await tx.compareAndSwap(after, expectedRevision)) throw new CheckoutFoundationError("STALE_REVISION");
    await tx.appendEvent({ attemptId: id, revision: after.revision, at, kind: event.kind, from: before.state, to: after.state, reason: after.review.reason });
    return immutable(after);
  });
}
