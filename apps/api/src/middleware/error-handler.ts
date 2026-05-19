import { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    const details = "details" in error ? error.details : undefined;
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(Array.isArray(details) ? { details } : {})
      }
    });
    return;
  }

  logger.error(error);
  res.status(500).json({ error: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" } });
};
