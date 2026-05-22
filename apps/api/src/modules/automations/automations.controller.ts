import { Request, Response } from "express";
import { ZodError, type ZodIssue } from "zod";
import { HttpError } from "../../lib/http-error.js";
import { AutomationsService } from "./automations.service.js";
import { AutomationValidationDomainError } from "./domain/automation.errors.js";
import type { AutomationScope, ToggleAutomationInput, UpdateAutomationInput } from "./domain/automation.types.js";
import { toggleAutomationBodySchema, updateAutomationBodySchema } from "./automations.schema.js";

export class AutomationsController {
  constructor(private readonly automationsService = new AutomationsService()) {}

  list = async (_req: Request, res: Response) => {
    res.json(await this.automationsService.getAutomationsList());
  };

  detail = async (req: Request, res: Response) => {
    res.json(await this.automationsService.getAutomationDetail(this.getAutomationId(req)));
  };

  update = async (req: Request, res: Response) => {
    const input = this.parseUpdateBody(req.body);

    res.json(await this.automationsService.updateAutomation(this.getAutomationId(req), input, this.getScope(req)));
  };

  toggle = async (req: Request, res: Response) => {
    const input = this.parseToggleBody(req.body);

    res.json(await this.automationsService.toggleAutomation(this.getAutomationId(req), input));
  };

  fieldOptions = async (req: Request, res: Response) => {
    res.json(await this.automationsService.getFieldOptions(this.getAutomationId(req)));
  };

  private parseUpdateBody(body: unknown): UpdateAutomationInput {
    const parsed = updateAutomationBodySchema.safeParse(body);

    if (!parsed.success) {
      throw this.validationError(parsed.error);
    }

    return {
      templateId: parsed.data.templateId,
      delayMinutes: parsed.data.delayMinutes,
      variableMappings: parsed.data.variableMappings.map((mapping) => ({
        templateVariableName: mapping.templateVariableName,
        componentType: mapping.componentType,
        variableIndex: mapping.variableIndex,
        sourceField: mapping.sourceField,
        ...(mapping.fallbackValue !== undefined ? { fallbackValue: mapping.fallbackValue } : {})
      }))
    };
  }

  private parseToggleBody(body: unknown): ToggleAutomationInput {
    const parsed = toggleAutomationBodySchema.safeParse(body);

    if (!parsed.success) {
      throw this.validationError(parsed.error);
    }

    return parsed.data;
  }

  private getAutomationId(req: Request) {
    const { id } = req.params;

    if (typeof id !== "string" || !id) {
      throw new HttpError(400, "Automation id is required.", "AUTOMATION_VALIDATION_ERROR");
    }

    return id;
  }

  private getScope(req: Request): AutomationScope {
    if (!req.auth?.adminUserId) {
      throw new HttpError(401, "Authentication required.", "UNAUTHORIZED");
    }

    return { adminUserId: req.auth.adminUserId };
  }

  private validationError(error: ZodError) {
    return new AutomationValidationDomainError(error.issues.map(toValidationDetail));
  }
}

function toValidationDetail(issue: ZodIssue) {
  return {
    field: issue.path.join(".") || "request",
    message: issue.message
  };
}
