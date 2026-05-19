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
