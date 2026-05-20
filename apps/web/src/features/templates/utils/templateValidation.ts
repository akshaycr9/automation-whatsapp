import {
  BODY_TEXT_MAX_LENGTH,
  BUTTON_TEXT_MAX_LENGTH,
  FOOTER_TEXT_MAX_LENGTH,
  HEADER_TEXT_MAX_LENGTH,
  TEMPLATE_BUTTON_TOTAL_MAX_COUNT,
  TEMPLATE_CATEGORIES,
  TEMPLATE_LANGUAGE_OPTIONS,
  TEMPLATE_PHONE_NUMBER_BUTTON_MAX_COUNT,
  TEMPLATE_QUICK_REPLY_BUTTON_MAX_COUNT,
  TEMPLATE_URL_BUTTON_MAX_COUNT
} from "../constants/template.constants";
import type {
  CreateTemplateFormValues,
  TemplateButton,
  TemplateType,
  TemplateValidationChecklistItem,
  TemplateValidationResult,
  TemplateVariable
} from "../types/template.types";
import {
  areVariablesSequential,
  extractBodyTemplateVariables,
  extractTemplateVariables,
  findInvalidVariableSyntax,
  getMissingVariablePositions
} from "./templateVariables";

export function isValidTemplateName(name: string) {
  return /^[a-z][a-z0-9_]*$/.test(name.trim());
}

export function getTemplateNameError(name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return "Template name is required.";
  }
  if (!/^[a-z]/.test(trimmedName)) {
    return "Template name must start with a lowercase letter.";
  }
  if (!isValidTemplateName(trimmedName)) {
    return "Use lowercase letters, numbers, and underscores only.";
  }
  return null;
}

export function isValidTemplateBody(body: string) {
  const trimmedBody = body.trim();
  return trimmedBody.length > 0 && trimmedBody.length <= BODY_TEXT_MAX_LENGTH;
}

export function isValidLanguageCode(languageCode: string) {
  return TEMPLATE_LANGUAGE_OPTIONS.some((option) => option.code === languageCode.trim());
}

export function validateTemplateByType(values: CreateTemplateFormValues): TemplateValidationResult {
  if (values.type === "TEXT") {
    return validateTextTemplateForm(values);
  }

  return unsupportedTemplateTypeValidation(values.type);
}

export function validateCreateTemplateForm(values: CreateTemplateFormValues): TemplateValidationResult {
  return validateTemplateByType(values);
}

export function validateTextTemplateForm(values: CreateTemplateFormValues): TemplateValidationResult {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};
  const bodyVariables = extractBodyTemplateVariables(values.bodyText);

  addError(errors, "name", getTemplateNameError(values.name));

  if (!values.category) {
    addError(errors, "category", "Select a category.");
  } else if (!TEMPLATE_CATEGORIES.includes(values.category)) {
    addError(errors, "category", "Select a supported category.");
  }

  if (!values.languageCode.trim()) {
    addError(errors, "languageCode", "Select a language.");
  } else if (!isValidLanguageCode(values.languageCode)) {
    addError(errors, "languageCode", "Select a supported language.");
  }

  if (values.type !== "TEXT") {
    addError(errors, "type", "Only text templates can be created in this phase.");
  }

  validateHeader(values, errors);
  validateBody(values.bodyText, values.variableSamples, bodyVariables, errors);
  validateFooter(values.footerText ?? "", errors);
  validateTemplateButtons(values.buttons, errors);

  const checklist = buildChecklist(values, bodyVariables, errors);
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    checklist
  };
}

function unsupportedTemplateTypeValidation(type: TemplateType): TemplateValidationResult {
  return {
    isValid: false,
    errors: {
      type: [`${type} templates are not supported in this phase.`]
    },
    warnings: {},
    checklist: [
      {
        id: "template-type",
        label: "Template type supported",
        status: "invalid",
        message: `${type} templates are coming soon.`
      }
    ]
  };
}

export function validateTemplateBody(bodyText: string, variableSamples: Record<string, string>) {
  const errors: Record<string, string[]> = {};
  const variables = extractBodyTemplateVariables(bodyText);
  validateBody(bodyText, variableSamples, variables, errors);
  return errors.bodyText ?? [];
}

