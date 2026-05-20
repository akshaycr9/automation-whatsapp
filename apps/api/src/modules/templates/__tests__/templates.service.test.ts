import { TemplatesService } from "../templates.service.js";
import {
  TemplateCategory,
  TemplateComponentType,
  TemplateEventType,
  TemplateQualityRating,
  TemplateStatus,
  TemplateType
} from "@prisma/client";
import { TemplateProviderError } from "../providers/meta/meta-template.errors.js";

it("can construct the templates service placeholder", () => {
  expect(new TemplatesService()).toBeInstanceOf(TemplatesService);
});

it("syncs only local templates and creates lifecycle events when status changes", async () => {
  const localTemplate = {
    id: "tmpl_123",
    adminUserId: "admin_123",
    metaTemplateId: null,
    name: "order_update",
    displayName: "Order Update",
    category: TemplateCategory.UTILITY,
    type: TemplateType.TEXT,
    languageCode: "en",
    status: TemplateStatus.PENDING,
    qualityRating: TemplateQualityRating.UNKNOWN,
    rejectionReason: null,
    allowCategoryChange: false,
    lastSyncedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    components: [],
    variables: [],
    buttons: []
  };
  const repository = {
    findAllForSync: vi.fn().mockResolvedValue([localTemplate]),
    createProviderPayload: vi.fn().mockResolvedValue({ id: "payload_123" }),
    updateProviderPayload: vi.fn().mockResolvedValue({}),
    updateFromProvider: vi.fn().mockResolvedValue({}),
    createFromProvider: vi.fn(),
    createEvent: vi.fn().mockResolvedValue({})
  };
  const providerAdapter = {
    listTemplates: vi.fn().mockResolvedValue({
      templates: [
        {
          providerTemplateId: "meta_123",
          name: "order_update",
          category: TemplateCategory.UTILITY,
          type: TemplateType.TEXT,
          languageCode: "en",
          status: TemplateStatus.APPROVED,
          qualityRating: TemplateQualityRating.GREEN,
          rejectionReason: null,
          raw: { status: "APPROVED" }
        },
        {
          providerTemplateId: "meta_foreign",
          name: "legacy_template_from_other_app",
          category: TemplateCategory.MARKETING,
          type: TemplateType.TEXT,
          languageCode: "en",
          status: TemplateStatus.APPROVED,
          qualityRating: TemplateQualityRating.GREEN,
          rejectionReason: null,
          raw: { status: "APPROVED" }
        }
      ],
      raw: { data: [] },
      statusCode: 200
    })
  };
  const credentialResolver = {
    resolve: vi.fn().mockReturnValue({
      graphApiVersion: "v21.0",
      wabaId: "waba_123",
      accessToken: "token"
    })
  };
  const service = new TemplatesService(
    repository as never,
    undefined as never,
    providerAdapter as never,
    credentialResolver as never
  );

  const result = await service.syncTemplates({ adminUserId: "admin_123" });

  expect(result.data).toEqual({ syncedCount: 1, createdCount: 0, updatedCount: 1, failedCount: 0 });
  expect(repository.findAllForSync).toHaveBeenCalledWith({ adminUserId: "admin_123" });
  expect(repository.createFromProvider).not.toHaveBeenCalled();
  expect(repository.updateFromProvider).toHaveBeenCalledWith(
    "tmpl_123",
    expect.objectContaining({
      metaTemplateId: "meta_123",
      wabaId: "waba_123",
      status: TemplateStatus.APPROVED,
      qualityRating: TemplateQualityRating.GREEN
    }),
    { adminUserId: "admin_123" }
  );
  expect(repository.createEvent).toHaveBeenCalledWith(
    expect.objectContaining({ eventType: TemplateEventType.SYNCED, oldStatus: TemplateStatus.PENDING })
  );
  expect(repository.createEvent).toHaveBeenCalledWith(
    expect.objectContaining({ eventType: TemplateEventType.APPROVED, oldStatus: TemplateStatus.PENDING })
  );
});

