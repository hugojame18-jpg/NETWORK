import { createHash } from "crypto";

/**
 * Hashes a raw IP address before it's ever stored. We need IPs for fraud
 * detection (rate limiting, duplicate-click checks) but never want to persist
 * them in plaintext — the salted hash lets us compare "same visitor" without
 * keeping anything that identifies a real address.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "0.0.0.0";
}

/**
 * Best-effort country resolution from CDN/proxy headers (Vercel, Cloudflare).
 * Returns null when self-hosted without a geo-aware proxy in front — offers
 * with country restrictions simply won't be enforced in that case rather than
 * incorrectly blocking everyone.
 */
export function getClientCountry(headers: Headers): string | null {
  return headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry") ?? headers.get("x-geo-country") ?? null;
}
