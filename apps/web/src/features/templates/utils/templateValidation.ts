import { BODY_TEXT_MAX_LENGTH, TEMPLATE_LANGUAGE_OPTIONS } from "../constants/template.constants";

export function isValidTemplateName(name: string) {
  return /^[a-z0-9_]+$/.test(name.trim());
}

export function isValidTemplateBody(body: string) {
  const trimmedBody = body.trim();
  return trimmedBody.length > 0 && trimmedBody.length <= BODY_TEXT_MAX_LENGTH;
}

export function isValidLanguageCode(languageCode: string) {
  return TEMPLATE_LANGUAGE_OPTIONS.some((option) => option.code === languageCode.trim());
}
