"use client";

import {
  markChannelPosted,
  markChannelRemoved,
  publishToWebsite,
  removeFromWebsite,
  type Channel,
} from "@/app/posting-actions";
import { MarketplacePostHelper } from "@/components/marketplace-post-helper";
import { Button } from "@/components/ui";
import type { MarketplaceField } from "@/lib/marketplace-fields";
import type { ComplianceIssue, PaceStatus } from "@/lib/marketplace-rules";
import { cn, fullDate } from "@/lib/utils";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Globe,
  Loader2,
  MessagesSquare,
  Newspaper,
  ShieldAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Where each assisted channel's "create a listing" page lives. We open these in
// a new tab with the copy already on the clipboard — the dealer pastes and
// submits. We never automate the submit itself.
const POST_URLS: Record<"facebook" | "craigslist", string> = {
  facebook: "https://www.facebook.com/marketplace/create/vehicle",
  craigslist: "https://post.craigslist.org/",
};

interface ChannelState {
  key: Channel;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  listedAt: string | null;
}

export function PostingPanel({
  vehicleId,
  websiteAt,
  facebookAt,
  craigslistAt,
  facebookCopy,
  craigslistCopy,
  publicUrl,
  sold,
  facebookIssues,
  pace,
  facebookFields,
  craigslistFields,
  photoCount,
}: {
  vehicleId: string;
  websiteAt: string | null;
  facebookAt: string | null;
  craigslistAt: string | null;
  facebookCopy: string;
  craigslistCopy: string;
  publicUrl: string;
  sold: boolean;
  /** Marketplace policy problems with this vehicle's copy. */
  facebookIssues: ComplianceIssue[];
  /** Whether posting another vehicle right now is safe for the dealer's account. */
  pace: PaceStatus;
  /** Facebook's form fields, in its on-screen order, ready to copy across. */
  facebookFields: MarketplaceField[];
  /** Craigslist's form fields, likewise. */
  craigslistFields: MarketplaceField[];
  /** How many photos the vehicle has — drives the "download all" bundle. */
  photoCount: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  // A "block" issue is one that risks the account, not just reach — so it stops
  // the post rather than merely warning.
  const hasBlocker = facebookIssues.some((i) => i.severity === "block");
  const canPostFacebook = pace.canPostNow && !hasBlocker;

  const channels: ChannelState[] = [
    { key: "website", label: "Your website", icon: Globe, listedAt: websiteAt },
    { key: "facebook", label: "Facebook Marketplace", icon: MessagesSquare, listedAt: facebookAt },
    { key: "craigslist", label: "Craigslist", icon: Newspaper, listedAt: craigslistAt },
  ];

  async function run(key: string, fn: () => Promise<unknown>, success: string) {
    setBusy(key);
    try {
      await fn();
      toast.success(success);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  // Copy the listing text, then open the posting page in a new tab.
  async function copyAndOpen(channel: "facebook" | "craigslist", copy: string) {
    try {
      await navigator.clipboard.writeText(copy);
      toast.success("Listing copied", {
        description: "Paste it into the form that just opened, then confirm below.",
      });
    } catch {
      toast.message("Couldn't copy automatically — copy the text from the tab above.");
    }
    window.open(POST_URLS[channel], "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      {channels.map((c) => {
        const live = !!c.listedAt;
        const isBusy = busy === c.key;
        return (
          <div key={c.key} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              {live ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-slate-300" />
              )}
              <c.icon className="h-4 w-4 shrink-0 text-slate-400" />
              <span
                className={cn("flex-1 text-sm font-medium", live ? "text-slate-800" : "text-slate-500")}
              >
                {c.label}
              </span>
              {live && c.listedAt && (
                <span className="text-[11px] text-slate-400">{fullDate(c.listedAt)}</span>
              )}
            </div>

            {/* Website is fully automatic — it's our own site. */}
            {c.key === "website" ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {live ? (
                  <>
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" /> View live
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isBusy}
                      onClick={() =>
                        run(c.key, () => removeFromWebsite(vehicleId), "Removed from your website")
                      }
                    >
                      {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Remove
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    disabled={isBusy || sold}
                    onClick={() =>
                      run(c.key, () => publishToWebsite(vehicleId), "Live on your website")
                    }
                  >
                    {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                    Publish to website
                  </Button>
                )}
              </div>
            ) : (
              /* Facebook + Craigslist are assisted: we prep, the dealer posts. */
              <div className="mt-2 space-y-2">
                {/* Marketplace posts go out from the owner's personal account, and
                    Meta bans it for 30 days on a first spam strike — so we show
                    what's wrong before they post, not after. */}
                {c.key === "facebook" && !live && (
                  <MarketplaceGuardrails issues={facebookIssues} pace={pace} />
                )}

                {live ? (
                  /* Already posted — a quick way to re-copy for edits, plus mark removed. */
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        copyAndOpen(
                          c.key as "facebook" | "craigslist",
                          c.key === "facebook" ? facebookCopy : craigslistCopy,
                        )
                      }
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Copy &amp; open {c.key === "facebook" ? "Marketplace" : "Craigslist"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isBusy}
                      onClick={() =>
                        run(
                          c.key,
                          () => markChannelRemoved(vehicleId, c.key),
                          `Marked removed from ${c.label}`,
                        )
                      }
                    >
                      {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Mark removed
                    </Button>
                  </div>
                ) : (
                  <>
                    <MarketplacePostHelper
                      channel={c.key as "facebook" | "craigslist"}
                      createUrl={POST_URLS[c.key as "facebook" | "craigslist"]}
                      fields={c.key === "facebook" ? facebookFields : craigslistFields}
                      description={c.key === "facebook" ? facebookCopy : craigslistCopy}
                      photoCount={photoCount}
                      photosZipUrl={`/api/vehicle/${vehicleId}/photos`}
                      disabled={sold || (c.key === "facebook" && !canPostFacebook)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isBusy}
                      onClick={() =>
                        run(
                          c.key,
                          () => markChannelPosted(vehicleId, c.key),
                          `Marked posted on ${c.label}`,
                        )
                      }
                    >
                      {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      I posted it
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      <p className="text-[11px] leading-relaxed text-slate-400">
        Your website updates instantly. Facebook and Craigslist don&apos;t allow automated
        posting — AuctionDesk writes the listing and opens the form so you just paste and
        submit, which keeps your accounts safe.
      </p>
    </div>
  );
}

/**
 * The pre-flight check for a Marketplace post: pace first (it stops you outright),
 * then anything wrong with the copy.
 */
function MarketplaceGuardrails({ issues, pace }: { issues: ComplianceIssue[]; pace: PaceStatus }) {
  const blockers = issues.filter((i) => i.severity === "block");
  const warnings = issues.filter((i) => i.severity === "warn");

  if (pace.canPostNow && issues.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Ready to post · {pace.remainingToday} of {pace.remainingToday + pace.postedToday} left today
      </p>
    );
  }

  return (
    <div className="space-y-1.5 rounded-lg bg-slate-50 p-2.5">
      {!pace.canPostNow && pace.reason && (
        <p className="flex items-start gap-1.5 text-[11px] font-medium text-amber-800">
          <Clock className="mt-px h-3.5 w-3.5 shrink-0" />
          {pace.reason}
        </p>
      )}

      {blockers.map((issue, i) => (
        <p key={`b${i}`} className="flex items-start gap-1.5 text-[11px] text-red-700">
          <ShieldAlert className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>{issue.message}</strong> {issue.fix}
          </span>
        </p>
      ))}

      {warnings.map((issue, i) => (
        <p key={`w${i}`} className="flex items-start gap-1.5 text-[11px] text-amber-700">
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>
            {issue.message} {issue.fix}
          </span>
        </p>
      ))}

      {blockers.length > 0 && (
        <p className="text-[10px] text-slate-500">
          Meta bans first-time spam violations for 30 days, and these posts come from your
          personal account — worth fixing before it goes out.
        </p>
      )}
    </div>
  );
}
