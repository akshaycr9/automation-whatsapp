import { HttpError } from "../../../lib/http-error.js";
import type { TemplateValidationError } from "./template.types.js";

export const TEMPLATE_ERROR_CODES = {
  VALIDATION: "TEMPLATE_VALIDATION_ERROR",
  DUPLICATE_NAME: "TEMPLATE_DUPLICATE_NAME",
  NOT_FOUND: "TEMPLATE_NOT_FOUND",
  UNSUPPORTED_TYPE: "TEMPLATE_UNSUPPORTED_TYPE",
  PROVIDER_ERROR: "TEMPLATE_PROVIDER_ERROR",
  SYNC_FAILED: "TEMPLATE_SYNC_FAILED"
} as const;

export class TemplateDomainError extends HttpError {
  constructor(statusCode: number, message: string, code: string) {
    super(statusCode, message, code);
  }
}

export class TemplateValidationDomainError extends TemplateDomainError {
  constructor(public readonly details: TemplateValidationError[]) {
    super(400, "Template validation failed", TEMPLATE_ERROR_CODES.VALIDATION);
  }
}

export class TemplateDuplicateNameError extends TemplateDomainError {
  constructor() {
    super(409, "A template with this name and language already exists.", TEMPLATE_ERROR_CODES.DUPLICATE_NAME);
  }
}

export class TemplateNotFoundError extends TemplateDomainError {
  constructor() {
    super(404, "Template not found.", TEMPLATE_ERROR_CODES.NOT_FOUND);
  }
}

export class TemplateUnsupportedTypeError extends TemplateDomainError {
  constructor() {
    super(400, "Template type is not supported yet.", TEMPLATE_ERROR_CODES.UNSUPPORTED_TYPE);
  }
}

export class TemplateProviderApiError extends TemplateDomainError {
  constructor(message = "Template provider request failed.") {
    super(502, message, TEMPLATE_ERROR_CODES.PROVIDER_ERROR);
  }
}

export class TemplateSyncFailedError extends TemplateDomainError {
  constructor(message = "Template sync failed.") {
    super(502, message, TEMPLATE_ERROR_CODES.SYNC_FAILED);
  }
}
