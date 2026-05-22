import type { TemplateCategory, TemplateComponent, TemplateStatus } from "@/features/templates/types/template.types";

export type AutomationFlowKey = "ORDER_FLOW" | "COD_FLOW" | "ABANDONED_CART_FLOW";
export type AutomationComponentType = "HEADER" | "BODY" | "BUTTON";

export type AutomationVariableMapping = {
  id?: string;
  templateVariableName: string;
  componentType: AutomationComponentType;
  variableIndex: number;
  sourceField: string;
  fallbackValue: string | null;
};

export type AutomationRequiredVariable = {
  templateVariableName: string;
  componentType: AutomationComponentType;
  variableIndex: number;
  placeholder: string;
  sampleValue: string;
  sourceKey: string | null;
};

export type AutomationTemplateDetail = {
  id: string;
  name: string;
  language: string;
  category?: TemplateCategory;
  status?: TemplateStatus;
  components?: TemplateComponent[];
  variables?: AutomationRequiredVariable[];
};

export type AutomationListItem = {
  id: string;
  key: string;
  name: string;
  description: string;
  triggerSource: string;
  triggerEvent: string;
  triggerButtonText: string | null;
  isEnabled: boolean;
  templateId: string | null;
  templateName: string | null;
  delayMinutes: number;
  sortOrder: number;
  isConfigured: boolean;
  mappedVariablesCount: number;
  requiredVariablesCount: number;
};

export type AutomationFlow = {
  id: string;
  key: AutomationFlowKey;
  name: string;
  description: string;
  sortOrder: number;
  automations: AutomationListItem[];
};

export type AutomationsListResponse = {
  flows: AutomationFlow[];
};

export type AutomationDetail = Omit<
  AutomationListItem,
  "templateName" | "mappedVariablesCount" | "requiredVariablesCount"
> & {
  flow: {
    id: string;
    key: AutomationFlowKey;
    name: string;
  };
  template: AutomationTemplateDetail | null;
  requiredVariables: AutomationRequiredVariable[];
  variableMappings: AutomationVariableMapping[];
};

export type AutomationFieldOption = {
  label: string;
  value: string;
};

export type AutomationFieldOptionGroup = {
  label: string;
  options: AutomationFieldOption[];
};

export type AutomationFieldOptionsResponse = {
  groups: AutomationFieldOptionGroup[];
};

export type UpdateAutomationPayload = {
  templateId: string | null;
  delayMinutes: number;
  variableMappings: Array<Omit<AutomationVariableMapping, "id">>;
};

export type ToggleAutomationPayload = {
  isEnabled: boolean;
};
