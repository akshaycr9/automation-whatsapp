import { Button } from "@/components/ui/button";
import type { TemplateStatus } from "../../types/template.types";
import { formatTemplateStatus } from "../../utils/templateFormatters";

type TemplateListToolbarProps = {
  activeStatus: TemplateStatus | "ALL";
  counts: Record<TemplateStatus | "ALL", number>;
  onStatusChange: (status: TemplateStatus | "ALL") => void;
  onSyncTemplates: () => void;
  isSyncing?: boolean;
};

const visibleStatuses: Array<TemplateStatus | "ALL"> = ["ALL", "APPROVED", "PENDING", "REJECTED", "DRAFT", "PAUSED"];

export function TemplateListToolbar({
  activeStatus,
  counts,
  onStatusChange,
  onSyncTemplates,
  isSyncing = false
}: TemplateListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="hidden gap-2 md:flex" aria-label="Template status filters">
        {visibleStatuses.map((status) => (
          <button
            key={status}
            className={
              activeStatus === status
                ? "inline-flex min-h-9 items-center gap-2 rounded-md bg-brand-soft px-3 text-sm font-medium text-brand-hover"
                : "inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-text-muted transition hover:bg-surface-2 hover:text-text"
            }
            type="button"
            aria-pressed={activeStatus === status}
            onClick={() => onStatusChange(status)}
          >
            {status === "ALL" ? "All" : formatTemplateStatus(status)}
            <span className="rounded-full bg-surface px-1.5 py-0.5 text-[11px] text-text-muted">
              {counts[status] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1.5 md:hidden">
        <span className="text-xs font-medium text-text-muted">Status</span>
        <select
          className="block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          value={activeStatus}
          onChange={(event) => onStatusChange(event.target.value as TemplateStatus | "ALL")}
        >
          {visibleStatuses.map((status) => (
            <option key={status} value={status}>
              {status === "ALL" ? "All" : `${formatTemplateStatus(status)} (${counts[status] ?? 0})`}
            </option>
          ))}
        </select>
      </label>

      <Button type="button" variant="secondary" disabled={isSyncing} onClick={onSyncTemplates}>
        {isSyncing ? "Syncing..." : "Sync mock data"}
      </Button>
    </div>
  );
}
