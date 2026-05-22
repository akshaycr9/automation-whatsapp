import { adaptWhatsAppButtonReply } from "./whatsapp-button-reply.adapter.js";
import type { InternalAutomationEvent, WhatsAppWebhookMessage } from "../domain/whatsapp.types.js";

export type WhatsAppAdaptedMessageEvent = {
  message: WhatsAppWebhookMessage;
  event: InternalAutomationEvent;
};

export function parseWhatsAppWebhookPayload(payload: unknown): WhatsAppWebhookMessage[] {
  const body = readObject(payload);
  const entries = Array.isArray(body.entry) ? body.entry : [];

  return entries.flatMap((entry) => {
    const entryRecord = readObject(entry);
    const changes = Array.isArray(entryRecord.changes) ? entryRecord.changes.filter(isRecord) : [];

    return changes.flatMap((change) => {
      const value = readObject(change.value);
      return Array.isArray(value.messages) ? value.messages.filter(isRecord) : [];
    });
  });
}

export function adaptWhatsAppWebhook(payload: unknown): WhatsAppAdaptedMessageEvent[] {
  return parseWhatsAppWebhookPayload(payload).flatMap((message) => {
    const event = adaptWhatsAppButtonReply(message);
    return event ? [{ message, event }] : [];
  });
}

function isRecord(value: unknown): value is WhatsAppWebhookMessage {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
