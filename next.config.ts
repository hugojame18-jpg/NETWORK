import type { NextConfig } from "next";
import { PROMO_SITES } from "./src/lib/promo-sites";

/**
 * Publishers preview the network's own promo sites in an iframe on
 * /dashboard/sites. Deriving the frame-src allowlist from the catalogue keeps
 * the two from drifting: adding a site there is enough, and no other origin
 * can be framed.
 */
const promoSiteOrigins = Array.from(new Set(PROMO_SITES.map((site) => new URL(site.url).origin)));

/**
 * Security headers applied to every route. CSP is kept pragmatic for a
 * Next.js app: inline styles are required by styled-jsx/Tailwind runtime
 * bits, and 'unsafe-inline' scripts are needed for Next's bootstrap in
 * production (Next injects inline scripts without nonces by default).
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      ["frame-src 'self'", ...promoSiteOrigins].join(" "),
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // The click redirect is embedded/followed cross-site by design; it must
      // never be cached so every visit is recorded.
      {
        source: "/api/track/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
