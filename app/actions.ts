"use server";

import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Every action below re-derives the dealership from the session — never from a
// client argument. Mutations by ID filter on dealershipId as well, so a
// tampered ID from another tenant matches zero rows instead of succeeding.

async function assertVehicle(vehicleId: string, dealershipId: string) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, dealershipId },
    select: { id: true },
  });
  if (!vehicle) throw new Error("Vehicle not found");
}

async function assertLead(leadId: string, dealershipId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, dealershipId },
    select: { id: true },
  });
  if (!lead) throw new Error("Lead not found");
}

async function assertCustomer(customerId: string, dealershipId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, dealershipId },
    select: { id: true },
  });
  if (!customer) throw new Error("Customer not found");
}

// --- Inventory -------------------------------------------------------------

export async function createVehicle(data: {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  cost: number;
  price: number;
  description: string;
  // Whatever the dealer had on screen when they hit save — already rendered
  // from their chosen template, if any. Saved so the vehicle page shows this
  // exact text instead of regenerating from scratch with no template.
  facebookCopy?: string;
  craigslistCopy?: string;
}) {
  const dealershipId = await requireDealershipId();

  // Server-side guard: never trust the client. Every field is required and the
  // numeric fields must be real, non-negative numbers.
  const vin = data.vin.trim().toUpperCase();
  if (vin.length !== 17) throw new Error("A VIN is 17 characters.");
  if (!data.make.trim() || !data.model.trim() || !data.trim.trim()) {
    throw new Error("Make, model, and trim are required.");
  }
  for (const [label, n] of [
    ["Year", data.year],
    ["Mileage", data.mileage],
    ["Cost", data.cost],
    ["Price", data.price],
  ] as const) {
    if (!Number.isFinite(n)) throw new Error(`${label} must be a number.`);
  }
  if (data.year < 1980 || data.year > new Date().getFullYear() + 1) {
    throw new Error("Enter a valid year.");
  }
  if (data.mileage < 0 || data.cost < 0 || data.price <= 0) {
    throw new Error("Mileage and cost can't be negative, and price must be greater than zero.");
  }

  // VINs are unique per dealership, so this only checks your own inventory.
  const existing = await prisma.vehicle.findFirst({ where: { dealershipId, vin } });
  if (existing) throw new Error("That VIN is already in your inventory.");

  const vehicle = await prisma.vehicle.create({
    data: {
      dealershipId,
      vin,
      year: data.year,
      make: data.make.trim(),
      model: data.model.trim(),
      trim: data.trim.trim(),
      mileage: data.mileage,
      cost: data.cost,
      price: data.price,
      description: data.description,
      facebookCopy: data.facebookCopy,
      craigslistCopy: data.craigslistCopy,
      status: "available",
      acquiredAt: new Date(),
    },
  });
  revalidatePath("/app/inventory");
  return vehicle.id;
}

async function setListingText(
  vehicleId: string,
  field: "description" | "facebookCopy" | "craigslistCopy",
  text: string,
) {
  const dealershipId = await requireDealershipId();
  const { count } = await prisma.vehicle.updateMany({
    where: { id: vehicleId, dealershipId },
    data: { [field]: text },
  });
  if (count === 0) throw new Error("Vehicle not found");
  revalidatePath(`/app/inventory/${vehicleId}`);
}

export async function updateVehicleDescription(vehicleId: string, description: string) {
  await setListingText(vehicleId, "description", description);
}

export async function updateVehicleFacebookCopy(vehicleId: string, text: string) {
  await setListingText(vehicleId, "facebookCopy", text);
}

export async function updateVehicleCraigslistCopy(vehicleId: string, text: string) {
  await setListingText(vehicleId, "craigslistCopy", text);
}

export interface VehicleDetailsInput {
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  cost: number;
  price: number;
}

export async function updateVehicleDetails(vehicleId: string, data: VehicleDetailsInput) {
  const dealershipId = await requireDealershipId();
  if (!data.make.trim() || !data.model.trim()) {
    throw new Error("Make and model are required");
  }
  if (data.year < 1980 || data.year > new Date().getFullYear() + 1) {
    throw new Error("Enter a valid year");
  }
  if (data.mileage < 0 || data.cost < 0 || data.price < 0) {
    throw new Error("Numbers can't be negative");
  }
  const { count } = await prisma.vehicle.updateMany({
    where: { id: vehicleId, dealershipId },
    data: {
      year: data.year,
      make: data.make.trim(),
      model: data.model.trim(),
      trim: data.trim.trim(),
      mileage: data.mileage,
      cost: data.cost,
      price: data.price,
    },
  });
  if (count === 0) throw new Error("Vehicle not found");
  revalidatePath(`/app/inventory/${vehicleId}`);
  revalidatePath("/app/inventory");
  revalidatePath("/app");
}