it("does not create local rows for provider templates missing from the local database", async () => {
  const repository = {
    findAllForSync: vi.fn().mockResolvedValue([]),
    createProviderPayload: vi.fn().mockResolvedValue({ id: "payload_123" }),
    updateProviderPayload: vi.fn().mockResolvedValue({}),
    updateFromProvider: vi.fn(),
    createFromProvider: vi.fn(),
    createEvent: vi.fn().mockResolvedValue({})
  };
  const providerAdapter = {
    listTemplates: vi.fn().mockResolvedValue({
      templates: [
        {
          providerTemplateId: "meta_foreign",
          name: "legacy_template_from_other_app",
          category: TemplateCategory.MARKETING,
          type: TemplateType.TEXT,
          languageCode: "en",
          status: TemplateStatus.APPROVED,
          qualityRating: TemplateQualityRating.GREEN,
          rejectionReason: null,
          raw: { status: "APPROVED" }
        }
      ],
      raw: { data: [] },
      statusCode: 200
    })
  };
  const credentialResolver = {
    resolve: vi.fn().mockReturnValue({
      graphApiVersion: "v21.0",
      wabaId: "waba_123",
      accessToken: "token"
    })
  };
  const service = new TemplatesService(
    repository as never,
    undefined as never,
    providerAdapter as never,
    credentialResolver as never
  );

  const result = await service.syncTemplates({ adminUserId: "admin_123" });

  expect(result.data).toEqual({ syncedCount: 0, createdCount: 0, updatedCount: 0, failedCount: 0 });
  expect(providerAdapter.listTemplates).not.toHaveBeenCalled();
  expect(repository.createFromProvider).not.toHaveBeenCalled();
  expect(repository.updateFromProvider).not.toHaveBeenCalled();
});

it("retry submission reconciles an existing Meta template before creating a duplicate", async () => {
  const localTemplate = {
    id: "tmpl_123",
    adminUserId: "admin_123",
    metaTemplateId: null,
    name: "order_update",
    displayName: "Order Update",
    category: TemplateCategory.UTILITY,
    type: TemplateType.TEXT,
    languageCode: "en",
    status: TemplateStatus.ERROR,
    qualityRating: TemplateQualityRating.UNKNOWN,
    rejectionReason: null,
    allowCategoryChange: false,
    lastSyncedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    components: [],
    variables: [],
    buttons: []
  };
  const repository = {
    findById: vi.fn().mockResolvedValue(localTemplate),
    updateFromProvider: vi
      .fn()
      .mockResolvedValue({ ...localTemplate, metaTemplateId: "meta_123", status: TemplateStatus.PENDING }),
    createProviderPayload: vi.fn().mockResolvedValue({ id: "payload_123" }),
    createEvent: vi.fn().mockResolvedValue({})
  };
  const providerAdapter = {
    listTemplates: vi.fn().mockResolvedValue({
      templates: [
        {
          providerTemplateId: "meta_123",
          name: "order_update",
          category: TemplateCategory.UTILITY,
          type: TemplateType.TEXT,
          languageCode: "en",
          status: TemplateStatus.PENDING,
          qualityRating: TemplateQualityRating.UNKNOWN,
          rejectionReason: null,
          raw: { id: "meta_123" }
        }
      ],
      raw: { data: [] },
      statusCode: 200
    }),
    createTemplate: vi.fn()
  };
  const credentialResolver = {
    resolve: vi.fn().mockReturnValue({
      graphApiVersion: "v21.0",
      wabaId: "waba_123",
      accessToken: "token"
    })
  };
  const service = new TemplatesService(
    repository as never,
    undefined as never,
    providerAdapter as never,
    credentialResolver as never
  );

  await service.retrySubmission("tmpl_123", { adminUserId: "admin_123" });

  expect(providerAdapter.createTemplate).not.toHaveBeenCalled();
  expect(repository.updateFromProvider).toHaveBeenCalledWith(
    "tmpl_123",
    expect.objectContaining({ metaTemplateId: "meta_123", status: TemplateStatus.PENDING }),
    { adminUserId: "admin_123" }
  );
});

