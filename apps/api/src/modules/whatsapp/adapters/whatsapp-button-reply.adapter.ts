import { AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";
import { WHATSAPP_BUTTON_ACTION_KEYS, WHATSAPP_BUTTON_RESOURCE_TYPES } from "../domain/whatsapp.constants.js";
import type {
  InternalAutomationEvent,
  ParsedAutomationButtonPayload,
  WhatsAppButtonReply,
  WhatsAppWebhookMessage
} from "../domain/whatsapp.types.js";

export function adaptWhatsAppButtonReply(message: WhatsAppWebhookMessage): InternalAutomationEvent | null {
  const reply = extractButtonReply(message);
  if (!reply) return null;

  const parsedPayload = parseAutomationButtonPayload(reply.buttonPayload);
  if (!parsedPayload) return null;

  const phone = normalizePhone(reply.from);

  return {
    source: AutomationTriggerSource.WHATSAPP,
    eventType: AutomationTriggerEvent.BUTTON_REPLY,
    resourceType: AutomationResourceType.ORDER,
    resourceId: parsedPayload.resourceId,
    customerPhone: phone,
    action: {
      type: "BUTTON_REPLY",
      actionKey: parsedPayload.actionKey,
      payload: reply.buttonPayload,
      text: reply.buttonText
    },
    data: {
      whatsapp: {
        messageId: reply.messageId,
        from: phone,
        timestamp: reply.timestamp,
        buttonText: reply.buttonText,
        buttonPayload: reply.buttonPayload
      },
      customer: {
        phone
      },
      order: {
        id: parsedPayload.resourceId
      }
    }
  };
}

export function extractButtonReply(message: WhatsAppWebhookMessage): WhatsAppButtonReply | null {
  const interactive = readObject(message.interactive);
  const interactiveButtonReply = readObject(interactive.button_reply);
  const fallbackButton = readObject(message.button);
  const interactivePayload = readString(interactiveButtonReply.id);
  const fallbackPayload = readString(fallbackButton.payload);
  const buttonPayload = interactivePayload ?? fallbackPayload;

  if (!buttonPayload) return null;

  return {
    messageId: readString(message.id),
    from: readString(message.from),
    timestamp: readString(message.timestamp),
    buttonPayload,
    buttonText: readString(interactiveButtonReply.title) ?? readString(fallbackButton.text)
  };
}

export function parseAutomationButtonPayload(payload: string): ParsedAutomationButtonPayload | null {
  const [actionKey, resourceType, ...resourceIdParts] = payload.split(":");
  const resourceId = resourceIdParts.join(":");

  if (
    !isSupportedActionKey(actionKey) ||
    !isSupportedResourceType(resourceType) ||
    resourceIdParts.length !== 1 ||
    !resourceId
  ) {
    return null;
  }

  return {
    actionKey,
    resourceType,
    resourceId
  };
}

export function normalizePhone(phone: string | undefined) {
  return phone?.startsWith("+") ? phone.slice(1) : phone;
}

function isSupportedActionKey(value: string | undefined): value is ParsedAutomationButtonPayload["actionKey"] {
  return WHATSAPP_BUTTON_ACTION_KEYS.includes(value as ParsedAutomationButtonPayload["actionKey"]);
}

function isSupportedResourceType(value: string | undefined): value is ParsedAutomationButtonPayload["resourceType"] {
  return WHATSAPP_BUTTON_RESOURCE_TYPES.includes(value as ParsedAutomationButtonPayload["resourceType"]);
}

function readString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
