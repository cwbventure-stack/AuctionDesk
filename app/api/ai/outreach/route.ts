import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { draftOutreach } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const dealershipId = await requireDealershipId();
    const { customerId, type } = await req.json();
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, dealershipId },
      include: { deals: { include: { vehicle: true }, orderBy: { closedAt: "desc" } } },
    });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const deal = customer.deals[0];
    const vehicleName = deal
      ? `${deal.vehicle.year} ${deal.vehicle.make} ${deal.vehicle.model} ${deal.vehicle.trim}`
      : "vehicle";
    // Simple demo heuristic for trade-in equity: ~45% of purchase price.
    const estimatedEquity = deal ? Math.round((deal.price * 0.45) / 100) * 100 : 4000;

    const draft = await draftOutreach({
      customerName: customer.name,
      town: customer.town,
      vehicle: vehicleName,
      purchaseDate: deal?.closedAt ?? new Date(),
      type,
      estimatedEquity,
    });
    return NextResponse.json({ draft });
  } catch {
    return NextResponse.json({ error: "Failed to draft outreach" }, { status: 500 });
  }
}
