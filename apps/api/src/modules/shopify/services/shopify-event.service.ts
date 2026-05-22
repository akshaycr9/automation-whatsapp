import type { AutomationTriggerEvent } from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/shopify.types.js";

export class ShopifyEventService {
  getExternalEventId(headers: { eventId?: string | undefined; webhookId?: string | undefined }) {
    return headers.eventId ?? headers.webhookId;
  }

  buildQueueIdempotencyKey(event: InternalAutomationEvent, externalEventId?: string) {
    const id = externalEventId ?? event.resourceId;
    return id ? `SHOPIFY:${event.eventType}:${id}` : undefined;
  }

  buildFallbackExternalEventId(
    topic: string,
    eventType: AutomationTriggerEvent,
    resourceId?: string,
    triggeredAt?: string
  ) {
    if (!resourceId || !triggeredAt) return undefined;
    return `${topic}:${eventType}:${resourceId}:${triggeredAt}`;
  }
}
