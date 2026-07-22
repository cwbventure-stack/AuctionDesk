// Public inventory as JSON, for a dealer's existing website.
//
// Two consumers: the embed widget in /embed/[slug].js, and any web developer who
// wants to render inventory themselves. Same public data as the /lot/<slug>
// pages — see the explicit select for what deliberately doesn't ship.
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const dealership = await prisma.dealership.findUnique({
    where: { slug },
    select: { name: true, city: true, state: true, phone: true },
  });
  if (!dealership) {
    return Response.json({ error: "Unknown dealership" }, { status: 404 });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { dealership: { slug }, status: "available", listedWebsiteAt: { not: null } },
    // `cost` is deliberately absent.
    select: {
      id: true,
      year: true,
      make: true,
      model: true,
      trim: true,
      mileage: true,
      price: true,
      exteriorColor: true,
      bodyStyle: true,
      photos: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { acquiredAt: "desc" },
  });

  const origin = process.env.APP_URL?.replace(/\/+$/, "") ?? new URL(request.url).origin;

  return Response.json(
    {
      dealership,
      vehicles: vehicles.map((v) => ({
        id: v.id,
        title: `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`,
        year: v.year,
        make: v.make,
        model: v.model,
        trim: v.trim,
        mileage: v.mileage,
        price: v.price,
        color: v.exteriorColor,
        bodyStyle: v.bodyStyle,
        url: `${origin}/lot/${slug}/${v.id}`,
        photo: v.photos[0]
          ? v.photos[0].url.startsWith("http")
            ? v.photos[0].url
            : `${origin}${v.photos[0].url}`
          : null,
      })),
    },
    {
      headers: {
        // Any site can read this — it's public inventory meant to be embedded.
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=300",
      },
    },
  );
}
