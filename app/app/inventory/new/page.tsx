import { AddVehicleForm } from "@/components/add-vehicle-form";
import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AddVehiclePage() {
  const dealershipId = await requireDealershipId();
  const templates = await prisma.template.findMany({
    where: { dealershipId },
    select: { id: true, name: true, channel: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/app/inventory" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Back to inventory
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add a vehicle</h1>
        <p className="text-sm text-slate-500">
          Enter the basics once — AuctionDesk writes every listing for you. No more Sunday nights posting cars.
        </p>
      </div>

      <AddVehicleForm templates={templates} />
    </div>
  );
}
