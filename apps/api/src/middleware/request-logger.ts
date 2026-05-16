import { RequestHandler } from "express";
import { logger } from "../lib/logger.js";

export const requestLogger: RequestHandler = (req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
};
