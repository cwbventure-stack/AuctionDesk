import { CopyField } from "@/components/copy-field";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { feedStatusFor } from "@/lib/feed-status";
import { facebookPaceFor } from "@/lib/marketplace";
import { DAILY_POST_LIMIT } from "@/lib/marketplace-rules";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Code,
  Globe,
  MessagesSquare,
  Newspaper,
  ShoppingBag,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

/** Numbered step, so the Commerce Manager walkthrough reads as a checklist. */
function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
        {n}
      </span>
      <span className="text-xs leading-relaxed text-slate-600">{children}</span>
    </li>
  );
}

export default async function ChannelsPage() {
  const user = await requireUser();

  // Meta fetches the feed itself, so the URL we show has to be the public
  // absolute one, not a relative path.
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const origin = process.env.APP_URL?.replace(/\/+$/, "") ?? `${proto}://${host}`;

  const [feed, pace] = await Promise.all([
    feedStatusFor(user.dealershipId, origin),
    facebookPaceFor(user.dealershipId),
  ]);

  const feedUrl = `${origin}/api/feed/${user.dealershipSlug}/vehicles.csv`;
  const lotUrl = `${origin}/lot/${user.dealershipSlug}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/app/settings"
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Settings
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Where your cars go</h1>
        <p className="text-sm text-slate-500">
          Four places your inventory can show up. Two are automatic once set up; two need you to
          paste and submit, because those sites don&apos;t allow anything else.
        </p>
      </div>

      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-blue-600" /> Your inventory site
            <Badge variant="green">Automatic</Badge>
          </CardTitle>
          <p className="text-xs text-slate-500">
            Live now. Every vehicle you publish appears here instantly, and marking one sold pulls
            it down. Nothing to set up.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <CopyField value={lotUrl} label="Site address" />
          <p className="text-[11px] text-slate-500">
            Put this link in your Facebook page bio, your Google Business profile, and your text
            signature — it&apos;s the one channel nobody can take away from you.
          </p>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <Code className="h-4 w-4 text-slate-600" /> Already have a website?
            <Badge variant="green">Automatic</Badge>
          </CardTitle>
          <p className="text-xs text-slate-500">
            Show this same inventory on your existing site. Paste these two lines where you want the
            cars to appear — it updates itself, so you never touch your website again when
            inventory changes.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <CopyField
            multiline
            label="Embed code"
            value={`<div id="auctiondesk-inventory"></div>\n<script src="${origin}/embed/${user.dealershipSlug}/widget.js" async></script>`}
          />
          <p className="text-[11px] text-slate-500">
            Works on Wix, Squarespace, WordPress, GoDaddy — anywhere you can add an HTML or embed
            block. If your site builder has a &ldquo;custom code&rdquo; or &ldquo;embed&rdquo;
            element, that&apos;s the one.
          </p>
          <details className="text-[11px] text-slate-500">
            <summary className="cursor-pointer font-medium text-slate-600">
              Building it yourself? Raw inventory data
            </summary>
            <div className="mt-2">
              <CopyField
                label="JSON feed"
                value={`${origin}/api/feed/${user.dealershipSlug}/inventory.json`}
              />
            </div>
          </details>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <ShoppingBag className="h-4 w-4 text-violet-600" /> Facebook vehicle catalog
            <Badge variant="violet">Automatic · needs setup</Badge>
          </CardTitle>
          <p className="text-xs text-slate-500">
            A one-time connection. After this, Facebook checks your inventory on its own — new
            cars appear, price changes follow, sold cars drop off. Powers Marketplace-style ads on
            Facebook and Instagram, so it needs an ad budget to run.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-700">Your feed address</p>
            <CopyField value={feedUrl} label="Feed URL" />
          </div>

          {feed.included > 0 ? (
            <p className="flex items-start gap-1.5 text-xs text-emerald-700">
              <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" />
              {feed.included} vehicle{feed.included === 1 ? "" : "s"} ready to send.
            </p>
          ) : (
            <p className="flex items-start gap-1.5 text-xs text-amber-700">
              <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
              No vehicles are ready yet — see below.
            </p>
          )}

          {feed.reasons.length > 0 && (
            <div className="rounded-lg bg-amber-50 p-2.5">
              <p className="text-xs font-medium text-amber-900">
                {feed.excluded.length} vehicle{feed.excluded.length === 1 ? "" : "s"} held back
              </p>
              <ul className="mt-1 space-y-0.5">
                {feed.reasons.map((r) => (
                  <li key={r.reason} className="text-[11px] text-amber-800">
                    {r.count} missing {r.reason}
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[11px] text-amber-700">
                Facebook rejects incomplete listings and counts it against your account, so we hold
                them back instead of sending them. Fill these in on the vehicle&apos;s Details tab.
              </p>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-medium text-slate-700">One-time setup (about 10 minutes)</p>
            <ol className="space-y-2">
              <Step n={1}>
                Go to{" "}
                <a
                  href="https://business.facebook.com/commerce"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-700 underline"
                >
                  Commerce Manager
                </a>{" "}
                and sign in with the Facebook account that manages your dealership page.
              </Step>
              <Step n={2}>
                Click <strong>Add catalog</strong>. Choose <strong>Vehicles</strong> as the catalog
                type, then <strong>Upload product info</strong> (not a partner platform).
              </Step>
              <Step n={3}>
                Name it after your lot and create it. Open the catalog, then go to{" "}
                <strong>Data sources → Add items → Use a scheduled feed</strong>.
              </Step>
              <Step n={4}>
                Paste the feed address from above as the URL. Leave username and password blank —
                it&apos;s a public link.
              </Step>
              <Step n={5}>
                Set the schedule to <strong>daily</strong> (hourly if you turn cars fast), then
                click <strong>Start upload</strong>.
              </Step>
              <Step n={6}>
                Wait a few minutes and check <strong>Data sources</strong> for errors. Anything
                flagged there tells you which field to fix here.
              </Step>
              <Step n={7}>
                To actually run ads: in <strong>Ads Manager</strong>, create a campaign with the{" "}
                <strong>Sales</strong> objective and pick this catalog. Meta builds the ads from
                your inventory.
              </Step>
            </ol>
          </div>

          <p className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-500">
            <strong>Worth knowing:</strong> this puts your cars into Facebook&apos;s paid ad system,
            not the free Marketplace listings. Free Marketplace listings require being an approved
            Facebook inventory partner, which is a closed list of large vendors. For free reach, use
            the assisted posting below.
          </p>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <MessagesSquare className="h-4 w-4 text-sky-600" /> Facebook Marketplace
            <Badge variant="amber">You post · we prep</Badge>
          </CardTitle>
          <p className="text-xs text-slate-500">
            Free and where the buyers are. Facebook has no way to post here automatically, so
            AuctionDesk writes the listing, checks it against Facebook&apos;s rules, and opens the
            form with everything on your clipboard.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-slate-200 p-2.5">
            <p className="text-xs font-medium text-slate-700">Today&apos;s posting</p>
            <p className="mt-0.5 text-xs text-slate-600">
              {pace.postedToday} of {DAILY_POST_LIMIT} used
              {pace.reason ? ` — ${pace.reason}` : " — clear to post."}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-slate-700">Rules we enforce for you</p>
            <ul className="space-y-1 text-[11px] leading-relaxed text-slate-600">
              <li>
                <strong>Post from your personal account, not your business page.</strong> Facebook
                removed vehicle listings from business pages in 2023 — posting from a page gets them
                taken down.
              </li>
              <li>
                <strong>Ten a day, spaced a few minutes apart.</strong> Faster than that trips the
                spam filter. AuctionDesk counts for you and holds the button when you&apos;re at the
                limit.
              </li>
              <li>
                <strong>No finance talk in the listing.</strong> &ldquo;Financing available&rdquo;
                and &ldquo;no credit check&rdquo; get listings pulled. Bring it up in the message
                thread instead — we block copy containing them.
              </li>
              <li>
                <strong>Your own photos only.</strong> Stock or watermarked images get listings
                removed.
              </li>
              <li>
                <strong>Take sold cars down within 24 hours.</strong> Your dashboard warns you when
                one is overdue.
              </li>
            </ul>
          </div>

          <p className="rounded-lg bg-red-50 p-2 text-[11px] text-red-800">
            A first spam violation is a 30-day Marketplace ban, and a second within 90 days is
            permanent — on your personal account. That&apos;s why AuctionDesk blocks a risky post
            instead of just warning you.
          </p>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <Newspaper className="h-4 w-4 text-emerald-600" /> Craigslist
            <Badge variant="amber">You post · we prep</Badge>
          </CardTitle>
          <p className="text-xs text-slate-500">
            Craigslist has no posting API for anyone, at any size. Same assisted flow: we write it,
            you paste and submit.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-[11px] leading-relaxed text-slate-600">
            <li>
              Dealer vehicle posts are <strong>paid</strong> — typically $5–15 each depending on
              your market.
            </li>
            <li>
              Posting more than about 10 a month? Contact Craigslist directly about bulk rates; they
              exist but aren&apos;t advertised.
            </li>
            <li>
              Replies come back by email. Point that inbox at AuctionDesk and they land in your Lead
              Inbox automatically.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
