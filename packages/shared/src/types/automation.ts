import { AutomationKey } from "../constants/automation-keys";

export type AutomationSummary = {
  key: AutomationKey;
  name: string;
  enabled: boolean;
};
