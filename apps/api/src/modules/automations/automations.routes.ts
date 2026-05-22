import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { createAuthMiddleware } from "../auth/auth.middleware.js";
import { AutomationsController } from "./automations.controller.js";

export function createAutomationsRoutes(
  controller = new AutomationsController(),
  authMiddleware = createAuthMiddleware()
) {
  const router = Router();

  router.use(authMiddleware);
  router.get("/", asyncHandler(controller.list));
  router.get("/:id/field-options", asyncHandler(controller.fieldOptions));
  router.patch("/:id/toggle", asyncHandler(controller.toggle));
  router.get("/:id", asyncHandler(controller.detail));
  router.put("/:id", asyncHandler(controller.update));

  return router;
}

export const automationsRoutes = createAutomationsRoutes();
