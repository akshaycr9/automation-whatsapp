import {
  TemplateDuplicateNameError,
  TemplateNotFoundError,
  TemplateProviderApiError,
  TemplateSyncFailedError,
  TemplateUnsupportedTypeError,
  TemplateValidationDomainError
} from "../domain/template.errors.js";
import { TemplateEventType, TemplateProviderAction, TemplateStatus, TemplateType } from "@prisma/client";
import { TemplateFactoryResolver } from "../domain/template.factory.js";
import { mapTemplateToDetailResponse, mapTemplateToListItem } from "../domain/template.mapper.js";
import type { CreateTemplateInput, TemplateListQuery, TemplateScope } from "../domain/template.types.js";
import { validateCreateTemplateInput } from "../domain/template.validators.js";
import { mapCreateTemplateInputToMetaPayload } from "../providers/meta/meta-template.mapper.js";
import { MetaTemplateAdapter } from "../providers/meta/meta-template.adapter.js";
import { MetaTemplateCredentialResolver } from "../providers/meta/meta-template-credentials.js";
import { TemplateProviderError } from "../providers/meta/meta-template.errors.js";
import type { TemplateProviderAdapter } from "../providers/template-provider.adapter.js";
import { TemplateRepository } from "../repositories/template.repository.js";

export class TemplateDomainService {
  constructor(
    private readonly repository = new TemplateRepository(),
    private readonly factoryResolver = new TemplateFactoryResolver(),
    private readonly providerAdapter: TemplateProviderAdapter = new MetaTemplateAdapter(),
    private readonly credentialResolver = new MetaTemplateCredentialResolver()
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
    data.template.status = TemplateStatus.SUBMITTING;
    const template = await this.repository.createWithRelations(data, context);
    const payload = mapCreateTemplateInputToMetaPayload(input);
    const payloadRecord = await this.repository.createProviderPayload({
      templateId: template.id,
      action: TemplateProviderAction.CREATE,
      requestPayload: payload
    });

    try {
      const providerResult = await this.providerAdapter.createTemplate({
        credentials: this.credentialResolver.resolve(context),
        payload
      });
      await this.repository.updateProviderPayload(payloadRecord.id, {
        responsePayload: providerResult.raw,
        statusCode: providerResult.statusCode
      });
      const updated = await this.repository.updateProviderSubmissionResult(
        template.id,
        {
          metaTemplateId: providerResult.providerTemplateId,
          status: providerResult.status,
          lastSyncedAt: new Date()
        },
        context
      );

      if (!updated) {
        throw new TemplateNotFoundError();
      }

      await this.repository.createEvent({
        templateId: template.id,
        eventType: TemplateEventType.SUBMITTED,
        oldStatus: TemplateStatus.SUBMITTING,
        newStatus: providerResult.status,
        message: "Template submitted to Meta.",
        createdById: context.adminUserId
      });

      return { data: mapTemplateToDetailResponse(updated) };
    } catch (error) {
      const providerError = this.normalizeProviderError(error);
      await this.repository.updateProviderPayload(payloadRecord.id, {
        responsePayload: providerError.raw,
        statusCode: providerError.statusCode,
        errorCode: providerError.code,
        errorMessage: providerError.message
      });
      await this.repository.updateProviderSubmissionResult(template.id, { status: TemplateStatus.ERROR }, context);
      await this.repository.createEvent({
        templateId: template.id,
        eventType: TemplateEventType.ERROR,
        oldStatus: TemplateStatus.SUBMITTING,
        newStatus: TemplateStatus.ERROR,
        message: providerError.message,
        metadata: { provider: providerError.provider, code: providerError.code, statusCode: providerError.statusCode },
        createdById: context.adminUserId
      });
      throw new TemplateProviderApiError(providerError.message);
    }
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

  async syncTemplates(context: TemplateScope) {
    const payloadRecord = await this.repository.createProviderPayload({
      action: TemplateProviderAction.SYNC,
      requestPayload: { operation: "listTemplates" }
    });

    try {
      const providerResult = await this.providerAdapter.listTemplates({
        credentials: this.credentialResolver.resolve(context)
      });
      let createdCount = 0;
      let updatedCount = 0;
      const syncedAt = new Date();

      for (const providerTemplate of providerResult.templates) {
        if (!providerTemplate.name) continue;

        const existing = await this.repository.findByProviderIdentity(
          {
            metaTemplateId: providerTemplate.providerTemplateId,
            name: providerTemplate.name,
            languageCode: providerTemplate.languageCode
          },
          context
        );

        if (existing) {
          await this.repository.updateFromProvider(
            existing.id,
            {
              metaTemplateId: providerTemplate.providerTemplateId,
              category: providerTemplate.category,
              type: providerTemplate.type,
              languageCode: providerTemplate.languageCode,
              status: providerTemplate.status,
              qualityRating: providerTemplate.qualityRating,
              rejectionReason: providerTemplate.rejectionReason,
              lastSyncedAt: syncedAt
            },
            context
          );
          updatedCount += 1;
        } else {
          await this.repository.createFromProvider(
            {
              metaTemplateId: providerTemplate.providerTemplateId,
              name: providerTemplate.name,
              displayName: providerTemplate.name,
              category: providerTemplate.category,
              type: providerTemplate.type,
              languageCode: providerTemplate.languageCode,
              status: providerTemplate.status,
              qualityRating: providerTemplate.qualityRating,
              rejectionReason: providerTemplate.rejectionReason,
              lastSyncedAt: syncedAt
            },
            context
          );
          createdCount += 1;
        }
      }

      await this.repository.updateProviderPayload(payloadRecord.id, {
        responsePayload: providerResult.raw,
        statusCode: providerResult.statusCode
      });
      await this.repository.createEvent({
        eventType: TemplateEventType.SYNCED,
        message: "Templates synced from Meta.",
        metadata: { createdCount, updatedCount, syncedCount: providerResult.templates.length },
        createdById: context.adminUserId
      });

      return {
        data: {
          syncedCount: providerResult.templates.length,
          createdCount,
          updatedCount,
          failedCount: 0
        },
        message: "Templates synced successfully"
      };
    } catch (error) {
      const providerError = this.normalizeProviderError(error);
      await this.repository.updateProviderPayload(payloadRecord.id, {
        responsePayload: providerError.raw,
        statusCode: providerError.statusCode,
        errorCode: providerError.code,
        errorMessage: providerError.message
      });
      throw new TemplateSyncFailedError(providerError.message);
    }
  }

  private normalizeProviderError(error: unknown) {
    if (error instanceof TemplateProviderError) {
      return error.details;
    }

    return {
      provider: "META" as const,
      code: "META_TEMPLATE_API_ERROR",
      message: error instanceof Error ? error.message : "Meta template API request failed.",
      statusCode: 500,
      raw: null
    };
  }
}
