import { TemplateStatus } from "@prisma/client";
import { AUTOMATION_DELAY_MAX_MINUTES, AUTOMATION_ENABLE_ERROR_MESSAGE } from "./domain/automation.constants.js";
import { getAllowedSourceFields, getFieldOptionsForFlow } from "./domain/automation-field-options.js";
import {
  extractRequiredVariables,
  isAutomationConfigured,
  mapAutomationFlowsToListResponse,
  mapAutomationToDetailResponse
} from "./domain/automation.mapper.js";
import {
  AutomationNotConfiguredError,
  AutomationNotFoundError,
  AutomationValidationDomainError,
  type AutomationValidationError
} from "./domain/automation.errors.js";
import type {
  AutomationRecord,
  AutomationScope,
  AutomationTemplateRecord,
  AutomationVariableMappingInput,
  ToggleAutomationInput,
  UpdateAutomationInput
} from "./domain/automation.types.js";
import { AutomationsRepository } from "./automations.repository.js";

export class AutomationsService {
  constructor(private readonly repository = new AutomationsRepository()) {}

  async getAutomationsList() {
    const flows = await this.repository.findFlowsWithAutomations();

    return { data: mapAutomationFlowsToListResponse(flows) };
  }

  async getAutomationDetail(id: string) {
    const automation = await this.repository.findAutomationById(id);

    if (!automation) {
      throw new AutomationNotFoundError();
    }

    return { data: mapAutomationToDetailResponse(automation) };
  }

  async updateAutomation(id: string, input: UpdateAutomationInput, scope: AutomationScope) {
    return this.repository.transaction(async (client) => {
      const automation = await this.repository.findAutomationById(id, client);

      if (!automation) {
        throw new AutomationNotFoundError();
      }

      const template = input.templateId
        ? await this.repository.findTemplateById(input.templateId, scope.adminUserId, client)
        : null;
      this.validateUpdateInput(automation, input, template);

      const updated = await this.repository.updateAutomationConfig(id, input, client);

      if (!updated) {
        throw new AutomationNotFoundError();
      }

      return { data: mapAutomationToDetailResponse(updated) };
    });
  }

  async toggleAutomation(id: string, input: ToggleAutomationInput) {
    const automation = await this.repository.findAutomationById(id);

    if (!automation) {
      throw new AutomationNotFoundError();
    }

    if (input.isEnabled) {
      this.validateCanEnable(automation);
    }

    const updated = await this.repository.updateAutomationEnabled(id, input.isEnabled);

    if (!updated) {
      throw new AutomationNotFoundError();
    }

    return { data: mapAutomationToDetailResponse(updated) };
  }

  async getFieldOptions(id: string) {
    const automation = await this.repository.findAutomationById(id);

    if (!automation) {
      throw new AutomationNotFoundError();
    }

    return { data: { groups: getFieldOptionsForFlow(automation.flow.key) } };
  }

  private validateUpdateInput(
    automation: AutomationRecord,
    input: UpdateAutomationInput,
    template: AutomationTemplateRecord | null
  ) {
    const errors: AutomationValidationError[] = [];

    if (input.delayMinutes < 0 || input.delayMinutes > AUTOMATION_DELAY_MAX_MINUTES) {
      errors.push({
        field: "delayMinutes",
        message: "Delay minutes must be between 0 and 43,200."
      });
    }

    if (input.templateId && !template) {
      errors.push({
        field: "templateId",
        message: "Selected WhatsApp template was not found."
      });
    }

    if (!input.templateId && input.variableMappings.length > 0) {
      errors.push({
        field: "variableMappings",
        message: "Variable mappings must be empty when no template is selected."
      });
    }

    this.validateVariableMappings(automation, input.variableMappings, template, errors);

    const nextAutomation = {
      ...automation,
      templateId: input.templateId,
      template,
      delayMinutes: input.delayMinutes,
      variableMappings: input.variableMappings.map((mapping, index) => ({
        id: `pending-${index}`,
        templateVariableName: mapping.templateVariableName,
        componentType: mapping.componentType,
        variableIndex: mapping.variableIndex,
        sourceField: mapping.sourceField,
        fallbackValue: mapping.fallbackValue ?? null
      }))
    } satisfies AutomationRecord;

    if (
      automation.isEnabled &&
      (!isAutomationConfigured(nextAutomation) || nextAutomation.template?.status !== TemplateStatus.APPROVED)
    ) {
      errors.push({
        field: "request",
        message: "Enabled automations must keep an approved WhatsApp template and all required variables configured."
      });
    }

    if (errors.length > 0) {
      throw new AutomationValidationDomainError(errors);
    }
  }

  private validateCanEnable(automation: AutomationRecord) {
    if (
      !automation.template ||
      automation.delayMinutes < 0 ||
      automation.delayMinutes > AUTOMATION_DELAY_MAX_MINUTES ||
      !isAutomationConfigured(automation) ||
      automation.template.status !== TemplateStatus.APPROVED
    ) {
      throw new AutomationNotConfiguredError(AUTOMATION_ENABLE_ERROR_MESSAGE);
    }
  }

  private validateVariableMappings(
    automation: AutomationRecord,
    mappings: AutomationVariableMappingInput[],
    template: AutomationTemplateRecord | null,
    errors: AutomationValidationError[]
  ) {
    const allowedFields = getAllowedSourceFields(automation.flow.key);
    const requiredVariables = extractRequiredVariables(template);
    const requiredVariableKeys = new Set(
      requiredVariables.map((variable) => `${variable.componentType}:${variable.variableIndex}`)
    );
    const seenMappingKeys = new Set<string>();

    mappings.forEach((mapping, index) => {
      const mappingKey = `${mapping.componentType}:${mapping.variableIndex}`;

      if (seenMappingKeys.has(mappingKey)) {
        errors.push({
          field: `variableMappings.${index}`,
          message: "Duplicate variable mapping for the same component and variable index."
        });
      }

      seenMappingKeys.add(mappingKey);

      if (!allowedFields.has(mapping.sourceField)) {
        errors.push({
          field: `variableMappings.${index}.sourceField`,
          message: "Source field is not allowed for this automation."
        });
      }

      if (template && !requiredVariableKeys.has(mappingKey)) {
        errors.push({
          field: `variableMappings.${index}`,
          message: "Variable mapping does not match a variable on the selected template."
        });
      }
    });
  }
}
