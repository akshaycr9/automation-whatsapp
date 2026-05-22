import { AutomationTriggerEvent } from "@prisma/client";
import { adaptShopifyCheckoutWebhook } from "../adapters/shopify-checkout.adapter.js";

it("maps abandoned checkout payloads to CHECKOUT_ABANDONED", () => {
  const event = adaptShopifyCheckoutWebhook({
    id: 987,
    token: "checkout-token",
    cart_token: "cart-token",
    total_price: "499.00",
    currency: "INR",
    abandoned_checkout_url: "https://store.example/checkouts/recover",
    email: "customer@example.com",
    line_items: [{ title: "T-shirt" }, { title: "Cap" }],
    shipping_address: {
      phone: "919999999999",
      first_name: "Akshay",
      last_name: "Thadani"
    }
  });

  expect(event).toEqual(
    expect.objectContaining({
      eventType: AutomationTriggerEvent.CHECKOUT_ABANDONED,
      resourceId: "987",
      customerPhone: "919999999999",
      data: expect.objectContaining({
        checkout: expect.objectContaining({
          recoveryUrl: "https://store.example/checkouts/recover",
          firstProductName: "T-shirt",
          productCount: 2
        })
      })
    })
  );
});

it("ignores completed checkouts", () => {
  expect(
    adaptShopifyCheckoutWebhook({
      id: 987,
      token: "checkout-token",
      completed_at: "2026-05-22T10:00:00Z",
      abandoned_checkout_url: "https://store.example/checkouts/recover"
    })
  ).toBeNull();
});
