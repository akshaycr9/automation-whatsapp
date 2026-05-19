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
import {
  isKnownMetaTemplateStatus,
  mapCreateTemplateInputToMetaPayload,
  mapTemplateRecordToMetaPayload
} from "../providers/meta/meta-template.mapper.js";
import { MetaTemplateAdapter } from "../providers/meta/meta-template.adapter.js";
import { MetaTemplateCredentialResolver } from "../providers/meta/meta-template-credentials.js";
import { TemplateProviderError } from "../providers/meta/meta-template.errors.js";
import type { TemplateProviderAdapter } from "../providers/template-provider.adapter.js";
import { TemplateRepository } from "../repositories/template.repository.js";
import type { TemplateProviderCredentials } from "../providers/template-provider.adapter.js";
import type { TemplateRecord } from "../repositories/template.repository.js";

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
    const existing = await this.repository.findAnyByNameAndLanguage(name, languageCode, context);

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
      throw new TemplateProviderApiError();
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

  async retrySubmission(id: string, context: TemplateScope) {
    const template = await this.repository.findById(id, context);

    if (!template) {
      throw new TemplateNotFoundError();
    }

    const credentials = this.credentialResolver.resolve(context);
    const syncedAt = new Date();

    try {
      const providerResult = await this.providerAdapter.listTemplates({ credentials });
      const providerTemplate = providerResult.templates.find(
        (candidate) => candidate.name === template.name && candidate.languageCode === template.languageCode
      );

      if (providerTemplate) {
        const updated = await this.repository.updateFromProvider(
          template.id,
          {
            metaTemplateId: providerTemplate.providerTemplateId,
            wabaId: credentials.wabaId,
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

        await this.repository.createProviderPayload({
          templateId: template.id,
          action: TemplateProviderAction.SYNC,
          requestPayload: {
            operation: "retrySubmission.reconcile",
            name: template.name,
            languageCode: template.languageCode
          },
          responsePayload: providerTemplate.raw,
          statusCode: providerResult.statusCode
        });
        await this.createProviderStatusEvents({
          templateId: template.id,
          oldStatus: template.status,
          newStatus: providerTemplate.status,
          source: "sync",
          metadata: { retrySubmission: true, matchedOn: "name_language" },
          createdById: context.adminUserId
        });

        return {
          data: mapTemplateToDetailResponse(updated ?? template),
          message: "Template reconciled with Meta."
        };
      }

      const payload = mapTemplateRecordToMetaPayload(template);
      const payloadRecord = await this.repository.createProviderPayload({
        templateId: template.id,
        action: TemplateProviderAction.CREATE,
        requestPayload: payload
      });

      await this.repository.updateProviderSubmissionResult(template.id, { status: TemplateStatus.SUBMITTING }, context);
      const createResult = await this.providerAdapter.createTemplate({ credentials, payload });
      await this.repository.updateProviderPayload(payloadRecord.id, {
        responsePayload: createResult.raw,
        statusCode: createResult.statusCode
      });

      const updated = await this.repository.updateProviderSubmissionResult(
        template.id,
        {
          metaTemplateId: createResult.providerTemplateId,
          status: createResult.status,
          lastSyncedAt: syncedAt
        },
        context
      );

      await this.repository.createEvent({
        templateId: template.id,
        eventType: TemplateEventType.SUBMITTED,
        oldStatus: template.status,
        newStatus: createResult.status,
        message: "Template resubmitted to Meta.",
        metadata: { retrySubmission: true },
        createdById: context.adminUserId
      });

      return {
        data: mapTemplateToDetailResponse(updated ?? template),
        message: "Template resubmitted to Meta."
      };
    } catch (error) {
      const providerError = this.normalizeProviderError(error);
      await this.repository.updateProviderSubmissionResult(
        template.id,
        {
          status: TemplateStatus.ERROR,
          rejectionReason: providerError.message,
          lastSyncedAt: new Date()
        },
        context
      );
      await this.repository.createProviderPayload({
        templateId: template.id,
        action: TemplateProviderAction.CREATE,
        requestPayload: { operation: "retrySubmission", templateId: template.id },
        responsePayload: providerError.raw,
        statusCode: providerError.statusCode,
        errorCode: providerError.code,
        errorMessage: providerError.message
      });
      await this.repository.createEvent({
        templateId: template.id,
        eventType: TemplateEventType.ERROR,
        oldStatus: template.status,
        newStatus: TemplateStatus.ERROR,
        message: providerError.message,
        metadata: { provider: providerError.provider, code: providerError.code, retrySubmission: true },
        createdById: context.adminUserId
      });
      throw new TemplateProviderApiError("Template retry failed. Please try again later.");
    }
  }

  async syncTemplate(id: string, context: TemplateScope) {
    const template = await this.repository.findById(id, context);

    if (!template) {
      throw new TemplateNotFoundError();
    }

    const credentials = this.credentialResolver.resolve(context);
    const payloadRecord = await this.repository.createProviderPayload({
      templateId: template.id,
      action: TemplateProviderAction.SYNC,
      requestPayload: {
        operation: "getTemplate",
        templateId: template.id,
        metaTemplateId: template.metaTemplateId,
        name: template.name,
        languageCode: template.languageCode
      }
    });

    try {
      const providerResult =
        template.metaTemplateId && this.providerAdapter.getTemplate
          ? await this.providerAdapter.getTemplate({
              credentials,
              providerTemplateId: template.metaTemplateId
            })
          : await this.findProviderTemplateByNameAndLanguage(template, credentials);

      if (!providerResult?.template) {
        await this.repository.updateProviderPayload(payloadRecord.id, {
          errorCode: "META_TEMPLATE_NOT_FOUND",
          errorMessage: "Template was not found on Meta during row sync."
        });
        throw new TemplateSyncFailedError("Template was not found on Meta.");
      }

      const rawStatus = (providerResult.template.raw as { status?: string } | null)?.status;
      const status = isKnownMetaTemplateStatus(rawStatus) ? providerResult.template.status : template.status;
      const updated = await this.repository.updateFromProvider(
        template.id,
        {
          metaTemplateId: providerResult.template.providerTemplateId,
          wabaId: credentials.wabaId,
          category: providerResult.template.category,
          type: providerResult.template.type,
          languageCode: providerResult.template.languageCode,
          status,
          qualityRating: providerResult.template.qualityRating,
          rejectionReason: providerResult.template.rejectionReason,
          lastSyncedAt: new Date()
        },
        context
      );

      await this.repository.updateProviderPayload(payloadRecord.id, {
        responsePayload: providerResult.raw,
        statusCode: providerResult.statusCode
      });
      await this.createProviderStatusEvents({
        templateId: template.id,
        oldStatus: template.status,
        newStatus: status,
        source: "sync",
        metadata: { rowSync: true, rawStatus: rawStatus ?? null },
        createdById: context.adminUserId
      });

      return {
        data: mapTemplateToDetailResponse(updated ?? template),
        message: "Template synced successfully"
      };
    } catch (error) {
      const providerError = this.normalizeProviderError(error);
      await this.repository.updateProviderPayload(payloadRecord.id, {
        responsePayload: providerError.raw,
        statusCode: providerError.statusCode,
        errorCode: providerError.code,
        errorMessage: providerError.message
      });
      throw new TemplateSyncFailedError("Template sync failed. Please try again later.");
    }
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
      let failedCount = 0;
      const syncedAt = new Date();
      const credentials = this.credentialResolver.resolve(context);

      for (const providerTemplate of providerResult.templates) {
        if (!providerTemplate.name) {
          failedCount += 1;
          continue;
        }

        const existing = await this.repository.findByProviderIdentity(
          {
            metaTemplateId: providerTemplate.providerTemplateId,
            name: providerTemplate.name,
            languageCode: providerTemplate.languageCode
          },
          context
        );

        const rawStatus = (providerTemplate.raw as { status?: string } | null)?.status;
        const status = isKnownMetaTemplateStatus(rawStatus)
          ? providerTemplate.status
          : (existing?.status ?? TemplateStatus.ERROR);

        if (existing) {
          const oldStatus = existing.status;
          await this.repository.updateFromProvider(
            existing.id,
            {
              metaTemplateId: providerTemplate.providerTemplateId,
              wabaId: credentials.wabaId,
              category: providerTemplate.category,
              type: providerTemplate.type,
              languageCode: providerTemplate.languageCode,
              status,
              qualityRating: providerTemplate.qualityRating,
              rejectionReason: providerTemplate.rejectionReason,
              lastSyncedAt: syncedAt
            },
            context
          );
          updatedCount += 1;
          await this.createProviderStatusEvents({
            templateId: existing.id,
            oldStatus,
            newStatus: status,
            source: "sync",
            metadata: { rawStatus: rawStatus ?? null },
            createdById: context.adminUserId
          });
        } else {
          const created = await this.repository.createFromProvider(
            {
              metaTemplateId: providerTemplate.providerTemplateId,
              wabaId: credentials.wabaId,
              name: providerTemplate.name,
              displayName: providerTemplate.name,
              category: providerTemplate.category,
              type: providerTemplate.type,
              languageCode: providerTemplate.languageCode,
              status,
              qualityRating: providerTemplate.qualityRating,
              rejectionReason: providerTemplate.rejectionReason,
              lastSyncedAt: syncedAt
            },
            context
          );
          createdCount += 1;
          await this.repository.createEvent({
            templateId: created.id,
            eventType: TemplateEventType.SYNCED,
            newStatus: status,
            message: "Template created locally from Meta sync.",
            metadata: { rawStatus: rawStatus ?? null },
            createdById: context.adminUserId
          });
        }
      }

      await this.repository.updateProviderPayload(payloadRecord.id, {
        responsePayload: providerResult.raw,
        statusCode: providerResult.statusCode
      });
      await this.repository.createEvent({
        eventType: TemplateEventType.SYNCED,
        message: "Templates synced from Meta.",
        metadata: { createdCount, updatedCount, syncedCount: providerResult.templates.length, failedCount },
        createdById: context.adminUserId
      });

      return {
        data: {
          syncedCount: providerResult.templates.length,
          createdCount,
          updatedCount,
          failedCount
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
      throw new TemplateSyncFailedError("Template sync failed. Please try again later.");
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

  private async findProviderTemplateByNameAndLanguage(
    template: TemplateRecord,
    credentials: TemplateProviderCredentials
  ) {
    const providerResult = await this.providerAdapter.listTemplates({ credentials });
    const providerTemplate = providerResult.templates.find(
      (candidate) => candidate.name === template.name && candidate.languageCode === template.languageCode
    );

    if (!providerTemplate) return null;

    return {
      template: providerTemplate,
      raw: providerTemplate.raw,
      statusCode: providerResult.statusCode
    };
  }

  private async createProviderStatusEvents(input: {
    templateId: string;
    oldStatus: TemplateStatus;
    newStatus: TemplateStatus;
    source: "sync" | "webhook";
    metadata?: unknown;
    createdById?: string | null;
  }) {
    await this.repository.createEvent({
      templateId: input.templateId,
      eventType: input.source === "sync" ? TemplateEventType.SYNCED : TemplateEventType.WEBHOOK_RECEIVED,
      oldStatus: input.oldStatus,
      newStatus: input.newStatus,
      message: input.source === "sync" ? "Template status synced from Meta." : "Meta template webhook received.",
      metadata: input.metadata,
      createdById: input.createdById ?? null
    });

    if (input.oldStatus === input.newStatus) return;

    const eventType = this.statusToEventType(input.newStatus);
    if (!eventType) return;

    await this.repository.createEvent({
      templateId: input.templateId,
      eventType,
      oldStatus: input.oldStatus,
      newStatus: input.newStatus,
      message: `Template status changed from ${input.oldStatus} to ${input.newStatus}.`,
      metadata: input.metadata,
      createdById: input.createdById ?? null
    });
  }

  private statusToEventType(status: TemplateStatus) {
    switch (status) {
      case TemplateStatus.APPROVED:
        return TemplateEventType.APPROVED;
      case TemplateStatus.REJECTED:
        return TemplateEventType.REJECTED;
      case TemplateStatus.PAUSED:
        return TemplateEventType.PAUSED;
      case TemplateStatus.DISABLED:
        return TemplateEventType.DISABLED;
      case TemplateStatus.ERROR:
        return TemplateEventType.ERROR;
      default:
        return null;
    }
  }
}
