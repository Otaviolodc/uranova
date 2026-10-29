import "server-only";
import { admin } from "@/lib/supabase/admin";
import { requireFinanceAdmin } from "@/lib/finance/access";
import { rethrowAccessError } from "@/components/finance/presentation-errors";

export type CommercialStatus = "Publicado no Marketplace" | "Ativo fora do Marketplace" | "Checkout inativo" | "Sem checkout";
type Checkout = { id: string; product_id: string | null; is_active: boolean | null; status: string | null; is_marketplace: boolean | null };
type Product = {
  id: string; title: string | null; price: string | null; type: string | null;
  user_id: string | null; created_at: string | null;
  owner: { name: string | null; username: string | null } | null;
};

export function classifyProduct(checkouts: Pick<Checkout, "is_active" | "status" | "is_marketplace">[]): CommercialStatus {
  const active = checkouts.filter(c => c.is_active === true && c.status === "active");
  if (active.some(c => c.is_marketplace === true)) return "Publicado no Marketplace";
  if (active.length) return "Ativo fora do Marketplace";
  return checkouts.length ? "Checkout inativo" : "Sem checkout";
}

export function summarizeProducts(products: Product[], checkouts: Checkout[]) {
  const byProduct = new Map<string, Checkout[]>();
  for (const checkout of checkouts) {
    if (!checkout.product_id) continue;
    const group = byProduct.get(checkout.product_id) ?? [];
    group.push(checkout); byProduct.set(checkout.product_id, group);
  }
  const rows = products.map(product => ({ ...product, commercialStatus: classifyProduct(byProduct.get(product.id) ?? []) }));
  return {
    products: rows,
    counts: {
      registered: rows.length,
      active: rows.filter(p => ["Publicado no Marketplace", "Ativo fora do Marketplace"].includes(p.commercialStatus)).length,
      marketplace: rows.filter(p => p.commercialStatus === "Publicado no Marketplace").length,
      withoutCheckout: rows.filter(p => p.commercialStatus === "Sem checkout").length,
    },
  };
}

// Paginate both sources: PostgREST's row limit must not silently become a total.
async function readProducts(): Promise<Product[]> {
  const rows: Product[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error, count } = await admin.from("products")
      .select("id,title,price,type,user_id,created_at,owner:profiles!user_id(name,username)", { count: "exact" })
      .order("id").range(offset, offset + 499);
    if (error) throw error;
    if (!data || count === null) throw new Error("CATALOG_UNAVAILABLE");
    rows.push(...data as unknown as Product[]);
    if (rows.length === count) return rows;
    if (data.length !== 500 || rows.length > count) throw new Error("CATALOG_INCOMPLETE");
  }
}

async function readCheckouts(): Promise<Checkout[]> {
  const rows: Checkout[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error, count } = await admin.from("products_checkout")
      .select("id,product_id,is_active,status,is_marketplace", { count: "exact" })
      .order("id").range(offset, offset + 499);
    if (error) throw error;
    if (!data || count === null) throw new Error("CATALOG_UNAVAILABLE");
    rows.push(...data);
    if (rows.length === count) return rows;
    if (data.length !== 500 || rows.length > count) throw new Error("CATALOG_INCOMPLETE");
  }
}

export async function getAdminProductCatalog() {
  // Authorization stays outside error handling; no data access before this guard.
  await requireFinanceAdmin();
  try {
    const [products, checkouts] = await Promise.all([readProducts(), readCheckouts()]);
    const catalog = summarizeProducts(products, checkouts);
    catalog.products.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "") || a.id.localeCompare(b.id));
    return catalog;
  } catch (error) {
    rethrowAccessError(error);
    return null;
  }
}

export async function getAdminRecordCount(table: "profiles" | "orders") {
  await requireFinanceAdmin();
  try {
    const { count, error } = await admin.from(table).select("id", { count: "exact", head: true });
    if (error) throw error;
    return count;
  } catch (error) {
    rethrowAccessError(error);
    return null;
  }
}
