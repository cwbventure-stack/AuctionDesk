import { prisma } from "@/lib/prisma";
import { storageBackend } from "@/lib/storage";
import { usingMockAI, validateEnv } from "@/lib/env";
import { NextResponse } from "next/server";

// Health check for uptime monitoring and deploy verification.
// Returns 200 when the app can serve traffic, 503 when it can't reach the
// database or is missing required configuration.
export const dynamic = "force-dynamic";

export async function GET() {
  const issues = validateEnv();

  let database: "ok" | "unreachable" = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "unreachable";
  }

  const healthy = database === "ok" && !issues.some((i) => i.level === "error");

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      database,
      storage: storageBackend(),
      ai: usingMockAI() ? "mock" : "live",
      issues,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
