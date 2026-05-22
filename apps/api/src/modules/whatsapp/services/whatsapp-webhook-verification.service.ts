import type { Request } from "express";
import { env } from "../../../config/env.js";
import { HttpError } from "../../../lib/http-error.js";
import { verifyMetaWebhookSignature } from "../../webhooks/meta-webhook-signature.js";

export class WhatsAppWebhookVerificationService {
  verifyChallenge(input: {
    mode?: string | undefined;
    verifyToken?: string | undefined;
    challenge?: string | undefined;
  }) {
    if (
      input.mode !== "subscribe" ||
      !input.challenge ||
      !env.META_VERIFY_TOKEN ||
      input.verifyToken !== env.META_VERIFY_TOKEN
    ) {
      throw new HttpError(403, "WhatsApp webhook verification failed.", "WHATSAPP_WEBHOOK_VERIFY_FAILED");
    }

    return input.challenge;
  }

  verifySignature(req: Request) {
    if (!env.META_APP_SECRET) return;

    verifyMetaWebhookSignature(req);
  }
}
