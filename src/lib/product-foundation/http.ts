import "server-only";
import { FoundationError } from "./contracts";
import type { createFoundationService } from "./service";

export function foundationUnavailable() {
  // Deliberately not an environment flag: activation requires a reviewed code change.
  return Response.json({ code: "PRODUCT_FOUNDATION_DISABLED" }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

export function createLocalFoundationHandlers(service: ReturnType<typeof createFoundationService>) {
  function failure(error: unknown) {
    const code = error instanceof FoundationError ? error.code : "RESULT_UNCERTAIN";
    const status = code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : code === "INVALID_INPUT" ? 422
      : ["CONFLICT", "LEGACY_BLOCKED", "IMMUTABLE"].includes(code) ? 409 : 503;
    return Response.json({ code, retryWithSameKey: code === "RESULT_UNCERTAIN" }, { status, headers: { "Cache-Control": "no-store" } });
  }
  return {
    async commit(request: Request) {
      try {
        if (request.headers.get("origin") !== new URL(request.url).origin) throw new FoundationError("FORBIDDEN");
        if (!request.headers.get("content-type")?.startsWith("application/json")) throw new FoundationError("INVALID_INPUT");
        const reader = request.body?.getReader(); if (!reader) throw new FoundationError("INVALID_INPUT");
        const chunks: Uint8Array[] = []; let size = 0;
        for (;;) { const { value, done } = await reader.read(); if (done) break; size += value.length;
          if (size > 32768) { await reader.cancel(); throw new FoundationError("INVALID_INPUT"); } chunks.push(value); }
        let input: unknown;
        try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new FoundationError("INVALID_INPUT"); }
        const result = await service.create(request.headers.get("idempotency-key"), input);
        return Response.json(result, { status: result.replayed ? 200 : 201, headers: { "Cache-Control": "no-store" } });
      } catch (error) { return failure(error); }
    },
    async status(key: string) {
      try {
        const result = await service.status(key);
        // Absence is not evidence of failure while another transaction may be in flight.
        return Response.json(result || { code: "RESULT_NOT_CONFIRMED", retryWithSameKey: true },
          { status: result ? 200 : 202, headers: { "Cache-Control": "no-store" } });
      } catch (error) { return failure(error); }
    },
  };
}
