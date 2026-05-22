import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDelay } from "../utils/automation.utils";

export function AutomationStatusBadge({ isEnabled }: { isEnabled: boolean }) {
  return (
    <Badge className={cn(isEnabled ? "bg-success-soft text-brand-hover" : "bg-surface-2 text-text-muted")}>
      <span aria-hidden="true" className="mr-1 size-1.5 rounded-full bg-current" />
      {isEnabled ? "Enabled" : "Disabled"}
    </Badge>
  );
}

export function AutomationConfiguredBadge({ isConfigured }: { isConfigured: boolean }) {
  return (
    <Badge className={cn(isConfigured ? "bg-success-soft text-brand-hover" : "bg-warning-soft text-[#92400e]")}>
      {isConfigured ? "Configured" : "Needs setup"}
    </Badge>
  );
}

export function AutomationDelayBadge({ delayMinutes }: { delayMinutes: number }) {
  const instant = delayMinutes === 0;

  return (
    <Badge
      className={cn(
        "w-fit max-w-full",
        instant ? "bg-success-soft text-brand-hover" : "bg-warning-soft text-[#92400e]"
      )}
    >
      {formatDelay(delayMinutes)}
    </Badge>
  );
}

export function AutomationTemplateChip({ templateName }: { templateName: string | null }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center truncate rounded-md px-2 py-1 font-mono text-[11px]",
        templateName ? "bg-brand-soft text-brand-hover" : "bg-surface-2 text-text-subtle"
      )}
      title={templateName ?? "No template selected"}
    >
      {templateName ?? "No template selected"}
    </span>
  );
}
