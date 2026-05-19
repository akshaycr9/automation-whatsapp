import {
  TemplateDuplicateNameError,
  TemplateNotFoundError,
  TemplateUnsupportedTypeError,
  TemplateValidationDomainError
} from "../domain/template.errors.js";
import { TemplateEventType, TemplateStatus, TemplateType } from "@prisma/client";
import { TemplateFactoryResolver } from "../domain/template.factory.js";
import { mapTemplateToDetailResponse, mapTemplateToListItem } from "../domain/template.mapper.js";
import type { CreateTemplateInput, TemplateListQuery, TemplateScope } from "../domain/template.types.js";
import { validateCreateTemplateInput } from "../domain/template.validators.js";
import { TemplateRepository } from "../repositories/template.repository.js";

export class TemplateDomainService {
  constructor(
    private readonly repository = new TemplateRepository(),
    private readonly factoryResolver = new TemplateFactoryResolver()
  ) {}

  validateCreateInput(input: CreateTemplateInput) {
    return validateCreateTemplateInput(input);
  }

  prepareCreateData(input: CreateTemplateInput, context: TemplateScope) {
    if (input.type !== TemplateType.TEXT) {
      throw new TemplateUnsupportedTypeError();
    }

    const validation = this.validateCreateInput(input);

    if (!validation.isValid) {
      throw new TemplateValidationDomainError(validation.errors);
    }

    return this.factoryResolver.build(input, context);
  }

  async listTemplates(query: TemplateListQuery, context: TemplateScope) {
    const result = await this.repository.findMany(query, context);

    return {
      data: result.items.map(mapTemplateToListItem),
      pagination: result.pagination
    };
  }

  async getTemplateById(id: string, context: TemplateScope) {
    const template = await this.repository.findById(id, context);

    if (!template) {
      throw new TemplateNotFoundError();
    }

    return { data: mapTemplateToDetailResponse(template) };
  }

  async checkDuplicateName(name: string, languageCode: string, context: TemplateScope) {
    const existing = await this.repository.findByNameAndLanguage(name, languageCode, context);

    if (existing) {
      throw new TemplateDuplicateNameError();
    }
  }

  async createLocalTemplate(input: CreateTemplateInput, context: TemplateScope) {
    const data = this.prepareCreateData(input, context);
    await this.checkDuplicateName(input.name, input.languageCode, context);
    const template = await this.repository.createWithRelations(data, context);

    return { data: mapTemplateToDetailResponse(template) };
  }

  async deleteTemplate(id: string, context: TemplateScope) {
    const template = await this.repository.findById(id, context);

    if (!template) {
      throw new TemplateNotFoundError();
    }

    const result = await this.repository.softDelete(id, context);

    if (result.count === 0) {
      throw new TemplateNotFoundError();
    }

    await this.repository.createEvent({
      templateId: id,
      eventType: TemplateEventType.DELETED,
      oldStatus: template.status,
      newStatus: TemplateStatus.DELETED,
      message: "Template soft deleted locally.",
      createdById: context.adminUserId
    });

    return {
      data: {
        id,
        status: TemplateStatus.DELETED
      },
      message: "Template deleted successfully"
    };
  }

  getSyncPlaceholder() {
    return {
      data: {
        syncedCount: 0,
        createdCount: 0,
        updatedCount: 0,
        failedCount: 0
      },
      message: "Template sync is not connected to Meta yet"
    };
  }
}
