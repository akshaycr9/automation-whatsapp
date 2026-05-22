import { AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";
import {
  adaptWhatsAppButtonReply,
  extractButtonReply,
  parseAutomationButtonPayload
} from "../adapters/whatsapp-button-reply.adapter.js";

it("parses COD confirm button payloads", () => {
  expect(parseAutomationButtonPayload("COD_CONFIRM:ORDER:123456789")).toEqual({
    actionKey: "COD_CONFIRM",
    resourceType: "ORDER",
    resourceId: "123456789"
  });
});

it("parses COD cancel button payloads", () => {
  expect(parseAutomationButtonPayload("COD_CANCEL:ORDER:123456789")).toEqual({
    actionKey: "COD_CANCEL",
    resourceType: "ORDER",
    resourceId: "123456789"
  });
});

it("rejects invalid button payloads", () => {
  expect(parseAutomationButtonPayload("TRACK:ORDER:123")).toBeNull();
  expect(parseAutomationButtonPayload("COD_CONFIRM:CUSTOMER:123")).toBeNull();
  expect(parseAutomationButtonPayload("COD_CONFIRM:ORDER")).toBeNull();
});

it("extracts interactive button reply id and title", () => {
  expect(
    extractButtonReply({
      from: "919999999999",
      id: "wamid.confirm.test",
      timestamp: "1710000000",
      type: "interactive",
      interactive: {
        type: "button_reply",
        button_reply: {
          id: "COD_CONFIRM:ORDER:123456789",
          title: "Confirm my order"
        }
      }
    })
  ).toEqual({
    messageId: "wamid.confirm.test",
    from: "919999999999",
    timestamp: "1710000000",
    buttonPayload: "COD_CONFIRM:ORDER:123456789",
    buttonText: "Confirm my order"
  });
});

it("extracts fallback button payload and text", () => {
  expect(
    extractButtonReply({
      from: "919999999999",
      id: "wamid.cancel.test",
      timestamp: "1710000001",
      type: "button",
      button: {
        payload: "COD_CANCEL:ORDER:123456789",
        text: "Cancel my order"
      }
    })
  ).toEqual(
    expect.objectContaining({
      buttonPayload: "COD_CANCEL:ORDER:123456789",
      buttonText: "Cancel my order"
    })
  );
});

it("creates an internal automation event for a valid button reply", () => {
  const event = adaptWhatsAppButtonReply({
    from: "+919999999999",
    id: "wamid.confirm.test",
    timestamp: "1710000000",
    interactive: {
      button_reply: {
        id: "COD_CONFIRM:ORDER:123456789",
        title: "Confirm my order"
      }
    }
  });

  expect(event).toEqual(
    expect.objectContaining({
      source: AutomationTriggerSource.WHATSAPP,
      eventType: AutomationTriggerEvent.BUTTON_REPLY,
      resourceId: "123456789",
      customerPhone: "919999999999",
      action: expect.objectContaining({
        type: "BUTTON_REPLY",
        actionKey: "COD_CONFIRM",
        payload: "COD_CONFIRM:ORDER:123456789",
        text: "Confirm my order"
      }),
      data: expect.objectContaining({
        whatsapp: expect.objectContaining({
          messageId: "wamid.confirm.test",
          from: "919999999999"
        }),
        order: { id: "123456789" }
      })
    })
  );
});

it("ignores unsupported message types", () => {
  expect(adaptWhatsAppButtonReply({ type: "text", text: { body: "hello" } })).toBeNull();
});
