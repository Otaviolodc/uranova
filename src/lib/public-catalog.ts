export const catalogCategories = [
  { value: "todos", label: "Todos" },
  { value: "ebook", label: "E-book" },
  { value: "course", label: "Curso" },
  { value: "pdf", label: "PDF" },
  { value: "ferramenta", label: "Ferramenta" },
  { value: "mentoring", label: "Mentoria" },
  { value: "bundle", label: "Pack de Arquivos" },
];

export function normalizeCategory(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() || "";
  const aliases: Record<string, string> = {
    curso: "course", mentoria: "mentoring", "e-book": "ebook", tool: "ferramenta",
  };
  return aliases[normalized] || normalized;
}

export function categoryLabel(value: string | null | undefined) {
  return catalogCategories.find((item) => item.value === normalizeCategory(value))?.label || "Produto";
}

export function matchesCatalogSearch(title: string | null, search: string) {
  const normalize = (value: string) => value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return normalize(title || "").includes(normalize(search));
}

// Keep valid affiliate URLs exactly as stored, including tracking parameters.
export function publicHttpUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? value : null;
  } catch {
    return null;
  }
}
