"use server";

import { prisma } from "@/lib/prisma";
import { captureError } from "@/lib/observability";
import { looksLikePhone } from "@/lib/sms";
import { isAfterHours } from "@/lib/utils";

// Actions callable from the PUBLIC inventory site. These are deliberately not
// tenant-scoped by session — there is no session — so they take a dealership
// slug and only ever CREATE a lead. They never read or modify existing data.

export interface LeadFormResult {
  ok: boolean;
  message: string;
}

export async function submitPublicLead(input: {
  dealershipSlug: string;
  vehicleId: string;
  name: string;
  contact: string;
  message: string;
  smsConsent: boolean;
}): Promise<LeadFormResult> {
  try {
    const name = input.name.trim();
    const contact = input.contact.trim();
    const message = input.message.trim();

    if (!name || !contact) {
      return { ok: false, message: "Please add your name and how to reach you." };
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    if (!isEmail && !looksLikePhone(contact)) {
      return { ok: false, message: "Enter a valid phone number or email address." };
    }

    const dealership = await prisma.dealership.findUnique({
      where: { slug: input.dealershipSlug },
    });
    if (!dealership) return { ok: false, message: "Something went wrong. Please call us instead." };

    // Confirm the vehicle belongs to this dealership and is actually listed.
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: input.vehicleId,
        dealershipId: dealership.id,
        listedWebsiteAt: { not: null },
      },
      select: { id: true, year: true, make: true, model: true },
    });

    const now = new Date();
    const lead = await prisma.lead.create({
      data: {
        dealershipId: dealership.id,
        name,
        contact,
        source: "website",
        status: "new",
        unread: true,
        afterHours: isAfterHours(now),
        vehicleId: vehicle?.id ?? null,
        createdAt: now,
      },
    });

    await prisma.message.create({
      data: {
        leadId: lead.id,
        sender: "customer",
        channel: isEmail ? "email" : "sms",
        body:
          message ||
          (vehicle
            ? `I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}. Is it still available?`
            : "I'm interested in a vehicle on your lot."),
        createdAt: now,
      },
    });

    // TCPA: record consent at the moment it's given, tied to this phone number.
    if (input.smsConsent && looksLikePhone(contact)) {
      const existing = await prisma.customer.findFirst({
        where: { dealershipId: dealership.id, phone: contact },
      });
      if (existing) {
        await prisma.customer.update({
          where: { id: existing.id },
          data: { smsConsent: true, smsOptOutAt: null },
        });
      } else {
        await prisma.customer.create({
          data: {
            dealershipId: dealership.id,
            name,
            town: "",
            phone: contact,
            email: isEmail ? contact : "",
            smsConsent: true,
          },
        });
      }
    }

    return { ok: true, message: "Thanks! We'll be in touch shortly." };
  } catch (error) {
    captureError(error, { source: "submitPublicLead" });
    return { ok: false, message: "Something went wrong. Please call us instead." };
  }
}
