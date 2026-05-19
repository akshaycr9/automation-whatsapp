import { MetaMessagesWebhookHandler } from "./handlers/meta-messages.handler.js";
import { MetaTemplateStatusWebhookHandler } from "./handlers/meta-template-status.handler.js";
import type {
  MetaWebhookChange,
  MetaWebhookEntry,
  MetaWebhookFieldHandler,
  MetaWebhookPayload
} from "./meta-webhook.types.js";

export class WebhooksService {
  private readonly handlers: Map<string, MetaWebhookFieldHandler>;

  constructor(
    handlers: MetaWebhookFieldHandler[] = [new MetaTemplateStatusWebhookHandler(), new MetaMessagesWebhookHandler()]
  ) {
    this.handlers = new Map(handlers.map((handler) => [handler.field, handler]));
  }

  async handleMetaWebhook(payload: unknown) {
    const body = toMetaWebhookPayload(payload);
    const fields = [
      ...new Set((body.entry ?? []).flatMap((entry) => entry.changes?.map((change) => change.field ?? "") ?? []))
    ];
    let processedCount = 0;
    let ignoredCount = 0;

    for (const field of fields) {
      const fieldPayload = filterPayloadByField(body, field);
      const handler = this.handlers.get(field);

      if (!handler) {
        ignoredCount += countChanges(fieldPayload);
        continue;
      }

      const result = await handler.handle(fieldPayload);
      processedCount += result.processedCount;
      ignoredCount += result.ignoredCount ?? 0;
    }

    return {
      data: {
        processedCount,
        ignoredCount,
        fields
      },
      message: "Webhook received"
    };
  }
}

function toMetaWebhookPayload(payload: unknown): MetaWebhookPayload {
  const body = payload as MetaWebhookPayload;
  return {
    entry: Array.isArray(body.entry) ? body.entry : []
  };
}

function filterPayloadByField(payload: MetaWebhookPayload, field: string): MetaWebhookPayload {
  return {
    entry: (payload.entry ?? [])
      .map((entry): MetaWebhookEntry => {
        const changes = (entry.changes ?? []).filter((change): change is MetaWebhookChange => change.field === field);
        return {
          ...entry,
          changes
        };
      })
      .filter((entry) => (entry.changes?.length ?? 0) > 0)
  };
}

function countChanges(payload: MetaWebhookPayload) {
  return (payload.entry ?? []).reduce((total, entry) => total + (entry.changes?.length ?? 0), 0);
}