export function validateTemplateButtons(buttons: TemplateButton[], errors: Record<string, string[]> = {}) {
  const counts = getButtonCounts(buttons);
  const labels = new Set<string>();

  if (counts.total > TEMPLATE_BUTTON_TOTAL_MAX_COUNT) {
    addError(errors, "buttons", `Use no more than ${TEMPLATE_BUTTON_TOTAL_MAX_COUNT} buttons.`);
  }
  if (counts.quickReply > TEMPLATE_QUICK_REPLY_BUTTON_MAX_COUNT) {
    addError(errors, "buttons", `Use no more than ${TEMPLATE_QUICK_REPLY_BUTTON_MAX_COUNT} quick reply buttons.`);
  }
  if (counts.url > TEMPLATE_URL_BUTTON_MAX_COUNT) {
    addError(errors, "buttons", `Use no more than ${TEMPLATE_URL_BUTTON_MAX_COUNT} URL buttons.`);
  }
  if (counts.phoneNumber > TEMPLATE_PHONE_NUMBER_BUTTON_MAX_COUNT) {
    addError(errors, "buttons", `Use no more than ${TEMPLATE_PHONE_NUMBER_BUTTON_MAX_COUNT} phone number button.`);
  }
  if (!areButtonGroupsValid(buttons)) {
    addError(errors, "buttons", "Group quick reply buttons together and action buttons together.");
  }

  buttons.forEach((button, index) => {
    const field = `buttons.${index}`;
    const text = button.text.trim();

    if (!text) {
      addError(errors, field, "Action text is required.");
    }
    if (text.length > BUTTON_TEXT_MAX_LENGTH) {
      addError(errors, field, `Action text must be ${BUTTON_TEXT_MAX_LENGTH} characters or fewer.`);
    }
    if (text && labels.has(text.toLowerCase())) {
      addError(errors, field, "Action labels should be unique.");
    }
    labels.add(text.toLowerCase());

    if (button.type === "URL" && !isValidUrl(button.value ?? "")) {
      addError(errors, field, "Enter a valid URL starting with http:// or https://.");
    }
    if (button.type === "PHONE_NUMBER" && !isValidPhoneNumber(button.value ?? "")) {
      addError(errors, field, "Enter a valid phone number with digits and country code.");
    }
  });

  return errors.buttons ?? [];
}

function validateHeader(values: CreateTemplateFormValues, errors: Record<string, string[]>) {
  const headerText = values.headerText?.trim() ?? "";
  if (values.headerFormat === "NONE") {
    return;
  }
  if (values.headerFormat !== "TEXT") {
    addError(errors, "headerText", "Only text headers are supported in this phase.");
    return;
  }
  if (!headerText) {
    addError(errors, "headerText", "Header text is required when header format is text.");
  }
  if (headerText.length > HEADER_TEXT_MAX_LENGTH) {
    addError(errors, "headerText", `Header text must be ${HEADER_TEXT_MAX_LENGTH} characters or fewer.`);
  }
  if (extractTemplateVariables(headerText).length > 0 || findInvalidVariableSyntax(headerText).length > 0) {
    addError(errors, "headerText", "Header variables are not supported in this phase.");
  }
}

function validateBody(
  bodyText: string,
  variableSamples: Record<string, string>,
  variables: TemplateVariable[],
  errors: Record<string, string[]>
) {
  const trimmedBody = bodyText.trim();
  const invalidTokens = findInvalidVariableSyntax(bodyText);
  const missingPositions = getMissingVariablePositions(variables);

  if (!trimmedBody) {
    addError(errors, "bodyText", "Body text is required.");
  }
  if (bodyText.length > BODY_TEXT_MAX_LENGTH) {
    addError(errors, "bodyText", `Body text must be ${BODY_TEXT_MAX_LENGTH} characters or fewer.`);
  }
  if (invalidTokens.length > 0) {
    addError(errors, "bodyText", `Invalid variable syntax: ${invalidTokens.join(", ")}.`);
  }
  if (!areVariablesSequential(variables)) {
    addError(
      errors,
      "bodyText",
      `Variables must be sequential. Missing: ${missingPositions.map((index) => `{{${index}}}`).join(", ")}.`
    );
  }
  for (const variable of variables) {
    if (!variableSamples[variable.token]?.trim()) {
      addError(errors, `variables.${variable.token}`, `Sample value is required for ${variable.token}.`);
    }
  }
}

