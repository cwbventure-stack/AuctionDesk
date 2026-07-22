import { Button } from "@/components/ui";
import {
  AlarmClock,
  ArrowRight,
  Car,
  CheckCircle2,
  Megaphone,
  MessageSquareText,
  Moon,
  RefreshCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Megaphone,
    title: "Post a car once. It goes everywhere.",
    quote: "I spend my Sunday nights posting cars.",
    body: "Enter the VIN, mileage, and price — AuctionDesk writes the sales description, the Facebook Marketplace post, and the Craigslist ad, then pushes them to every channel with one click. What took 45 minutes per vehicle takes 45 seconds.",
    bullets: [
      "AI-written listings from your actual vehicle data",
      "Website + Facebook + Craigslist in one click",
      "Photo shot list so every car looks its best",
    ],
    mock: (
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-700">2018 Subaru Outback 2.5i Premium</p>
        {["Website", "Facebook Marketplace", "Craigslist"].map((ch, i) => (
          <div key={ch} className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {ch}
            <span className="ml-auto text-[10px] text-emerald-600">Live · 9:0{i + 1} AM</span>
          </div>
        ))}
        <p className="border-t border-slate-100 pt-2 text-[10px] text-slate-400">≈ 40 minutes saved</p>
      </div>
    ),
  },
  {
    icon: AlarmClock,
    title: "Every lead answered in 2 minutes. Even at 9 PM.",
    quote: "Leads that message after 6 PM go cold by morning.",
    body: "Buyers shop at night. AuctionDesk answers instantly with real details from your inventory, offers test-drive times, and books the appointment — then hands you a summary in the morning. You wake up to booked test drives, not cold leads.",
    bullets: [
      "Answers with your real vehicle specs and price",
      "Offers concrete test-drive slots and books them",
      "Hands off every conversation with a summary",
    ],
    mock: (
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-violet-700">
          <Moon className="h-3 w-3" /> 9:12 PM — after hours
        </div>
        <div className="rounded-lg rounded-tl-sm bg-slate-100 px-3 py-2 text-xs text-slate-700">
          Is the 2019 CR-V still available?
        </div>
        <div className="ml-6 rounded-lg rounded-tr-sm bg-violet-600 px-3 py-2 text-xs text-white">
          Yes! 54k miles, $21,995. Want a test drive tomorrow at 10 AM or 4:30 PM?
        </div>
        <div className="flex items-center gap-1 text-[10px] text-violet-700">
          <Zap className="h-3 w-3" /> Answered by AuctionDesk in 2 minutes · test drive booked
        </div>
      </div>
    ),
  },
  {
    icon: RefreshCcw,
    title: "Past buyers come back — automatically.",
    quote: "I lose track of who called about what.",
    body: "Thank-you texts with review links, six-month check-ins, and 'your trade-in is worth more than you think' messages go out on schedule, personalized with each customer's name and vehicle. Repeat business stops being luck.",
    bullets: [
      "Review requests that actually get sent",
      "Revenue Radar flags buyers ready to upgrade",
      "Every message personalized, every send logged",
    ],
    mock: (
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700">Kevin Schroeder</span>
          <span className="font-bold text-emerald-700">≈ $7,700 equity</span>
        </div>
        <p className="text-[10px] text-slate-400">2019 Ford Escape · bought 25 months ago</p>
        <div className="rounded-lg bg-slate-50 p-2 text-[11px] leading-relaxed text-slate-600">
          “Hi Kevin, used values are strong right now — your Escape could be worth more in trade than
          you&apos;d expect…”
        </div>
        <div className="flex items-center gap-1 text-[10px] text-blue-700">
          <MessageSquareText className="h-3 w-3" /> Queued for 10:00 AM
        </div>
      </div>
    ),
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
            <Car className="h-4.5 w-4.5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Auction<span className="text-blue-700">Desk</span>
          </span>
        </span>
        <Link href="/app">
          <Button variant="secondary" size="sm">
            Open the app <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 pt-14 pb-16 text-center sm:pt-20">
        <p className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
          <Sparkles className="h-3.5 w-3.5" /> Built for independent lots with 5–50 cars
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Stop spending Sunday nights
          <br className="hidden sm:block" /> posting cars.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          AuctionDesk lists every vehicle everywhere in one click, answers your leads at 9 PM while
          you&apos;re at dinner, and brings past buyers back — so a small lot runs like it has a
          full-time internet department.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/app">
            <Button size="lg">
              See the live demo <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="mailto:cwbventure@gmail.com?subject=AuctionDesk%20walkthrough">
            <Button variant="secondary" size="lg">
              Book a 15-minute walkthrough
            </Button>
          </a>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          No contracts. No enterprise DMS required. Made for Wisconsin dealers.
        </p>
      </section>

      {/* Features */}
      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl space-y-16 px-5 py-16">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`flex flex-col items-center gap-8 lg:flex-row ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            >
              <div className="flex-1">
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
                  <f.icon className="h-5 w-5" />
                </span>
                <p className="mb-1 text-sm font-medium text-blue-700">
                  “{f.quote}” — every owner we talked to
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{f.title}</h2>
                <p className="mt-3 text-slate-600">{f.body}</p>
                <ul className="mt-4 space-y-2">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full max-w-sm flex-1">{f.mock}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Your evenings back. Your leads answered. Your buyers returning.
        </h2>
        <p className="mt-3 text-slate-600">
          15 minutes is all it takes to see AuctionDesk running on your own inventory.
        </p>
        <div className="mt-6">
          <a href="mailto:cwbventure@gmail.com?subject=AuctionDesk%20walkthrough">
            <Button size="lg">
              Book a 15-minute walkthrough <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        AuctionDesk · auctiondesk.net · Automation for independent dealerships · Appleton–Oshkosh, WI
      </footer>
    </div>
  );
}
