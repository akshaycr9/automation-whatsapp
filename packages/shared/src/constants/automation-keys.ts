export const AUTOMATION_KEYS = [
  "ORDER_CONFIRMED",
  "ORDER_FULFILLED",
  "ORDER_CANCELLED",
  "COD_ORDER_CONFIRMATION",
  "COD_ORDER_CONFIRMED",
  "COD_ORDER_CANCELLED",
  "COD_ORDER_FOLLOW_UP",
  "ABANDONED_CART_1",
  "ABANDONED_CART_2",
  "ABANDONED_CART_3"
] as const;

export type AutomationKey = (typeof AUTOMATION_KEYS)[number];

export const AUTOMATION_FLOW_KEYS = ["ORDER_FLOW", "COD_FLOW", "ABANDONED_CART_FLOW"] as const;

export type AutomationFlowKey = (typeof AUTOMATION_FLOW_KEYS)[number];

export const AUTOMATION_TRIGGER_SOURCES = ["SHOPIFY", "WHATSAPP", "SYSTEM"] as const;

export type AutomationTriggerSource = (typeof AUTOMATION_TRIGGER_SOURCES)[number];

export const AUTOMATION_TRIGGER_EVENTS = [
  "ORDER_CREATED",
  "ORDER_FULFILLED",
  "ORDER_CANCELLED",
  "COD_ORDER_CREATED",
  "CHECKOUT_ABANDONED",
  "BUTTON_REPLY"
] as const;

export type AutomationTriggerEvent = (typeof AUTOMATION_TRIGGER_EVENTS)[number];

export const AUTOMATION_RESOURCE_TYPES = ["ORDER", "CHECKOUT", "CUSTOMER"] as const;

export type AutomationResourceType = (typeof AUTOMATION_RESOURCE_TYPES)[number];

export const AUTOMATION_JOB_STATUSES = [
  "PENDING",
  "QUEUED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "SKIPPED",
  "CANCELLED"
] as const;

export type AutomationJobStatus = (typeof AUTOMATION_JOB_STATUSES)[number];

export const AUTOMATION_COMPONENT_TYPES = ["HEADER", "BODY", "BUTTON"] as const;

export type AutomationComponentType = (typeof AUTOMATION_COMPONENT_TYPES)[number];

export const AUTOMATION_ACTION_STATES = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "CANCELLED",
  "FOLLOW_UP_SENT",
  "ABANDONED_ACTIVE",
  "RECOVERED",
  "EXPIRED"
] as const;

export type AutomationActionState = (typeof AUTOMATION_ACTION_STATES)[number];
