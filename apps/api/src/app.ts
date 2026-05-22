import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { requestLogger } from "./middleware/request-logger.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { automationsRoutes } from "./modules/automations/automations.routes.js";
import { templatesRoutes } from "./modules/templates/templates.routes.js";
import { webhooksRoutes } from "./modules/webhooks/webhooks.routes.js";

function isAllowedDevOrigin(origin: string) {
  return /^http:\/\/(localhost|127\.0\.0\.1|\d{1,3}(?:\.\d{1,3}){3}):5173$/.test(origin);
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || origin === env.WEB_APP_URL || (env.NODE_ENV === "development" && isAllowedDevOrigin(origin))) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      }
    })
  );
  app.use(cookieParser());
  app.use(
    express.json({
      limit: "1mb",
      verify(req, _res, buf) {
        (req as typeof req & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
      }
    })
  );
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.json({ data: { status: "ok" } });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/automations", automationsRoutes);
  app.use("/api/templates", templatesRoutes);
  app.use("/api/webhooks", webhooksRoutes);
  app.use("/webhooks", webhooksRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
