import {
  AutomationActionStateValue,
  AutomationFlowKey,
  AutomationJobStatus,
  AutomationKey,
  AutomationTriggerEvent,
  AutomationTriggerSource
} from "@prisma/client";
import { adaptShopifyCheckoutWebhook } from "../../shopify/adapters/shopify-checkout.adapter.js";
import { adaptShopifyOrderWebhook } from "../../shopify/adapters/shopify-order.adapter.js";
import { adaptWhatsAppButtonReply } from "../../whatsapp/adapters/whatsapp-button-reply.adapter.js";
import { MetaWhatsAppTemplateSenderService } from "../../whatsapp/services/meta-whatsapp-template-sender.service.js";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import { AutomationActionStateRepository } from "../repository/automation-action-state.repository.js";
import { AutomationJobRepository } from "../repository/automation-job.repository.js";
import { AutomationSendConditionService } from "./automation-send-condition.service.js";
import { AutomationTemplatePayloadBuilderService } from "./automation-template-payload-builder.service.js";
import { AutomationVariableResolverService } from "./automation-variable-resolver.service.js";

export type AutomationSendJobRecord = NonNullable<
  Awaited<ReturnType<AutomationJobRepository["findByIdWithRelations"]>>
>;

export class AutomationSendProcessorService {
  constructor(
    private readonly jobs = new AutomationJobRepository(),
    private readonly conditions = new AutomationSendConditionService(),
    private readonly variables = new AutomationVariableResolverService(),
    private readonly payloadBuilder = new AutomationTemplatePayloadBuilderService(),
    private readonly sender = new MetaWhatsAppTemplateSenderService(),
    private readonly actionStates = new AutomationActionStateRepository()
  ) {}

  async processAutomationJob(automationJobId: string) {
    const job = await this.jobs.findByIdWithRelations(automationJobId);

    if (!job) {
      throw new Error(`Automation job not found: ${automationJobId}`);
    }

    if (isTerminalStatus(job.status)) {
      return { status: "ignored" as const, reason: `Automation job is already ${job.status}.` };
    }

    await this.jobs.markProcessing(job.id);

    try {
      const event = this.toInternalAutomationEvent(job);
      if (!event) {
        return this.skip(job.id, "Incoming event is unsupported.");
      }

      const condition = await this.conditions.canSend(job, event);
      if (!condition.canSend) {
        return this.skip(job.id, condition.reason);
      }

      const template = job.automation.template;
      if (!template) {
        return this.skip(job.id, "Automation template is missing.");
      }

      const resolved = this.variables.resolve(event, job.automation.variableMappings);
      if (!resolved.success) {
        return this.skip(job.id, resolved.reason);
      }

      await this.sender.sendTemplateMessage(
        this.payloadBuilder.build({
          to: job.customerPhone ?? event.customerPhone ?? "",
          template,
          variables: resolved.variables
        })
      );

      if (job.automation.key === AutomationKey.COD_ORDER_FOLLOW_UP) {
        await this.markCodFollowupSent(job);
      }

      await this.jobs.markCompleted(job.id);
      return { status: "completed" as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process automation send job.";
      await this.jobs.updateFailed(job.id, message);
      throw error;
    }
  }

  private async skip(id: string, reason: string) {
    await this.jobs.markSkipped(id, reason);
    return { status: "skipped" as const, reason };
  }

  private toInternalAutomationEvent(job: AutomationSendJobRecord): InternalAutomationEvent | null {
    const payload = toPayloadRecord(job.incomingEvent.payloadJson);

    if (job.incomingEvent.source === AutomationTriggerSource.SHOPIFY) {
      if (job.incomingEvent.eventType === AutomationTriggerEvent.CHECKOUT_ABANDONED) {
        return adaptShopifyCheckoutWebhook(payload) as InternalAutomationEvent | null;
      }

      return adaptShopifyOrderWebhook(payload, job.incomingEvent.eventType) as InternalAutomationEvent;
    }

    if (job.incomingEvent.source === AutomationTriggerSource.WHATSAPP) {
      return adaptWhatsAppButtonReply(payload) as InternalAutomationEvent | null;
    }

    return null;
  }

  private async markCodFollowupSent(job: AutomationSendJobRecord) {
    const state = await this.actionStates.findByFlowResource(
      AutomationFlowKey.COD_FLOW,
      job.resourceType,
      job.resourceId
    );
    if (state?.state !== AutomationActionStateValue.PENDING_CONFIRMATION) return;

    await this.actionStates.upsertState({
      flowKey: AutomationFlowKey.COD_FLOW,
      resourceType: job.resourceType,
      resourceId: job.resourceId,
      customerPhone: job.customerPhone,
      state: AutomationActionStateValue.FOLLOW_UP_SENT,
      sourceEventId: job.incomingEventId
    });
  }
}

function isTerminalStatus(status: AutomationJobStatus) {
  return (
    status === AutomationJobStatus.COMPLETED ||
    status === AutomationJobStatus.CANCELLED ||
    status === AutomationJobStatus.SKIPPED
  );
}

function toPayloadRecord(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
  return payload as Record<string, unknown>;
}
