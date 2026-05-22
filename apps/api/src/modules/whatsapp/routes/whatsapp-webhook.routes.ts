import { Router } from "express";
import { asyncHandler } from "../../../lib/async-handler.js";
import { WhatsAppWebhookVerificationService } from "../services/whatsapp-webhook-verification.service.js";
import { WhatsAppWebhookService } from "../services/whatsapp-webhook.service.js";

export function createWhatsAppWebhookRoutes(
  service = new WhatsAppWebhookService(),
  verifier = new WhatsAppWebhookVerificationService()
) {
  const router = Router();

  router.get("/whatsapp", (req, res) => {
    const challenge = verifier.verifyChallenge({
      mode: readQuery(req.query["hub.mode"]),
      verifyToken: readQuery(req.query["hub.verify_token"]),
      challenge: readQuery(req.query["hub.challenge"])
    });

    res.status(200).send(challenge);
  });

  router.post(
    "/whatsapp",
    asyncHandler(async (req, res) => {
      verifier.verifySignature(req);
      const result = await service.handleWebhook(req.body);

      res.status(200).json(result);
    })
  );

  return router;
}

function readQuery(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
