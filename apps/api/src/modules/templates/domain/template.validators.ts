import { TemplateCategory, TemplateType } from "@prisma/client";
import { SUPPORTED_TEMPLATE_TYPES_FOR_CREATE, TEMPLATE_NAME_MAX_LENGTH } from "./template.constants.js";
import { validateTemplateButtons } from "./template-button.validator.js";
import { validateTemplateComponents } from "./template-component.validator.js";
import type { CreateTemplateInput, TemplateValidationError, TemplateValidationResult } from "./template.types.js";
import { validateTemplateVariables } from "./template-variable.validator.js";

const TEMPLATE_NAME_PATTERN = /^[a-z0-9_]+$/;

export function isValidTemplateName(name: string) {
  return TEMPLATE_NAME_PATTERN.test(name) && name.length <= TEMPLATE_NAME_MAX_LENGTH;
}

export function validateTemplateName(name: string): TemplateValidationError[] {
  const errors: TemplateValidationError[] = [];

  if (!name?.trim()) {
    errors.push({ field: "name", message: "Template name is required." });
    return errors;
  }

  if (name !== name.trim()) {
    errors.push({ field: "name", message: "Template name cannot include leading or trailing whitespace." });
  }

  if (!TEMPLATE_NAME_PATTERN.test(name)) {
    errors.push({
      field: "name",
      message: "Template name must contain only lowercase letters, numbers, and underscores."
    });
  }

  if (name.length > TEMPLATE_NAME_MAX_LENGTH) {
    errors.push({ field: "name", message: `Template name must be ${TEMPLATE_NAME_MAX_LENGTH} characters or less.` });
  }

  return errors;
}

export function validateTemplateMetadata(input: CreateTemplateInput): TemplateValidationError[] {
  const errors: TemplateValidationError[] = [];

  if (!Object.values(TemplateCategory).includes(input.category)) {
    errors.push({ field: "category", message: "Template category is required and must be valid." });
  }

  if (!Object.values(TemplateType).includes(input.type)) {
    errors.push({ field: "type", message: "Template type is required and must be valid." });
  } else if (
    !SUPPORTED_TEMPLATE_TYPES_FOR_CREATE.includes(input.type as (typeof SUPPORTED_TEMPLATE_TYPES_FOR_CREATE)[number])
  ) {
    errors.push({ field: "type", message: "Only TEXT templates are supported for creation in this phase." });
  }

  if (!input.languageCode?.trim()) {
    errors.push({ field: "languageCode", message: "Template language code is required." });
  }

  return errors;
}

export function validateCreateTemplateInput(input: CreateTemplateInput): TemplateValidationResult {
  const errors = [
    ...validateTemplateName(input.name),
    ...validateTemplateMetadata(input),
    ...validateTemplateComponents(input),
    ...validateTemplateVariables(input),
    ...validateTemplateButtons(input.components.buttons)
  ];

  return {
    isValid: errors.length === 0,
    errors
  };
}
