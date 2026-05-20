import {
  TemplateCategory,
  TemplateComponentType,
  TemplateEventType,
  TemplateProvider,
  TemplateQualityRating,
  TemplateStatus,
  TemplateType
} from "@prisma/client";
import { TemplateProviderApiError } from "../domain/template.errors.js";
import { TemplateDomainService } from "../services/template-domain.service.js";
import { TemplateProviderError } from "../providers/meta/meta-template.errors.js";

const context = { adminUserId: "admin_123" };
const credentials = { graphApiVersion: "v21.0", wabaId: "waba_123", accessToken: "secret-token" };

function input() {
  return {
    name: "order_confirmation_v1",
    displayName: "Order Confirmation",
    category: TemplateCategory.UTILITY,
    type: TemplateType.TEXT,
    languageCode: "en",
    components: {
      body: { text: "Hi {{1}}" },
      buttons: []
    },
    variables: [{ componentType: TemplateComponentType.BODY, position: 1, placeholder: "{{1}}", sampleValue: "Akshay" }]
  };
}

function record(status: TemplateStatus) {
  const now = new Date("2026-05-19T10:00:00.000Z");

  return {
    id: "tmpl_123",
    adminUserId: "admin_123",
    metaTemplateId: status === TemplateStatus.PENDING ? "meta_123" : null,
    name: "order_confirmation_v1",
    displayName: "Order Confirmation",
    category: TemplateCategory.UTILITY,
    type: TemplateType.TEXT,
    languageCode: "en",
    status,
    qualityRating: TemplateQualityRating.UNKNOWN,
    rejectionReason: null,
    lastSyncedAt: null,
    createdAt: now,
    updatedAt: now,
    components: [{ componentType: TemplateComponentType.BODY, format: null, text: "Hi {{1}}", sortOrder: 0 }],
    variables: [
      {
        componentType: TemplateComponentType.BODY,
        position: 1,
        placeholder: "{{1}}",
        sampleValue: "Akshay",
        sourceKey: null
      }
    ],
    buttons: []
  };
}

it("submits created templates to the provider and updates status", async () => {
  const repository = {
    findAnyByNameAndLanguage: vi.fn().mockResolvedValue(null),
    createWithRelations: vi.fn().mockResolvedValue(record(TemplateStatus.SUBMITTING)),
    createProviderPayload: vi.fn().mockResolvedValue({ id: "payload_123" }),
    updateProviderPayload: vi.fn().mockResolvedValue({}),
    updateProviderSubmissionResult: vi.fn().mockResolvedValue(record(TemplateStatus.PENDING)),
    createEvent: vi.fn().mockResolvedValue({})
  };
  const provider = {
    createTemplate: vi.fn().mockResolvedValue({
      providerTemplateId: "meta_123",
      status: TemplateStatus.PENDING,
      raw: { id: "meta_123", status: "PENDING" },
      statusCode: 200
    }),
    listTemplates: vi.fn()
  };
  const service = new TemplateDomainService(repository as never, undefined, provider, {
    resolve: vi.fn().mockReturnValue(credentials)
  });

  const result = await service.createLocalTemplate(input(), context);

  expect(provider.createTemplate).toHaveBeenCalledWith({
    credentials,
    payload: expect.objectContaining({ name: "order_confirmation_v1" })
  });
  expect(repository.updateProviderSubmissionResult).toHaveBeenCalledWith(
    "tmpl_123",
    expect.objectContaining({ metaTemplateId: "meta_123", wabaId: "waba_123", status: TemplateStatus.PENDING }),
    context
  );
  expect(repository.createEvent).toHaveBeenCalledWith(
    expect.objectContaining({ eventType: TemplateEventType.SUBMITTED })
  );
  expect(result.data.status).toBe(TemplateStatus.PENDING);
});

