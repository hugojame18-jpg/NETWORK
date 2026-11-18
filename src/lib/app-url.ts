/**
 * The app's public base URL, for links that leave the app: email buttons,
 * referral links, sitemap entries.
 *
 * Falls back to the real production origin rather than throwing or yielding
 * "undefined", because these URLs end up in emails sent to affiliates — a
 * missing environment variable must never ship a dead link.
 */
const PRODUCTION_URL = "https://revnetwork.live";
const DEVELOPMENT_URL = "http://localhost:3000";

export function appUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return process.env.NODE_ENV === "development"
    ? DEVELOPMENT_URL
    : PRODUCTION_URL;
}
