import { generateListing } from "@/lib/ai";
import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const dealershipId = await requireDealershipId();
    const body = await req.json();
    const { vin, year, make, model, trim, mileage, price, descriptionTemplateId, facebookTemplateId, craigslistTemplateId } = body;
    if (!vin || !year || !make || !model) {
      return NextResponse.json({ error: "Missing vehicle fields" }, { status: 400 });
    }
    const [description, facebook, craigslist] = await Promise.all([
      descriptionTemplateId ? prisma.template.findFirst({ where: { id: descriptionTemplateId, dealershipId } }) : null,
      facebookTemplateId ? prisma.template.findFirst({ where: { id: facebookTemplateId, dealershipId } }) : null,
      craigslistTemplateId ? prisma.template.findFirst({ where: { id: craigslistTemplateId, dealershipId } }) : null,
    ]);
    const listing = await generateListing(
      {
        vin,
        year: Number(year),
        make,
        model,
        trim: trim ?? "",
        mileage: Number(mileage) || 0,
        price: Number(price) || 0,
      },
      { description, facebook, craigslist },
    );
    return NextResponse.json(listing);
  } catch {
    return NextResponse.json({ error: "Failed to generate listing" }, { status: 500 });
  }
}
