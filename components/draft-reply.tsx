"use client";

import { sendReply } from "@/app/messaging-actions";
import { Button, Textarea } from "@/components/ui";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function DraftReplyPanel({ leadId }: { leadId: string }) {
  const [draft, setDraft] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);

  async function generate() {
    setDrafting(true);
    try {
      const res = await fetch("/api/ai/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      if (!res.ok) throw new Error();
      const { draft } = await res.json();
      setDraft(draft);
    } catch {
      toast.error("Couldn't draft a reply — try again");
    } finally {
      setDrafting(false);
    }
  }

  async function send() {
    if (!draft.trim()) return;
    setSending(true);
    try {
      const result = await sendReply(leadId, draft.trim());
      setDraft("");
      toast.success(result.simulated ? "Reply recorded" : "Reply sent", {
        description: result.message,
      });
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Couldn't send the reply");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">Your reply</p>
        <Button variant="secondary" size="sm" onClick={generate} disabled={drafting}>
          {drafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-violet-600" />}
          {drafting ? "Drafting…" : "AI Draft Reply"}
        </Button>
      </div>
      <Textarea
        rows={5}
        placeholder="Type a reply, or let AuctionDesk draft one from the vehicle's actual specs…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-slate-400">Edit anything before it goes out — you&apos;re always in control.</p>
        <Button onClick={send} disabled={sending || !draft.trim()} size="sm">
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send
        </Button>
      </div>
    </div>
  );
}
