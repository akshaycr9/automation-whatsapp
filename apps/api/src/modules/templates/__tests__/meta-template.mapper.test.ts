import {
  TemplateButtonType,
  TemplateCategory,
  TemplateComponentType,
  TemplateHeaderFormat,
  TemplateType
} from "@prisma/client";
import { mapCreateTemplateInputToMetaPayload } from "../providers/meta/meta-template.mapper.js";

it("builds a Meta TEXT template payload with examples and buttons", () => {
  const payload = mapCreateTemplateInputToMetaPayload({
    name: "order_confirmation_v1",
    displayName: "Order Confirmation",
    category: TemplateCategory.UTILITY,
    type: TemplateType.TEXT,
    languageCode: "en",
    components: {
      header: { format: TemplateHeaderFormat.TEXT, text: "Order confirmed" },
      body: { text: "Hi {{1}}, your order {{2}} is confirmed." },
      footer: { text: "Qwertees" },
      buttons: [
        { type: TemplateButtonType.QUICK_REPLY, text: "Thanks" },
        { type: TemplateButtonType.URL, text: "Track", url: "https://example.com/track" },
        { type: TemplateButtonType.PHONE_NUMBER, text: "Call", phoneNumber: "+15555550123" }
      ]
    },
    variables: [
      { componentType: TemplateComponentType.BODY, position: 1, placeholder: "{{1}}", sampleValue: "Akshay" },
      { componentType: TemplateComponentType.BODY, position: 2, placeholder: "{{2}}", sampleValue: "#QW12345" }
    ]
  });

  expect(payload).toEqual({
    name: "order_confirmation_v1",
    language: "en",
    category: TemplateCategory.UTILITY,
    allow_category_change: false,
    components: [
      { type: "HEADER", format: "TEXT", text: "Order confirmed" },
      {
        type: "BODY",
        text: "Hi {{1}}, your order {{2}} is confirmed.",
        example: { body_text: [["Akshay", "#QW12345"]] }
      },
      { type: "FOOTER", text: "Qwertees" },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "Thanks" },
          { type: "URL", text: "Track", url: "https://example.com/track" },
          { type: "PHONE_NUMBER", text: "Call", phone_number: "+15555550123" }
        ]
      }
    ]
  });
});