// --- Leads -----------------------------------------------------------------

export async function markLeadRead(leadId: string) {
  const dealershipId = await requireDealershipId();
  await prisma.lead.updateMany({
    where: { id: leadId, dealershipId },
    data: { unread: false },
  });
  revalidatePath("/app/leads");
}

export async function toggleAutoPilot(source: string, autoPilot: boolean) {
  const dealershipId = await requireDealershipId();
  await prisma.sourceSetting.upsert({
    where: { dealershipId_source: { dealershipId, source } },
    create: { dealershipId, source, autoPilot },
    update: { autoPilot },
  });
  revalidatePath("/app/leads");
}

// --- Listing templates -----------------------------------------------------

const TEMPLATE_CHANNELS = ["description", "facebook", "craigslist"];

export async function createTemplate(name: string, body: string, channel: string) {
  const dealershipId = await requireDealershipId();
  if (!TEMPLATE_CHANNELS.includes(channel)) throw new Error("Invalid channel");
  await prisma.template.create({ data: { dealershipId, name, body, channel } });
  revalidatePath("/app/settings");
}

export async function updateTemplate(id: string, name: string, body: string, channel: string) {
  const dealershipId = await requireDealershipId();
  if (!TEMPLATE_CHANNELS.includes(channel)) throw new Error("Invalid channel");
  const { count } = await prisma.template.updateMany({
    where: { id, dealershipId },
    data: { name, body, channel },
  });
  if (count === 0) throw new Error("Template not found");
  revalidatePath("/app/settings");
}

export async function deleteTemplate(id: string) {
  const dealershipId = await requireDealershipId();
  await prisma.template.deleteMany({ where: { id, dealershipId } });
  revalidatePath("/app/settings");
}

// --- Schedule --------------------------------------------------------------

export async function saveBusinessHours(
  hours: { weekday: number; open: string | null; close: string | null }[],
) {
  const dealershipId = await requireDealershipId();
  for (const h of hours) {
    await prisma.businessHours.upsert({
      where: { dealershipId_weekday: { dealershipId, weekday: h.weekday } },
      create: { dealershipId, weekday: h.weekday, open: h.open, close: h.close },
      update: { open: h.open, close: h.close },
    });
  }
  revalidatePath("/app/settings");
}

export async function addScheduleBlock(title: string, startsAt: string, endsAt: string) {
  const dealershipId = await requireDealershipId();
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (!title.trim() || isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    throw new Error("Invalid block");
  }
  await prisma.scheduleBlock.create({
    data: { dealershipId, title: title.trim(), startsAt: start, endsAt: end },
  });
  revalidatePath("/app/settings");
}

export async function updateScheduleBlock(
  id: string,
  title: string,
  startsAt: string,
  endsAt: string,
) {
  const dealershipId = await requireDealershipId();
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (!title.trim() || isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    throw new Error("Invalid block");
  }
  const { count } = await prisma.scheduleBlock.updateMany({
    where: { id, dealershipId },
    data: { title: title.trim(), startsAt: start, endsAt: end },
  });
  if (count === 0) throw new Error("Block not found");
  revalidatePath("/app/settings");
}

export async function deleteScheduleBlock(id: string) {
  const dealershipId = await requireDealershipId();
  await prisma.scheduleBlock.deleteMany({ where: { id, dealershipId } });
  revalidatePath("/app/settings");
}

// Re-exported so existing imports keep working while the ownership helpers
// stay internal to this module.
export async function assertOwnsVehicle(vehicleId: string) {
  await assertVehicle(vehicleId, await requireDealershipId());
}
export async function assertOwnsLead(leadId: string) {
  await assertLead(leadId, await requireDealershipId());
}
export async function assertOwnsCustomer(customerId: string) {
  await assertCustomer(customerId, await requireDealershipId());
}
