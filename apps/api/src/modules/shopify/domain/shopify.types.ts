import type {
  AutomationResourceType,
  AutomationTriggerEvent,
  AutomationTriggerSource,
  IncomingEvent
} from "@prisma/client";

export type ShopifyWebhookTopic =
  | "orders/create"
  | "orders/fulfilled"
  | "fulfillments/create"
  | "orders/cancelled"
  | "checkouts/update"
  | "abandoned_checkouts/create";

export type ShopifyRouteTopic =
  | "orders-create"
  | "orders-fulfilled"
  | "fulfillments-create"
  | "orders-cancelled"
  | "checkouts-update"
  | "abandoned-checkouts";

export type ShopifyWebhookHeaders = {
  hmac?: string | undefined;
  topic?: string | undefined;
  shopDomain?: string | undefined;
  webhookId?: string | undefined;
  triggeredAt?: string | undefined;
  eventId?: string | undefined;
};

export type InternalAutomationEvent = {
  source: AutomationTriggerSource;
  eventType: AutomationTriggerEvent;
  resourceType: AutomationResourceType;
  resourceId?: string | undefined;
  customerPhone?: string | undefined;
  customerEmail?: string | undefined;
  data: Record<string, unknown>;
};

export type ShopifyWebhookResult = {
  status: "queued" | "duplicate" | "ignored";
  incomingEvent?: IncomingEvent;
  event?: InternalAutomationEvent;
};
