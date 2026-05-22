import { apiClient } from "@/lib/api-client";
import type { TemplateComponent, TemplateHeaderFormat } from "@/features/templates/types/template.types";
import type {
  AutomationDetail,
  AutomationTemplateDetail,
  AutomationFieldOptionsResponse,
  AutomationsListResponse,
  ToggleAutomationPayload,
  UpdateAutomationPayload
} from "../types/automation.types";

export type AutomationApiOptions = {
  accessToken?: string | null;
};

type BackendAutomationDetail = Omit<AutomationDetail, "template"> & {
  template:
    | (Omit<AutomationTemplateDetail, "components"> & {
        components?: Array<{
          componentType: string;
          format?: string | null;
          text?: string | null;
          sortOrder?: number;
        }>;
      })
    | null;
};

export const automationApi = {
  async getAutomations(options: AutomationApiOptions = {}) {
    const response = await apiClient.get<AutomationsListResponse>("/api/automations", requestOptions(options));
    return response.data;
  },

  async getAutomation(id: string, options: AutomationApiOptions = {}) {
    const response = await apiClient.get<BackendAutomationDetail>(
      `/api/automations/${encodeURIComponent(id)}`,
      requestOptions(options)
    );
    return mapAutomationDetail(response.data);
  },

  async getFieldOptions(id: string, options: AutomationApiOptions = {}) {
    const response = await apiClient.get<AutomationFieldOptionsResponse>(
      `/api/automations/${encodeURIComponent(id)}/field-options`,
      requestOptions(options)
    );
    return response.data;
  },

  async updateAutomation(id: string, payload: UpdateAutomationPayload, options: AutomationApiOptions = {}) {
    const response = await apiClient.put<BackendAutomationDetail>(
      `/api/automations/${encodeURIComponent(id)}`,
      payload,
      requestOptions(options)
    );
    return mapAutomationDetail(response.data);
  },

  async toggleAutomation(id: string, payload: ToggleAutomationPayload, options: AutomationApiOptions = {}) {
    const response = await apiClient.patch<BackendAutomationDetail>(
      `/api/automations/${encodeURIComponent(id)}/toggle`,
      payload,
      requestOptions(options)
    );
    return mapAutomationDetail(response.data);
  }
};

function requestOptions(options: AutomationApiOptions) {
  return {
    ...(options.accessToken !== undefined ? { accessToken: options.accessToken } : {}),
    credentials: "include" as const
  };
}

function mapAutomationDetail(automation: BackendAutomationDetail): AutomationDetail {
  const template = automation.template ? mapAutomationTemplate(automation.template) : null;

  return {
    ...automation,
    template
  };
}

function mapAutomationTemplate(template: NonNullable<BackendAutomationDetail["template"]>): AutomationTemplateDetail {
  const { components, ...rest } = template;

  return {
    ...rest,
    ...(components
      ? {
          components: components.map(
            (component, index): TemplateComponent => ({
              id: `${component.componentType.toLowerCase()}_${index}`,
              type: component.componentType as TemplateComponent["type"],
              ...(component.format ? { format: component.format as TemplateHeaderFormat } : {}),
              ...(component.text ? { text: component.text } : {})
            })
          )
        }
      : {})
  };
}
