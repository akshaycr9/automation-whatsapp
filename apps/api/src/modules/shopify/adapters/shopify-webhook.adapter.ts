import { AutomationTriggerEvent } from "@prisma/client";
import { SHOPIFY_ROUTE_TOPICS, SHOPIFY_WEBHOOK_TOPICS } from "../domain/shopify.constants.js";
import type { InternalAutomationEvent, ShopifyRouteTopic, ShopifyWebhookTopic } from "../domain/shopify.types.js";
import { adaptShopifyCheckoutWebhook } from "./shopify-checkout.adapter.js";
import { adaptShopifyOrderCreatedWebhook, adaptShopifyOrderWebhook } from "./shopify-order.adapter.js";

export function routeTopicToShopifyTopic(topic: ShopifyRouteTopic): ShopifyWebhookTopic {
  switch (topic) {
    case SHOPIFY_ROUTE_TOPICS.ORDERS_CREATE:
      return SHOPIFY_WEBHOOK_TOPICS.ORDERS_CREATE;
    case SHOPIFY_ROUTE_TOPICS.ORDERS_FULFILLED:
      return SHOPIFY_WEBHOOK_TOPICS.ORDERS_FULFILLED;
    case SHOPIFY_ROUTE_TOPICS.FULFILLMENTS_CREATE:
      return SHOPIFY_WEBHOOK_TOPICS.FULFILLMENTS_CREATE;
    case SHOPIFY_ROUTE_TOPICS.ORDERS_CANCELLED:
      return SHOPIFY_WEBHOOK_TOPICS.ORDERS_CANCELLED;
    case SHOPIFY_ROUTE_TOPICS.CHECKOUTS_UPDATE:
      return SHOPIFY_WEBHOOK_TOPICS.CHECKOUTS_UPDATE;
    case SHOPIFY_ROUTE_TOPICS.ABANDONED_CHECKOUTS:
      return SHOPIFY_WEBHOOK_TOPICS.ABANDONED_CHECKOUTS;
  }
}

export function adaptShopifyWebhook(
  topic: ShopifyWebhookTopic,
  payload: Record<string, unknown>
): InternalAutomationEvent | null {
  switch (topic) {
    case SHOPIFY_WEBHOOK_TOPICS.ORDERS_CREATE:
      return adaptShopifyOrderCreatedWebhook(payload);
    case SHOPIFY_WEBHOOK_TOPICS.ORDERS_FULFILLED:
    case SHOPIFY_WEBHOOK_TOPICS.FULFILLMENTS_CREATE:
      return adaptShopifyOrderWebhook(payload, AutomationTriggerEvent.ORDER_FULFILLED);
    case SHOPIFY_WEBHOOK_TOPICS.ORDERS_CANCELLED:
      return adaptShopifyOrderWebhook(payload, AutomationTriggerEvent.ORDER_CANCELLED);
    case SHOPIFY_WEBHOOK_TOPICS.CHECKOUTS_UPDATE:
    case SHOPIFY_WEBHOOK_TOPICS.ABANDONED_CHECKOUTS:
      return adaptShopifyCheckoutWebhook(payload);
  }
}

export function isSupportedShopifyTopic(topic: string): topic is ShopifyWebhookTopic {
  return Object.values(SHOPIFY_WEBHOOK_TOPICS).includes(topic as ShopifyWebhookTopic);
}
