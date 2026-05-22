import {
  AutomationJobStatus,
  AutomationKey,
  AutomationResourceType,
  AutomationTriggerEvent,
  AutomationTriggerSource
} from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import { AutomationJobService } from "../services/automation-job.service.js";

const automation = {
  id: "automation_123",
  key: AutomationKey.ORDER_CONFIRMED,
  delayMinutes: 0
};

const incomingEvent = {
  id: "incoming_123",
  source: AutomationTriggerSource.SHOPIFY,
  eventType: AutomationTriggerEvent.ORDER_CREATED,
  externalEventId: "external_123",
  resourceType: AutomationResourceType.ORDER,
  resourceId: "order_123",
  customerPhone: "919999999999",
  payloadJson: {},
  receivedAt: new Date(),
  processedAt: null,
  isProcessed: false,
  errorMessage: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

const event: InternalAutomationEvent = {
  source: AutomationTriggerSource.SHOPIFY,
  eventType: AutomationTriggerEvent.ORDER_CREATED,
  resourceType: AutomationResourceType.ORDER,
  resourceId: "order_123",
  customerPhone: "919999999999",
  data: {}
};

it("creates an automation job, enqueues only automationJobId, and marks it queued", async () => {
  const repository = {
    findByIdempotencyKey: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: "automation_job_123" }),
    updateQueued: vi.fn().mockResolvedValue({ id: "automation_job_123", status: AutomationJobStatus.QUEUED }),
    updateFailed: vi.fn()
  };
  const queue = {
    addSendJob: vi.fn().mockResolvedValue("bullmq_123")
  };
  const service = new AutomationJobService(repository as never, queue as never);

  await service.createAutomationJobAndEnqueue({
    automation: automation as never,
    incomingEvent,
    event,
    scheduledAt: new Date(),
    idempotencyKey: "SHOPIFY:ORDER_CONFIRMED:ORDER:order_123"
  });

  expect(repository.create).toHaveBeenCalledWith(
    expect.objectContaining({
      automationId: "automation_123",
      incomingEventId: "incoming_123",
      resourceType: AutomationResourceType.ORDER,
      resourceId: "order_123",
      customerPhone: "919999999999",
      status: AutomationJobStatus.PENDING,
      idempotencyKey: "SHOPIFY:ORDER_CONFIRMED:ORDER:order_123"
    })
  );
  expect(queue.addSendJob).toHaveBeenCalledWith(
    expect.objectContaining({
      automationJobId: "automation_job_123",
      idempotencyKey: "SHOPIFY:ORDER_CONFIRMED:ORDER:order_123"
    })
  );
  expect(queue.addSendJob.mock.calls[0]?.[0]).not.toHaveProperty("event");
  expect(queue.addSendJob.mock.calls[0]?.[0]).not.toHaveProperty("payloadJson");
  expect(repository.updateQueued).toHaveBeenCalledWith("automation_job_123", "bullmq_123");
});

it("skips duplicate automation job idempotency keys", async () => {
  const existing = { id: "existing_job_123" };
  const repository = {
    findByIdempotencyKey: vi.fn().mockResolvedValue(existing),
    create: vi.fn(),
    updateQueued: vi.fn(),
    updateFailed: vi.fn()
  };
  const queue = {
    addSendJob: vi.fn()
  };
  const service = new AutomationJobService(repository as never, queue as never);

  const result = await service.createAutomationJobAndEnqueue({
    automation: automation as never,
    incomingEvent,
    event,
    scheduledAt: new Date(),
    idempotencyKey: "SHOPIFY:ORDER_CONFIRMED:ORDER:order_123"
  });

  expect(result).toBe(existing);
  expect(repository.create).not.toHaveBeenCalled();
  expect(queue.addSendJob).not.toHaveBeenCalled();
});
