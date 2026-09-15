import type { MetadataRoute } from "next";
import { navItems, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = navItems.map((item) => ({
    url: `${siteConfig.url}${item.href === "/" ? "" : item.href}`,
    changeFrequency: "monthly",
    priority: item.href === "/" ? 1 : 0.8,
  }));

  return [
    ...pages,
    {
      url: `${siteConfig.url}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
