import type { Prisma } from "@prisma/client";
import { logger } from "../../../lib/logger.js";
import { IncomingEventRepository } from "../../incoming-events/incoming-event.repository.js";
import { AutomationEventQueueService } from "../../queues/services/automation-event-queue.service.js";
import { adaptWhatsAppWebhook } from "../adapters/whatsapp-webhook.adapter.js";
import type { InternalAutomationEvent, WhatsAppWebhookMessage } from "../domain/whatsapp.types.js";

export class WhatsAppWebhookService {
  constructor(
    private readonly incomingEvents = new IncomingEventRepository(),
    private readonly queue = new AutomationEventQueueService()
  ) {}

  async handleWebhook(payload: unknown) {
    const adaptedEvents = adaptWhatsAppWebhook(payload);

    if (adaptedEvents.length === 0) {
      logger.info({ event: "whatsapp_webhook.ignored" });
      return { data: { status: "ignored" as const, queuedCount: 0, duplicateCount: 0 } };
    }

    let queuedCount = 0;
    let duplicateCount = 0;

    for (const adapted of adaptedEvents) {
      const externalEventId = this.getExternalEventId(adapted.message, adapted.event);

      if (externalEventId) {
        const existing = await this.incomingEvents.findBySourceAndExternalEventId(
          adapted.event.source,
          externalEventId
        );
        if (existing) {
          duplicateCount += 1;
          logger.info({ event: "whatsapp_webhook.duplicate", incomingEventId: existing.id, externalEventId });
          continue;
        }
      }

      const incomingEvent = await this.incomingEvents.createIncomingEvent({
        source: adapted.event.source,
        eventType: adapted.event.eventType,
        externalEventId: externalEventId ?? null,
        resourceType: adapted.event.resourceType,
        resourceId: adapted.event.resourceId ?? adapted.event.customerPhone ?? "unknown",
        customerPhone: adapted.event.customerPhone ?? null,
        payloadJson: adapted.message as Prisma.InputJsonValue
      });

      try {
        await this.queue.addEventProcessingJob({
          incomingEventId: incomingEvent.id,
          idempotencyKey: this.getQueueIdempotencyKey(adapted.event, externalEventId)
        });
        queuedCount += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to enqueue automation event.";
        await this.incomingEvents.updateErrorMessage(incomingEvent.id, message);
        throw error;
      }
    }

    return { data: { status: "received" as const, queuedCount, duplicateCount } };
  }

  private getExternalEventId(message: WhatsAppWebhookMessage, event: InternalAutomationEvent) {
    const messageId = readString(message.id);
    if (messageId) return messageId;

    const payload = event.action?.payload;
    const timestamp = readString(message.timestamp);
    if (!event.customerPhone || !payload || !timestamp) return undefined;

    return `BUTTON_REPLY:${event.customerPhone}:${payload}:${timestamp}`;
  }

  private getQueueIdempotencyKey(event: InternalAutomationEvent, externalEventId: string | undefined) {
    if (externalEventId) return `WHATSAPP:BUTTON_REPLY:${externalEventId}`;

    const payload = event.action?.payload;
    if (!event.customerPhone || !payload) return `WHATSAPP:BUTTON_REPLY:${event.resourceId}`;

    return `WHATSAPP:BUTTON_REPLY:${event.customerPhone}:${payload}`;
  }
}

function readString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
