export type LinkMetric = { id?: string; title?: string | null; clicks?: number | null };
export function linkStatistics(links: LinkMetric[]) {
  const known = links.filter(link => typeof link.clicks === "number" && Number.isSafeInteger(link.clicks) && link.clicks >= 0);
  const total = known.reduce((sum, link) => sum + link.clicks!, 0);
  const ranking = known.map((link, index) => ({ id: link.id ?? String(index), title: link.title?.trim() || "Link sem título", clicks: link.clicks! }))
    .sort((a, b) => b.clicks - a.clicks || a.id.localeCompare(b.id));
  return { ranking, total, average: known.length ? total / known.length : null, missing: links.length - known.length };
}
