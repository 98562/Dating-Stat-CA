import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const routes = [
  "",
  "/calculator",
  "/methodology",
  "/sources",
  "/faq",
  "/about",
  "/privacy",
  "/terms"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: new URL(route || "/", siteConfig.url).toString(),
    lastModified: now
  }));
}
