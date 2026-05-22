import {
  AutomationActionStateValue,
  AutomationFlowKey,
  AutomationJobStatus,
  AutomationKey,
  AutomationResourceType,
  AutomationTriggerEvent,
  TemplateStatus
} from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import { AutomationActionStateRepository } from "../repository/automation-action-state.repository.js";
import type { AutomationSendJobRecord } from "./automation-send-processor.service.js";

export type AutomationSendConditionResult = { canSend: true } | { canSend: false; reason: string };

export class AutomationSendConditionService {
  constructor(private readonly actionStates = new AutomationActionStateRepository()) {}

  async canSend(job: AutomationSendJobRecord, event: InternalAutomationEvent): Promise<AutomationSendConditionResult> {
    if (isTerminalStatus(job.status)) {
      return { canSend: false, reason: `Automation job is already ${job.status}.` };
    }

    if (!job.automation.isEnabled) return { canSend: false, reason: "Automation is disabled." };
    if (!job.automation.templateId || !job.automation.template)
      return { canSend: false, reason: "Automation template is missing." };
    if (job.automation.template.status !== TemplateStatus.APPROVED) {
      return { canSend: false, reason: "Automation template is not approved." };
    }
    if (!job.customerPhone && !event.customerPhone) return { canSend: false, reason: "Customer phone is missing." };
    if (!job.incomingEvent) return { canSend: false, reason: "Incoming event is missing." };
    if (!event.resourceId) return { canSend: false, reason: "Event resource id is missing." };

    if (job.automation.key === AutomationKey.COD_ORDER_FOLLOW_UP) {
      return this.canSendCodFollowup(job);
    }

    if (job.automation.key === AutomationKey.COD_ORDER_CONFIRMED) {
      return this.canSendCodButtonResult(job, AutomationActionStateValue.CANCELLED, "COD order is already cancelled.");
    }

    if (job.automation.key === AutomationKey.COD_ORDER_CANCELLED) {
      return this.canSendCodButtonResult(job, AutomationActionStateValue.CONFIRMED, "COD order is already confirmed.");
    }

    if (isAbandonedCartAutomation(job.automation.key)) {
      const checkout = event.data.checkout;
      if (checkout && typeof checkout === "object" && "isRecovered" in checkout && checkout.isRecovered === true) {
        return { canSend: false, reason: "Abandoned checkout is already recovered." };
      }
      return { canSend: true };
    }

    if (isOrderAutomation(job.automation.key) && event.resourceType !== AutomationResourceType.ORDER) {
      return { canSend: false, reason: "Order automation requires an order event." };
    }

    if (
      job.automation.key === AutomationKey.ORDER_CONFIRMED &&
      event.eventType !== AutomationTriggerEvent.ORDER_CREATED
    ) {
      return { canSend: false, reason: "Order confirmed automation requires an order created event." };
    }

    return { canSend: true };
  }

  private async canSendCodFollowup(job: AutomationSendJobRecord): Promise<AutomationSendConditionResult> {
    const state = await this.actionStates.findByFlowResource(
      AutomationFlowKey.COD_FLOW,
      AutomationResourceType.ORDER,
      job.resourceId
    );

    if (state?.state === AutomationActionStateValue.CONFIRMED) {
      return { canSend: false, reason: "COD order is already confirmed." };
    }

    if (state?.state === AutomationActionStateValue.CANCELLED) {
      return { canSend: false, reason: "COD order is already cancelled." };
    }

    return { canSend: true };
  }

  private async canSendCodButtonResult(
    job: AutomationSendJobRecord,
    blockedState: AutomationActionStateValue,
    reason: string
  ): Promise<AutomationSendConditionResult> {
    const state = await this.actionStates.findByFlowResource(
      AutomationFlowKey.COD_FLOW,
      AutomationResourceType.ORDER,
      job.resourceId
    );
    return state?.state === blockedState ? { canSend: false, reason } : { canSend: true };
  }
}

function isTerminalStatus(status: AutomationJobStatus) {
  return (
    status === AutomationJobStatus.COMPLETED ||
    status === AutomationJobStatus.CANCELLED ||
    status === AutomationJobStatus.SKIPPED
  );
}

function isAbandonedCartAutomation(key: AutomationKey) {
  return (
    key === AutomationKey.ABANDONED_CART_1 ||
    key === AutomationKey.ABANDONED_CART_2 ||
    key === AutomationKey.ABANDONED_CART_3
  );
}

function isOrderAutomation(key: AutomationKey) {
  return (
    key === AutomationKey.ORDER_CONFIRMED ||
    key === AutomationKey.ORDER_FULFILLED ||
    key === AutomationKey.ORDER_CANCELLED
  );
}
