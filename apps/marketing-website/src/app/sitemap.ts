import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

// In-page #anchors aren't distinct resources, so they don't belong here —
// only the crawlable routes do. Extend this list as further routes ship.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/teachers", priority: 0.8 },
    { path: "/institutes", priority: 0.8 },
    { path: "/about", priority: 0.6 },
    { path: "/legal", priority: 0.3 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));
}
