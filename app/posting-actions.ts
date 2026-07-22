"use server";

import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Posting model, by channel:
//
//   website     — we publish it ourselves. Setting listedWebsiteAt makes the
//                 vehicle appear on the dealership's public inventory site
//                 immediately. This is genuinely automatic.
//   facebook    — assisted. We prepare the copy and open Marketplace's posting
//                 page; the dealer pastes and submits, then confirms here.
//   craigslist  — assisted, same flow.
//
// Assisted posting is deliberate: automating posts to those sites violates
// their terms and risks the dealer's account. See PRODUCTION_ROADMAP.md.

export type Channel = "website" | "facebook" | "craigslist";

const FIELD: Record<Channel, "listedWebsiteAt" | "listedFacebookAt" | "listedCraigslistAt"> = {
  website: "listedWebsiteAt",
  facebook: "listedFacebookAt",
  craigslist: "listedCraigslistAt",
};

async function setChannel(vehicleId: string, channel: Channel, value: Date | null) {
  const dealershipId = await requireDealershipId();
  const { count } = await prisma.vehicle.updateMany({
    where: { id: vehicleId, dealershipId },
    data: { [FIELD[channel]]: value },
  });
  if (count === 0) throw new Error("Vehicle not found");
  revalidatePath(`/app/inventory/${vehicleId}`);
  revalidatePath("/app/inventory");
  revalidatePath("/app");
}

/** Publishes to the dealership's own website — real and immediate. */
export async function publishToWebsite(vehicleId: string) {
  await setChannel(vehicleId, "website", new Date());
}

export async function removeFromWebsite(vehicleId: string) {
  await setChannel(vehicleId, "website", null);
}

/**
 * Records that the dealer completed an assisted post on Facebook or Craigslist.
 * We can't verify it from here — this is their confirmation that it's live.
 */
export async function markChannelPosted(vehicleId: string, channel: Channel) {
  await setChannel(vehicleId, channel, new Date());
}

/** Records that a listing was taken down on an assisted channel. */
export async function markChannelRemoved(vehicleId: string, channel: Channel) {
  await setChannel(vehicleId, channel, null);
}

export interface SoldResult {
  /** Channels the dealer still needs to take down by hand. */
  manualTakedowns: Channel[];
}

/**
 * Marks a vehicle sold. The website listing comes down automatically; Facebook
 * and Craigslist are returned so the UI can walk the dealer through removing
 * them (and we don't silently claim to have done it).
 */
export async function markVehicleSold(vehicleId: string): Promise<SoldResult> {
  const dealershipId = await requireDealershipId();
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, dealershipId },
  });
  if (!vehicle) throw new Error("Vehicle not found");

  const manualTakedowns: Channel[] = [];
  if (vehicle.listedFacebookAt) manualTakedowns.push("facebook");
  if (vehicle.listedCraigslistAt) manualTakedowns.push("craigslist");

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      status: "sold",
      // Ours to control — off the public site right away.
      listedWebsiteAt: null,
      // Facebook/Craigslist stay flagged until the dealer confirms removal, so
      // the UI can keep reminding them.
    },
  });

  revalidatePath("/app/inventory");
  revalidatePath(`/app/inventory/${vehicleId}`);
  revalidatePath("/app");
  return { manualTakedowns };
}

export async function reopenVehicle(vehicleId: string) {
  const dealershipId = await requireDealershipId();
  const { count } = await prisma.vehicle.updateMany({
    where: { id: vehicleId, dealershipId },
    data: { status: "available" },
  });
  if (count === 0) throw new Error("Vehicle not found");
  revalidatePath("/app/inventory");
  revalidatePath(`/app/inventory/${vehicleId}`);
}
