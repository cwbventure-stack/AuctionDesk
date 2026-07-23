// Downloads all of a vehicle's photos as a single ZIP, so a dealer can drag them
// into Facebook's or Craigslist's uploader in one go.
//
// Authenticated and tenant-scoped: unlike the public catalog feed, this bundles
// the dealership's own working assets, so it requires a session and only ever
// serves photos from the caller's own inventory.
import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createZip, type ZipEntry } from "@/lib/zip";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let dealershipId: string;
  try {
    dealershipId = await requireDealershipId();
  } catch {
    return new Response("Sign in required", { status: 401 });
  }

  const { id } = await params;

  const vehicle = await prisma.vehicle.findFirst({
    where: { id, dealershipId },
    select: {
      year: true,
      make: true,
      model: true,
      photos: { select: { url: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!vehicle) return new Response("Vehicle not found", { status: 404 });
  if (vehicle.photos.length === 0) return new Response("No photos to download", { status: 404 });

  const origin = new URL(request.url).origin;

  // Fetch each photo's bytes. Local uploads resolve against our own origin; S3
  // photos are absolute public URLs. A photo that fails to fetch is skipped
  // rather than failing the whole download.
  const entries: ZipEntry[] = [];
  await Promise.all(
    vehicle.photos.map(async (photo, i) => {
      const url = photo.url.startsWith("http") ? photo.url : `${origin}${photo.url}`;
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const buf = Buffer.from(await res.arrayBuffer());
        const ext = photo.url.split(".").pop()?.split("?")[0] || "jpg";
        entries.push({ name: `photo-${String(i + 1).padStart(2, "0")}.${ext}`, data: buf });
      } catch {
        // Skip a photo we can't retrieve.
      }
    }),
  );

  if (entries.length === 0) {
    return new Response("Photos could not be retrieved", { status: 502 });
  }

  // Keep the numbered order stable regardless of which fetch finished first.
  entries.sort((a, b) => a.name.localeCompare(b.name));

  const zip = createZip(entries);
  const base = `${vehicle.year}-${vehicle.make}-${vehicle.model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Convert the Node Buffer to a fresh Uint8Array so the body is a plain
  // BodyInit, not a possibly-shared pooled buffer.
  return new Response(new Uint8Array(zip), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${base}-photos.zip"`,
      "cache-control": "no-store",
    },
  });
}
