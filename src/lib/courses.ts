import { normalizeCategory } from "./public-catalog";

export const isCourse = (type: string | null | undefined) => normalizeCategory(type) === "course";
export const isMentoring = (type: string | null | undefined) => normalizeCategory(type) === "mentoring";
type Positioned = { id: string; position?: number | null };
export function orderCourseItems<T extends Positioned>(items: T[]): T[] {
  const position = (item: T) => typeof item.position === "number" && Number.isFinite(item.position) ? item.position : Number.MAX_SAFE_INTEGER;
  return [...items].sort((a, b) => position(a) - position(b) || a.id.localeCompare(b.id));
}
export function courseSequence<M extends Positioned, L extends Positioned & { module_id: string }>(modules: M[], lessons: L[]) {
  return orderCourseItems(modules).flatMap(module => orderCourseItems(lessons.filter(lesson => lesson.module_id === module.id)));
}
export function nextPosition(items: Positioned[]) {
  return Math.max(-1, ...items.map(item => item.position ?? -1)) + 1;
}
export function completionCount(lessonIds: string[], progress: string[]) {
  const known = new Set(lessonIds);
  const completedLessons = new Set(progress.filter(id => known.has(id))).size;
  return { totalLessons: known.size, completedLessons, completed: known.size > 0 && completedLessons === known.size };
}
export function courseVideo(url: string | null, provider: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
    const host = parsed.hostname.toLowerCase();
    if (provider === "youtube" || ["youtube.com", "www.youtube.com", "youtu.be"].includes(host)) {
      if (!["youtube.com", "www.youtube.com", "youtu.be", "www.youtube-nocookie.com"].includes(host)) return null;
      const id = host === "youtu.be" ? parsed.pathname.slice(1) : parsed.searchParams.get("v") || parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1];
      return id && /^[\w-]{11}$/.test(id) ? { kind: "embed" as const, url: `https://www.youtube-nocookie.com/embed/${id}` } : null;
    }
    if (provider === "vimeo" || ["vimeo.com", "player.vimeo.com"].includes(host)) {
      if (!["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) return null;
      const id = parsed.pathname.match(/^\/(?:video\/)?(\d+)$/)?.[1];
      return id ? { kind: "embed" as const, url: `https://player.vimeo.com/video/${id}${parsed.searchParams.has("h") ? `?h=${encodeURIComponent(parsed.searchParams.get("h")!)}` : ""}` } : null;
    }
    return { kind: provider === "upload" ? "video" as const : "link" as const, url };
  } catch { return null; }
}
