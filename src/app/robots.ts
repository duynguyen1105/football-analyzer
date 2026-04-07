import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [
      "https://nhandinhbongdavn.com/sitemap.xml",
      "https://nhandinhbongdavn.com/news-sitemap.xml",
      "https://nhandinhbongdavn.com/image-sitemap.xml",
    ],
  };
}
