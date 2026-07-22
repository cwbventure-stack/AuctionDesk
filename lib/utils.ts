import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function daysOnLot(acquiredAt: Date) {
  return Math.floor((Date.now() - new Date(acquiredAt).getTime()) / 86_400_000);
}

export function dolColor(days: number) {
  if (days < 30) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (days <= 60) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

const BUSINESS_OPEN = 8; // 8 AM
const BUSINESS_CLOSE = 18; // 6 PM

export function isAfterHours(d: Date) {
  const h = new Date(d).getHours();
  return h < BUSINESS_OPEN || h >= BUSINESS_CLOSE;
}

export function timeAgo(d: Date | string) {
  const ms = Date.now() - new Date(d).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export function clockTime(d: Date | string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function shortDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fullDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const SOURCE_LABELS: Record<string, string> = {
  facebook: "Facebook",
  website: "Website",
  phone: "Phone",
  walkin: "Walk-in",
  craigslist: "Craigslist",
};

export const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  pending: "Sale Pending",
  sold: "Sold",
  recon: "In Recon",
};
