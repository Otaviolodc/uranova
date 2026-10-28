export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function uuid(value: unknown): string {
  if (typeof value !== "string" || !UUID.test(value)) throw new Error("INVALID_INPUT");
  return value;
}
export function text(value: unknown, max: number, required = true): string {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new Error("INVALID_INPUT");
  return value.trim();
}
export function exactKeys(value: unknown, allowed: string[]): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(k => !allowed.includes(k))) throw new Error("INVALID_INPUT");
}
export function safeExternalUrl(value: unknown): string {
  const url = new URL(text(value, 2048));
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("INVALID_INPUT");
  return url.toString();
}
export function storedPaths(value: unknown): string[] {
  if (typeof value !== "string" || !value) return [];
  const parsed: unknown = value.startsWith("[") ? JSON.parse(value) : [value];
  if (!Array.isArray(parsed) || parsed.length > 100) throw new Error("INVALID_FILE");
  return parsed.map((v: unknown) => {
    const path = text(v, 1024);
    if (path.startsWith("/") || /[%\\\x00-\x1f:]/.test(path) || path.split("/").some(p => !p || p === "." || p === "..")) throw new Error("INVALID_FILE");
    return path;
  });
}
export function activeAccess(access: {status: string; expires_at: string | null} | null, now = Date.now()): boolean {
  return !!access && access.status === "active" && (access.expires_at === null || Date.parse(access.expires_at) > now);
}
