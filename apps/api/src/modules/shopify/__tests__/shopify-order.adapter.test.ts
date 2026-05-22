import { AutomationTriggerEvent } from "@prisma/client";
import { adaptShopifyOrderCreatedWebhook, adaptShopifyOrderWebhook } from "../adapters/shopify-order.adapter.js";

const baseOrder = {
  id: 123456789,
  name: "#1001",
  total_price: "899.00",
  currency: "INR",
  financial_status: "paid",
  fulfillment_status: null,
  payment_gateway_names: ["razorpay"],
  email: "customer@example.com",
  customer: {
    first_name: "Akshay",
    last_name: "Thadani"
  },
  shipping_address: {
    phone: "919999999999",
    address1: "Line 1",
    address2: "Line 2",
    city: "Mumbai",
    province: "Maharashtra",
    country: "India",
    zip: "400001"
  }
};

it("maps prepaid order creation to ORDER_CREATED", () => {
  const event = adaptShopifyOrderCreatedWebhook(baseOrder);

  expect(event.eventType).toBe(AutomationTriggerEvent.ORDER_CREATED);
  expect(event.resourceId).toBe("123456789");
  expect(event.customerPhone).toBe("919999999999");
  expect(event.data).toEqual(
    expect.objectContaining({
      order: expect.objectContaining({
        name: "#1001",
        paymentMethod: "razorpay"
      }),
      customer: expect.objectContaining({
        fullName: "Akshay Thadani",
        email: "customer@example.com"
      }),
      shippingAddress: expect.objectContaining({
        city: "Mumbai",
        pincode: "400001"
      })
    })
  );
});

it("maps COD order creation to COD_ORDER_CREATED", () => {
  const event = adaptShopifyOrderCreatedWebhook({
    ...baseOrder,
    financial_status: "pending",
    payment_gateway_names: ["Cash on Delivery (COD)"]
  });

  expect(event.eventType).toBe(AutomationTriggerEvent.COD_ORDER_CREATED);
  expect(event.data).toEqual(
    expect.objectContaining({
      order: expect.objectContaining({ paymentMethod: "COD" })
    })
  );
});

it("maps fulfillment and cancellation events to requested internal event types", () => {
  expect(adaptShopifyOrderWebhook(baseOrder, AutomationTriggerEvent.ORDER_FULFILLED).eventType).toBe(
    AutomationTriggerEvent.ORDER_FULFILLED
  );
  expect(adaptShopifyOrderWebhook(baseOrder, AutomationTriggerEvent.ORDER_CANCELLED).eventType).toBe(
    AutomationTriggerEvent.ORDER_CANCELLED
  );
});
