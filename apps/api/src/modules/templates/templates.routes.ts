import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { createAuthMiddleware } from "../auth/auth.middleware.js";
import { TemplatesController } from "./templates.controller.js";

export function createTemplatesRoutes(controller = new TemplatesController(), authMiddleware = createAuthMiddleware()) {
  const router = Router();

  router.use(authMiddleware);
  router.get("/", asyncHandler(controller.list));
  router.post("/", asyncHandler(controller.create));
  router.post("/sync", asyncHandler(controller.sync));
  router.post("/:id/retry-submission", asyncHandler(controller.retrySubmission));
  router.get("/:id", asyncHandler(controller.detail));
  router.delete("/:id", asyncHandler(controller.delete));

  return router;
}

export const templatesRoutes = createTemplatesRoutes();
