import { AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";
import { WhatsAppWebhookService } from "../services/whatsapp-webhook.service.js";

const confirmPayload = {
  entry: [
    {
      changes: [
        {
          value: {
            messages: [
              {
                from: "919999999999",
                id: "wamid.confirm.test",
                timestamp: "1710000000",
                type: "interactive",
                interactive: {
                  button_reply: {
                    id: "COD_CONFIRM:ORDER:123456789",
                    title: "Confirm my order"
                  }
                }
              }
            ]
          }
        }
      ]
    }
  ]
};

function createRepository(overrides: Record<string, unknown> = {}) {
  return {
    findBySourceAndExternalEventId: vi.fn(),
    createIncomingEvent: vi.fn().mockResolvedValue({
      id: "incoming_123",
      source: AutomationTriggerSource.WHATSAPP,
      eventType: AutomationTriggerEvent.BUTTON_REPLY,
      externalEventId: "wamid.confirm.test",
      resourceType: AutomationResourceType.ORDER,
      resourceId: "123456789",
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
    service: new WhatsAppWebhookService(repository as never, queue as never)
  };
}

it("stores a WhatsApp button reply and queues only the incomingEventId", async () => {
  const { service, repository, queue } = createService();

  const result = await service.handleWebhook(confirmPayload);

  expect(repository.createIncomingEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      source: AutomationTriggerSource.WHATSAPP,
      eventType: AutomationTriggerEvent.BUTTON_REPLY,
      externalEventId: "wamid.confirm.test",
      resourceType: AutomationResourceType.ORDER,
      resourceId: "123456789",
      customerPhone: "919999999999",
      payloadJson: expect.objectContaining({ id: "wamid.confirm.test" })
    })
  );
  expect(queue.addEventProcessingJob).toHaveBeenCalledWith({
    incomingEventId: "incoming_123",
    idempotencyKey: "WHATSAPP:BUTTON_REPLY:wamid.confirm.test"
  });
  const queuedPayload = queue.addEventProcessingJob.mock.calls[0]?.[0];
  expect(queuedPayload).not.toHaveProperty("payloadJson");
  expect(result.data).toEqual({ status: "received", queuedCount: 1, duplicateCount: 0 });
});

it("does not create or enqueue duplicate WhatsApp message events", async () => {
  const repository = createRepository({
    findBySourceAndExternalEventId: vi.fn().mockResolvedValue({
      id: "incoming_existing",
      errorMessage: null
    })
  });
  const { service, queue } = createService(repository);

  const result = await service.handleWebhook(confirmPayload);

  expect(repository.createIncomingEvent).not.toHaveBeenCalled();
  expect(queue.addEventProcessingJob).not.toHaveBeenCalled();
  expect(result.data).toEqual({ status: "received", queuedCount: 0, duplicateCount: 1 });
});

it("safely ignores unsupported WhatsApp messages", async () => {
  const { service, repository, queue } = createService();

  const result = await service.handleWebhook({
    entry: [{ changes: [{ value: { messages: [{ id: "wamid.text.test", type: "text" }] } }] }]
  });

  expect(repository.createIncomingEvent).not.toHaveBeenCalled();
  expect(queue.addEventProcessingJob).not.toHaveBeenCalled();
  expect(result.data).toEqual({ status: "ignored", queuedCount: 0, duplicateCount: 0 });
});
