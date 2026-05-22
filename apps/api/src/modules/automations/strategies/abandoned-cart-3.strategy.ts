import { AutomationKey, AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import {
  hasCheckoutRecoveryUrl,
  hasRunnableConfiguration,
  type AutomationStrategy,
  type AutomationStrategyContext
} from "./automation-strategy.interface.js";

export class AbandonedCart3Strategy implements AutomationStrategy {
  key = AutomationKey.ABANDONED_CART_3;

  async canRun(event: InternalAutomationEvent, context: AutomationStrategyContext) {
    return (
      event.source === AutomationTriggerSource.SHOPIFY &&
      event.eventType === AutomationTriggerEvent.CHECKOUT_ABANDONED &&
      event.resourceType === AutomationResourceType.CHECKOUT &&
      hasRunnableConfiguration(event, context) &&
      hasCheckoutRecoveryUrl(event)
    );
  }
}
