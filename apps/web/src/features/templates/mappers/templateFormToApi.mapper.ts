import type { CreateTemplateFormValues, CreateTemplatePayload, TemplateVariable } from "../types/template.types";

export function mapTemplateFormToApiPayload(
  values: CreateTemplateFormValues,
  detectedVariables: TemplateVariable[]
): CreateTemplatePayload {
  if (!values.category || values.type !== "TEXT") {
    throw new Error("Cannot map invalid template form values.");
  }

  const components: CreateTemplatePayload["components"] = {
    body: {
      text: values.bodyText.trim()
    },
    buttons: values.buttons.map((button) => {
      const mappedButton = {
        type: button.type as Extract<typeof button.type, "QUICK_REPLY" | "URL" | "PHONE_NUMBER">,
        text: button.text.trim()
      };

      if (button.type === "URL") {
        return { ...mappedButton, url: button.value?.trim() ?? "" };
      }
      if (button.type === "PHONE_NUMBER") {
        return { ...mappedButton, phoneNumber: button.value?.trim() ?? "" };
      }

      return mappedButton;
    })
  };

  if (values.headerFormat === "TEXT" && values.headerText?.trim()) {
    components.header = {
      format: "TEXT",
      text: values.headerText.trim()
    };
  }

  if (values.footerText?.trim()) {
    components.footer = { text: values.footerText.trim() };
  }

  return {
    name: values.name.trim(),
    displayName: values.displayName.trim(),
    category: values.category,
    type: "TEXT",
    languageCode: values.languageCode.trim(),
    components,
    variables: detectedVariables.map((variable) => ({
      componentType: "BODY",
      position: variable.index,
      placeholder: variable.token,
      sampleValue: values.variableSamples[variable.token]?.trim() ?? ""
    }))
  };
}
