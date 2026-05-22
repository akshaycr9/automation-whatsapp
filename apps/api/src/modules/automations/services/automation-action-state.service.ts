import {
  AutomationActionStateValue,
  AutomationFlowKey,
  AutomationKey,
  AutomationResourceType,
  type IncomingEvent
} from "@prisma/client";
import { logger } from "../../../lib/logger.js";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import { AutomationActionStateRepository } from "../repository/automation-action-state.repository.js";
import { AutomationJobService } from "./automation-job.service.js";

const FINAL_COD_STATES = new Set<AutomationActionStateValue>([
  AutomationActionStateValue.CONFIRMED,
  AutomationActionStateValue.CANCELLED
]);

export class AutomationActionStateService {
  constructor(
    private readonly repository = new AutomationActionStateRepository(),
    private readonly jobService = new AutomationJobService()
  ) {}

  createPendingCodState(event: InternalAutomationEvent, incomingEvent: IncomingEvent) {
    if (!event.resourceId) return null;

    return this.repository.upsertState({
      flowKey: AutomationFlowKey.COD_FLOW,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      customerPhone: event.customerPhone ?? null,
      state: AutomationActionStateValue.PENDING_CONFIRMATION,
      sourceEventId: incomingEvent.id
    });
  }

  async transitionCodState(event: InternalAutomationEvent, incomingEvent: IncomingEvent) {
    if (!event.resourceId) return false;

    const nextState =
      event.action?.actionKey === "COD_CONFIRM"
        ? AutomationActionStateValue.CONFIRMED
        : event.action?.actionKey === "COD_CANCEL"
          ? AutomationActionStateValue.CANCELLED
          : null;

    if (!nextState) return false;

    const existing = await this.repository.findByFlowResource(
      AutomationFlowKey.COD_FLOW,
      event.resourceType,
      event.resourceId
    );
    if (existing && FINAL_COD_STATES.has(existing.state)) {
      logger.info({
        event: "automation_action_state.final_state_skip",
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        existingState: existing.state,
        requestedState: nextState
      });
      return false;
    }

    await this.repository.upsertState({
      flowKey: AutomationFlowKey.COD_FLOW,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      customerPhone: event.customerPhone ?? null,
      state: nextState,
      sourceEventId: incomingEvent.id
    });

    await this.jobService.cancelPendingJobsForAutomationKeyAndResource({
      automationKey: AutomationKey.COD_ORDER_FOLLOW_UP,
      resourceType: AutomationResourceType.ORDER,
      resourceId: event.resourceId
    });

    return true;
  }
}
