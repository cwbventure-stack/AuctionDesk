import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// www is canonical — the apex auctiondesk.net 308-redirects to it.
const SITE_URL = "https://www.auctiondesk.net";

// One description, reused for the meta tag and the social cards, so search and
// share previews say the same accurate thing. Google may still synthesize its
// own snippet from page content, but this is the authoritative fallback and
// what most crawlers show verbatim.
const DESCRIPTION =
  "AuctionDesk lists your used-car inventory to your website, Facebook, and Craigslist in one click, answers every lead in minutes with AI — even after hours — and automates follow-ups that bring past buyers back. Built for independent dealers.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AuctionDesk — List, Answer & Follow Up for Independent Dealers",
    template: "%s · AuctionDesk",
  },
  description: DESCRIPTION,
  applicationName: "AuctionDesk",
  keywords: [
    "used car dealer software",
    "independent dealership tools",
    "vehicle listing automation",
    "Facebook Marketplace for dealers",
    "car dealer lead response",
    "auto dealer CRM",
    "inventory syndication",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "AuctionDesk",
    url: SITE_URL,
    title: "AuctionDesk — Automation for Independent Dealers",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "AuctionDesk — Automation for Independent Dealers",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