it("syncs a single template from Meta by provider id", async () => {
  const localTemplate = {
    id: "tmpl_123",
    adminUserId: "admin_123",
    metaTemplateId: "meta_123",
    name: "order_update",
    displayName: "Order Update",
    category: TemplateCategory.UTILITY,
    type: TemplateType.TEXT,
    languageCode: "en",
    status: TemplateStatus.PENDING,
    qualityRating: TemplateQualityRating.UNKNOWN,
    rejectionReason: null,
    allowCategoryChange: false,
    lastSyncedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    components: [],
    variables: [],
    buttons: []
  };
  const repository = {
    findById: vi.fn().mockResolvedValue(localTemplate),
    createProviderPayload: vi.fn().mockResolvedValue({ id: "payload_123" }),
    updateProviderPayload: vi.fn().mockResolvedValue({}),
    updateFromProvider: vi.fn().mockResolvedValue({ ...localTemplate, status: TemplateStatus.APPROVED }),
    createEvent: vi.fn().mockResolvedValue({})
  };
  const providerAdapter = {
    getTemplate: vi.fn().mockResolvedValue({
      template: {
        providerTemplateId: "meta_123",
        name: "order_update",
        category: TemplateCategory.UTILITY,
        type: TemplateType.TEXT,
        languageCode: "en",
        status: TemplateStatus.APPROVED,
        qualityRating: TemplateQualityRating.GREEN,
        rejectionReason: null,
        raw: { status: "APPROVED" }
      },
      raw: { status: "APPROVED" },
      statusCode: 200
    }),
    listTemplates: vi.fn()
  };
  const credentialResolver = {
    resolve: vi.fn().mockReturnValue({
      graphApiVersion: "v21.0",
      wabaId: "waba_123",
      accessToken: "token"
    })
  };
  const service = new TemplatesService(
    repository as never,
    undefined as never,
    providerAdapter as never,
    credentialResolver as never
  );

  await service.syncTemplate("tmpl_123", { adminUserId: "admin_123" });

  expect(providerAdapter.getTemplate).toHaveBeenCalledWith({
    credentials: { graphApiVersion: "v21.0", wabaId: "waba_123", accessToken: "token" },
    providerTemplateId: "meta_123"
  });
  expect(providerAdapter.listTemplates).not.toHaveBeenCalled();
  expect(repository.updateFromProvider).toHaveBeenCalledWith(
    "tmpl_123",
    expect.objectContaining({ status: TemplateStatus.APPROVED, qualityRating: TemplateQualityRating.GREEN }),
    { adminUserId: "admin_123" }
  );
});

