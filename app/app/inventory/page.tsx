import { Badge, Button, Card } from "@/components/ui";
import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn, daysOnLot, dolColor, money, STATUS_LABELS } from "@/lib/utils";
import { Car, CheckCircle2, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "green" | "amber" | "slate" | "violet"> = {
  available: "green",
  pending: "amber",
  sold: "slate",
  recon: "violet",
};

export default async function InventoryPage() {
  const dealershipId = await requireDealershipId();
  const vehicles = await prisma.vehicle.findMany({
    where: { dealershipId },
    orderBy: [{ status: "asc" }, { acquiredAt: "desc" }],
    include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500">
            {vehicles.filter((v) => v.status === "available").length} available ·{" "}
            {vehicles.length} total on the books
          </p>
        </div>
        <Link href="/app/inventory/new">
          <Button>
            <Plus className="h-4 w-4" /> Add Vehicle
          </Button>
        </Link>
      </div>

      {/* Desktop table */}
      <Card className="hidden overflow-hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Mileage</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Days on lot</th>
              <th className="px-4 py-3">Listed on</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const dol = daysOnLot(v.acquiredAt);
              const listedCount = [v.listedWebsiteAt, v.listedFacebookAt, v.listedCraigslistAt].filter(Boolean).length;
              return (
                <tr key={v.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <Link href={`/app/inventory/${v.id}`} className="flex items-center gap-3 group">
                      <span className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-slate-400">
                        {v.photos[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.photos[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Car className="h-5 w-5" />
                        )}
                      </span>
                      <span>
                        <span className="block font-medium text-slate-900 group-hover:text-blue-700">
                          {v.year} {v.make} {v.model}
                        </span>
                        <span className="block text-xs text-slate-500">{v.trim}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{v.mileage.toLocaleString()} mi</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{money(v.price)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[v.status] ?? "default"}>{STATUS_LABELS[v.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-block rounded-full border px-2 py-0.5 text-xs font-semibold", dolColor(dol))}>
                      {dol} days
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {listedCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {listedCount}/3 channels
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Not listed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {vehicles.map((v) => {
          const dol = daysOnLot(v.acquiredAt);
          return (
            <Link key={v.id} href={`/app/inventory/${v.id}`}>
              <Card className="flex items-center gap-3 p-4">
                <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-slate-400">
                  {v.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.photos[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Car className="h-6 w-6" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {v.year} {v.make} {v.model} <span className="text-slate-500">{v.trim}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {v.mileage.toLocaleString()} mi · <span className="font-semibold text-slate-800">{money(v.price)}</span>
                  </p>
                  <div className="mt-1 flex gap-1.5">
                    <Badge variant={statusVariant[v.status] ?? "default"}>{STATUS_LABELS[v.status]}</Badge>
                    <span className={cn("inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold", dolColor(dol))}>
                      {dol}d
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
