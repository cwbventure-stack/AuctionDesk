import { MarkSoldButton } from "@/components/mark-sold-button";
import { PhotoGrid } from "@/components/photo-grid";
import { PostingPanel } from "@/components/posting-panel";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { VehicleDetailsCard } from "@/components/vehicle-details-card";
import { generateListing } from "@/lib/ai";
import { requireUser } from "@/lib/auth";
import { facebookPaceFor } from "@/lib/marketplace";
import { checkFacebookListing } from "@/lib/marketplace-rules";
import { prisma } from "@/lib/prisma";
import { cn, daysOnLot, dolColor, fullDate, money, STATUS_LABELS } from "@/lib/utils";
import { ListingTabs } from "@/components/listing-tabs";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "green" | "amber" | "slate" | "violet"> = {
  available: "green",
  pending: "amber",
  sold: "slate",
  recon: "violet",
};

export default async function VehicleDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  // Tenant-scoped lookup: another dealership's vehicle ID 404s.
  const vehicle = await prisma.vehicle.findFirst({
    where: { id, dealershipId: user.dealershipId },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
  if (!vehicle) notFound();

  const dol = daysOnLot(vehicle.acquiredAt);
  const listing = await generateListing(vehicle); // mock-mode: instant, deterministic
  // The dealer's saved (possibly hand-edited) description always wins.
  if (vehicle.description) listing.description = vehicle.description;

  // Checked server-side against the copy that will actually be posted, so an
  // edited description is what gets screened.
  const facebookIssues = checkFacebookListing({
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`.trim(),
    body: listing.facebook,
    price: vehicle.price,
    photoCount: vehicle.photos.length,
  });
  const pace = await facebookPaceFor(user.dealershipId);

  const channels = [
    { label: "Website", at: vehicle.listedWebsiteAt },
    { label: "Facebook Marketplace", at: vehicle.listedFacebookAt },
    { label: "Craigslist", at: vehicle.listedCraigslistAt },
  ];
  const isListed = channels.some((c) => c.at);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link href="/app/inventory" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Back to inventory
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {vehicle.year} {vehicle.make} {vehicle.model}{" "}
            <span className="font-normal text-slate-500">{vehicle.trim}</span>
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant[vehicle.status] ?? "default"}>{STATUS_LABELS[vehicle.status]}</Badge>
            <span className={cn("inline-block rounded-full border px-2 py-0.5 text-xs font-semibold", dolColor(dol))}>
              {dol} days on lot
            </span>
            <span className="font-mono text-xs text-slate-400">VIN {vehicle.vin}</span>
          </div>
        </div>
        <p className="text-3xl font-bold tracking-tight text-slate-900">{money(vehicle.price)}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Photos — real uploads with placeholder fallback */}
          <Card>
            <CardContent className="p-4">
              <PhotoGrid vehicleId={vehicle.id} photos={vehicle.photos} />
            </CardContent>
          </Card>

          {/* Generated listing set — editable, edits persist */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-900">
              Listing copy — every channel, one click. Hit Edit to make it yours.
            </h2>
            <ListingTabs listing={listing} persistVehicleId={vehicle.id} />
          </div>
        </div>

        <div className="space-y-5">
          {/* Specs — editable */}
          <VehicleDetailsCard
            vehicle={{
              id: vehicle.id,
              vin: vehicle.vin,
              year: vehicle.year,
              make: vehicle.make,
              model: vehicle.model,
              trim: vehicle.trim,
              mileage: vehicle.mileage,
              cost: vehicle.cost,
              price: vehicle.price,
              acquiredAt: vehicle.acquiredAt.toISOString(),
            }}
          />

          {/* Per-channel posting: website is automatic, the rest are assisted */}
          <Card>
            <CardHeader>
              <CardTitle>Where it&apos;s listed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PostingPanel
                vehicleId={vehicle.id}
                websiteAt={vehicle.listedWebsiteAt?.toISOString() ?? null}
                facebookAt={vehicle.listedFacebookAt?.toISOString() ?? null}
                craigslistAt={vehicle.listedCraigslistAt?.toISOString() ?? null}
                facebookCopy={listing.facebook}
                craigslistCopy={listing.craigslist}
                publicUrl={`/lot/${user.dealershipSlug}/${vehicle.id}`}
                sold={vehicle.status === "sold"}
                facebookIssues={facebookIssues}
                pace={pace}
              />
              <div className="border-t border-slate-100 pt-4">
                <MarkSoldButton vehicleId={vehicle.id} sold={vehicle.status === "sold"} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
