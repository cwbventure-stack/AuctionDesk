// Photo storage with two backends:
//
//   • local  — writes to public/uploads. Zero config, used by the demo.
//   • s3     — any S3-compatible bucket (AWS S3, Cloudflare R2, Backblaze B2).
//              Used in production, because cloud hosts wipe local disk on deploy.
//
// The backend is chosen by environment: if STORAGE_BUCKET is set, S3 is used.
// The AWS SDK is imported lazily so the demo never loads it.
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

export type StorageBackend = "local" | "s3";

export function storageBackend(): StorageBackend {
  return process.env.STORAGE_BUCKET ? "s3" : "local";
}

interface S3Config {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl?: string;
}

function s3Config(): S3Config {
  const bucket = process.env.STORAGE_BUCKET;
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;
  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloud storage is misconfigured: STORAGE_BUCKET, STORAGE_ACCESS_KEY_ID and STORAGE_SECRET_ACCESS_KEY are all required.",
    );
  }
  return {
    bucket,
    accessKeyId,
    secretAccessKey,
    region: process.env.STORAGE_REGION ?? "auto",
    // R2 and other S3-compatible providers need a custom endpoint; plain AWS S3 doesn't.
    endpoint: process.env.STORAGE_ENDPOINT,
    publicBaseUrl: process.env.STORAGE_PUBLIC_URL,
  };
}

// Cached client so we don't rebuild it per request.
let s3ClientPromise: Promise<import("@aws-sdk/client-s3").S3Client> | null = null;

async function getS3Client() {
  if (!s3ClientPromise) {
    s3ClientPromise = (async () => {
      const cfg = s3Config();
      const { S3Client } = await import("@aws-sdk/client-s3");
      return new S3Client({
        region: cfg.region,
        ...(cfg.endpoint ? { endpoint: cfg.endpoint } : {}),
        credentials: {
          accessKeyId: cfg.accessKeyId,
          secretAccessKey: cfg.secretAccessKey,
        },
      });
    })();
  }
  return s3ClientPromise;
}

/**
 * Stores an image and returns the URL to render it from.
 * `key` is a server-generated filename — never raw user input.
 */
export async function putImage(key: string, body: Buffer, contentType: string): Promise<string> {
  if (storageBackend() === "s3") {
    const cfg = s3Config();
    const client = await getS3Client();
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    await client.send(
      new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    // Prefer an explicit public URL (CDN domain / R2 public bucket URL).
    if (cfg.publicBaseUrl) return `${cfg.publicBaseUrl.replace(/\/$/, "")}/${key}`;
    return `https://${cfg.bucket}.s3.${cfg.region}.amazonaws.com/${key}`;
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, key), body);
  return `/uploads/${key}`;
}

/**
 * Best-effort delete. A storage failure should never block the database delete,
 * so callers treat errors here as non-fatal.
 */
export async function deleteImage(url: string): Promise<void> {
  const key = path.basename(url);
  if (!key) return;

  if (storageBackend() === "s3") {
    const cfg = s3Config();
    const client = await getS3Client();
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    await client.send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }));
    return;
  }

  await unlink(path.join(LOCAL_DIR, key));
}
