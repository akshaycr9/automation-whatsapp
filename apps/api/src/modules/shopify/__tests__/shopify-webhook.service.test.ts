import { AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";
import { ShopifyWebhookService } from "../services/shopify-webhook.service.js";

function createRepository(overrides: Record<string, unknown> = {}) {
  return {
    findBySourceAndExternalEventId: vi.fn(),
    createIncomingEvent: vi.fn().mockResolvedValue({
      id: "incoming_123",
      source: AutomationTriggerSource.SHOPIFY,
      eventType: AutomationTriggerEvent.ORDER_CREATED,
      externalEventId: "webhook_123",
      resourceType: AutomationResourceType.ORDER,
      resourceId: "123",
      customerPhone: "919999999999",
      payloadJson: {},
      receivedAt: new Date(),
      processedAt: null,
      isProcessed: false,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    updateErrorMessage: vi.fn(),
    ...overrides
  };
}

function createService(
  repository = createRepository(),
  queue = { addEventProcessingJob: vi.fn().mockResolvedValue("job_123") }
) {
  return {
    repository,
    queue,
    service: new ShopifyWebhookService(repository as never, queue as never, { verify: vi.fn() } as never)
  };
}

it("stores a Shopify event and queues only the incomingEventId", async () => {
  const { service, repository, queue } = createService();

  const result = await service.handleWebhook({
    routeTopic: "orders-create",
    headers: {
      hmac: "valid",
      webhookId: "webhook_123",
      topic: "orders/create"
    },
    rawBody: Buffer.from("{}"),
    payload: {
      id: 123,
      payment_gateway_names: ["razorpay"],
      shipping_address: { phone: "919999999999" }
    }
  });

  expect(repository.createIncomingEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      source: AutomationTriggerSource.SHOPIFY,
      eventType: AutomationTriggerEvent.ORDER_CREATED,
      externalEventId: "webhook_123",
      resourceType: AutomationResourceType.ORDER,
      resourceId: "123",
      customerPhone: "919999999999",
      payloadJson: expect.objectContaining({ id: 123 })
    })
  );
  expect(queue.addEventProcessingJob).toHaveBeenCalledWith({
    incomingEventId: "incoming_123",
    idempotencyKey: "SHOPIFY:ORDER_CREATED:webhook_123"
  });
  const queuedPayload = queue.addEventProcessingJob.mock.calls[0]?.[0];
  expect(queuedPayload).not.toHaveProperty("payloadJson");
  expect(result.data).toEqual({ status: "queued", incomingEventId: "incoming_123" });
});

it("does not create or enqueue a duplicate Shopify webhook", async () => {
  const repository = createRepository({
    findBySourceAndExternalEventId: vi.fn().mockResolvedValue({
      id: "incoming_existing",
      errorMessage: null
    })
  });
  const { service, queue } = createService(repository);

  const result = await service.handleWebhook({
    routeTopic: "orders-create",
    headers: {
      hmac: "valid",
      webhookId: "webhook_123",
      topic: "orders/create"
    },
    rawBody: Buffer.from("{}"),
    payload: {
      id: 123,
      payment_gateway_names: ["razorpay"]
    }
  });

  expect(repository.createIncomingEvent).not.toHaveBeenCalled();
  expect(queue.addEventProcessingJob).not.toHaveBeenCalled();
  expect(result.data).toEqual({ status: "duplicate", incomingEventId: "incoming_existing" });
});
