import { cn } from "@/lib/utils";
import type { AutomationFlow } from "../types/automation.types";
import { getFlowTone } from "../utils/automation.utils";
import { AutomationIcon } from "./AutomationIcon";
import { AutomationConfiguredBadge } from "./AutomationBadges";

type AutomationFlowCardProps = {
  flow: AutomationFlow;
  isSelected: boolean;
  onSelect: () => void;
};

export function AutomationFlowCard({ flow, isSelected, onSelect }: AutomationFlowCardProps) {
  const tone = getFlowTone(flow.key);
  const activeCount = flow.automations.filter((automation) => automation.isEnabled).length;
  const configuredCount = flow.automations.filter((automation) => automation.isConfigured).length;
  const allConfigured = configuredCount === flow.automations.length;

  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        "relative min-w-0 flex-1 overflow-hidden rounded-lg border bg-surface p-4 text-left shadow-sm transition hover:bg-surface-2",
        isSelected ? `${tone.border} ${tone.bg} shadow-md` : "border-border"
      )}
      type="button"
      onClick={onSelect}
    >
      {isSelected ? <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", tone.accent)} /> : null}
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-md",
            isSelected ? `${tone.accent} text-white` : "bg-surface-2 text-text-muted"
          )}
        >
          <AutomationIcon className="size-5" name={tone.icon} />
        </span>
        <span className="min-w-0">
          <span className={cn("block text-sm font-semibold", isSelected ? tone.text : "text-text")}>{flow.name}</span>
          <span className="mt-1 line-clamp-2 block text-xs leading-5 text-text-muted">{flow.description}</span>
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/70 pt-3">
        <span>
          <span className={cn("text-xl font-semibold leading-none", tone.text)}>{activeCount}</span>
          <span className="text-sm text-text-subtle">/{flow.automations.length}</span>
          <span className="mt-1 block text-[11px] text-text-subtle">active</span>
        </span>
        <span className="flex flex-col items-end gap-1">
          <AutomationConfiguredBadge isConfigured={allConfigured} />
          <span className="text-[11px] text-text-subtle">
            {configuredCount}/{flow.automations.length} configured
          </span>
        </span>
      </div>
    </button>
  );
}
