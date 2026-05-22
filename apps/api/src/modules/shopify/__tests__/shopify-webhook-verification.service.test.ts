import { createHmac } from "node:crypto";

it("accepts a valid Shopify HMAC signature", async () => {
  vi.resetModules();
  process.env.SHOPIFY_WEBHOOK_SECRET = "shopify-secret";
  const { ShopifyWebhookVerificationService } = await import("../services/shopify-webhook-verification.service.js");
  const rawBody = Buffer.from(JSON.stringify({ id: 123 }));
  const signature = createHmac("sha256", "shopify-secret").update(rawBody).digest("base64");

  expect(() => new ShopifyWebhookVerificationService().verify(rawBody, signature)).not.toThrow();
});

it("rejects an invalid Shopify HMAC signature", async () => {
  vi.resetModules();
  process.env.SHOPIFY_WEBHOOK_SECRET = "shopify-secret";
  const { ShopifyWebhookVerificationService } = await import("../services/shopify-webhook-verification.service.js");

  expect(() => new ShopifyWebhookVerificationService().verify(Buffer.from("{}"), "invalid")).toThrow(
    "Invalid Shopify webhook signature."
  );
});
