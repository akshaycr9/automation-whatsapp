import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../lib/async-handler.js";
import { createAuthMiddleware } from "./auth.middleware.js";
import { AuthController } from "./auth.controller.js";

const loginRateLimit = rateLimit({
  legacyHeaders: false,
  max: 10,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000
});

const refreshRateLimit = rateLimit({
  legacyHeaders: false,
  max: 60,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000
});

export function createAuthRoutes(controller = new AuthController(), authMiddleware = createAuthMiddleware()) {
  const router = Router();

  router.post("/login", loginRateLimit, asyncHandler(controller.login));
  router.post("/refresh", refreshRateLimit, asyncHandler(controller.refresh));
  router.post("/logout", asyncHandler(controller.logout));
  router.get("/me", authMiddleware, asyncHandler(controller.me));

  return router;
}

export const authRoutes = createAuthRoutes();
