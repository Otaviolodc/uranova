/** Isolated proposal. No active route, provider, database or worker imports. */
export type CheckoutAttemptState = "created" | "reserved" | "creating" | "session_created" | "uncertain" | "expired" | "cancelled" | "payment_confirmed" | "failed_definitive" | "needs_review";
export type DeliveryBinding =
  | { readonly mode: "legacy_unversioned"; readonly versionId: null }
  | { readonly mode: "versioned"; readonly versionId: string; readonly manifestDigest: string; readonly headRevision: number };
export type CheckoutMetadata =
  | { readonly finance_version: "1"; readonly product_id: string; readonly seller_id: string; readonly customer_id: string; readonly seller_stripe_account_id: string }
  | { readonly finance_version: "2"; readonly product_id: string; readonly seller_id: string; readonly customer_id: string; readonly seller_stripe_account_id: string; readonly checkout_attempt_id: string };
export interface CheckoutAttemptSnapshot {
  readonly buyerId: string;
  readonly sellerId: string;
  readonly offerId: string;
  readonly offerSlug: string;
  readonly productId: string;
  readonly connectAccountId: string;
  readonly providerMode: "test" | "live";
  readonly paymentMode: "payment";
  readonly amountCents: number;
  /** Supplied by the trusted existing pricing contract; never computed here. */
  readonly applicationFeeCents: number;
  readonly currency: "brl";
  readonly financeVersion: "1" | "2";
  readonly binding: DeliveryBinding;
  readonly title: string;
  readonly successUrl: string;
  readonly cancelUrl: string;
}
export interface CheckoutRequestPayload {
  readonly checkoutSlug: string;
  readonly kind: "resume" | "repurchase";
  readonly previousAttemptId?: string;
  readonly confirmationId?: string;
}
export interface CheckoutRequestKey {
  readonly buyerId: string;
  readonly key: string;
  readonly payload: CheckoutRequestPayload;
  readonly attemptId: string;
}
export interface CheckoutActiveSlot { readonly buyerId: string; readonly offerId: string; readonly attemptId: string }
export interface CheckoutAttemptEvent {
  readonly attemptId: string;
  readonly revision: number;
  readonly at: number;
  readonly kind: string;
  readonly from: CheckoutAttemptState;
  readonly to: CheckoutAttemptState;
  readonly reason: string | null;
}
export interface CheckoutAttempt {
  readonly id: string;
  readonly canonicalKey: string;
  readonly snapshot: CheckoutAttemptSnapshot;
  readonly providerKey: string;
  readonly metadata: CheckoutMetadata;
  readonly state: CheckoutAttemptState;
  readonly paymentState: "unconfirmed" | "confirmed";
  readonly settlementState: "not_started" | "pending";
  readonly review: { readonly required: boolean; readonly reason: string | null };
  readonly sessionId: string | null;
  readonly paymentIntentId: string | null;
  readonly worker: { readonly token: string; readonly epoch: number } | null;
  readonly revision: number;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly previousAttemptId: string | null;
}
export interface ProviderObservation {
  readonly attemptId: string;
  readonly sessionId: string;
  readonly paymentIntentId: string | null;
  readonly connectAccountId: string;
  readonly providerMode: "test" | "live";
  readonly amountCents: number;
  readonly applicationFeeCents: number;
  readonly currency: "brl";
  readonly metadata: CheckoutMetadata;
  readonly outcome: "open" | "paid" | "expired" | "cancelled";
  /** Terminal evidence must also exclude an asynchronous payment still pending. */
  readonly paymentPending: boolean;
}
export type CheckoutDomainEvent =
  | { readonly kind: "reserve" }
  | { readonly kind: "claim"; readonly token: string; readonly epoch: number }
  | { readonly kind: "timeout" | "lease_expired"; readonly token: string; readonly epoch: number }
  | { readonly kind: "cancel_url" }
  | { readonly kind: "cancel_before_send" }
  | { readonly kind: "definitive_failure_before_send" }
  | { readonly kind: "provider_observation"; readonly observation: ProviderObservation; readonly source: "webhook" }
  | { readonly kind: "provider_observation"; readonly observation: ProviderObservation; readonly source: "worker"; readonly token: string; readonly epoch: number };
export type CheckoutAttemptResult = { readonly attempt: CheckoutAttempt; readonly replayed: boolean; readonly aliased: boolean };
export type CheckoutRecoveryResult =
  | { readonly action: "ready_for_claim" | "wait" | "review" | "terminal"; readonly attempt: CheckoutAttempt }
  | { readonly action: "retrieve_known_session"; readonly attempt: CheckoutAttempt; readonly sessionId: string; readonly connectAccountId: string };
/** Interface only. Domain/service never invokes this port; real implementation forbidden in this phase. */
export interface CheckoutProviderAdapter {
  createSession(attempt: CheckoutAttempt): Promise<ProviderObservation>;
  retrieveSession(attempt: CheckoutAttempt): Promise<ProviderObservation>;
}
export interface CheckoutTransaction {
  findKey(buyerId: string, key: string): Promise<CheckoutRequestKey | null>;
  findSlot(buyerId: string, offerId: string): Promise<CheckoutActiveSlot | null>;
  getAttempt(id: string): Promise<CheckoutAttempt | null>;
  insertAttempt(attempt: CheckoutAttempt): Promise<void>;
  insertKey(key: CheckoutRequestKey): Promise<void>;
  setSlot(slot: CheckoutActiveSlot): Promise<void>;
  /** Must validate buyer, predecessor, one-time confirmation and atomically consume it. */
  consumeRepurchaseConfirmation(buyerId: string, previousAttemptId: string, confirmationId: string): Promise<boolean>;
  compareAndSwap(attempt: CheckoutAttempt, expectedRevision: number): Promise<boolean>;
  appendEvent(event: CheckoutAttemptEvent): Promise<void>;
}
export interface CheckoutAttemptRepository {
  /** Real implementation must provide transaction isolation + constraints, not a process mutex. */
  transaction<T>(work: (tx: CheckoutTransaction) => Promise<T>): Promise<T>;
}
