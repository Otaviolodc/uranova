import "server-only";

export type CheckoutStage = "INTEGRATION_CONFIG" | "ORIGIN" | "AUTH" | "RATE_LIMIT" | "STRIPE_CONFIG" |
  "REQUEST_VALIDATION" | "CHECKOUT_READ" | "PRODUCER_READ" | "CONNECT_VALIDATION" |
  "PRICE_VALIDATION" | "URL_VALIDATION" | "SESSION_CREATE" | "SESSION_URL_VALIDATION";
type Category = "EXPECTED_REJECTION" | "DEPENDENCY_ERROR" | "STRIPE_ERROR" | "CONFIGURATION_ERROR" | "INTERNAL_ERROR";

const stripeTypes = new Set(["StripeInvalidRequestError", "StripeAPIError", "StripeAuthenticationError",
  "StripePermissionError", "StripeRateLimitError", "StripeConnectionError", "StripeCardError"]);
const stripeCodes = new Set(["account_invalid", "api_key_expired", "authentication_required", "parameter_missing",
  "parameter_invalid_integer", "parameter_invalid_string_blank", "parameter_unknown", "resource_missing",
  "rate_limit", "lock_timeout", "amount_too_small", "amount_too_large", "currency_not_supported",
  "account_not_yet_compatible_with_v2", "accounts_v2_access_blocked",
  "non_connect_platform_accounts_v2_access_blocked", "v1_account_instead_of_v2_account"]);

// Never serialize error objects, messages, headers, payloads or arbitrary properties.
function field(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object") return undefined;
  return Object.getOwnPropertyDescriptor(value, key)?.value;
}

export function logCheckoutFailure(stage: CheckoutStage, status: number, error?: unknown,
  category?: Category, responseRequestId?: unknown) {
  // Observability must not replace the original HTTP response, even if logging fails.
  try {
    const type = field(error, "type");
    const isStripe = typeof type === "string" && stripeTypes.has(type);
    const code = field(error, "code");
    const requestId = isStripe ? field(error, "requestId") : responseRequestId;
    const message = field(error, "message");
    const expectedBusinessRejection =
      (stage === "CONNECT_VALIDATION" && message === "Conta Connect incompatível: taxas precisam ser cobradas do produtor.") ||
      (stage === "PRICE_VALIDATION" && ["Invalid price", "Invalid monetary amount", "Preço inválido: use até duas casas decimais."].includes(String(message)));
    const entry = {
      stage,
      category: category ?? (status < 500 || expectedBusinessRejection ? "EXPECTED_REJECTION" : isStripe ? "STRIPE_ERROR" :
        ["INTEGRATION_CONFIG", "STRIPE_CONFIG", "URL_VALIDATION"].includes(stage) ? "CONFIGURATION_ERROR" :
        ["AUTH", "RATE_LIMIT", "CHECKOUT_READ", "PRODUCER_READ"].includes(stage) ? "DEPENDENCY_ERROR" : "INTERNAL_ERROR"),
      status,
      ...(isStripe && typeof code === "string" && stripeCodes.has(code) ? { stripeCode: code } : {}),
      ...(typeof requestId === "string" && /^req_[A-Za-z0-9]{8,80}$/.test(requestId) ? { stripeRequestId: requestId } : {}),
    };
    if (entry.category === "EXPECTED_REJECTION") console.warn(entry);
    else console.error(entry);
  } catch {
    // Deliberately no fallback that could expose the original exception.
  }
}
