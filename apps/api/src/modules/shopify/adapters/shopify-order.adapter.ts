import { AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/shopify.types.js";

type ShopifyOrderPayload = Record<string, unknown>;

const COD_MARKERS = ["cash on delivery", "cash_on_delivery", "cod", "manual payment method"];

export function adaptShopifyOrderWebhook(
  payload: ShopifyOrderPayload,
  eventType: AutomationTriggerEvent
): InternalAutomationEvent {
  const customer = readObject(payload.customer);
  const shippingAddress = readObject(payload.shipping_address);
  const phone = getBestPhone(payload);
  const firstName = readString(customer.first_name) ?? readString(shippingAddress.first_name);
  const lastName = readString(customer.last_name) ?? readString(shippingAddress.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || readString(shippingAddress.name);
  const paymentMethod = getPaymentMethod(payload);

  return {
    source: AutomationTriggerSource.SHOPIFY,
    eventType,
    resourceType: AutomationResourceType.ORDER,
    resourceId: readId(payload.id),
    customerPhone: phone,
    customerEmail: readString(payload.email) ?? readString(customer.email),
    data: {
      order: {
        id: readId(payload.id),
        name: readString(payload.name),
        totalPrice: readString(payload.total_price),
        currency: readString(payload.currency),
        paymentMethod,
        paymentStatus: readString(payload.financial_status),
        fulfillmentStatus: readString(payload.fulfillment_status)
      },
      customer: {
        firstName,
        lastName,
        fullName,
        phone,
        email: readString(payload.email) ?? readString(customer.email)
      },
      shippingAddress: {
        address1: readString(shippingAddress.address1),
        address2: readString(shippingAddress.address2),
        city: readString(shippingAddress.city),
        province: readString(shippingAddress.province),
        country: readString(shippingAddress.country),
        pincode: readString(shippingAddress.zip)
      }
    }
  };
}

export function adaptShopifyOrderCreatedWebhook(payload: ShopifyOrderPayload) {
  return adaptShopifyOrderWebhook(
    payload,
    isCashOnDeliveryOrder(payload) ? AutomationTriggerEvent.COD_ORDER_CREATED : AutomationTriggerEvent.ORDER_CREATED
  );
}

export function isCashOnDeliveryOrder(payload: ShopifyOrderPayload) {
  return getPaymentSignals(payload).some((value) => COD_MARKERS.some((marker) => value.includes(marker)));
}

function getPaymentSignals(payload: ShopifyOrderPayload) {
  const signals = [
    ...readStringArray(payload.payment_gateway_names),
    readString(payload.gateway),
    readString(payload.financial_status),
    readString(readObject(payload.payment_terms).payment_terms_name),
    ...readTransactions(payload)
  ].filter((value): value is string => Boolean(value));

  return signals.map((value) => value.toLowerCase().trim());
}

function readTransactions(payload: ShopifyOrderPayload) {
  if (!Array.isArray(payload.transactions)) return [];

  return payload.transactions.flatMap((transaction) => {
    const record = readObject(transaction);
    return [readString(record.gateway), readString(record.payment_details)].filter((value): value is string =>
      Boolean(value)
    );
  });
}

function getPaymentMethod(payload: ShopifyOrderPayload) {
  if (isCashOnDeliveryOrder(payload)) return "COD";

  return readStringArray(payload.payment_gateway_names)[0] ?? readString(payload.gateway);
}

function getBestPhone(payload: ShopifyOrderPayload) {
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

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
