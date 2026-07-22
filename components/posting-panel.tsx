"use client";

import {
  markChannelPosted,
  markChannelRemoved,
  publishToWebsite,
  removeFromWebsite,
  type Channel,
} from "@/app/posting-actions";
import { Button } from "@/components/ui";
import { cn, fullDate } from "@/lib/utils";
import {
  Check,
  CheckCircle2,
  Circle,
  ExternalLink,
  Globe,
  Loader2,
  MessagesSquare,
  Newspaper,
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
}: {
  vehicleId: string;
  websiteAt: string | null;
  facebookAt: string | null;
  craigslistAt: string | null;
  facebookCopy: string;
  craigslistCopy: string;
  publicUrl: string;
  sold: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

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
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={sold && !live}
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
                {live ? (
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
                ) : (
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
