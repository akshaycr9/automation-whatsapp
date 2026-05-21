import type {
  AutomationFlowKey,
  AutomationKey,
  AutomationTriggerEvent,
  AutomationTriggerSource
} from "../constants/automation-keys";

export type AutomationSummary = {
  key: AutomationKey;
  flowKey: AutomationFlowKey;
  name: string;
  triggerSource: AutomationTriggerSource;
  triggerEvent: AutomationTriggerEvent;
  enabled: boolean;
};
