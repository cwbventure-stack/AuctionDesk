import { Badge, Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/utils";
import { Car, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// The dealership's public inventory site. This is the one channel we publish to
// automatically — no platform approval needed, because it's ours.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dealership = await prisma.dealership.findUnique({ where: { slug } });
  if (!dealership) return { title: "Inventory" };
  return {
    title: `Used Cars in ${dealership.city || dealership.state} | ${dealership.name}`,
    description: `Browse current inventory at ${dealership.name}. Quality used vehicles, honestly priced.`,
  };
}

export default async function PublicLot({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dealership = await prisma.dealership.findUnique({ where: { slug } });
  if (!dealership) notFound();

  // Only vehicles the dealer has actually published, and never sold ones.
  const vehicles = await prisma.vehicle.findMany({
    where: {
      dealershipId: dealership.id,
      listedWebsiteAt: { not: null },
      status: { in: ["available", "pending"] },
    },
    include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { listedWebsiteAt: "desc" },
  });

  const location = [dealership.city, dealership.state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{dealership.name}</h1>
            <p className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
              {location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {location}
                </span>
              )}
              {dealership.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {dealership.phone}
                </span>
              )}
            </p>
          </div>
          <span className="text-sm font-medium text-slate-600">
            {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"} available
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {vehicles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Car className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-medium text-slate-700">No vehicles listed right now</p>
            <p className="text-sm text-slate-500">Check back soon — new inventory arrives weekly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <Link key={v.id} href={`/lot/${slug}/${v.id}`} className="group block">
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                  <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-slate-300">
                    {v.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.photos[0].url}
                        alt={`${v.year} ${v.make} ${v.model}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Car className="h-12 w-12" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                        {v.year} {v.make} {v.model}
                      </p>
                      {v.status === "pending" && <Badge variant="amber">Sale pending</Badge>}
                    </div>
                    <p className="text-xs text-slate-500">{v.trim}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900">{money(v.price)}</span>
                      <span className="text-xs text-slate-500">
                        {v.mileage.toLocaleString()} mi
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        {dealership.name} · Powered by AuctionDesk
      </footer>
    </div>
  );
}
