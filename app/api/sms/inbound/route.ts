// Inbound SMS webhook (Twilio posts form-encoded data here).
//
// Point your Twilio number's "A message comes in" webhook at:
//   https://your-domain/api/sms/inbound?dealership=<slug>
//
// The dealership is identified by the slug query param, so one deployment can
// serve many dealerships each with their own Twilio number.
import { prisma } from "@/lib/prisma";
import { captureError } from "@/lib/observability";
import { isOptOut, samePhone } from "@/lib/sms";
import { NextRequest, NextResponse } from "next/server";

// Twilio expects TwiML (XML). An empty <Response/> means "no auto-reply".
function twiml(body = "") {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("dealership");
    const form = await req.formData();
    const from = String(form.get("From") ?? "").trim();
    const body = String(form.get("Body") ?? "").trim();

    if (!from || !body) return twiml();

    const dealership = slug
      ? await prisma.dealership.findUnique({ where: { slug } })
      : await prisma.dealership.findFirst({ orderBy: { createdAt: "asc" } });
    if (!dealership) return twiml();

    // Honor STOP immediately — this is a legal requirement, not a nicety.
    // Phone formats differ between what the dealer typed and what Twilio sends,
    // so match on the last 10 digits rather than the raw string.
    if (isOptOut(body)) {
      const customers = await prisma.customer.findMany({
        where: { dealershipId: dealership.id },
        select: { id: true, phone: true },
      });
      const matches = customers.filter((c) => samePhone(c.phone, from)).map((c) => c.id);
      if (matches.length > 0) {
        await prisma.customer.updateMany({
          where: { id: { in: matches } },
          data: { smsConsent: false, smsOptOutAt: new Date() },
        });
      }
      return twiml("<Message>You're unsubscribed and won't get more texts from us.</Message>");
    }

    // Continue an existing open conversation from this number, or start one.
    const existing = await prisma.lead.findFirst({
      where: {
        dealershipId: dealership.id,
        contact: from,
        status: { not: "closed" },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      await prisma.message.create({
        data: {
          leadId: existing.id,
          sender: "customer",
          body,
          channel: "sms",
          createdAt: new Date(),
        },
      });
      await prisma.lead.update({
        where: { id: existing.id },
        data: { unread: true, status: "new" },
      });
    } else {
      const hour = new Date().getHours();
      const lead = await prisma.lead.create({
        data: {
          dealershipId: dealership.id,
          name: `Text from ${from}`,
          contact: from,
          source: "phone",
          status: "new",
          unread: true,
          afterHours: hour < 8 || hour >= 18,
          createdAt: new Date(),
        },
      });
      await prisma.message.create({
        data: { leadId: lead.id, sender: "customer", body, channel: "sms", createdAt: new Date() },
      });
    }

    return twiml();
  } catch (error) {
    captureError(error, { source: "api/sms/inbound" });
    // Always 200 to Twilio — retries on a persistent bug just duplicate leads.
    return twiml();
  }
}
