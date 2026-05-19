import { TemplateEventType, TemplateProviderAction, TemplateQualityRating, TemplateStatus } from "@prisma/client";
import { MetaTemplateStatusWebhookHandler } from "../handlers/meta-template-status.handler.js";
import { WebhooksService } from "../webhooks.service.js";

function createRepository(overrides: Record<string, unknown> = {}) {
  return {
    findByWebhookIdentity: vi.fn(),
    createProviderPayload: vi.fn().mockResolvedValue({ id: "payload_123" }),
    updateProviderPayload: vi.fn().mockResolvedValue({}),
    updateFromWebhook: vi.fn().mockResolvedValue({}),
    createEvent: vi.fn().mockResolvedValue({}),
    ...overrides
  };
}

it("updates a local template from a Meta template status webhook", async () => {
  const repository = createRepository({
    findByWebhookIdentity: vi.fn().mockResolvedValue({
      id: "tmpl_123",
      status: TemplateStatus.PENDING
    })
  });
  const service = new WebhooksService([new MetaTemplateStatusWebhookHandler(repository as never)]);

  await service.handleMetaWebhook({
    entry: [
      {
        id: "waba_123",
        changes: [
          {
            field: "message_template_status_update",
            value: {
              message_template_id: "meta_123",
              message_template_name: "order_update",
              message_template_language: "en",
              event: "APPROVED",
              quality_score: "GREEN"
            }
          }
        ]
      }
    ]
  });

  expect(repository.findByWebhookIdentity).toHaveBeenCalledWith({
    metaTemplateId: "meta_123",
    name: "order_update",
    languageCode: "en",
    wabaId: "waba_123"
  });
  expect(repository.updateFromWebhook).toHaveBeenCalledWith(
    "tmpl_123",
    expect.objectContaining({
      status: TemplateStatus.APPROVED,
      qualityRating: TemplateQualityRating.GREEN,
      rejectionReason: null
    })
  );
  expect(repository.createEvent).toHaveBeenCalledWith(
    expect.objectContaining({ eventType: TemplateEventType.WEBHOOK_RECEIVED })
  );
  expect(repository.createEvent).toHaveBeenCalledWith(
    expect.objectContaining({ eventType: TemplateEventType.APPROVED })
  );
});

it("does not create duplicate lifecycle events when status is unchanged", async () => {
  const repository = createRepository({
    findByWebhookIdentity: vi.fn().mockResolvedValue({
      id: "tmpl_123",
      status: TemplateStatus.APPROVED
    })
  });
  const service = new WebhooksService([new MetaTemplateStatusWebhookHandler(repository as never)]);

  await service.handleMetaWebhook({
    entry: [
      {
        changes: [
          { field: "message_template_status_update", value: { message_template_id: "meta_123", event: "APPROVED" } }
        ]
      }
    ]
  });

  expect(repository.createEvent).toHaveBeenCalledTimes(1);
  expect(repository.createEvent).toHaveBeenCalledWith(
    expect.objectContaining({ eventType: TemplateEventType.WEBHOOK_RECEIVED })
  );
});

it("stores unknown Meta statuses without crashing or changing local status", async () => {
  const repository = createRepository({
    findByWebhookIdentity: vi.fn().mockResolvedValue({
      id: "tmpl_123",
      status: TemplateStatus.PENDING
    })
  });
  const service = new WebhooksService([new MetaTemplateStatusWebhookHandler(repository as never)]);

  await service.handleMetaWebhook({
    entry: [
      {
        changes: [
          { field: "message_template_status_update", value: { message_template_id: "meta_123", event: "IN_APPEAL" } }
        ]
      }
    ]
  });

  expect(repository.updateFromWebhook).toHaveBeenCalledWith(
    "tmpl_123",
    expect.not.objectContaining({ status: expect.any(String) })
  );
  expect(repository.createEvent).toHaveBeenCalledWith(expect.objectContaining({ eventType: TemplateEventType.ERROR }));
});

it("audits unmatched webhook events", async () => {
  const repository = createRepository({
    findByWebhookIdentity: vi.fn().mockResolvedValue(null)
  });
  const service = new WebhooksService([new MetaTemplateStatusWebhookHandler(repository as never)]);

  const result = await service.handleMetaWebhook({
    entry: [
      {
        changes: [
          {
            field: "message_template_status_update",
            value: { message_template_id: "missing_meta_123", event: "REJECTED" }
          }
        ]
      }
    ]
  });

  expect(result.data.processedCount).toBe(0);
  expect(repository.createProviderPayload).toHaveBeenCalledWith(
    expect.objectContaining({ action: TemplateProviderAction.WEBHOOK, templateId: null })
  );
  expect(repository.updateProviderPayload).toHaveBeenCalledWith(
    "payload_123",
    expect.objectContaining({ errorCode: "META_TEMPLATE_NOT_FOUND" })
  );
});
