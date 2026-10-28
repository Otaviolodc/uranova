import type { SupabaseClient } from "@supabase/supabase-js";
import { activeAccess } from "./security/validation";
import { normalizeCategory } from "./public-catalog";

export type LibraryAccess = { id: string; product_id: string; status: string; expires_at: string | null; unlocked_at: string | null };
export type LibraryProduct = { id: string; title: string; image_url: string | null; type: string | null; unlocked_at?: string | null; available: boolean; accessLabel: string; missing: boolean };
export function accessLabel(access: Pick<LibraryAccess, "status" | "expires_at">, now = Date.now()) {
  if (activeAccess(access, now)) return "Liberado";
  return access.status === "active" && access.expires_at !== null && Date.parse(access.expires_at) <= now ? "Expirado" : "Indisponível";
}
export function preferredAccess<T extends LibraryAccess>(accesses: T[], now = Date.now()): T | undefined {
  const date = (value: string | null) => Number.isFinite(Date.parse(value ?? "")) ? Date.parse(value!) : 0;
  return [...accesses].sort((a, b) => Number(activeAccess(b, now)) - Number(activeAccess(a, now)) || date(b.unlocked_at) - date(a.unlocked_at) || a.id.localeCompare(b.id))[0];
}
export function libraryDestination(product: Pick<LibraryProduct, "id" | "type">) {
  return normalizeCategory(product.type) === "course" ? `/dashboard/my-courses/${product.id}` : `/dashboard/customer/products/${product.id}`;
}
export function groupLibraryAccesses(accesses: LibraryAccess[], now = Date.now()) {
  const grouped = new Map<string, LibraryAccess>();
  for (const access of accesses) {
    const previous = grouped.get(access.product_id);
    grouped.set(access.product_id, previous ? preferredAccess([previous, access], now)! : access);
  }
  return grouped;
}
export function readableDate(value: string | null | undefined) {
  return value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString("pt-BR") : "—";
}
export async function loadCustomerLibrary(client: SupabaseClient): Promise<LibraryProduct[]> {
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) throw new Error("SESSION_REQUIRED");
  const accesses: LibraryAccess[] = [];
  // Explicit pages avoid the Data API's default row limit. Read only, tenant scoped.
  for (let offset = 0; ; offset += 200) {
    const { data, error } = await client.from("customer_products").select("id,product_id,status,expires_at,unlocked_at").eq("customer_id", user.id).order("id").range(offset, offset + 199);
    if (error) throw new Error("LIBRARY_READ_FAILED");
    accesses.push(...(data ?? []));
    if (!data || data.length < 200) break;
  }
  const ids = [...new Set(accesses.map(access => access.product_id).filter(Boolean))];
  const products = new Map<string, { id: string; title: string; image_url: string | null; type: string | null }>();
  for (let offset = 0; offset < ids.length; offset += 100) {
    const { data, error } = await client.from("products").select("id,title,image_url,type").in("id", ids.slice(offset, offset + 100)).order("id");
    if (error) throw new Error("PRODUCT_READ_FAILED");
    for (const product of data ?? []) products.set(product.id, product);
  }
  const now = Date.now();
  const grouped = groupLibraryAccesses(accesses, now);
  return ids.map(id => {
    const access = grouped.get(id)!;
    const product = products.get(id);
    return { id, title: product?.title?.trim() || "Produto indisponível", image_url: product?.image_url ?? null, type: product?.type ?? null,
      unlocked_at: access.unlocked_at, available: !!product && activeAccess(access, now),
      accessLabel: product ? accessLabel(access, now) : "Produto indisponível", missing: !product };
  }).sort((a, b) => a.title.localeCompare(b.title, "pt-BR") || a.id.localeCompare(b.id));
}
