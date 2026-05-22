import { AutomationTriggerEvent, AutomationTriggerSource, type IncomingEvent } from "@prisma/client";
import { logger } from "../../../lib/logger.js";
import { IncomingEventRepository } from "../../incoming-events/incoming-event.repository.js";
import { adaptShopifyCheckoutWebhook } from "../../shopify/adapters/shopify-checkout.adapter.js";
import { adaptShopifyOrderWebhook } from "../../shopify/adapters/shopify-order.adapter.js";
import { adaptWhatsAppButtonReply } from "../../whatsapp/adapters/whatsapp-button-reply.adapter.js";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import { AutomationEngineService } from "./automation-engine.service.js";

export class AutomationEventProcessorService {
  constructor(
    private readonly incomingEvents = new IncomingEventRepository(),
    private readonly engine = new AutomationEngineService()
  ) {}

  async processIncomingEvent(incomingEventId: string) {
    const incomingEvent = await this.incomingEvents.findById(incomingEventId);

    if (!incomingEvent) {
      throw new Error(`Incoming event not found: ${incomingEventId}`);
    }

    if (incomingEvent.isProcessed) {
      logger.info({ event: "incoming_event.already_processed", incomingEventId });
      return { status: "already_processed" as const };
    }

    try {
      const event = this.toInternalAutomationEvent(incomingEvent);

      if (!event) {
        await this.incomingEvents.markProcessed(incomingEvent.id);
        return { status: "ignored" as const };
      }

      await this.engine.handleEvent(event, incomingEvent);
      await this.incomingEvents.markProcessed(incomingEvent.id);

      return { status: "processed" as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process incoming event.";
      await this.incomingEvents.markFailed(incomingEvent.id, message);
      throw error;
    }
  }

  private toInternalAutomationEvent(incomingEvent: IncomingEvent): InternalAutomationEvent | null {
    const payload = toPayloadRecord(incomingEvent.payloadJson);

    if (incomingEvent.source === AutomationTriggerSource.SHOPIFY) {
      if (incomingEvent.eventType === AutomationTriggerEvent.CHECKOUT_ABANDONED) {
        return adaptShopifyCheckoutWebhook(payload) as InternalAutomationEvent | null;
      }

      return adaptShopifyOrderWebhook(payload, incomingEvent.eventType) as InternalAutomationEvent;
    }

    if (incomingEvent.source === AutomationTriggerSource.WHATSAPP) {
      return adaptWhatsAppButtonReply(payload) as InternalAutomationEvent | null;
    }

    return null;
  }
}

function toPayloadRecord(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
  return payload as Record<string, unknown>;
}
