import { isIP } from "node:net";

// Covers are uploaded to this public bucket. Never forward signed/private URLs.
// This validates the URL contract, not remote availability or image contents.
export function checkoutImage(value: unknown): { images?: string[] } {
  if (typeof value !== "string" || !value || value.length > 2048) return {};
  try {
    const storage = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    const image = new URL(value);
    if (storage.protocol !== "https:" || image.protocol !== "https:"
      || image.origin !== storage.origin || image.username || image.password
      || image.search || image.hash || image.port
      || isIP(image.hostname.replace(/^\[|\]$/g, ""))
      || !image.hostname.includes(".") || /\.(localhost|local|internal|test|invalid)$/.test(image.hostname)
      || !/^\/storage\/v1\/object\/public\/products-images\/[^/]+\/[^/]+\.(png|jpe?g|webp)$/i.test(image.pathname)
      || /%|\\|\s/.test(value)) return {};
    return { images: [image.href] };
  } catch {
    return {};
  }
}
