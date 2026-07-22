"use client";

import { cn } from "@/lib/utils";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface PhotoItem {
  id: string;
  url: string;
}

export function PhotoGrid({ vehicleId, photos }: { vehicleId: string; photos: PhotoItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("vehicleId", vehicleId);
      for (const f of Array.from(files)) form.append("files", f);
      const res = await fetch("/api/photos", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error);
      }
      toast.success(`${files.length === 1 ? "Photo" : "Photos"} uploaded`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Upload failed — try again");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Photo removed");
      router.refresh();
    } catch {
      toast.error("Couldn't remove the photo");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {photos.map((p, i) => (
          <div
            key={p.id}
            className={cn(
              "group relative overflow-hidden rounded-lg bg-slate-100",
              i === 0 && "col-span-3 row-span-2 sm:col-span-3",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="Vehicle photo" className="aspect-[4/3] h-full w-full object-cover" />
            <button
              onClick={() => remove(p.id)}
              disabled={deleting === p.id}
              className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
              aria-label="Remove photo"
            >
              {deleting === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        ))}
        {/* Placeholders + upload tile fill the rest of the grid */}
        {Array.from({ length: Math.max(0, 4 - photos.length) }).map((_, i) => (
          <div
            key={`ph-${i}`}
            className={cn(
              "flex aspect-[4/3] items-center justify-center rounded-lg bg-slate-100 text-slate-300",
              photos.length === 0 && i === 0 && "col-span-3 row-span-2 sm:col-span-3",
            )}
          >
            <Camera className={photos.length === 0 && i === 0 ? "h-10 w-10" : "h-6 w-6"} />
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-blue-400 hover:text-blue-600 cursor-pointer"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <span className="text-[10px] font-medium">{uploading ? "Uploading…" : "Add photos"}</span>
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        {photos.length === 0
          ? "Upload photos from your phone — follow the shot list below for photos that sell"
          : `${photos.length} photo${photos.length === 1 ? "" : "s"} · first photo is the cover shot`}
      </p>
    </div>
  );
}
