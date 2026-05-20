import { cn } from "@/lib/utils";
import type { PullToRefreshStatus } from "@/hooks/use-pull-to-refresh";

type PullToRefreshIndicatorProps = {
  progress: number;
  status: PullToRefreshStatus;
};

export function PullToRefreshIndicator({ progress, status }: PullToRefreshIndicatorProps) {
  if (status === "idle") return null;

  const label = getLabel(status);

  return (
    <div className="pointer-events-none sticky top-0 z-20 -mb-10 flex h-10 items-center justify-center" role="status">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted shadow-md">
        <span
          aria-hidden="true"
          className={cn(
            "size-3 rounded-full border-2 border-brand border-t-transparent",
            status === "refreshing" && "animate-spin"
          )}
          style={status === "refreshing" ? undefined : { transform: `rotate(${Math.round(progress * 180)}deg)` }}
        />
        {label}
      </div>
    </div>
  );
}

function getLabel(status: PullToRefreshStatus) {
  if (status === "ready") return "Release to refresh";
  if (status === "refreshing") return "Refreshing...";
  return "Pull to refresh";
}
