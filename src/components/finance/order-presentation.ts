export function productTitle(relation: unknown): string {
  const product = Array.isArray(relation) ? relation[0] : relation;
  if (product && typeof product === "object" && "title" in product && typeof product.title === "string" && product.title.trim()) return product.title;
  return "Produto indisponível";
}

export function orderStatus(status: unknown): string {
  if (typeof status !== "string") return "Status desconhecido";
  switch (status.toUpperCase()) {
    case "PAID": return "APROVADA";
    case "PENDING": return "PENDENTE";
    case "CANCELLED": case "CANCELED": return "CANCELADA";
    default: return "Status desconhecido";
  }
}
