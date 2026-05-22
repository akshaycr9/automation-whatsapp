import type { IncomingEvent } from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import type { EngineAutomation } from "../repository/automation-engine.repository.js";

export type AutomationStrategyContext = {
  automation: EngineAutomation;
  incomingEvent: IncomingEvent;
};

export interface AutomationStrategy {
  key: EngineAutomation["key"];
  canRun(event: InternalAutomationEvent, context: AutomationStrategyContext): Promise<boolean>;
}

export function hasRunnableConfiguration(event: InternalAutomationEvent, context: AutomationStrategyContext) {
  return Boolean(
    context.automation.isEnabled && context.automation.templateId && event.resourceId && event.customerPhone
  );
}

export function hasCheckoutRecoveryUrl(event: InternalAutomationEvent) {
  const checkout = event.data.checkout;
  return Boolean(
    checkout &&
    typeof checkout === "object" &&
    "recoveryUrl" in checkout &&
    typeof checkout.recoveryUrl === "string" &&
    checkout.recoveryUrl.length > 0
  );
}
