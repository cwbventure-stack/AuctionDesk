// Facebook Marketplace posting rules, encoded.
//
// Dealers can't list vehicles from a Business Page — Meta removed that in
// January 2023 — so assisted posts go out from the owner's *personal* account.
// That account is the thing at risk: since May 2026 a first spam violation is a
// 30-day ban and a second within 90 days is permanent, with appeals auto-denied.
//
// So these checks aren't nagging. A listing that trips Meta's spam filter can
// cost a dealer their Marketplace access entirely, which is worse than any
// listing being late. Everything here is a pure function so it can be checked
// before the copy is ever shown.

export type Severity = "block" | "warn";

export interface ComplianceIssue {
  severity: Severity;
  /** What's wrong, in the dealer's language — not policy jargon. */
  message: string;
  /** What to do about it. */
  fix: string;
}

/**
 * Finance come-ons are the classic dealer tell, and Meta's filters treat them as
 * business-selling signals on a personal listing. Craigslist doesn't care —
 * these apply to Facebook only.
 */
const BANNED_PHRASES = [
  "financing available",
  "financing avail",
  "no credit check",
  "bad credit ok",
  "bad credit okay",
  "guaranteed approval",
  "buy here pay here",
  "e-z credit",
  "ez credit",
  "we finance",
  "credit approval",
];

/** Prices used as click-bait; Meta flags them as fake listings. */
const BAIT_PRICES = [1, 100, 123, 500, 1234];

// Rough emoji match — the pictographic ranges people actually type.
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}]/gu;

const countEmoji = (text: string) => (text.match(EMOJI) ?? []).length;

const isShouting = (text: string) => {
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length < 8) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length > 0.7;
};

export interface ListingDraft {
  title: string;
  body: string;
  price: number;
  photoCount: number;
}

/**
 * Checks a Marketplace draft. "block" issues are the ones that actually risk the
 * account; "warn" issues hurt reach or credibility.
 */
export function checkFacebookListing(draft: ListingDraft): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const haystack = `${draft.title}\n${draft.body}`.toLowerCase();

  for (const phrase of BANNED_PHRASES) {
    if (haystack.includes(phrase)) {
      issues.push({
        severity: "block",
        message: `"${phrase}" reads as a dealer ad on a personal listing.`,
        fix: "Take it out. Talk financing in the message thread once they reach out.",
      });
      break; // One finance warning is enough; listing them all is noise.
    }
  }

  if (BAIT_PRICES.includes(draft.price)) {
    issues.push({
      severity: "block",
      message: `$${draft.price.toLocaleString()} looks like bait pricing to Meta's filters.`,
      fix: "Post the real asking price.",
    });
  }

  if (isShouting(draft.title)) {
    issues.push({
      severity: "block",
      message: "The title is mostly capitals.",
      fix: "Use normal sentence case — all-caps titles get filtered.",
    });
  }

  const emoji = countEmoji(draft.title) + countEmoji(draft.body);
  if (emoji > 6) {
    issues.push({
      severity: "warn",
      message: `${emoji} emoji in this listing.`,
      fix: "Keep it to a handful. Heavy emoji use is a spam signal.",
    });
  }

  if (draft.photoCount === 0) {
    issues.push({
      severity: "warn",
      message: "No photos on this vehicle yet.",
      fix: "Add your own photos before posting — stock or watermarked images get listings pulled.",
    });
  }

  return issues;
}

// --- Posting pace ----------------------------------------------------------

/** Meta's spam filter trips past this many listings from one account in a day. */
export const DAILY_POST_LIMIT = 10;
/** Minimum gap between posts, in minutes. */
export const MIN_SPACING_MINUTES = 5;

export interface PaceStatus {
  postedToday: number;
  remainingToday: number;
  /** Whether another post right now is safe. */
  canPostNow: boolean;
  /** Minutes to wait, when spacing is the reason to hold off. */
  waitMinutes: number;
  reason: string | null;
}

/**
 * Decides whether it's safe to post another vehicle right now. Meta's daily
 * limit resets at local midnight rather than on a rolling window, so `postedToday`
 * should be counted from the start of the dealer's day.
 */
export function checkPace(postedToday: number, lastPostAt: Date | null, now = new Date()): PaceStatus {
  const remainingToday = Math.max(0, DAILY_POST_LIMIT - postedToday);

  if (remainingToday === 0) {
    return {
      postedToday,
      remainingToday,
      canPostNow: false,
      waitMinutes: 0,
      reason: `You've posted ${postedToday} today. Meta's limit is ${DAILY_POST_LIMIT} — the rest can go out tomorrow.`,
    };
  }

  if (lastPostAt) {
    const elapsedMinutes = (now.getTime() - lastPostAt.getTime()) / 60_000;
    if (elapsedMinutes < MIN_SPACING_MINUTES) {
      const waitMinutes = Math.max(1, Math.ceil(MIN_SPACING_MINUTES - elapsedMinutes));
      return {
        postedToday,
        remainingToday,
        canPostNow: false,
        waitMinutes,
        reason: `Posting back-to-back looks automated. Give it ${waitMinutes} more minute${waitMinutes === 1 ? "" : "s"}.`,
      };
    }
  }

  return { postedToday, remainingToday, canPostNow: true, waitMinutes: 0, reason: null };
}

/** Meta expects sold vehicles delisted within a day. */
export const TAKEDOWN_DEADLINE_HOURS = 24;

export function takedownOverdueBy(soldAt: Date, now = new Date()): number {
  const hours = (now.getTime() - soldAt.getTime()) / 3_600_000;
  return Math.max(0, hours - TAKEDOWN_DEADLINE_HOURS);
}
