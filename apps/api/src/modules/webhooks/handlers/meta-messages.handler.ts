import type { MetaWebhookFieldHandler, MetaWebhookPayload } from "../meta-webhook.types.js";

export class MetaMessagesWebhookHandler implements MetaWebhookFieldHandler {
  readonly field = "messages";

  async handle(payload: MetaWebhookPayload) {
    let ignoredCount = 0;

    for (const entry of payload.entry ?? []) {
      ignoredCount += entry.changes?.length ?? 0;
    }

    return {
      processedCount: 0,
      ignoredCount
    };
  }
}
