"use server";

import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { looksLikePhone, sendSms, withOptOut } from "@/lib/sms";
import { revalidatePath } from "next/cache";

export interface SendOutcome {
  ok: boolean;
  /** True when SMS isn't configured yet and the message was only recorded. */
  simulated: boolean;
  message: string;
}

/**
 * Replies to a lead. If their contact is a phone number, this really sends an
 * SMS (or simulates one when Twilio isn't configured). Email-only leads are
 * recorded for now — Craigslist replies go back out through email ingestion.
 */
export async function sendReply(leadId: string, body: string): Promise<SendOutcome> {
  const dealershipId = await requireDealershipId();
  const text = body.trim();
  if (!text) throw new Error("Reply can't be empty");

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, dealershipId },
    select: { id: true, contact: true },
  });
  if (!lead) throw new Error("Lead not found");

  let channel = "manual";
  let simulated = false;
  let message = "Reply recorded.";

  if (looksLikePhone(lead.contact)) {
    const result = await sendSms(lead.contact, text);
    if (!result.ok) {
      throw new Error(result.error ?? "Could not send the text");
    }
    channel = "sms";
    simulated = result.simulated;
    message = result.simulated
      ? "Reply recorded (SMS not configured yet — nothing was actually sent)."
      : "Text sent.";
  }

  await prisma.message.create({
    data: { leadId, sender: "owner", body: text, channel, createdAt: new Date() },
  });
  await prisma.lead.updateMany({
    where: { id: leadId, dealershipId },
    data: { status: "replied", unread: false },
  });

  revalidatePath(`/app/leads/${leadId}`);
  revalidatePath("/app/leads");
  return { ok: true, simulated, message };
}

/**
 * Sends a follow-up to a past customer. This is marketing under TCPA, so it
 * requires prior SMS consent and always carries an opt-out notice.
 */
export async function sendOutreach(
  customerId: string,
  type: string,
  body?: string,
): Promise<SendOutcome> {
  const dealershipId = await requireDealershipId();
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, dealershipId },
  });
  if (!customer) throw new Error("Customer not found");

  const now = new Date();
  let simulated = false;
  let message = "Follow-up recorded.";
  let status = "sent";

  if (body?.trim()) {
    if (customer.smsOptOutAt) {
      throw new Error(`${customer.name} opted out of texts — reach out another way.`);
    }
    if (!customer.smsConsent) {
      throw new Error(
        `${customer.name} hasn't opted in to texts yet. Get consent before sending marketing messages.`,
      );
    }
    const result = await sendSms(customer.phone, withOptOut(body.trim()));
    if (!result.ok) {
      status = "failed";
      throw new Error(result.error ?? "Could not send the text");
    }
    simulated = result.simulated;
    message = result.simulated
      ? "Follow-up recorded (SMS not configured yet — nothing was actually sent)."
      : "Text sent.";
  }

  await prisma.followUp.create({
    data: { customerId, type, status, scheduledFor: now, sentAt: now },
  });
  await prisma.customer.update({
    where: { id: customerId },
    data: { lastContactAt: now },
  });

  revalidatePath("/app/customers");
  revalidatePath("/app");
  return { ok: true, simulated, message };
}

/** Records that a customer agreed to receive texts (TCPA consent). */
export async function setSmsConsent(customerId: string, consent: boolean): Promise<void> {
  const dealershipId = await requireDealershipId();
  const { count } = await prisma.customer.updateMany({
    where: { id: customerId, dealershipId },
    data: {
      smsConsent: consent,
      smsOptOutAt: consent ? null : new Date(),
    },
  });
  if (count === 0) throw new Error("Customer not found");
  revalidatePath("/app/customers");
}
