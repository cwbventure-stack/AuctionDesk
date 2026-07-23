import type { MetadataRoute } from "next";

// Marketing pages and public dealer lots are fair game to index; the signed-in
// app, the admin console, and the machine endpoints (feeds, embed) are not
// search results and only add crawl noise.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/admin/", "/api/", "/embed/"],
    },
    sitemap: "https://www.auctiondesk.net/sitemap.xml",
    host: "https://www.auctiondesk.net",
  };
}
