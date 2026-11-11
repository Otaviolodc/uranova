// Shared error type must not import the administrative rate-limit client.
export class RateLimitError extends Error {
  constructor(public readonly retryAfter: number) { super("RATE_LIMITED"); }
}
