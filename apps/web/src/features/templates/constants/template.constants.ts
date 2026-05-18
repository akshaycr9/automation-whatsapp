import type { TemplateCategory, TemplateStatus, TemplateType } from "../types/template.types";

export const TEMPLATE_TYPES: TemplateType[] = ["TEXT", "MEDIA", "CAROUSEL", "AUTHENTICATION"];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = ["UTILITY", "MARKETING", "AUTHENTICATION"];

export const TEMPLATE_STATUSES: TemplateStatus[] = [
  "DRAFT",
  "SUBMITTING",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "PAUSED",
  "DISABLED",
  "DELETED",
  "ERROR"
];

export const DEFAULT_TEMPLATE_TYPE: TemplateType = "TEXT";

export const DEFAULT_LANGUAGE_CODE = "en";

export const HEADER_TEXT_MAX_LENGTH = 60;
export const BODY_TEXT_MAX_LENGTH = 1024;
export const FOOTER_TEXT_MAX_LENGTH = 60;
export const BUTTON_TEXT_MAX_LENGTH = 25;
