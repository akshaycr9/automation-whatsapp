import type {
  AutomationDetail,
  AutomationFlow,
  AutomationFlowKey,
  AutomationListItem
} from "../types/automation.types";

export function formatDelay(delayMinutes: number) {
  if (delayMinutes === 0) return "Instant";
  if (delayMinutes < 60) return `${delayMinutes} minute${delayMinutes === 1 ? "" : "s"}`;
  if (delayMinutes % 1440 === 0) {
    const days = delayMinutes / 1440;
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  if (delayMinutes % 60 === 0) {
    const hours = delayMinutes / 60;
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return `${delayMinutes} minutes`;
}

export function formatTrigger(source: string, event: string) {
  return `${source} · ${event}`;
}

export function getFlowTone(flowKey: AutomationFlowKey) {
  if (flowKey === "COD_FLOW") {
    return {
      icon: "cash",
      border: "border-warning/50",
      bg: "bg-warning-soft",
      text: "text-[#92400e]",
      accent: "bg-warning"
    };
  }

  if (flowKey === "ABANDONED_CART_FLOW") {
    return {
      icon: "cart",
      border: "border-info/50",
      bg: "bg-info-soft",
      text: "text-[#1d4ed8]",
      accent: "bg-info"
    };
  }

  return {
    icon: "order",
    border: "border-brand/50",
    bg: "bg-brand-soft",
    text: "text-brand-hover",
    accent: "bg-brand"
  };
}

export function getAutomationIcon(automationKey: string) {
  if (automationKey.includes("CANCEL")) return "x";
  if (automationKey.includes("FULFILLED")) return "truck";
  if (automationKey.includes("FOLLOW_UP")) return "clock";
  if (automationKey.includes("ABANDONED")) return "cart";
  if (automationKey.includes("CONFIRMED")) return "check";
  if (automationKey.includes("COD")) return "cash";
  return "bolt";
}

export function summarizeAutomations(flows: AutomationFlow[]) {
  const automations = flows.flatMap((flow) => flow.automations);
  const activeCount = automations.filter((automation) => automation.isEnabled).length;
  const configuredCount = automations.filter((automation) => automation.isConfigured).length;

  return {
    totalCount: automations.length,
    activeCount,
    inactiveCount: automations.length - activeCount,
    configuredCount
  };
}

export function isListItemConfigured(automation: AutomationListItem | AutomationDetail) {
  return automation.isConfigured;
}

export function getTemplateLabel(automation: AutomationListItem) {
  return automation.templateName ?? "No template selected";
}
