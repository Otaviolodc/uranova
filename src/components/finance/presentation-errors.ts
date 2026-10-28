import { unstable_rethrow } from "next/navigation";

// Existing readers preserve guard messages but flatten database errors to Error.
// Session/permission failures and Next control flow must reach their original handler.
export function rethrowAccessError(error: unknown) {
  unstable_rethrow(error);
  if (error && typeof error === "object") {
    if ("__isAuthError" in error || ("status" in error && [401, 403].includes(Number(error.status)))) throw error;
    if ("code" in error && ["42501", "PGRST301", "PGRST302", "PGRST303"].includes(String(error.code))) throw error;
  }
  if (error instanceof Error && /UNAUTHENTICATED|FORBIDDEN|REAUTH_REQUIRED|permission denied|row.level security|JWT|session|Auth/i.test(error.message)) throw error;
}
