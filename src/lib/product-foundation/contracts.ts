export type DeliveryKind = "pdf" | "ebook" | "bundle";
export type CreateDraft = { contract: "1"; title: string; description: string | null; price: string; kind: DeliveryKind; assetIds: string[] };
export type CreateResult = { productId: string; checkoutId: string; versionId: string; replayed: boolean };
export type Asset = { id: string; seller_id: string; bucket: string; path: string; name: string; size_bytes: number; mime: string; sha256: string; state: "reserved" | "uncertain" | "verified" };
export type Evidence = { owner: string; bucket: string; path: string; size: number; mime: string; sha256: string };
export type FileReservation = { name: string; size: number; mime: string; sha256: string; bucket: "products" | "products-images" };

export class FoundationError extends Error {
  constructor(public readonly code: string) { super(code); }
}
export function id(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new FoundationError("INVALID_INPUT");
  return value.toLowerCase();
}
export function object(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some((key) => !keys.includes(key))) throw new FoundationError("INVALID_INPUT");
  return value as Record<string, unknown>;
}
function title(value: unknown) {
  if (typeof value !== "string" || !value.trim() || value.length > 200) throw new FoundationError("INVALID_INPUT");
  return value; // Preserve presentation and idempotency identity, no silent edits.
}
export function versionInput(value: unknown) {
  const b = object(value, ["title", "description", "kind", "assetIds"]);
  if (!["pdf", "ebook", "bundle"].includes(String(b.kind))) throw new FoundationError("INVALID_INPUT");
  if (b.description !== null && (typeof b.description !== "string" || b.description.length > 10000)) throw new FoundationError("INVALID_INPUT");
  if (!Array.isArray(b.assetIds) || b.assetIds.length < 1 || b.assetIds.length > 100 || (b.kind !== "bundle" && b.assetIds.length !== 1)) throw new FoundationError("INVALID_INPUT");
  const assetIds = b.assetIds.map(id);
  if (new Set(assetIds).size !== assetIds.length) throw new FoundationError("INVALID_INPUT");
  return { title: title(b.title), description: b.description as string | null, kind: b.kind as DeliveryKind, assetIds };
}
export function createInput(value: unknown): CreateDraft {
  const b = object(value, ["contract", "title", "description", "price", "kind", "assetIds"]);
  if (b.contract !== "1" || typeof b.price !== "string" || !/^\d+(\.\d{1,2})?$/.test(b.price) || !/[1-9]/.test(b.price)) throw new FoundationError("INVALID_INPUT");
  return { contract: "1", ...versionInput({ title: b.title, description: b.description, kind: b.kind, assetIds: b.assetIds }), price: b.price };
}
export function reservationInput(value: unknown): FileReservation {
  const b = object(value, ["name", "size", "mime", "sha256", "bucket"]);
  if (typeof b.name !== "string" || !b.name || b.name.length > 255 || !Number.isSafeInteger(b.size) || Number(b.size) < 1 || Number(b.size) > 4186112
    || typeof b.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(b.sha256) || !["products", "products-images"].includes(String(b.bucket))
    || !["application/pdf", "application/zip", "video/mp4", "image/png", "image/jpeg", "image/webp"].includes(String(b.mime))
    || (b.bucket === "products-images" && !["image/png", "image/jpeg", "image/webp"].includes(String(b.mime)))) throw new FoundationError("INVALID_INPUT");
  return b as unknown as FileReservation;
}
