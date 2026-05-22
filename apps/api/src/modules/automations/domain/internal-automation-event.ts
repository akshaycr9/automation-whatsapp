import type { AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";

export type InternalAutomationEvent = {
  source: AutomationTriggerSource;
  eventType: AutomationTriggerEvent;
  resourceType: AutomationResourceType;
  resourceId?: string | undefined;
  customerPhone?: string | undefined;
  customerEmail?: string | undefined;
  action?: {
    type: "BUTTON_REPLY";
    actionKey?: string | undefined;
    payload?: string | undefined;
    text?: string | undefined;
  };
  data: Record<string, unknown>;
};
