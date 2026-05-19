import type { Request, Response } from "express";
import { verifyMetaWebhookSignature } from "./meta-webhook-signature.js";
import { WebhooksService } from "./webhooks.service.js";

export class WebhooksController {
  constructor(private readonly webhooksService = new WebhooksService()) {}

  metaTemplateStatus = async (req: Request, res: Response) => {
    verifyMetaWebhookSignature(req);
    const result = await this.webhooksService.handleMetaTemplateStatus(req.body);

    res.status(200).json(result);
  };
}
