import type { ErrorLogInput } from "./errorBoundary.types";

export function logError({ error, errorInfo, boundary, level }: ErrorLogInput) {
  if (import.meta.env.DEV) {
    console.error("[ErrorBoundary]", {
      boundary,
      level,
      error,
      componentStack: errorInfo?.componentStack
    });
  }
}
