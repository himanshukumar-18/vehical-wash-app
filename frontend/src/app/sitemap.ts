import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  return staticRoutes;
}
