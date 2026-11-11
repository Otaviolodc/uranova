import type { CheckoutAttempt, CheckoutAttemptEvent, CheckoutAttemptRepository, CheckoutActiveSlot, CheckoutRequestKey, CheckoutTransaction, CheckoutProviderAdapter, ProviderObservation } from "../src/lib/checkout-foundation/contracts";

/** TEST ONLY. Serial process mutex models atomicity, NOT durable multi-instance isolation. */
export class MemoryCheckoutRepository implements CheckoutAttemptRepository {
  attempts = new Map<string, CheckoutAttempt>();
  keys = new Map<string, CheckoutRequestKey>();
  slots = new Map<string, CheckoutActiveSlot>();
  events: CheckoutAttemptEvent[] = [];
  confirmations = new Set<string>();
  failAppend = false;
  private tail: Promise<unknown> = Promise.resolve();
  transaction<T>(work: (tx: CheckoutTransaction) => Promise<T>): Promise<T> {
    const run = this.tail.then(async () => {
      const attempts = structuredClone(this.attempts), keys = structuredClone(this.keys), slots = structuredClone(this.slots), events = structuredClone(this.events), confirmations = new Set(this.confirmations);
      const tx: CheckoutTransaction = {
        findKey: async (b, k) => keys.get(`${b}/${k}`) ?? null,
        findSlot: async (b, o) => slots.get(`${b}/${o}`) ?? null,
        getAttempt: async id => attempts.get(id) ?? null,
        insertAttempt: async a => { if (attempts.has(a.id)) throw new Error("UNIQUE_ATTEMPT"); attempts.set(a.id, structuredClone(a)); },
        insertKey: async k => { const id = `${k.buyerId}/${k.key}`; if (keys.has(id)) throw new Error("UNIQUE_KEY"); keys.set(id, structuredClone(k)); },
        setSlot: async s => { slots.set(`${s.buyerId}/${s.offerId}`, structuredClone(s)); },
        consumeRepurchaseConfirmation: async (b, p, c) => confirmations.delete(`${b}/${p}/${c}`),
        compareAndSwap: async (a, r) => { if (attempts.get(a.id)?.revision !== r) return false; attempts.set(a.id, structuredClone(a)); return true; },
        appendEvent: async e => { if (this.failAppend) throw new Error("INJECTED_APPEND_FAILURE"); events.push(structuredClone(e)); },
      };
      const result = await work(tx);
      this.attempts = attempts; this.keys = keys; this.slots = slots; this.events = events; this.confirmations = confirmations;
      return result;
    });
    this.tail = run.catch(() => undefined);
    return run;
  }
}
export class FakeCheckoutProvider implements CheckoutProviderAdapter {
  calls: string[] = [];
  observation(a: CheckoutAttempt, patch: Partial<ProviderObservation> = {}): ProviderObservation {
    return { attemptId: a.id, sessionId: "cs_synthetic", paymentIntentId: null, connectAccountId: a.snapshot.connectAccountId, providerMode: a.snapshot.providerMode, amountCents: a.snapshot.amountCents, applicationFeeCents: a.snapshot.applicationFeeCents, currency: a.snapshot.currency, metadata: a.metadata, outcome: "open", paymentPending: false, ...patch };
  }
  async createSession(a: CheckoutAttempt) { this.calls.push("create"); return this.observation(a); }
  async retrieveSession(a: CheckoutAttempt) { this.calls.push("retrieve"); return this.observation(a); }
}
