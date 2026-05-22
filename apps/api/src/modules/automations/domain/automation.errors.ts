import { HttpError } from "../../../lib/http-error.js";

export type AutomationValidationError = {
  field: string;
  message: string;
};

export const AUTOMATION_ERROR_CODES = {
  VALIDATION: "AUTOMATION_VALIDATION_ERROR",
  NOT_FOUND: "AUTOMATION_NOT_FOUND",
  NOT_CONFIGURED: "AUTOMATION_NOT_CONFIGURED"
} as const;

export class AutomationDomainError extends HttpError {
  constructor(statusCode: number, message: string, code: string) {
    super(statusCode, message, code);
  }
}

export class AutomationValidationDomainError extends AutomationDomainError {
  constructor(
    public readonly details: AutomationValidationError[],
    message = "Automation validation failed"
  ) {
    super(400, message, AUTOMATION_ERROR_CODES.VALIDATION);
  }
}

export class AutomationNotFoundError extends AutomationDomainError {
  constructor() {
    super(404, "Automation not found.", AUTOMATION_ERROR_CODES.NOT_FOUND);
  }
}

export class AutomationNotConfiguredError extends AutomationDomainError {
  constructor(message: string) {
    super(400, message, AUTOMATION_ERROR_CODES.NOT_CONFIGURED);
  }
}
