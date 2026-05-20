import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { WebhooksController } from "./webhooks.controller.js";

export function createWebhooksRoutes(controller = new WebhooksController()) {
  const router = Router();

  router.get("/meta", asyncHandler(controller.metaChallenge));
  router.post("/meta", asyncHandler(controller.meta));

  return router;
}

export const webhooksRoutes = createWebhooksRoutes();
