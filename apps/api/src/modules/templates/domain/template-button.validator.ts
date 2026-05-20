import { TemplateButtonType } from "@prisma/client";
import { BUTTON_TEXT_MAX_LENGTH, SUPPORTED_BUTTON_TYPES_FOR_TEXT_CREATE } from "./template.constants.js";
import type { TemplateButtonInput, TemplateValidationError } from "./template.types.js";

const PHONE_NUMBER_PATTERN = /^\+?[1-9]\d{6,14}$/;

export function validateTemplateButtons(buttons: TemplateButtonInput[] = []): TemplateValidationError[] {
  const errors: TemplateValidationError[] = [];

  buttons.forEach((button, index) => {
    const field = `components.buttons.${index}`;

    if (
      !SUPPORTED_BUTTON_TYPES_FOR_TEXT_CREATE.includes(
        button.type as (typeof SUPPORTED_BUTTON_TYPES_FOR_TEXT_CREATE)[number]
      )
    ) {
      errors.push({ field: `${field}.type`, message: `${button.type} buttons are not supported yet.` });
    }

    if (!button.text?.trim()) {
      errors.push({ field: `${field}.text`, message: "Button text is required." });
    }

    if (button.text && button.text.trim().length > BUTTON_TEXT_MAX_LENGTH) {
      errors.push({
        field: `${field}.text`,
        message: `Button text must be ${BUTTON_TEXT_MAX_LENGTH} characters or less.`
      });
    }

    if (button.type === TemplateButtonType.URL && !isValidUrl(button.url)) {
      errors.push({ field: `${field}.url`, message: "URL buttons require a valid URL." });
    }

    if (button.type === TemplateButtonType.PHONE_NUMBER && !isValidPhoneNumber(button.phoneNumber)) {
      errors.push({ field: `${field}.phoneNumber`, message: "Phone number buttons require a valid phone number." });
    }
  });

  return errors;
}

function isValidUrl(url: string | undefined) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidPhoneNumber(phoneNumber: string | undefined) {
  return Boolean(phoneNumber?.match(PHONE_NUMBER_PATTERN));
}
