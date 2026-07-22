import { PublicLeadForm } from "@/components/public-lead-form";
import { Badge, Card } from "@/components/ui";
import { generateListing } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/utils";
import { ArrowLeft, Car, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function load(slug: string, vehicleId: string) {
  const dealership = await prisma.dealership.findUnique({ where: { slug } });
  if (!dealership) return null;
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      dealershipId: dealership.id,
      listedWebsiteAt: { not: null },
      status: { in: ["available", "pending"] },
    },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
  if (!vehicle) return null;
  return { dealership, vehicle };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; vehicleId: string }>;
}): Promise<Metadata> {
  const { slug, vehicleId } = await params;
  const data = await load(slug, vehicleId);
  if (!data) return { title: "Vehicle" };
  const { vehicle, dealership } = data;
  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} | ${dealership.name}`,
    description: `${vehicle.mileage.toLocaleString()} miles, ${money(vehicle.price)}. Available now at ${dealership.name}.`,
  };
}

export default async function PublicVehicle({
  params,
}: {
  params: Promise<{ slug: string; vehicleId: string }>;
}) {
  const { slug, vehicleId } = await params;
  const data = await load(slug, vehicleId);
  if (!data) notFound();
  const { dealership, vehicle } = data;

  // Show the dealer's saved copy if they've written/edited one.
  const listing = await generateListing(vehicle);
  const description = vehicle.description || listing.description;
  const location = [dealership.city, dealership.state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4">
          <Link href={`/lot/${slug}`} className="text-lg font-bold tracking-tight text-slate-900">
            {dealership.name}
          </Link>
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
      </header>

      <main className="mx-auto max-w-5xl px-5 py-6">
        <Link
          href={`/lot/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> All inventory
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {vehicle.year} {vehicle.make} {vehicle.model}{" "}
              <span className="font-normal text-slate-500">{vehicle.trim}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {vehicle.mileage.toLocaleString()} miles
              {vehicle.status === "pending" && (
                <>
                  {" · "}
                  <Badge variant="amber">Sale pending</Badge>
                </>
              )}
            </p>
          </div>
          <p className="text-3xl font-bold tracking-tight text-slate-900">{money(vehicle.price)}</p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Card className="overflow-hidden">
              {vehicle.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-1 p-1">
                  {vehicle.photos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={p.id}
                      src={p.url}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className={`w-full rounded object-cover ${
                        i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]"
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-slate-100 text-slate-300">
                  <Car className="h-16 w-16" />
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">About this vehicle</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                {description}
              </p>
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Details</h2>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                {[
                  ["Year", String(vehicle.year)],
                  ["Make", vehicle.make],
                  ["Model", vehicle.model],
                  ["Trim", vehicle.trim],
                  ["Mileage", `${vehicle.mileage.toLocaleString()} mi`],
                  ["VIN", vehicle.vin],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-slate-100 pb-1.5 pr-4">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-medium text-slate-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>

          {/* Lead capture — this is how website leads reach the inbox */}
          <div>
            <Card className="p-5 lg:sticky lg:top-6">
              <h2 className="text-sm font-semibold text-slate-900">Interested?</h2>
              <p className="mb-3 text-xs text-slate-500">
                Send a message and we&apos;ll get right back to you — usually within minutes.
              </p>
              <PublicLeadForm dealershipSlug={slug} vehicleId={vehicle.id} />
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        {dealership.name} · Powered by AuctionDesk
      </footer>
    </div>
  );
}
