import type { Instrumentation } from "next";
import { captureError } from "@/lib/observability";
import { reportEnv } from "@/lib/env";

// Runs once when the server starts, before it handles any request. We validate
// configuration here so a misconfigured deploy fails loudly at boot instead of
// mysteriously on someone's first click.
export function register() {
  reportEnv();
}

// Next.js routes every server-side error here.
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  captureError(err, {
    source: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routeType: context.routeType,
  });
};
