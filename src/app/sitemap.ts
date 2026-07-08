import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: appUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${appUrl}/sign-up`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${appUrl}/sign-in`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
