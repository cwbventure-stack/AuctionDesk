import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

const SITE_URL = "https://www.auctiondesk.net";

// The internal tenant that owns platform-admin accounts has an empty public lot
// and shouldn't appear in search results.
const INTERNAL_SLUG = "auctiondesk-internal";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketing: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/signup`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Public dealer lots that actually have inventory live on their site. Each
  // lot index plus its available vehicles — the pages worth surfacing for a
  // shopper searching a specific car in a specific town.
  const dealerships = await prisma.dealership.findMany({
    where: {
      slug: { not: INTERNAL_SLUG },
      vehicles: { some: { status: "available", listedWebsiteAt: { not: null } } },
    },
    select: {
      slug: true,
      vehicles: {
        where: { status: "available", listedWebsiteAt: { not: null } },
        select: { id: true, createdAt: true },
      },
    },
  });

  const lots: MetadataRoute.Sitemap = dealerships.flatMap((d) => [
    { url: `${SITE_URL}/lot/${d.slug}`, changeFrequency: "daily" as const, priority: 0.7 },
    ...d.vehicles.map((v) => ({
      url: `${SITE_URL}/lot/${d.slug}/${v.id}`,
      lastModified: v.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  return [...marketing, ...lots];
}
