// Inbound email → leads.
//
// Craigslist has no API: replies to a posting arrive as relayed EMAIL. Point an
// inbound-parse webhook (Postmark, SendGrid, Mailgun) at:
//
//   https://your-domain/api/email/inbound?dealership=<slug>
//
// Optionally set INBOUND_EMAIL_TOKEN and append &token=... so only your mail
// provider can post here.
//
// The payload shape differs per provider, so we read the handful of fields they
// all expose under their various names.
import { prisma } from "@/lib/prisma";
import { captureError } from "@/lib/observability";
import { isAfterHours } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

interface ParsedEmail {
  from: string;
  fromName: string;
  subject: string;
  body: string;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Pulls the address out of `Jane Smith <jane@example.com>`. */
function extractAddress(value: string): string {
  const angle = value.match(/<([^>]+)>/);
  const raw = (angle ? angle[1] : value).trim();
  return raw.toLowerCase();
}

function extractName(value: string, fallbackAddress: string): string {
  const angle = value.match(/^\s*"?([^"<]+?)"?\s*</);
  if (angle?.[1]?.trim()) return angle[1].trim();
  return fallbackAddress.split("@")[0] || "Craigslist lead";
}

// Normalizes Postmark / SendGrid / Mailgun payloads into one shape.
function parsePayload(payload: Record<string, unknown>): ParsedEmail | null {
  const fromRaw =
    str(payload.From) || str(payload.from) || str(payload.sender) || str(payload["from_email"]);
  if (!fromRaw) return null;

  const body =
    str(payload.TextBody) ||
    str(payload.text) ||
    str(payload["body-plain"]) ||
    str(payload.plain) ||
    str(payload.StrippedTextReply) ||
    "";

  const address = extractAddress(fromRaw);
  return {
    from: address,
    fromName:
      str(payload.FromName) || str(payload["from_name"]) || extractName(fromRaw, address),
    subject: str(payload.Subject) || str(payload.subject) || "",
    body: body.trim(),
  };
}

/**
 * Craigslist subjects look like:
 *   "Re: 2019 Honda CR-V EX AWD - $21,995 (Appleton)"
 * Match the year + make/model words back to a listed vehicle.
 */
async function matchVehicle(dealershipId: string, subject: string, body: string) {
  const haystack = `${subject} ${body}`;
  const year = haystack.match(/\b(19[89]\d|20[0-4]\d)\b/)?.[0];

  const candidates = await prisma.vehicle.findMany({
    where: {
      dealershipId,
      status: { in: ["available", "pending"] },
      ...(year ? { year: Number(year) } : {}),
    },
    select: { id: true, year: true, make: true, model: true },
  });

  const lower = haystack.toLowerCase();
  return (
    candidates.find(
      (v) => lower.includes(v.make.toLowerCase()) && lower.includes(v.model.toLowerCase()),
    ) ?? null
  );
}

export async function POST(req: NextRequest) {
  try {
    const expected = process.env.INBOUND_EMAIL_TOKEN;
    if (expected && req.nextUrl.searchParams.get("token") !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Providers post JSON or form-encoded depending on configuration.
    const contentType = req.headers.get("content-type") ?? "";
    let payload: Record<string, unknown>;
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      payload = Object.fromEntries(await req.formData()) as Record<string, unknown>;
    }

    const email = parsePayload(payload);
    if (!email) return NextResponse.json({ error: "Unparseable email" }, { status: 400 });

    const slug = req.nextUrl.searchParams.get("dealership");
    const dealership = slug
      ? await prisma.dealership.findUnique({ where: { slug } })
      : await prisma.dealership.findFirst({ orderBy: { createdAt: "asc" } });
    if (!dealership) return NextResponse.json({ error: "Unknown dealership" }, { status: 404 });

    const now = new Date();
    const vehicle = await matchVehicle(dealership.id, email.subject, email.body);

    // Keep a thread going if this person already wrote in.
    const existing = await prisma.lead.findFirst({
      where: { dealershipId: dealership.id, contact: email.from, status: { not: "closed" } },
      orderBy: { createdAt: "desc" },
    });

    const leadId = existing
      ? existing.id
      : (
          await prisma.lead.create({
            data: {
              dealershipId: dealership.id,
              name: email.fromName,
              contact: email.from,
              source: "craigslist",
              status: "new",
              unread: true,
              afterHours: isAfterHours(now),
              vehicleId: vehicle?.id ?? null,
              createdAt: now,
            },
          })
        ).id;

    if (existing) {
      await prisma.lead.update({
        where: { id: existing.id },
        data: { unread: true, status: "new" },
      });
    }

    await prisma.message.create({
      data: {
        leadId,
        sender: "customer",
        channel: "email",
        body: email.body || email.subject || "(no message body)",
        createdAt: now,
      },
    });

    return NextResponse.json({ ok: true, leadId, matchedVehicle: vehicle?.id ?? null });
  } catch (error) {
    captureError(error, { source: "api/email/inbound" });
    return NextResponse.json({ error: "Failed to process email" }, { status: 500 });
  }
}
