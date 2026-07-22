// SMS via Twilio, with a console fallback.
//
// Configured  (TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER):
//   messages are really sent through Twilio's REST API.
// Unconfigured:
//   messages are logged and reported as "simulated" — the app works end to end
//   for demos and local development without a Twilio account.
//
// We call the REST API with fetch instead of pulling in the Twilio SDK; it's a
// single form-encoded POST and keeps the dependency surface small.
import "server-only";
import { captureError } from "@/lib/observability";

export interface SendResult {
  ok: boolean;
  simulated: boolean;
  /** Twilio message SID when really sent. */
  id?: string;
  error?: string;
}

export function smsConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  );
}

/** Digits-only check — good enough to catch an email address in a phone field. */
export function looksLikePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Last 10 digits, ignoring formatting and country code. Dealers type numbers as
 * "(920) 555-0100" while Twilio sends "+19205550100" — comparing the raw
 * strings never matches, so always compare through this.
 */
export function phoneKey(value: string): string {
  return value.replace(/\D/g, "").slice(-10);
}

export function samePhone(a: string, b: string): boolean {
  const ka = phoneKey(a);
  return ka.length === 10 && ka === phoneKey(b);
}

/** Formats a US number as E.164, which is what Twilio expects. */
export function toE164(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (value.trim().startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

export async function sendSms(to: string, body: string): Promise<SendResult> {
  if (!looksLikePhone(to)) {
    return { ok: false, simulated: false, error: "Not a valid phone number" };
  }

  if (!smsConfigured()) {
    console.info(`[sms:simulated] → ${toE164(to)}: ${body}`);
    return { ok: true, simulated: true };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM_NUMBER!;

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: toE164(to), From: from, Body: body }),
    });

    if (!res.ok) {
      const detail = await res.text();
      captureError(new Error(`Twilio ${res.status}: ${detail}`), { source: "sms" });
      return { ok: false, simulated: false, error: `Twilio rejected the message (${res.status})` };
    }

    const json = (await res.json()) as { sid?: string };
    return { ok: true, simulated: false, id: json.sid };
  } catch (error) {
    captureError(error, { source: "sms" });
    return { ok: false, simulated: false, error: "Could not reach the SMS provider" };
  }
}

// --- TCPA -------------------------------------------------------------------
//
// Texting consumers is regulated. Replying to someone who just messaged you is
// fine, but proactive marketing (our follow-up sequences) requires prior
// consent and a working opt-out. These helpers keep that rule in one place.

const STOP_WORDS = new Set(["stop", "stopall", "unsubscribe", "cancel", "end", "quit"]);

export function isOptOut(body: string): boolean {
  return STOP_WORDS.has(body.trim().toLowerCase());
}

export const OPT_OUT_FOOTER = " Reply STOP to opt out.";

/** Appends the opt-out notice required on marketing messages. */
export function withOptOut(body: string): string {
  return body.trimEnd().toLowerCase().includes("reply stop")
    ? body
    : `${body.trimEnd()}${OPT_OUT_FOOTER}`;
}
