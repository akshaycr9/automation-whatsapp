import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AutomationFlow, AutomationListItem } from "../types/automation.types";
import { getFlowTone } from "../utils/automation.utils";
import { AutomationIcon } from "./AutomationIcon";
import { AutomationMobileCard, AutomationRow } from "./AutomationCard";

type AutomationFlowSectionProps = {
  flow: AutomationFlow;
  togglingAutomationId: string | null;
  onConfigure: (automationId: string) => void;
  onToggle: (automation: AutomationListItem, isEnabled: boolean) => void;
};

export function DesktopAutomationFlowSection({
  flow,
  togglingAutomationId,
  onConfigure,
  onToggle
}: AutomationFlowSectionProps) {
  const tone = getFlowTone(flow.key);
  const activeCount = flow.automations.filter((automation) => automation.isEnabled).length;

  return (
    <section className={cn("overflow-hidden rounded-lg border bg-surface shadow-sm", tone.border)}>
      <div className={cn("flex items-center gap-3 border-b px-5 py-4", tone.bg)}>
        <span className={cn("grid size-8 place-items-center rounded-md text-white", tone.accent)}>
          <AutomationIcon name={tone.icon} />
        </span>
        <div className="min-w-0">
          <h2 className={cn("text-sm font-semibold", tone.text)}>{flow.name}</h2>
          <p className="mt-0.5 text-xs text-text-muted">{flow.description}</p>
        </div>
        <p className="ml-auto text-sm text-text-muted">
          {activeCount}/{flow.automations.length} active
        </p>
      </div>
      <div className="grid grid-cols-[40px_minmax(0,1fr)_180px_110px_210px_150px_110px] gap-x-4 border-b border-border bg-surface-2 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-text-subtle">
        <span />
        <span>Automation</span>
        <span>Trigger</span>
        <span>Delay</span>
        <span>Template</span>
        <span>Status</span>
        <span />
      </div>
      {flow.automations.map((automation) => (
        <AutomationRow
          key={automation.id}
          automation={automation}
          isToggling={togglingAutomationId === automation.id}
          onConfigure={onConfigure}
          onToggle={onToggle}
        />
      ))}
    </section>
  );
}

export function MobileAutomationFlowSection({
  flow,
  togglingAutomationId,
  onConfigure,
  onToggle
}: AutomationFlowSectionProps) {
  const [isOpen, setIsOpen] = useState(flow.sortOrder === 1);
  const tone = getFlowTone(flow.key);
  const activeCount = flow.automations.filter((automation) => automation.isEnabled).length;

  return (
    <section
      className={cn("overflow-hidden rounded-lg border bg-surface shadow-sm", isOpen ? tone.border : "border-border")}
    >
      <button
        className={cn("flex w-full items-center gap-3 px-4 py-3 text-left", isOpen ? tone.bg : "bg-surface")}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span
          className={cn(
            "grid size-9 place-items-center rounded-md",
            isOpen ? `${tone.accent} text-white` : "bg-surface-2 text-text-muted"
          )}
        >
          <AutomationIcon name={tone.icon} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block text-sm font-semibold", isOpen ? tone.text : "text-text")}>{flow.name}</span>
          <span className="mt-0.5 block text-xs text-text-muted">
            {activeCount}/{flow.automations.length} active
          </span>
        </span>
        <span className={cn("text-text-muted transition", isOpen && "rotate-180")} aria-hidden="true">
          v
        </span>
      </button>
      {isOpen ? (
        <div className="space-y-3 border-t border-border bg-background p-3">
          {flow.automations.map((automation) => (
            <AutomationMobileCard
              key={automation.id}
              automation={automation}
              isToggling={togglingAutomationId === automation.id}
              onConfigure={onConfigure}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
