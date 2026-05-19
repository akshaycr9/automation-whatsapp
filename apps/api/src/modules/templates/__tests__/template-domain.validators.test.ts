import { TemplateButtonType, TemplateCategory, TemplateHeaderFormat, TemplateType } from "@prisma/client";
import { validateCreateTemplateInput, validateTemplateName } from "../domain/template.validators.js";
import type { CreateTemplateInput } from "../domain/template.types.js";

function validInput(overrides: Partial<CreateTemplateInput> = {}): CreateTemplateInput {
  return {
    name: "order_confirmation_v1",
    displayName: "Order Confirmation",
    category: TemplateCategory.UTILITY,
    type: TemplateType.TEXT,
    languageCode: "en",
    components: {
      header: {
        format: TemplateHeaderFormat.TEXT,
        text: "Order confirmed"
      },
      body: {
        text: "Hi {{1}}, your order {{2}} is confirmed."
      },
      buttons: [
        {
          type: TemplateButtonType.URL,
          text: "Track order",
          url: "https://example.com/track"
        }
      ]
    },
    variables: [
      {
        componentType: "BODY",
        position: 1,
        placeholder: "{{1}}",
        sampleValue: "Akshay"
      },
      {
        componentType: "BODY",
        position: 2,
        placeholder: "{{2}}",
        sampleValue: "#QW12345"
      }
    ],
    ...overrides
  };
}

it("accepts valid template names and rejects spaces, hyphens, and uppercase characters", () => {
  expect(validateTemplateName("order_confirmation_v1")).toEqual([]);
  expect(validateTemplateName("Order Confirmation")).toEqual(
    expect.arrayContaining([expect.objectContaining({ field: "name" })])
  );
  expect(validateTemplateName("order-confirmation")).toEqual(
    expect.arrayContaining([expect.objectContaining({ field: "name" })])
  );
});

it("requires body text", () => {
  const result = validateCreateTemplateInput(
    validInput({
      components: {
        body: { text: "" }
      },
      variables: []
    })
  );

  expect(result.isValid).toBe(false);
  expect(result.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "components.body.text" })]));
});

it("rejects skipped variable numbers", () => {
  const result = validateCreateTemplateInput(
    validInput({
      components: {
        body: { text: "Hi {{1}}, your order {{3}} is confirmed." }
      },
      variables: [
        { componentType: "BODY", position: 1, placeholder: "{{1}}", sampleValue: "Akshay" },
        { componentType: "BODY", position: 3, placeholder: "{{3}}", sampleValue: "#QW12345" }
      ]
    })
  );

  expect(result.isValid).toBe(false);
  expect(result.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "variables" })]));
});

it("rejects missing sample values", () => {
  const result = validateCreateTemplateInput(
    validInput({
      variables: [
        { componentType: "BODY", position: 1, placeholder: "{{1}}", sampleValue: "" },
        { componentType: "BODY", position: 2, placeholder: "{{2}}", sampleValue: "#QW12345" }
      ]
    })
  );

  expect(result.isValid).toBe(false);
  expect(result.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "variables" })]));
});

it("rejects unsupported template types", () => {
  const result = validateCreateTemplateInput(validInput({ type: TemplateType.MEDIA }));

  expect(result.isValid).toBe(false);
  expect(result.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: "type" })]));
});

it("rejects invalid URL and phone buttons", () => {
  const result = validateCreateTemplateInput(
    validInput({
      components: {
        body: { text: "Hi {{1}}" },
        buttons: [
          { type: TemplateButtonType.URL, text: "Track", url: "not-a-url" },
          { type: TemplateButtonType.PHONE_NUMBER, text: "Call", phoneNumber: "abc" }
        ]
      },
      variables: [{ componentType: "BODY", position: 1, placeholder: "{{1}}", sampleValue: "Akshay" }]
    })
  );

  expect(result.isValid).toBe(false);
  expect(result.errors).toEqual(
    expect.arrayContaining([expect.objectContaining({ field: "components.buttons.0.url" })])
  );
  expect(result.errors).toEqual(
    expect.arrayContaining([expect.objectContaining({ field: "components.buttons.1.phoneNumber" })])
  );
});
