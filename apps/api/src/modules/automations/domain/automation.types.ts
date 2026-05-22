import type {
  AutomationComponentType,
  AutomationFlowKey,
  AutomationKey,
  AutomationTriggerEvent,
  AutomationTriggerSource,
  TemplateCategory,
  TemplateComponentType,
  TemplateHeaderFormat,
  TemplateStatus
} from "@prisma/client";

export type AutomationScope = {
  adminUserId: string;
};

export type AutomationVariableMappingInput = {
  templateVariableName: string;
  componentType: AutomationComponentType;
  variableIndex: number;
  sourceField: string;
  fallbackValue?: string | null;
};

export type UpdateAutomationInput = {
  templateId: string | null;
  delayMinutes: number;
  variableMappings: AutomationVariableMappingInput[];
};

export type ToggleAutomationInput = {
  isEnabled: boolean;
};

export type TemplateVariableRecord = {
  componentType: TemplateComponentType;
  position: number;
  placeholder: string;
  sampleValue: string;
  sourceKey: string | null;
};

export type AutomationTemplateRecord = {
  id: string;
  name: string;
  displayName: string | null;
  category: TemplateCategory;
  languageCode: string;
  status: TemplateStatus;
  components?: Array<{
    componentType: TemplateComponentType;
    format: TemplateHeaderFormat | null;
    text: string | null;
    sortOrder: number;
  }>;
  variables?: TemplateVariableRecord[];
};

export type AutomationVariableMappingRecord = {
  id: string;
  templateVariableName: string;
  componentType: AutomationComponentType;
  variableIndex: number;
  sourceField: string;
  fallbackValue: string | null;
};

export type AutomationRecord = {
  id: string;
  key: AutomationKey;
  name: string;
  description: string;
  triggerSource: AutomationTriggerSource;
  triggerEvent: AutomationTriggerEvent;
  isEnabled: boolean;
  templateId: string | null;
  delayMinutes: number;
  sortOrder: number;
  flow: {
    id: string;
    key: AutomationFlowKey;
    name: string;
  };
  template: AutomationTemplateRecord | null;
  variableMappings: AutomationVariableMappingRecord[];
  targetButtonActions?: Array<{
    id: string;
    actionKey: string;
    buttonText: string;
    payloadPrefix: string;
    isActive: boolean;
  }>;
};

export type AutomationFlowRecord = {
  id: string;
  key: AutomationFlowKey;
  name: string;
  description: string;
  sortOrder: number;
  automations: AutomationRecord[];
};

export type RequiredAutomationVariable = {
  templateVariableName: string;
  componentType: AutomationComponentType;
  variableIndex: number;
  placeholder: string;
  sampleValue: string;
  sourceKey: string | null;
};
