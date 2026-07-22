import "server-only";
import { buildVehicleFeed, type FeedExclusion } from "@/lib/feed";
import { prisma } from "@/lib/prisma";

export interface FeedStatus {
  included: number;
  excluded: FeedExclusion[];
  /** Grouped reason -> count, for a one-line summary in Settings. */
  reasons: { reason: string; count: number }[];
}

/**
 * What the dealership's catalog feed currently contains, and what's being left
 * out. Meta counts rejected rows against catalog health, so a vehicle missing
 * required fields is held back rather than sent and bounced — Settings shows
 * exactly what to fix.
 */
export async function feedStatusFor(dealershipId: string, baseUrl: string): Promise<FeedStatus> {
  const dealership = await prisma.dealership.findUnique({
    where: { id: dealershipId },
    select: { name: true, slug: true, city: true, state: true },
  });
  if (!dealership) return { included: 0, excluded: [], reasons: [] };

  const vehicles = await prisma.vehicle.findMany({
    where: { dealershipId, status: "available" },
    select: {
      id: true,
      vin: true,
      year: true,
      make: true,
      model: true,
      trim: true,
      mileage: true,
      price: true,
      status: true,
      bodyStyle: true,
      exteriorColor: true,
      transmission: true,
      fuelType: true,
      description: true,
      photos: { select: { url: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  const { included, excluded } = buildVehicleFeed(dealership, vehicles, baseUrl);

  const tally = new Map<string, number>();
  for (const e of excluded) {
    for (const m of e.missing) tally.set(m, (tally.get(m) ?? 0) + 1);
  }

  return {
    included,
    excluded,
    reasons: [...tally.entries()]
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
  };
}