function validateFooter(footerText: string, errors: Record<string, string[]>) {
  if (footerText.length > FOOTER_TEXT_MAX_LENGTH) {
    addError(errors, "footerText", `Footer text must be ${FOOTER_TEXT_MAX_LENGTH} characters or fewer.`);
  }
  if (extractTemplateVariables(footerText).length > 0 || findInvalidVariableSyntax(footerText).length > 0) {
    addError(errors, "footerText", "Footer variables are not supported in this phase.");
  }
}

function buildChecklist(
  values: CreateTemplateFormValues,
  variables: TemplateVariable[],
  errors: Record<string, string[]>
): TemplateValidationChecklistItem[] {
  return [
    buildItem("name", "Template name added", values.name.trim().length > 0, errors.name?.[0]),
    buildItem(
      "name-format",
      "Template name format valid",
      !errors.name && values.name.trim().length > 0,
      errors.name?.[0]
    ),
    buildItem("category", "Category selected", !errors.category && Boolean(values.category), errors.category?.[0]),
    buildItem(
      "language",
      "Language selected",
      !errors.languageCode && Boolean(values.languageCode),
      errors.languageCode?.[0]
    ),
    buildItem("header", "Header valid", !errors.headerText, errors.headerText?.[0]),
    buildItem("body", "Body message added", values.bodyText.trim().length > 0, errors.bodyText?.[0]),
    buildItem("body-length", "Body length valid", values.bodyText.length <= BODY_TEXT_MAX_LENGTH, errors.bodyText?.[0]),
    buildItem(
      "variables-sequential",
      "Variables are sequential",
      areVariablesSequential(variables),
      errors.bodyText?.[0]
    ),
    buildItem(
      "variable-samples",
      "Variable sample values added",
      variables.every((variable) => Boolean(values.variableSamples[variable.token]?.trim())),
      Object.entries(errors).find(([field]) => field.startsWith("variables."))?.[1][0]
    ),
    buildItem("footer", "Footer valid", !errors.footerText, errors.footerText?.[0]),
    buildItem(
      "buttons",
      "Interactive actions valid",
      !hasButtonErrors(errors),
      errors.buttons?.[0] ?? getFirstButtonFieldError(errors)
    )
  ];
}

function buildItem(id: string, label: string, isValid: boolean, message?: string): TemplateValidationChecklistItem {
  return {
    id,
    label,
    status: isValid ? "valid" : "invalid",
    message
  };
}

function addError(errors: Record<string, string[]>, field: string, message: string | null) {
  if (!message) {
    return;
  }
  errors[field] = [...(errors[field] ?? []), message];
}

function getButtonCounts(buttons: TemplateButton[]) {
  return {
    total: buttons.length,
    quickReply: buttons.filter((button) => button.type === "QUICK_REPLY").length,
    url: buttons.filter((button) => button.type === "URL").length,
    phoneNumber: buttons.filter((button) => button.type === "PHONE_NUMBER").length
  };
}

function areButtonGroupsValid(buttons: TemplateButton[]) {
  const groupSequence = buttons.map((button) => (button.type === "QUICK_REPLY" ? "QUICK_REPLY" : "ACTION"));
  const transitions = groupSequence.reduce((count, group, index) => {
    if (index === 0) {
      return count;
    }

    return group === groupSequence[index - 1] ? count : count + 1;
  }, 0);

  return transitions <= 1;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return /^\+?[\d\s()-]+$/.test(value.trim()) && digits.length >= 8;
}

function hasButtonErrors(errors: Record<string, string[]>) {
  return Boolean(errors.buttons) || Object.keys(errors).some((field) => field.startsWith("buttons."));
}

function getFirstButtonFieldError(errors: Record<string, string[]>) {
  return Object.entries(errors).find(([field]) => field.startsWith("buttons."))?.[1][0];
}
