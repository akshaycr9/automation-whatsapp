import { adaptWhatsAppWebhook, parseWhatsAppWebhookPayload } from "../adapters/whatsapp-webhook.adapter.js";

const confirmPayload = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "WABA_ID",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            messages: [
              {
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
              }
            ]
          }
        }
      ]
    }
  ]
};

it("extracts messages from entry changes", () => {
  expect(parseWhatsAppWebhookPayload(confirmPayload)).toEqual([
    expect.objectContaining({
      id: "wamid.confirm.test",
      from: "919999999999"
    })
  ]);
});

it("adapts supported WhatsApp webhook messages", () => {
  expect(adaptWhatsAppWebhook(confirmPayload)).toEqual([
    expect.objectContaining({
      event: expect.objectContaining({
        resourceId: "123456789",
        customerPhone: "919999999999"
      })
    })
  ]);
});

it("ignores unsupported webhook messages", () => {
  expect(
    adaptWhatsAppWebhook({
      entry: [{ changes: [{ value: { messages: [{ id: "wamid.text.test", type: "text" }] } }] }]
    })
  ).toEqual([]);
});
