import { Router } from "express";
import { asyncHandler } from "../../../lib/async-handler.js";
import { ShopifyWebhookService } from "../services/shopify-webhook.service.js";

export function createShopifyWebhookRoutes(service = new ShopifyWebhookService()) {
  const router = Router();

  router.post(
    "/shopify/:topic",
    asyncHandler(async (req, res) => {
      const rawBody = (req as typeof req & { rawBody?: Buffer }).rawBody;
      const result = await service.handleWebhook({
        routeTopic: typeof req.params.topic === "string" ? req.params.topic : "",
        headers: {
          hmac: req.header("x-shopify-hmac-sha256"),
          topic: req.header("x-shopify-topic"),
          shopDomain: req.header("x-shopify-shop-domain"),
          webhookId: req.header("x-shopify-webhook-id"),
          triggeredAt: req.header("x-shopify-triggered-at"),
          eventId: req.header("x-shopify-event-id")
        },
        rawBody,
        payload: req.body
      });

      res.status(200).json(result);
    })
  );

  return router;
}
