import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteImage, putImage } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 10 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/jpeg": "jpg",
};

export async function POST(req: NextRequest) {
  try {
    const dealershipId = await requireDealershipId();
    const form = await req.formData();
    const vehicleId = form.get("vehicleId");
    if (typeof vehicleId !== "string") {
      return NextResponse.json({ error: "Missing vehicleId" }, { status: 400 });
    }
    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, dealershipId } });
    if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const existing = await prisma.photo.count({ where: { vehicleId } });
    const created = [];
    for (const [i, file] of files.entries()) {
      if (!ALLOWED.has(file.type) || file.size > MAX_BYTES) continue;
      const ext = EXT_BY_TYPE[file.type] ?? "jpg";
      // Server-generated key — user input never reaches the storage path.
      const key = `${vehicleId}-${Date.now()}-${i}.${ext}`;
      const url = await putImage(key, Buffer.from(await file.arrayBuffer()), file.type);
      created.push(
        await prisma.photo.create({
          data: { vehicleId, url, sortOrder: existing + i },
        }),
      );
    }
    if (created.length === 0) {
      return NextResponse.json(
        { error: "No valid images (JPG/PNG/WebP/GIF up to 10 MB)" },
        { status: 400 },
      );
    }
    return NextResponse.json({ photos: created });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const dealershipId = await requireDealershipId();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    // Only delete a photo that belongs to one of this dealership's vehicles.
    const photo = await prisma.photo.findFirst({
      where: { id, vehicle: { dealershipId } },
    });
    if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    await prisma.photo.delete({ where: { id } });
    // Best-effort file removal — a storage hiccup shouldn't fail the request.
    await deleteImage(photo.url).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
