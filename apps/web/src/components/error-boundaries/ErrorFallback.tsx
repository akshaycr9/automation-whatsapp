import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ErrorFallbackProps } from "./errorBoundary.types";

const fallbackCopy = {
  app: {
    title: "Something went wrong",
    description: "The app hit an unexpected problem. Refresh the page to try again."
  },
  route: {
    title: "This page could not be loaded",
    description: "Something went wrong while rendering this page."
  },
  feature: {
    title: "Something went wrong in this feature",
    description: "This feature could not be displayed. You can retry or continue elsewhere in the app."
  },
  section: {
    title: "This section could not be loaded",
    description: "The rest of the page is still available."
  }
};

export function ErrorFallback({
  title,
  description,
  error,
  resetError,
  variant = "section",
  showDetails = import.meta.env.DEV
}: ErrorFallbackProps) {
  const copy = fallbackCopy[variant];
  const shouldRenderAsFullPage = variant === "app";

  return (
    <div
      role="alert"
      className={cn(
        "border border-error/30 bg-error-soft text-text shadow-sm",
        shouldRenderAsFullPage
          ? "grid min-h-screen place-items-center bg-background p-6"
          : variant === "section"
            ? "rounded-lg p-4"
            : "rounded-lg p-5"
      )}
    >
      <div
        className={cn(
          "w-full",
          shouldRenderAsFullPage ? "max-w-md rounded-xl border border-border bg-surface p-6" : ""
        )}
      >
        <h1 className={cn("font-semibold text-text", variant === "section" ? "text-sm" : "text-xl")}>
          {title ?? copy.title}
        </h1>
        <p className="mt-2 text-sm text-text-muted">{description ?? copy.description}</p>

        {showDetails && error ? (
          <details className="mt-4 rounded-md border border-border bg-surface p-3 text-xs text-text-muted">
            <summary className="cursor-pointer font-medium text-text">Error details</summary>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono">
              {error.stack ?? error.message}
            </pre>
          </details>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {resetError ? (
            <Button type="button" variant="secondary" onClick={resetError}>
              Try again
            </Button>
          ) : null}
          {variant === "app" ? (
            <Button type="button" onClick={() => window.location.reload()}>
              Refresh page
            </Button>
          ) : null}
          {variant === "route" ? (
            <Button type="button" variant="ghost" onClick={() => window.location.assign("/dashboard")}>
              Go to dashboard
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
