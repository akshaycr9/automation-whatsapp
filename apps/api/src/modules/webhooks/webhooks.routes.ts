import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { createShopifyWebhookRoutes } from "../shopify/routes/shopify-webhook.routes.js";
import { createWhatsAppWebhookRoutes } from "../whatsapp/routes/whatsapp-webhook.routes.js";
import { WebhooksController } from "./webhooks.controller.js";

export function createWebhooksRoutes(controller = new WebhooksController()) {
  const router = Router();

  router.get("/meta", asyncHandler(controller.metaChallenge));
  router.post("/meta", asyncHandler(controller.meta));
  router.use(createShopifyWebhookRoutes());
  router.use(createWhatsAppWebhookRoutes());

  return router;
}

export const webhooksRoutes = createWebhooksRoutes();
