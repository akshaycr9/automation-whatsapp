export const SHOPIFY_WEBHOOK_TOPICS = {
  ORDERS_CREATE: "orders/create",
  ORDERS_FULFILLED: "orders/fulfilled",
  FULFILLMENTS_CREATE: "fulfillments/create",
  ORDERS_CANCELLED: "orders/cancelled",
  CHECKOUTS_UPDATE: "checkouts/update",
  ABANDONED_CHECKOUTS: "abandoned_checkouts/create"
} as const;

export const SHOPIFY_ROUTE_TOPICS = {
  ORDERS_CREATE: "orders-create",
  ORDERS_FULFILLED: "orders-fulfilled",
  FULFILLMENTS_CREATE: "fulfillments-create",
  ORDERS_CANCELLED: "orders-cancelled",
  CHECKOUTS_UPDATE: "checkouts-update",
  ABANDONED_CHECKOUTS: "abandoned-checkouts"
} as const;
