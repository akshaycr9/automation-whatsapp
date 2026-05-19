import { TemplateType } from "@prisma/client";

export const HEADER_TEXT_MAX_LENGTH = 60;
export const BODY_TEXT_MAX_LENGTH = 1024;
export const FOOTER_TEXT_MAX_LENGTH = 60;
export const BUTTON_TEXT_MAX_LENGTH = 25;
export const TEMPLATE_NAME_MAX_LENGTH = 512;

export const DEFAULT_TEMPLATE_TYPE = TemplateType.TEXT;
export const SUPPORTED_TEMPLATE_TYPES_FOR_CREATE = [TemplateType.TEXT] as const;
export const SUPPORTED_BUTTON_TYPES_FOR_TEXT_CREATE = ["QUICK_REPLY", "URL", "PHONE_NUMBER"] as const;
