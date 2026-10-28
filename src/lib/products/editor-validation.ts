import type { Product } from "@/types/product";

// Local checks only: never normalize prices, publication flags or stored paths.
export function validateProductDraft(product: Product): string | null {
  if (typeof product.title !== "string" || !product.title.trim()) return "Informe o título do produto.";
  if (!product.id && !["course", "pdf", "ebook", "mentoring", "bundle"].includes(product.type)) return "Selecione um tipo de produto válido.";
  // Existing delivery references are left untouched, including legacy records.
  if (!product.id && ["pdf", "ebook", "bundle"].includes(product.type)) {
    if (!product.file_path) return "Envie o conteúdo antes de criar o produto.";
    if (product.type === "bundle") {
      try {
        const paths: unknown = JSON.parse(product.file_path);
        if (!Array.isArray(paths) || !paths.length || paths.length > 100 || paths.some((path) => typeof path !== "string" || !path)) {
          return "Envie um pack válido com até 100 arquivos.";
        }
      } catch { return "Envie um pack válido com até 100 arquivos."; }
    } else if (product.file_path.startsWith("[")) {
      return "Este tipo de produto aceita um único arquivo. Confira o conteúdo selecionado.";
    }
  }
  return null;
}
