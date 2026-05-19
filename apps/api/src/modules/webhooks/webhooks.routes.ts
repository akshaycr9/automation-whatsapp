import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { WebhooksController } from "./webhooks.controller.js";

export function createWebhooksRoutes(controller = new WebhooksController()) {
  const router = Router();

  router.post("/meta/template-status", asyncHandler(controller.metaTemplateStatus));

  return router;
}

export const webhooksRoutes = createWebhooksRoutes();
