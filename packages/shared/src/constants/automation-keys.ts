export const AUTOMATION_KEYS = [
  "prepaid_order_confirmation",
  "cod_order_confirmation",
  "cod_order_confirmed",
  "cod_order_cancelled",
  "cod_order_followup",
  "order_fulfilled",
  "order_cancelled",
  "abandoned_cart_1",
  "abandoned_cart_2",
  "abandoned_cart_3"
] as const;

export type AutomationKey = (typeof AUTOMATION_KEYS)[number];
