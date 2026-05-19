import { TemplateHeaderFormat } from "@prisma/client";
import { BODY_TEXT_MAX_LENGTH, FOOTER_TEXT_MAX_LENGTH, HEADER_TEXT_MAX_LENGTH } from "./template.constants.js";
import type { CreateTemplateInput, TemplateValidationError } from "./template.types.js";

export function validateTemplateComponents(input: CreateTemplateInput): TemplateValidationError[] {
  const errors: TemplateValidationError[] = [];
  const { header, body, footer } = input.components;

  if (!body?.text?.trim()) {
    errors.push({ field: "components.body.text", message: "Body text is required." });
  } else if (body.text.trim().length > BODY_TEXT_MAX_LENGTH) {
    errors.push({
      field: "components.body.text",
      message: `Body text must be ${BODY_TEXT_MAX_LENGTH} characters or less.`
    });
  }

  if (header) {
    if (header.format !== TemplateHeaderFormat.NONE && header.format !== TemplateHeaderFormat.TEXT) {
      errors.push({
        field: "components.header.format",
        message: "Only NONE and TEXT headers are supported for text templates."
      });
    }

    if (header.format === TemplateHeaderFormat.TEXT && !header.text?.trim()) {
      errors.push({ field: "components.header.text", message: "Header text is required when header format is TEXT." });
    }

    if (header.text && header.text.trim().length > HEADER_TEXT_MAX_LENGTH) {
      errors.push({
        field: "components.header.text",
        message: `Header text must be ${HEADER_TEXT_MAX_LENGTH} characters or less.`
      });
    }
  }

  if (footer?.text && footer.text.trim().length > FOOTER_TEXT_MAX_LENGTH) {
    errors.push({
      field: "components.footer.text",
      message: `Footer text must be ${FOOTER_TEXT_MAX_LENGTH} characters or less.`
    });
  }

  if (footer?.text?.includes("{{")) {
    errors.push({
      field: "components.footer.text",
      message: "Footer variables are not supported for the text template MVP."
    });
  }

  return errors;
}
