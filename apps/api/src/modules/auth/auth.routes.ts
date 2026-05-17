import { RequestHandler, Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
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

const noopRateLimit: RequestHandler = (_req, _res, next) => next();
const loginLimiter = env.NODE_ENV === "test" ? noopRateLimit : loginRateLimit;
const refreshLimiter = env.NODE_ENV === "test" ? noopRateLimit : refreshRateLimit;

export function createAuthRoutes(controller = new AuthController(), authMiddleware = createAuthMiddleware()) {
  const router = Router();

  router.post("/login", loginLimiter, asyncHandler(controller.login));
  router.post("/refresh", refreshLimiter, asyncHandler(controller.refresh));
  router.post("/logout", asyncHandler(controller.logout));
  router.get("/me", authMiddleware, asyncHandler(controller.me));

  return router;
}

export const authRoutes = createAuthRoutes();
