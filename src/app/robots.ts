import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private surfaces and tracking endpoints must never be indexed.
      disallow: ["/dashboard", "/advertiser", "/admin", "/api/"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
