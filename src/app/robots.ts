import type { MetadataRoute } from "next";

import { appUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private surfaces and tracking endpoints must never be indexed.
      disallow: ["/dashboard", "/advertiser", "/admin", "/api/"],
    },
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
