import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AutomationListItem } from "../types/automation.types";
import { formatTrigger, getAutomationIcon } from "../utils/automation.utils";
import { AutomationConfiguredBadge, AutomationDelayBadge, AutomationTemplateChip } from "./AutomationBadges";
import { AutomationIcon } from "./AutomationIcon";
import { AutomationSwitch } from "./AutomationSwitch";

type AutomationCardProps = {
  automation: AutomationListItem;
  isToggling?: boolean;
  onConfigure: (automationId: string) => void;
  onToggle: (automation: AutomationListItem, isEnabled: boolean) => void;
};

export function AutomationRow({ automation, isToggling, onConfigure, onToggle }: AutomationCardProps) {
  return (
    <div className="grid grid-cols-[40px_minmax(0,1fr)_180px_110px_210px_150px_110px] items-center gap-x-4 border-b border-border px-5 py-4 last:border-b-0 hover:bg-surface-2">
      <AutomationGlyph automation={automation} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text">{automation.name}</p>
        <p className="mt-0.5 truncate text-xs leading-5 text-text-muted">{automation.description}</p>
      </div>
      <TriggerBlock automation={automation} />
      <AutomationDelayBadge delayMinutes={automation.delayMinutes} />
      <AutomationTemplateChip templateName={automation.templateName} />
      <div className="flex flex-wrap items-center gap-2">
        <AutomationSwitch
          checked={automation.isEnabled}
          disabled={Boolean(isToggling)}
          label={`${automation.isEnabled ? "Disable" : "Enable"} ${automation.name}`}
          onChange={(nextEnabled) => onToggle(automation, nextEnabled)}
        />
      </div>
      <div className="flex justify-end">
        <Button
          className="min-h-8 px-3 py-1.5 text-xs"
          type="button"
          variant="secondary"
          onClick={() => onConfigure(automation.id)}
        >
          Configure
        </Button>
      </div>
    </div>
  );
}

export function AutomationMobileCard({ automation, isToggling, onConfigure, onToggle }: AutomationCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <AutomationGlyph automation={automation} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-text">{automation.name}</h3>
              <p className="mt-1 text-xs leading-5 text-text-muted">{automation.description}</p>
            </div>
            <AutomationSwitch
              checked={automation.isEnabled}
              disabled={Boolean(isToggling)}
              label={`${automation.isEnabled ? "Disable" : "Enable"} ${automation.name}`}
              onChange={(nextEnabled) => onToggle(automation, nextEnabled)}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <TriggerPill automation={automation} />
        {automation.triggerButtonText ? <TriggerButtonChip buttonText={automation.triggerButtonText} /> : null}
        <AutomationDelayBadge delayMinutes={automation.delayMinutes} />
        <AutomationConfiguredBadge isConfigured={automation.isConfigured} />
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AutomationTemplateChip templateName={automation.templateName} />
        <Button
          className="min-h-9 w-full text-xs sm:w-auto"
          type="button"
          variant="secondary"
          onClick={() => onConfigure(automation.id)}
        >
          Configure
        </Button>
      </div>
    </article>
  );
}

function AutomationGlyph({ automation }: { automation: AutomationListItem }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-md",
        automation.isEnabled ? "bg-brand-soft text-brand-hover" : "bg-surface-2 text-text-muted"
      )}
    >
      <AutomationIcon name={getAutomationIcon(automation.key)} />
    </span>
  );
}

function TriggerBlock({ automation }: { automation: AutomationListItem }) {
  return (
    <div className="min-w-0 space-y-1">
      <TriggerPill automation={automation} />
      {automation.triggerButtonText ? <TriggerButtonChip buttonText={automation.triggerButtonText} /> : null}
    </div>
  );
}

function TriggerPill({ automation }: { automation: AutomationListItem }) {
  return (
    <span className="inline-flex w-fit max-w-full truncate rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-[11px] text-text-muted">
      {formatTrigger(automation.triggerSource, automation.triggerEvent)}
    </span>
  );
}

function TriggerButtonChip({ buttonText }: { buttonText: string }) {
  return (
    <span className="inline-flex w-fit max-w-full truncate rounded-md bg-info-soft px-2 py-1 text-[11px] font-medium text-[#1d4ed8]">
      Button: {buttonText}
    </span>
  );
}
