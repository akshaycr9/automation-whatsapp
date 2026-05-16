import { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ error: { message: error.message } });
    return;
  }

  logger.error(error);
  res.status(500).json({ error: { message: "Internal server error" } });
};
