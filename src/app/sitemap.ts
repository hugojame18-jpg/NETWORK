import type { MetadataRoute } from "next";

import { appUrl } from "@/lib/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: appUrl(), changeFrequency: "weekly", priority: 1 },
    { url: `${appUrl()}/sign-up`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${appUrl()}/sign-in`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
