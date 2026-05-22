import { AutomationKey, AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import {
  hasRunnableConfiguration,
  type AutomationStrategy,
  type AutomationStrategyContext
} from "./automation-strategy.interface.js";

export class CodOrderConfirmedStrategy implements AutomationStrategy {
  key = AutomationKey.COD_ORDER_CONFIRMED;

  async canRun(event: InternalAutomationEvent, context: AutomationStrategyContext) {
    return (
      event.source === AutomationTriggerSource.WHATSAPP &&
      event.eventType === AutomationTriggerEvent.BUTTON_REPLY &&
      event.action?.actionKey === "COD_CONFIRM" &&
      event.resourceType === AutomationResourceType.ORDER &&
      hasRunnableConfiguration(event, context)
    );
  }
}
