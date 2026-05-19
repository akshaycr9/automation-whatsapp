import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";
import { verifyMetaWebhookSignature } from "./meta-webhook-signature.js";
import { WebhooksService } from "./webhooks.service.js";

export class WebhooksController {
  constructor(private readonly webhooksService = new WebhooksService()) {}

  metaChallenge = async (req: Request, res: Response) => {
    const mode = readQuery(req, "hub.mode");
    const verifyToken = readQuery(req, "hub.verify_token");
    const challenge = readQuery(req, "hub.challenge");

    if (mode !== "subscribe" || !challenge || verifyToken !== env.META_VERIFY_TOKEN) {
      throw new HttpError(403, "Meta webhook verification failed.", "META_WEBHOOK_VERIFY_FAILED");
    }

    res.status(200).send(challenge);
  };

  meta = async (req: Request, res: Response) => {
    verifyMetaWebhookSignature(req);
    const result = await this.webhooksService.handleMetaWebhook(req.body);

    res.status(200).json(result);
  };
}

function readQuery(req: Request, key: string) {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}
