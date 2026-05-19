import { apiClient } from "@/lib/api-client";
import type {
  CreateTemplatePayload,
  Template,
  TemplateButton,
  TemplateComponent,
  TemplateListFilters
} from "../types/template.types";

export type TemplateApiOptions = {
  accessToken?: string | null;
};

export type TemplateListResponse = {
  data: Template[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type TemplateDetailResponse = {
  data: Template;
};

export type CreateTemplateResponse = {
  data: Template;
  message: string;
};

export type SyncTemplatesResponse = {
  data: {
    syncedCount: number;
    createdCount: number;
    updatedCount: number;
    failedCount: number;
  };
  message: string;
};

export type RetryTemplateSubmissionResponse = {
  data: Template;
  message: string;
};

export type DeleteTemplateResponse = {
  data: {
    id: string;
    status: "DELETED";
  };
  message: string;
};

type BackendTemplate = Omit<Template, "components" | "qualityRating"> & {
  metaTemplateId?: string | null;
  qualityRating?: Template["qualityRating"] | null;
  rejectionReason?: string | null;
  lastSyncedAt?: string | null;
  components?:
    | {
        header?: { format: "TEXT"; text: string };
        body: { text: string };
        footer?: { text: string };
        buttons: Array<{
          type: TemplateButton["type"];
          text: string;
          url?: string;
          phoneNumber?: string;
          payload?: string;
          flowId?: string;
        }>;
      }
    | TemplateComponent[];
};

export const templateApi = {
  async getTemplates(
    filters: TemplateListFilters = {},
    options: TemplateApiOptions = {}
  ): Promise<TemplateListResponse> {
    const query = buildTemplateListQuery(filters);
    const response = await apiClient.get<BackendTemplate[]>(`/api/templates${query}`, requestOptions(options));
    const pagination = (response as unknown as { pagination?: TemplateListResponse["pagination"] }).pagination;

    return {
      data: response.data.map(mapBackendTemplateToView),
      pagination: pagination ?? { page: 1, limit: response.data.length, total: response.data.length, totalPages: 1 }
    };
  },

  async getTemplateById(id: string, options: TemplateApiOptions = {}): Promise<TemplateDetailResponse> {
    const response = await apiClient.get<BackendTemplate>(
      `/api/templates/${encodeURIComponent(id)}`,
      requestOptions(options)
    );

    return { data: mapBackendTemplateToView(response.data) };
  },

  async createTemplate(
    payload: CreateTemplatePayload,
    options: TemplateApiOptions = {}
  ): Promise<CreateTemplateResponse> {
    const response = await apiClient.post<BackendTemplate>("/api/templates", payload, requestOptions(options));
    const message = (response as unknown as { message?: string }).message;

    return {
      data: mapBackendTemplateToView(response.data),
      message: message ?? "Template created successfully"
    };
  },

  async syncTemplates(options: TemplateApiOptions = {}): Promise<SyncTemplatesResponse> {
    const response = await apiClient.post<SyncTemplatesResponse["data"]>(
      "/api/templates/sync",
      {},
      requestOptions(options)
    );
    return {
      data: response.data,
      message: (response as unknown as { message?: string }).message ?? "Templates synced successfully"
    };
  },

  async retryTemplateSubmission(
    id: string,
    options: TemplateApiOptions = {}
  ): Promise<RetryTemplateSubmissionResponse> {
    const response = await apiClient.post<BackendTemplate>(
      `/api/templates/${encodeURIComponent(id)}/retry-submission`,
      {},
      requestOptions(options)
    );
    return {
      data: mapBackendTemplateToView(response.data),
      message: (response as unknown as { message?: string }).message ?? "Template retry submitted successfully"
    };
  },

  async deleteTemplate(id: string, options: TemplateApiOptions = {}): Promise<DeleteTemplateResponse> {
    const response = await apiClient.delete<DeleteTemplateResponse["data"]>(
      `/api/templates/${encodeURIComponent(id)}`,
      requestOptions(options)
    );
    return {
      data: response.data,
      message: (response as unknown as { message?: string }).message ?? "Template deleted successfully"
    };
  }
};

function requestOptions(options: TemplateApiOptions) {
  return {
    ...(options.accessToken !== undefined ? { accessToken: options.accessToken } : {}),
    credentials: "include" as const
  };
}

function buildTemplateListQuery(filters: TemplateListFilters) {
  const params = new URLSearchParams();

  appendFilter(params, "search", filters.search?.trim());
  appendFilter(params, "status", filters.status);
  appendFilter(params, "category", filters.category);
  appendFilter(params, "languageCode", filters.languageCode);
  appendFilter(params, "type", filters.type);

  return params.size > 0 ? `?${params.toString()}` : "";
}

function appendFilter(params: URLSearchParams, key: string, value: string | undefined) {
  if (!value || value === "ALL") return;
  params.set(key, value);
}

function mapBackendTemplateToView(template: BackendTemplate): Template {
  const components = mapBackendComponents(template.components);

  return {
    id: template.id,
    name: template.name,
    displayName: template.displayName,
    category: template.category,
    type: template.type,
    languageCode: template.languageCode,
    status: template.status,
    ...(template.qualityRating ? { qualityRating: template.qualityRating } : {}),
    ...(template.rejectionReason ? { rejectionReason: template.rejectionReason } : {}),
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    ...(components ? { components } : {})
  };
}

function mapBackendComponents(components: BackendTemplate["components"]): TemplateComponent[] | undefined {
  if (!components) return undefined;
  if (Array.isArray(components)) return components;

  const mappedComponents: TemplateComponent[] = [];

  if (components.header) {
    mappedComponents.push({
      id: "header",
      type: "HEADER",
      format: components.header.format,
      text: components.header.text
    });
  }

  mappedComponents.push({
    id: "body",
    type: "BODY",
    text: components.body.text
  });

  if (components.footer) {
    mappedComponents.push({
      id: "footer",
      type: "FOOTER",
      text: components.footer.text
    });
  }

  if (components.buttons.length > 0) {
    mappedComponents.push({
      id: "buttons",
      type: "BUTTONS",
      buttons: components.buttons.map((button, index) => ({
        id: `button_${index}`,
        type: button.type,
        text: button.text,
        ...((button.url ?? button.phoneNumber ?? button.payload ?? button.flowId)
          ? { value: button.url ?? button.phoneNumber ?? button.payload ?? button.flowId }
          : {})
      }))
    });
  }

  return mappedComponents;
}
