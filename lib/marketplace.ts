// Database-backed side of the Marketplace rules in lib/marketplace-rules.ts.
// The rules themselves are pure functions; this file supplies them with the
// dealership's actual posting history.
import "server-only";
import { prisma } from "@/lib/prisma";
import { checkPace, takedownOverdueBy, type PaceStatus } from "@/lib/marketplace-rules";

/**
 * How many vehicles this dealership has posted to Marketplace since local
 * midnight, and when the last one went out.
 *
 * Meta's limit is per *account*, and a lot posts from one owner's personal
 * account, so counting per dealership matches how the limit is actually applied.
 */
export async function facebookPaceFor(dealershipId: string, now = new Date()): Promise<PaceStatus> {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const [postedToday, lastPost] = await Promise.all([
    prisma.vehicle.count({
      where: { dealershipId, listedFacebookAt: { gte: startOfDay } },
    }),
    prisma.vehicle.findFirst({
      where: { dealershipId, listedFacebookAt: { not: null } },
      orderBy: { listedFacebookAt: "desc" },
      select: { listedFacebookAt: true },
    }),
  ]);

  return checkPace(postedToday, lastPost?.listedFacebookAt ?? null, now);
}

export interface OverdueTakedown {
  vehicleId: string;
  label: string;
  channels: ("facebook" | "craigslist")[];
  hoursOverdue: number;
}

/**
 * Sold vehicles still listed on an assisted channel. Anything past the 24-hour
 * mark is what actually risks the dealer's account, but we surface everything
 * sold-and-still-listed so nothing is a surprise.
 */
export async function overdueTakedowns(
  dealershipId: string,
  now = new Date(),
): Promise<OverdueTakedown[]> {
  const sold = await prisma.vehicle.findMany({
    where: {
      dealershipId,
      status: "sold",
      soldAt: { not: null },
      OR: [{ listedFacebookAt: { not: null } }, { listedCraigslistAt: { not: null } }],
    },
    select: {
      id: true,
      year: true,
      make: true,
      model: true,
      trim: true,
      soldAt: true,
      listedFacebookAt: true,
      listedCraigslistAt: true,
    },
    orderBy: { soldAt: "asc" },
  });

  return sold.map((v) => {
    const channels: ("facebook" | "craigslist")[] = [];
    if (v.listedFacebookAt) channels.push("facebook");
    if (v.listedCraigslistAt) channels.push("craigslist");
    return {
      vehicleId: v.id,
      label: `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`,
      channels,
      hoursOverdue: Math.floor(takedownOverdueBy(v.soldAt!, now)),
    };
  });
}
