// Central place to read and validate configuration.
//
// The demo runs with almost nothing set. Production needs more, so
// `validateEnv()` reports what's missing instead of letting the app fail on the
// first request. It's called at server startup from instrumentation.ts and is
// also surfaced by /api/health.

export interface EnvIssue {
  level: "error" | "warning";
  message: string;
}

export const isProduction = () => process.env.NODE_ENV === "production";

/** AI runs in mock mode unless a real key is present and MOCK_AI isn't "true". */
export const usingMockAI = () =>
  process.env.MOCK_AI === "true" || !process.env.ANTHROPIC_API_KEY;

export const usingCloudStorage = () => !!process.env.STORAGE_BUCKET;

/**
 * Returns config problems. `error` means the app is misconfigured for the
 * current environment; `warning` means it will run but not the way you'd want
 * in production.
 */
export function validateEnv(): EnvIssue[] {
  const issues: EnvIssue[] = [];
  const prod = isProduction();

  if (!process.env.DATABASE_URL) {
    issues.push({
      level: "error",
      message: "DATABASE_URL is not set. Copy .env.example to .env to get started.",
    });
  } else if (prod && process.env.DATABASE_URL.startsWith("file:")) {
    issues.push({
      level: "error",
      message:
        "DATABASE_URL points at a SQLite file in production. Cloud hosts wipe local disk on deploy — use managed Postgres (see DEPLOYMENT.md).",
    });
  }

  // AI
  if (process.env.MOCK_AI !== "true" && !process.env.ANTHROPIC_API_KEY) {
    issues.push({
      level: "warning",
      message:
        "MOCK_AI is not \"true\" but ANTHROPIC_API_KEY is missing — AI features will fall back to canned demo responses.",
    });
  }
  if (prod && usingMockAI()) {
    issues.push({
      level: "warning",
      message:
        "Running in production with mock AI. Set ANTHROPIC_API_KEY and MOCK_AI=false to use the real model.",
    });
  }

  // Storage: if a bucket is named, the credentials must be complete.
  if (process.env.STORAGE_BUCKET) {
    for (const key of ["STORAGE_ACCESS_KEY_ID", "STORAGE_SECRET_ACCESS_KEY"]) {
      if (!process.env[key]) {
        issues.push({
          level: "error",
          message: `STORAGE_BUCKET is set but ${key} is missing — photo uploads will fail.`,
        });
      }
    }
  } else if (prod) {
    issues.push({
      level: "warning",
      message:
        "No STORAGE_BUCKET set. Photos will be written to local disk and lost on the next deploy — configure S3/R2 (see DEPLOYMENT.md).",
    });
  }

  return issues;
}

/** Logs config problems once at startup. Throws only on a fatal prod misconfig. */
export function reportEnv(): void {
  const issues = validateEnv();
  if (issues.length === 0) return;

  for (const issue of issues) {
    const prefix = issue.level === "error" ? "[config error]" : "[config warning]";
    console[issue.level === "error" ? "error" : "warn"](`${prefix} ${issue.message}`);
  }

  // In production a hard error means the app can't work correctly — fail loudly
  // at boot rather than mysteriously at request time.
  if (isProduction() && issues.some((i) => i.level === "error")) {
    throw new Error(
      "Refusing to start with an invalid production configuration. See the [config error] lines above.",
    );
  }
}
