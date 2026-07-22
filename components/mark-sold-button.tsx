"use client";

import { markVehicleSold, reopenVehicle, type Channel } from "@/app/posting-actions";
import { Button } from "@/components/ui";
import { CircleDollarSign, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Where the dealer goes to take a listing down on each assisted channel.
const TAKEDOWN_URLS: Record<string, string> = {
  facebook: "https://www.facebook.com/marketplace/you/selling",
  craigslist: "https://accounts.craigslist.org/login",
};

const LABELS: Record<string, string> = {
  facebook: "Facebook Marketplace",
  craigslist: "Craigslist",
};

export function MarkSoldButton({ vehicleId, sold }: { vehicleId: string; sold: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingTakedowns, setPendingTakedowns] = useState<Channel[]>([]);

  async function markSold() {
    setConfirming(false);
    setBusy(true);
    try {
      const { manualTakedowns } = await markVehicleSold(vehicleId);
      setPendingTakedowns(manualTakedowns);
      toast.success("Marked sold", {
        description:
          manualTakedowns.length > 0
            ? "Off your website. The assisted listings still need removing."
            : "Removed from your website. Congrats on the sale!",
      });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function reopen() {
    setBusy(true);
    try {
      await reopenVehicle(vehicleId);
      toast.success("Back on the lot");
      router.refresh();
    } catch {
      toast.error("Couldn't reopen the vehicle");
    } finally {
      setBusy(false);
    }
  }

  if (sold) {
    return (
      <div className="space-y-3">
        {pendingTakedowns.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-900">
              Still live — take these down so you stop getting calls:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {pendingTakedowns.map((c) => (
                <a key={c} href={TAKEDOWN_URLS[c]} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    <ExternalLink className="h-3.5 w-3.5" /> {LABELS[c]}
                  </Button>
                </a>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-amber-800">
              Mark each one removed in the panel above once it&apos;s down.
            </p>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={reopen} disabled={busy}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Put back on the lot
        </Button>
      </div>
    );
  }

  return confirming ? (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-600">Mark this sold?</span>
      <Button size="sm" onClick={markSold}>
        Yes, it&apos;s sold
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  ) : (
    <Button
      variant="secondary"
      onClick={() => setConfirming(true)}
      disabled={busy}
      className="w-full sm:w-auto"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CircleDollarSign className="h-4 w-4 text-emerald-600" />
      )}
      Mark Sold
    </Button>
  );
}
