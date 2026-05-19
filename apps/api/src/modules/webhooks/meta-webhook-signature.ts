import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

export function verifyMetaWebhookSignature(req: Request) {
  if (env.META_WEBHOOK_VERIFY_DISABLED && env.NODE_ENV !== "production") {
    return;
  }

  if (!env.META_APP_SECRET) {
    throw new HttpError(401, "Meta webhook signature verification is not configured.", "META_WEBHOOK_UNVERIFIED");
  }

  const rawBody = (req as RawBodyRequest).rawBody;
  if (!rawBody) {
    throw new HttpError(401, "Raw webhook body is required for signature verification.", "META_WEBHOOK_UNVERIFIED");
  }

  const signatureHeader = req.header("x-hub-signature-256");
  if (!signatureHeader?.startsWith("sha256=")) {
    throw new HttpError(401, "Invalid Meta webhook signature.", "META_WEBHOOK_INVALID_SIGNATURE");
  }

  const expected = createHmac("sha256", env.META_APP_SECRET).update(rawBody).digest("hex");
  const received = signatureHeader.slice("sha256=".length);
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");

  if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
    throw new HttpError(401, "Invalid Meta webhook signature.", "META_WEBHOOK_INVALID_SIGNATURE");
  }
}
