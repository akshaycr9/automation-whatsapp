import { describe, expect, it } from "vitest";
import type { CreateTemplateFormValues, TemplateButton } from "../types/template.types";
import {
  areVariablesSequential,
  extractTemplateVariables,
  findInvalidVariableSyntax,
  replaceVariablesWithSamples
} from "../utils/templateVariables";
import { isValidTemplateName, validateCreateTemplateForm, validateTemplateButtons } from "../utils/templateValidation";
import { mapTemplateFormToApiPayload } from "../mappers/templateFormToApi.mapper";

const baseForm: CreateTemplateFormValues = {
  name: "order_confirmation_v1",
  displayName: "Order confirmation",
  category: "UTILITY",
  languageCode: "en",
  type: "TEXT",
  headerFormat: "NONE",
  headerText: "",
  bodyText: "Hi {{1}}, your order {{2}} is confirmed.",
  footerText: "",
  buttons: [],
  variableSamples: {
    "{{1}}": "Akshay",
    "{{2}}": "#QW12345"
  }
};

describe("template validation utilities", () => {
  it("validates template names", () => {
    expect(isValidTemplateName("order_confirmation_v1")).toBe(true);
    expect(isValidTemplateName("Order Confirmation")).toBe(false);
    expect(isValidTemplateName("order-confirmation")).toBe(false);
    expect(isValidTemplateName("_order_confirmation")).toBe(false);
  });

  it("extracts and validates sequential variables", () => {
    const variables = extractTemplateVariables("Hi {{1}}, order {{2}}");

    expect(variables.map((variable) => variable.token)).toEqual(["{{1}}", "{{2}}"]);
    expect(areVariablesSequential(variables)).toBe(true);
    expect(areVariablesSequential(extractTemplateVariables("Hi {{1}}, order {{3}}"))).toBe(false);
  });

  it("finds invalid variable syntax", () => {
    expect(findInvalidVariableSyntax("Hi {{name}} and {1}")).toEqual(["{{name}}", "{1}"]);
  });

  it("replaces variables with samples", () => {
    expect(replaceVariablesWithSamples("Hi {{1}}", { "{{1}}": "Akshay" })).toBe("Hi Akshay");
  });

  it("validates button fields", () => {
    const buttons: TemplateButton[] = [{ id: "one", type: "URL", text: "Track", value: "not-a-url" }];
    const errors: Record<string, string[]> = {};

    validateTemplateButtons(buttons, errors);

    expect(errors["buttons.0"]).toContain("Enter a valid URL starting with http:// or https://.");
  });

  it("returns invalid for missing variable samples", () => {
    const result = validateCreateTemplateForm({
      ...baseForm,
      variableSamples: {
        "{{1}}": "Akshay"
      }
    });

    expect(result.isValid).toBe(false);
    expect(result.errors["variables.{{2}}"]).toContain("Sample value is required for {{2}}.");
  });

  it("maps a valid form to the normalized frontend payload", () => {
    const variables = extractTemplateVariables(baseForm.bodyText);
    const payload = mapTemplateFormToApiPayload(baseForm, variables);

    expect(payload.components.body.text).toBe(baseForm.bodyText);
    expect(payload.variables).toEqual([
      { componentType: "BODY", position: 1, placeholder: "{{1}}", sampleValue: "Akshay" },
      { componentType: "BODY", position: 2, placeholder: "{{2}}", sampleValue: "#QW12345" }
    ]);
  });
});
