import { z } from "zod";

export const whatsappWebhookChallengeQuerySchema = z.object({
  "hub.mode": z.literal("subscribe"),
  "hub.verify_token": z.string().min(1),
  "hub.challenge": z.string().min(1)
});
