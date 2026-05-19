import { TemplatesService } from "../templates.service.js";
import {
  TemplateCategory,
  TemplateEventType,
  TemplateQualityRating,
  TemplateStatus,
  TemplateType
} from "@prisma/client";

it("can construct the templates service placeholder", () => {
  expect(new TemplatesService()).toBeInstanceOf(TemplatesService);
});

it("syncs Meta templates and creates lifecycle events when status changes", async () => {
  const repository = {
    createProviderPayload: vi.fn().mockResolvedValue({ id: "payload_123" }),
    updateProviderPayload: vi.fn().mockResolvedValue({}),
    findByProviderIdentity: vi.fn().mockResolvedValue({
      id: "tmpl_123",
      status: TemplateStatus.PENDING
    }),
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
