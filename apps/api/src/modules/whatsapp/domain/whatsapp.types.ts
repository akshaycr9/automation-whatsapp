import type { AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";

export type WhatsAppWebhookMessage = Record<string, unknown>;

export type WhatsAppButtonReply = {
  messageId?: string | undefined;
  from?: string | undefined;
  timestamp?: string | undefined;
  buttonText?: string | undefined;
  buttonPayload: string;
};

export type ParsedAutomationButtonPayload = {
  actionKey: "COD_CONFIRM" | "COD_CANCEL";
  resourceType: "ORDER";
  resourceId: string;
};

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
