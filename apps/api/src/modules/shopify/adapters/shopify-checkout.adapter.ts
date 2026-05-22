import { AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/shopify.types.js";

type ShopifyCheckoutPayload = Record<string, unknown>;

export function adaptShopifyCheckoutWebhook(payload: ShopifyCheckoutPayload): InternalAutomationEvent | null {
  if (!isAbandonedCheckout(payload)) return null;

  const customer = readObject(payload.customer);
  const shippingAddress = readObject(payload.shipping_address);
  const phone = getBestPhone(payload);
  const firstName = readString(customer.first_name) ?? readString(shippingAddress.first_name);
  const lastName = readString(customer.last_name) ?? readString(shippingAddress.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || readString(shippingAddress.name);
  const lineItems = Array.isArray(payload.line_items) ? payload.line_items : [];
  const firstLineItem = readObject(lineItems[0]);

  return {
    source: AutomationTriggerSource.SHOPIFY,
    eventType: AutomationTriggerEvent.CHECKOUT_ABANDONED,
    resourceType: AutomationResourceType.CHECKOUT,
    resourceId: readId(payload.id) ?? readString(payload.token),
    customerPhone: phone,
    customerEmail: readString(payload.email) ?? readString(customer.email),
    data: {
      checkout: {
        id: readId(payload.id),
        token: readString(payload.token),
        totalPrice: readString(payload.total_price),
        currency: readString(payload.currency),
        recoveryUrl:
          readString(payload.abandoned_checkout_url) ??
          readString(payload.recovery_url) ??
          readString(payload.checkout_url) ??
          readString(payload.web_url),
        firstProductName: readString(firstLineItem.title) ?? readString(firstLineItem.name),
        productCount: lineItems.length
      },
      customer: {
        firstName,
        lastName,
        fullName,
        phone,
        email: readString(payload.email) ?? readString(customer.email)
      }
    }
  };
}

export function isAbandonedCheckout(payload: ShopifyCheckoutPayload) {
  if (readString(payload.completed_at)) return false;
  if (readString(payload.closed_at)) return false;
  if (readString(payload.abandoned_checkout_url) || readString(payload.recovery_url)) return true;

  // Shopify checkout/update can fire for active checkouts too; without a recovery URL or
  // abandonment marker, keep this conservative and let later product work refine timing.
  return Boolean(readString(payload.cart_token) && (readString(payload.email) || getBestPhone(payload)));
}

function getBestPhone(payload: ShopifyCheckoutPayload) {
  const customer = readObject(payload.customer);
  const shippingAddress = readObject(payload.shipping_address);
  const billingAddress = readObject(payload.billing_address);
  const defaultAddress = readObject(customer.default_address);

  return (
    readString(shippingAddress.phone) ??
    readString(billingAddress.phone) ??
    readString(customer.phone) ??
    readString(payload.phone) ??
    readString(defaultAddress.phone)
  );
}

function readString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readId(value: unknown) {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
