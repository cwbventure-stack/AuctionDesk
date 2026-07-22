// Minimal error reporting seam.
//
// Today this logs to stdout, which your host (Vercel, Fly, Render) already
// collects. When you're ready for real error tracking, install @sentry/nextjs
// and forward from `captureError` — every server error already routes through
// here via instrumentation.ts, so that's the only place you need to change.

export interface ErrorContext {
  /** Where the error came from, e.g. "api/photos" or a route path. */
  source?: string;
  [key: string]: unknown;
}

export function captureError(error: unknown, context: ErrorContext = {}): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error("[error]", message, {
    ...context,
    ...(stack ? { stack } : {}),
  });

  // When SENTRY_DSN is configured and @sentry/nextjs is installed:
  //   Sentry.captureException(error, { extra: context });
}
