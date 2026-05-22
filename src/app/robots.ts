import type { MetadataRoute } from "next";
import { absoluteUrl, ROBOTS_DISALLOW, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ROBOTS_DISALLOW,
      },
    ],
    host: SITE_URL,
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
