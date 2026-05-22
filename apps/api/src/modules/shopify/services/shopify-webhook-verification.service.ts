import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../../config/env.js";
import { HttpError } from "../../../lib/http-error.js";

export class ShopifyWebhookVerificationService {
  verify(rawBody: Buffer | undefined, signature: string | undefined) {
    if (!env.SHOPIFY_WEBHOOK_SECRET) {
      throw new HttpError(401, "Shopify webhook verification is not configured.", "SHOPIFY_WEBHOOK_UNVERIFIED");
    }

    if (!rawBody) {
      throw new HttpError(
        401,
        "Raw webhook body is required for signature verification.",
        "SHOPIFY_WEBHOOK_UNVERIFIED"
      );
    }

    if (!signature) {
      throw new HttpError(401, "Invalid Shopify webhook signature.", "SHOPIFY_WEBHOOK_INVALID_SIGNATURE");
    }

    const expected = createHmac("sha256", env.SHOPIFY_WEBHOOK_SECRET).update(rawBody).digest("base64");
    const expectedBuffer = Buffer.from(expected, "utf8");
    const receivedBuffer = Buffer.from(signature, "utf8");

    if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
      throw new HttpError(401, "Invalid Shopify webhook signature.", "SHOPIFY_WEBHOOK_INVALID_SIGNATURE");
    }
  }
}