it("returns a safe provider error when Meta create fails", async () => {
  const repository = {
    findAnyByNameAndLanguage: vi.fn().mockResolvedValue(null),
    createWithRelations: vi.fn().mockResolvedValue({
      id: "tmpl_123",
      status: TemplateStatus.SUBMITTING,
      name: "order_update",
      languageCode: "en"
    }),
    createProviderPayload: vi.fn().mockResolvedValue({ id: "payload_123" }),
    updateProviderPayload: vi.fn().mockResolvedValue({}),
    updateProviderSubmissionResult: vi.fn().mockResolvedValue({}),
    createEvent: vi.fn().mockResolvedValue({})
  };
  const factoryResolver = {
    build: vi.fn().mockReturnValue({
      template: {
        name: "order_update",
        displayName: "Order Update",
        category: TemplateCategory.UTILITY,
        type: TemplateType.TEXT,
        languageCode: "en",
        status: TemplateStatus.DRAFT,
        createdById: "admin_123",
        updatedById: "admin_123"
      },
      components: [{ componentType: TemplateComponentType.BODY, text: "Hi {{1}}", sortOrder: 0 }],
      variables: [{ componentType: TemplateComponentType.BODY, position: 1, placeholder: "{{1}}", sampleValue: "A" }],
      buttons: [],
      event: { eventType: TemplateEventType.CREATED, newStatus: TemplateStatus.DRAFT, createdById: "admin_123" }
    })
  };
  const providerAdapter = {
    createTemplate: vi.fn().mockRejectedValue(
      new TemplateProviderError({
        provider: "META",
        code: "190",
        message: "Sensitive provider token error",
        statusCode: 400,
        raw: { error: { message: "Sensitive provider token error" } }
      })
    )
  };
  const credentialResolver = {
    resolve: vi.fn().mockReturnValue({
      graphApiVersion: "v21.0",
      wabaId: "waba_123",
      accessToken: "secret-token"
    })
  };
  const service = new TemplatesService(
    repository as never,
    factoryResolver as never,
    providerAdapter as never,
    credentialResolver as never
  );

  await expect(
    service.createLocalTemplate(
      {
        name: "order_update",
        displayName: "Order Update",
        category: TemplateCategory.UTILITY,
        type: TemplateType.TEXT,
        languageCode: "en",
        components: { body: { text: "Hi {{1}}" }, buttons: [] },
        variables: [{ componentType: TemplateComponentType.BODY, position: 1, placeholder: "{{1}}", sampleValue: "A" }]
      },
      { adminUserId: "admin_123" }
    )
  ).rejects.toMatchObject({
    code: "TEMPLATE_PROVIDER_ERROR",
    message: "Template provider request failed."
  });
  expect(repository.updateProviderPayload).toHaveBeenCalledWith(
    "payload_123",
    expect.objectContaining({ errorMessage: "Sensitive provider token error" })
  );
});

it("does not persist a template when Meta credentials are missing", async () => {
  const repository = {
    findAnyByNameAndLanguage: vi.fn().mockResolvedValue(null),
    createWithRelations: vi.fn(),
    createProviderPayload: vi.fn()
  };
  const factoryResolver = {
    build: vi.fn().mockReturnValue({
      template: {
        name: "order_update",
        displayName: "Order Update",
        category: TemplateCategory.UTILITY,
        type: TemplateType.TEXT,
        languageCode: "en",
        status: TemplateStatus.DRAFT,
        createdById: "admin_123",
        updatedById: "admin_123"
      },
      components: [{ componentType: TemplateComponentType.BODY, text: "Hi {{1}}", sortOrder: 0 }],
      variables: [{ componentType: TemplateComponentType.BODY, position: 1, placeholder: "{{1}}", sampleValue: "A" }],
      buttons: [],
      event: { eventType: TemplateEventType.CREATED, newStatus: TemplateStatus.DRAFT, createdById: "admin_123" }
    })
  };
  const credentialResolver = {
    resolve: vi.fn(() => {
      throw Object.assign(new Error("Meta WhatsApp template credentials are not configured."), {
        statusCode: 503,
        code: "TEMPLATE_PROVIDER_ERROR"
      });
    })
  };
  const service = new TemplatesService(
    repository as never,
    factoryResolver as never,
    { createTemplate: vi.fn() } as never,
    credentialResolver as never
  );

  await expect(
    service.createLocalTemplate(
      {
        name: "order_update",
        displayName: "Order Update",
        category: TemplateCategory.UTILITY,
        type: TemplateType.TEXT,
        languageCode: "en",
        components: { body: { text: "Hi {{1}}" }, buttons: [] },
        variables: [{ componentType: TemplateComponentType.BODY, position: 1, placeholder: "{{1}}", sampleValue: "A" }]
      },
      { adminUserId: "admin_123" }
    )
  ).rejects.toMatchObject({
    code: "TEMPLATE_PROVIDER_ERROR",
    statusCode: 503
  });
  expect(repository.createWithRelations).not.toHaveBeenCalled();
  expect(repository.createProviderPayload).not.toHaveBeenCalled();
});