it("stores provider errors and marks local templates as ERROR", async () => {
  const repository = {
    findAnyByNameAndLanguage: vi.fn().mockResolvedValue(null),
    createWithRelations: vi.fn().mockResolvedValue(record(TemplateStatus.SUBMITTING)),
    createProviderPayload: vi.fn().mockResolvedValue({ id: "payload_123" }),
    updateProviderPayload: vi.fn().mockResolvedValue({}),
    updateProviderSubmissionResult: vi.fn().mockResolvedValue(record(TemplateStatus.ERROR)),
    createEvent: vi.fn().mockResolvedValue({})
  };
  const providerError = new TemplateProviderError({
    provider: TemplateProvider.META,
    code: "100",
    message: "Invalid parameter",
    statusCode: 400,
    raw: { error: { code: "100" } }
  });
  const service = new TemplateDomainService(
    repository as never,
    undefined,
    { createTemplate: vi.fn().mockRejectedValue(providerError), listTemplates: vi.fn() },
    { resolve: vi.fn().mockReturnValue(credentials) }
  );

  await expect(service.createLocalTemplate(input(), context)).rejects.toBeInstanceOf(TemplateProviderApiError);
  expect(repository.updateProviderSubmissionResult).toHaveBeenCalledWith(
    "tmpl_123",
    { status: TemplateStatus.ERROR },
    context
  );
  expect(repository.updateProviderPayload).toHaveBeenCalledWith(
    "payload_123",
    expect.objectContaining({ errorCode: "100", errorMessage: "Invalid parameter", statusCode: 400 })
  );
  expect(repository.createEvent).toHaveBeenCalledWith(expect.objectContaining({ eventType: TemplateEventType.ERROR }));
});

it("syncs local templates from provider and ignores provider-only templates", async () => {
  const localTemplate = {
    ...record(TemplateStatus.PENDING),
    metaTemplateId: "meta_existing",
    name: "existing_template"
  };
  const repository = {
    findAllForSync: vi.fn().mockResolvedValue([localTemplate]),
    createProviderPayload: vi.fn().mockResolvedValue({ id: "payload_123" }),
    updateProviderPayload: vi.fn().mockResolvedValue({}),
    createFromProvider: vi.fn().mockResolvedValue(record(TemplateStatus.APPROVED)),
    updateFromProvider: vi.fn().mockResolvedValue(record(TemplateStatus.APPROVED)),
    createEvent: vi.fn().mockResolvedValue({})
  };
  const service = new TemplateDomainService(
    repository as never,
    undefined,
    {
      createTemplate: vi.fn(),
      listTemplates: vi.fn().mockResolvedValue({
        templates: [
          {
            providerTemplateId: "meta_new",
            name: "new_template",
            category: TemplateCategory.UTILITY,
            type: TemplateType.TEXT,
            languageCode: "en",
            status: TemplateStatus.APPROVED,
            qualityRating: TemplateQualityRating.GREEN,
            rejectionReason: null,
            raw: {}
          },
          {
            providerTemplateId: "meta_existing",
            name: "existing_template",
            category: TemplateCategory.UTILITY,
            type: TemplateType.TEXT,
            languageCode: "en",
            status: TemplateStatus.APPROVED,
            qualityRating: TemplateQualityRating.GREEN,
            rejectionReason: null,
            raw: {}
          }
        ],
        raw: { data: [] },
        statusCode: 200
      })
    },
    { resolve: vi.fn().mockReturnValue(credentials) }
  );

  await expect(service.syncTemplates(context)).resolves.toEqual({
    data: { syncedCount: 1, createdCount: 0, updatedCount: 1, failedCount: 0 },
    message: "Templates synced successfully"
  });
  expect(repository.findAllForSync).toHaveBeenCalledWith(context);
  expect(repository.createFromProvider).not.toHaveBeenCalled();
  expect(repository.updateFromProvider).toHaveBeenCalledTimes(1);
  expect(repository.updateFromProvider).toHaveBeenCalledWith(
    "tmpl_123",
    expect.objectContaining({
      metaTemplateId: "meta_existing",
      status: TemplateStatus.APPROVED,
      qualityRating: TemplateQualityRating.GREEN
    }),
    context
  );
  expect(repository.createEvent).toHaveBeenCalledWith(expect.objectContaining({ eventType: TemplateEventType.SYNCED }));
});
