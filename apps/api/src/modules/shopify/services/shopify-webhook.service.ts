import type { Prisma } from "@prisma/client";
import { logger } from "../../../lib/logger.js";
import { AutomationEventQueueService } from "../../queues/services/automation-event-queue.service.js";
import {
  adaptShopifyWebhook,
  isSupportedShopifyTopic,
  routeTopicToShopifyTopic
} from "../adapters/shopify-webhook.adapter.js";
import { shopifyRouteTopicSchema } from "../dto/shopify-webhook.dto.js";
import type { ShopifyRouteTopic, ShopifyWebhookHeaders } from "../domain/shopify.types.js";
import { IncomingEventRepository } from "../repository/incoming-event.repository.js";
import { ShopifyEventService } from "./shopify-event.service.js";
import { ShopifyWebhookVerificationService } from "./shopify-webhook-verification.service.js";

export class ShopifyWebhookService {
  constructor(
    private readonly incomingEvents = new IncomingEventRepository(),
    private readonly queue = new AutomationEventQueueService(),
    private readonly verifier = new ShopifyWebhookVerificationService(),
    private readonly eventService = new ShopifyEventService()
  ) {}

  async handleWebhook(input: {
    routeTopic: string;
    headers: ShopifyWebhookHeaders;
    rawBody?: Buffer | undefined;
    payload: unknown;
  }) {
    this.verifier.verify(input.rawBody, input.headers.hmac);

    const routeTopic = shopifyRouteTopicSchema.safeParse(input.routeTopic);
    if (!routeTopic.success) {
      logger.info({ event: "shopify_webhook.ignored", routeTopic: input.routeTopic });
      return { data: { status: "ignored" as const } };
    }

    const payload = toPayloadRecord(input.payload);
    const topic =
      input.headers.topic && isSupportedShopifyTopic(input.headers.topic)
        ? input.headers.topic
        : routeTopicToShopifyTopic(routeTopic.data as ShopifyRouteTopic);
    const event = adaptShopifyWebhook(topic, payload);

    if (!event || !event.resourceId) {
      logger.info({ event: "shopify_webhook.ignored", topic });
      return { data: { status: "ignored" as const } };
    }

    const externalEventId =
      this.eventService.getExternalEventId(input.headers) ??
      this.eventService.buildFallbackExternalEventId(
        topic,
        event.eventType,
        event.resourceId,
        input.headers.triggeredAt
      );

    if (externalEventId) {
      const existing = await this.incomingEvents.findBySourceAndExternalEventId(event.source, externalEventId);
      if (existing) {
        if (existing.errorMessage) {
          const idempotencyKey = this.eventService.buildQueueIdempotencyKey(event, externalEventId);
          await this.queue.addEventProcessingJob({
            incomingEventId: existing.id,
            ...(idempotencyKey ? { idempotencyKey } : {})
          });
          await this.incomingEvents.updateErrorMessage(existing.id, null);

          return { data: { status: "queued" as const, incomingEventId: existing.id } };
        }

        logger.info({ event: "shopify_webhook.duplicate", incomingEventId: existing.id, externalEventId });
        return { data: { status: "duplicate" as const, incomingEventId: existing.id } };
      }
    }

    const incomingEvent = await this.incomingEvents.createIncomingEvent({
      source: event.source,
      eventType: event.eventType,
      externalEventId: externalEventId ?? null,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      customerPhone: event.customerPhone ?? null,
      payloadJson: payload as Prisma.InputJsonValue
    });

    try {
      const idempotencyKey = this.eventService.buildQueueIdempotencyKey(event, externalEventId);
      await this.queue.addEventProcessingJob({
        incomingEventId: incomingEvent.id,
        ...(idempotencyKey ? { idempotencyKey } : {})
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to enqueue automation event.";
      await this.incomingEvents.updateErrorMessage(incomingEvent.id, message);
      throw error;
    }

    return { data: { status: "queued" as const, incomingEventId: incomingEvent.id } };
  }
}

function toPayloadRecord(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
  return payload as Record<string, unknown>;
}
