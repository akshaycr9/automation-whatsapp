import {
  AutomationComponentType,
  AutomationJobStatus,
  AutomationKey,
  AutomationResourceType,
  AutomationTriggerEvent,
  AutomationTriggerSource,
  TemplateStatus
} from "@prisma/client";
import { AutomationSendProcessorService } from "../services/automation-send-processor.service.js";

function createJob(overrides: Record<string, unknown> = {}) {
  return {
    id: "automation_job_123",
    automationId: "automation_123",
    incomingEventId: "incoming_123",
    resourceType: AutomationResourceType.ORDER,
    resourceId: "123456789",
    customerPhone: "919999999999",
    scheduledAt: new Date(),
    status: AutomationJobStatus.QUEUED,
    bullmqJobId: "bullmq_123",
    idempotencyKey: "SHOPIFY:ORDER_CONFIRMED:ORDER:123456789",
    attemptCount: 0,
    lastError: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    incomingEvent: {
      id: "incoming_123",
      source: AutomationTriggerSource.SHOPIFY,
      eventType: AutomationTriggerEvent.ORDER_CREATED,
      externalEventId: "external_123",
      resourceType: AutomationResourceType.ORDER,
      resourceId: "123456789",
      customerPhone: "919999999999",
      payloadJson: {
        id: 123456789,
        name: "#1001",
        payment_gateway_names: ["razorpay"],
        shipping_address: { phone: "919999999999" },
        customer: { first_name: "Akshay" }
      },
      receivedAt: new Date(),
      processedAt: new Date(),
      isProcessed: true,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    automation: {
      id: "automation_123",
      key: AutomationKey.ORDER_CONFIRMED,
      isEnabled: true,
      templateId: "template_123",
      template: {
        id: "template_123",
        name: "order_confirmed",
        languageCode: "en",
        status: TemplateStatus.APPROVED
      },
      variableMappings: [
        {
          templateVariableName: "body_1",
          componentType: AutomationComponentType.BODY,
          variableIndex: 1,
          sourceField: "customer.firstName",
          fallbackValue: "there"
        },
        {
          templateVariableName: "body_2",
          componentType: AutomationComponentType.BODY,
          variableIndex: 2,
          sourceField: "order.name",
          fallbackValue: null
        }
      ]
    },
    ...overrides
  };
}

function createProcessor(job = createJob(), overrides: Record<string, unknown> = {}) {
  const jobs = {
    findByIdWithRelations: vi.fn().mockResolvedValue(job),
    markProcessing: vi.fn(),
    markCompleted: vi.fn(),
    markSkipped: vi.fn(),
    updateFailed: vi.fn()
  };
  const sender = {
    sendTemplateMessage: vi.fn().mockResolvedValue({ providerMessageId: "wamid.sent" })
  };
  const actionStates = {
    findByFlowResource: vi.fn(),
    upsertState: vi.fn()
  };

  return {
    jobs,
    sender,
    actionStates,
    processor: new AutomationSendProcessorService(
      jobs as never,
      overrides.conditions as never,
      undefined,
      undefined,
      sender as never,
      actionStates as never
    )
  };
}

it("marks job processing, sends template, and marks completed", async () => {
  const { processor, jobs, sender } = createProcessor();

  const result = await processor.processAutomationJob("automation_job_123");

  expect(jobs.markProcessing).toHaveBeenCalledWith("automation_job_123");
  expect(sender.sendTemplateMessage).toHaveBeenCalledWith({
    to: "919999999999",
    templateName: "order_confirmed",
    languageCode: "en",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: "Akshay" },
          { type: "text", text: "#1001" }
        ]
      }
    ]
  });
  expect(jobs.markCompleted).toHaveBeenCalledWith("automation_job_123");
  expect(result).toEqual({ status: "completed" });
});

it("does not resend completed jobs", async () => {
  const { processor, jobs, sender } = createProcessor(createJob({ status: AutomationJobStatus.COMPLETED }));

  const result = await processor.processAutomationJob("automation_job_123");

  expect(jobs.markProcessing).not.toHaveBeenCalled();
  expect(sender.sendTemplateMessage).not.toHaveBeenCalled();
  expect(result).toEqual({ status: "ignored", reason: "Automation job is already COMPLETED." });
});

it("skips disabled automations", async () => {
  const job = createJob({
    automation: {
      ...createJob().automation,
      isEnabled: false
    }
  });
  const { processor, jobs, sender } = createProcessor(job);

  const result = await processor.processAutomationJob("automation_job_123");

  expect(sender.sendTemplateMessage).not.toHaveBeenCalled();
  expect(jobs.markSkipped).toHaveBeenCalledWith("automation_job_123", "Automation is disabled.");
  expect(result).toEqual({ status: "skipped", reason: "Automation is disabled." });
});

it("skips unresolved required variables", async () => {
  const base = createJob();
  const job = createJob({
    incomingEvent: {
      ...base.incomingEvent,
      payloadJson: {
        id: 123456789,
        payment_gateway_names: ["razorpay"],
        shipping_address: { phone: "919999999999" },
        customer: { first_name: "Akshay" }
      }
    }
  });
  const { processor, jobs, sender } = createProcessor(job);

  await processor.processAutomationJob("automation_job_123");

  expect(sender.sendTemplateMessage).not.toHaveBeenCalled();
  expect(jobs.markSkipped).toHaveBeenCalledWith(
    "automation_job_123",
    "Required variable body_2 could not be resolved."
  );
});

it("marks failed and throws when sender fails", async () => {
  const { processor, jobs, sender } = createProcessor();
  sender.sendTemplateMessage.mockRejectedValue(new Error("Meta failed"));

  await expect(processor.processAutomationJob("automation_job_123")).rejects.toThrow("Meta failed");
  expect(jobs.updateFailed).toHaveBeenCalledWith("automation_job_123", "Meta failed");
});
