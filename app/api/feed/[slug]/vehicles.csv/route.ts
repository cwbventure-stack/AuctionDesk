// Public vehicle catalog feed that Meta's Commerce Manager polls on a schedule.
//
// Deliberately unauthenticated: Meta fetches this from its own infrastructure
// with no way to present a credential, and every field in it is already public
// on the dealership's /lot/<slug> pages. Nothing here exposes cost, margin, lead,
// or customer data — see the explicit select in the query below.
import { buildVehicleFeed } from "@/lib/feed";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const dealership = await prisma.dealership.findUnique({
    where: { slug },
    select: { name: true, slug: true, city: true, state: true },
  });
  if (!dealership) {
    return new Response("Unknown dealership", { status: 404 });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { dealership: { slug }, status: "available" },
    // Explicit select: `cost` must never leave the building.
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
    orderBy: { acquiredAt: "desc" },
  });

  // Meta fetches images and landing pages itself, so every URL in the feed has
  // to be absolute. Derive it from the request rather than requiring config.
  const origin = process.env.APP_URL?.replace(/\/+$/, "") ?? new URL(request.url).origin;

  const { csv } = buildVehicleFeed(dealership, vehicles, origin);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `inline; filename="${slug}-vehicles.csv"`,
      // Meta re-fetches on its own schedule; a short cache keeps repeated pulls
      // cheap without letting a price change go stale for long.
      "cache-control": "public, max-age=300",
    },
  });
}
