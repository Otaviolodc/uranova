import "server-only";
import { FoundationError, createInput, id, reservationInput, versionInput, type Asset, type Evidence, type CreateResult } from "./contracts";

// This module has no live client, credentials or Storage writer. Only a trusted
// server composition may provide these ports after a separate activation review.
export interface FoundationPorts {
  authenticate(): Promise<{ id: string } | null>;
  rpc(name: string, args: Record<string, unknown>): Promise<{ data: unknown; error: { message: string } | null }>;
  inspectObject(asset: Readonly<Asset>): Promise<Evidence | null>;
}
export function createFoundationService(ports: FoundationPorts) {
  async function actor() {
    const user = await ports.authenticate();
    if (!user) throw new FoundationError("UNAUTHENTICATED");
    return id(user.id);
  }
  async function call<T>(name: string, args: Record<string, unknown>): Promise<T> {
    let result;
    try { result = await ports.rpc(name, args); }
    catch { throw new FoundationError("RESULT_UNCERTAIN"); }
    if (result.error) {
      const code = ["CONFLICT", "FORBIDDEN", "LEGACY_BLOCKED", "IMMUTABLE", "INVALID_FILES", "INVALID_INPUT", "SESSION_CLOSED", "EVIDENCE_MISMATCH", "EMPTY"]
        .find((value) => result.error!.message === `FOUNDATION_${value}`);
      throw new FoundationError(code || "RESULT_UNCERTAIN");
    }
    return result.data as T;
  }
  async function asset(owner: string, assetId: string) {
    const found = await call<Asset>("foundation_asset_status", { p_actor: owner, p_asset: assetId, p_uncertain: false });
    if (!found || found.seller_id !== owner || found.id !== assetId) throw new FoundationError("FORBIDDEN");
    return found;
  }
  return {
    async create(key: unknown, input: unknown) {
      const owner = await actor();
      return call<CreateResult>("foundation_create_product", { p_actor: owner, p_key: id(key), p_payload: createInput(input) });
    },
    async status(key: unknown) {
      return call<CreateResult | null>("foundation_create_status", { p_actor: await actor(), p_key: id(key) });
    },
    async draft(productId: unknown, input: unknown) {
      const owner = await actor(); const value = versionInput(input);
      return call<string>("foundation_new_draft", { p_actor: owner, p_product: id(productId), p_kind: value.kind,
        p_title: value.title, p_description: value.description, p_assets: value.assetIds });
    },
    async publish(versionId: unknown, expectedRevision: unknown) {
      const owner = await actor();
      if (!Number.isSafeInteger(expectedRevision) || Number(expectedRevision) < 0) throw new FoundationError("INVALID_INPUT");
      return call<{ product_id: string; version_id: string; revision: number }>("foundation_publish", {
        p_actor: owner, p_version: id(versionId), p_expected_revision: expectedRevision,
      });
    },
    async session(key: unknown) {
      return call<{ id: string; seller_id: string; state: string }>("foundation_upload_session", { p_actor: await actor(), p_key: id(key) });
    },
    async reserve(sessionId: unknown, fileKey: unknown, input: unknown) {
      const owner = await actor();
      return call<Asset>("foundation_reserve_asset", { p_actor: owner, p_session: id(sessionId), p_key: id(fileKey), p_file: reservationInput(input) });
    },
    async recover(assetId: unknown) {
      const owner = await actor(); return asset(owner, id(assetId));
    },
    async reconcile(assetId: unknown) {
      const owner = await actor(); const current = await asset(owner, id(assetId));
      let evidence;
      try { evidence = await ports.inspectObject(Object.freeze({ ...current })); }
      catch { evidence = null; }
      if (!evidence) {
        await call("foundation_asset_status", { p_actor: owner, p_asset: current.id, p_uncertain: true });
        throw new FoundationError("UPLOAD_UNCERTAIN");
      }
      if (evidence.owner !== owner || evidence.bucket !== current.bucket || evidence.path !== current.path || evidence.sha256 !== current.sha256
        || evidence.size !== current.size_bytes || evidence.mime !== current.mime) throw new FoundationError("EVIDENCE_MISMATCH");
      return call<Asset>("foundation_confirm_asset", { p_actor: owner, p_asset: current.id, p_evidence: evidence });
    },
  };
}
