import { AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";
import { AutomationEventProcessorService } from "../services/automation-event-processor.service.js";

const baseIncomingEvent = {
  id: "incoming_123",
  source: AutomationTriggerSource.SHOPIFY,
  eventType: AutomationTriggerEvent.ORDER_CREATED,
  externalEventId: "external_123",
  resourceType: AutomationResourceType.ORDER,
  resourceId: "123456789",
  customerPhone: "919999999999",
  payloadJson: {
    id: 123456789,
    payment_gateway_names: ["razorpay"],
    shipping_address: { phone: "919999999999" }
  },
  receivedAt: new Date(),
  processedAt: null,
  isProcessed: false,
  errorMessage: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

function createProcessor(overrides: { repository?: Record<string, unknown>; engine?: Record<string, unknown> } = {}) {
  const repository = {
    findById: vi.fn().mockResolvedValue(baseIncomingEvent),
    markProcessed: vi.fn(),
    markFailed: vi.fn(),
    ...overrides.repository
  };
  const engine = {
    handleEvent: vi.fn(),
    ...overrides.engine
  };

  return {
    repository,
    engine,
    processor: new AutomationEventProcessorService(repository as never, engine as never)
  };
}

it("loads Shopify incoming events, adapts them, and marks processed after engine success", async () => {
  const { processor, engine, repository } = createProcessor();

  const result = await processor.processIncomingEvent("incoming_123");

  expect(engine.handleEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      source: AutomationTriggerSource.SHOPIFY,
      eventType: AutomationTriggerEvent.ORDER_CREATED,
      resourceId: "123456789",
      customerPhone: "919999999999"
    }),
    baseIncomingEvent
  );
  expect(repository.markProcessed).toHaveBeenCalledWith("incoming_123");
  expect(result).toEqual({ status: "processed" });
});

it("skips already processed events", async () => {
  const { processor, engine, repository } = createProcessor({
    repository: {
      findById: vi.fn().mockResolvedValue({ ...baseIncomingEvent, isProcessed: true })
    }
  });

  const result = await processor.processIncomingEvent("incoming_123");

  expect(engine.handleEvent).not.toHaveBeenCalled();
  expect(repository.markProcessed).not.toHaveBeenCalled();
  expect(result).toEqual({ status: "already_processed" });
});

it("stores error and rethrows when engine processing fails", async () => {
  const { processor, repository } = createProcessor({
    engine: {
      handleEvent: vi.fn().mockRejectedValue(new Error("engine failed"))
    }
  });

  await expect(processor.processIncomingEvent("incoming_123")).rejects.toThrow("engine failed");
  expect(repository.markFailed).toHaveBeenCalledWith("incoming_123", "engine failed");
});
