import { Request, Response } from "express";
import { ZodError, type ZodIssue } from "zod";
import { HttpError } from "../../lib/http-error.js";
import { TemplateValidationDomainError } from "./domain/template.errors.js";
import type { CreateTemplateInput, TemplateListQuery, TemplateScope } from "./domain/template.types.js";
import { TemplateDomainService } from "./services/template-domain.service.js";
import { createTemplateBodySchema, listTemplatesQuerySchema } from "./templates.schema.js";

export class TemplatesController {
  constructor(private readonly templatesService = new TemplateDomainService()) {}

  list = async (req: Request, res: Response) => {
    const query = this.parseListQuery(req.query);
    const result = await this.templatesService.listTemplates(query, this.getScope(req));

    res.json(result);
  };

  detail = async (req: Request, res: Response) => {
    const result = await this.templatesService.getTemplateById(this.getTemplateId(req), this.getScope(req));

    res.json(result);
  };

  create = async (req: Request, res: Response) => {
    const input = this.parseCreateBody(req.body);
    const result = await this.templatesService.createLocalTemplate(input, this.getScope(req));
    const template = result.data;

    res.status(201).json({
      data: {
        id: template.id,
        name: template.name,
        displayName: template.displayName,
        category: template.category,
        type: template.type,
        languageCode: template.languageCode,
        status: template.status,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      },
      message: "Template created successfully"
    });
  };

  delete = async (req: Request, res: Response) => {
    const result = await this.templatesService.deleteTemplate(this.getTemplateId(req), this.getScope(req));

    res.json(result);
  };

  sync = async (_req: Request, res: Response) => {
    res.json(this.templatesService.getSyncPlaceholder());
  };

  private parseListQuery(query: Request["query"]): TemplateListQuery {
    const parsed = listTemplatesQuerySchema.safeParse(query);

    if (!parsed.success) {
      throw this.validationError(parsed.error);
    }

    const data = parsed.data;

    return {
      ...(data.search !== undefined ? { search: data.search } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.languageCode !== undefined ? { languageCode: data.languageCode } : {}),
      ...(data.page !== undefined ? { page: data.page } : {}),
      ...(data.limit !== undefined ? { limit: data.limit } : {}),
      ...(data.sortBy !== undefined ? { sortBy: data.sortBy } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {})
    };
  }

  private parseCreateBody(body: unknown): CreateTemplateInput {
    const parsed = createTemplateBodySchema.safeParse(body);

    if (!parsed.success) {
      throw this.validationError(parsed.error);
    }

    const data = parsed.data;

    return {
      name: data.name,
      displayName: data.displayName,
      category: data.category,
      type: data.type,
      languageCode: data.languageCode,
      components: {
        ...(data.components.header !== undefined
          ? {
              header: {
                format: data.components.header.format,
                ...(data.components.header.text !== undefined ? { text: data.components.header.text } : {})
              }
            }
          : {}),
        body: data.components.body,
        ...(data.components.footer !== undefined ? { footer: data.components.footer } : {}),
        buttons: data.components.buttons
      },
      variables: data.variables.map((variable) => ({
        componentType: variable.componentType,
        position: variable.position,
        placeholder: variable.placeholder,
        sampleValue: variable.sampleValue,
        ...(variable.sourceKey !== undefined ? { sourceKey: variable.sourceKey } : {})
      }))
    };
  }

  private getTemplateId(req: Request) {
    const { id } = req.params;

    if (typeof id !== "string" || !id) {
      throw new HttpError(400, "Template id is required.", "TEMPLATE_VALIDATION_ERROR");
    }

    return id;
  }

  private getScope(req: Request): TemplateScope {
    if (!req.auth?.adminUserId) {
      throw new HttpError(401, "Authentication required.", "UNAUTHORIZED");
    }

    return { adminUserId: req.auth.adminUserId };
  }

  private validationError(error: ZodError) {
    return new TemplateValidationDomainError(error.issues.map(toValidationDetail));
  }
}

function toValidationDetail(issue: ZodIssue) {
  return {
    field: issue.path.join(".") || "request",
    message: issue.message
  };
}
