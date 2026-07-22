import { prisma } from "@/lib/prisma";
import { draftReply } from "@/lib/ai";
import { requireDealershipId } from "@/lib/auth";
import { nextTestDriveSlots } from "@/lib/schedule";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const dealershipId = await requireDealershipId();
    const { leadId } = await req.json();
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, dealershipId },
      include: { vehicle: true, messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const lastCustomerMsg = [...lead.messages].reverse().find((m) => m.sender === "customer");
    const slots = await nextTestDriveSlots(dealershipId, 2);
    const draft = await draftReply({
      slots,
      leadName: lead.name,
      question: lastCustomerMsg?.body ?? "Is the vehicle still available?",
      vehicle: lead.vehicle
        ? {
            vin: lead.vehicle.vin,
            year: lead.vehicle.year,
            make: lead.vehicle.make,
            model: lead.vehicle.model,
            trim: lead.vehicle.trim,
            mileage: lead.vehicle.mileage,
            price: lead.vehicle.price,
            status: lead.vehicle.status,
          }
        : null,
    });
    return NextResponse.json({ draft });
  } catch {
    return NextResponse.json({ error: "Failed to draft reply" }, { status: 500 });
  }
}
