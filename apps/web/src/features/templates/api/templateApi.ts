import { mockTemplates } from "../data/mockTemplates";
import type { CreateTemplatePayload, Template, TemplateListFilters } from "../types/template.types";

export type TemplateListResponse = {
  data: Template[];
  pagination: {
    page: number;
    limit: number;
    total: number;
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
  data: Template[];
  message: string;
  syncedAt: string;
};

function applyTemplateFilters(templates: Template[], filters: TemplateListFilters = {}) {
  const search = filters.search?.trim().toLowerCase();

  return templates.filter((template) => {
    const matchesSearch =
      !search || template.name.toLowerCase().includes(search) || template.displayName.toLowerCase().includes(search);
    const matchesStatus = !filters.status || filters.status === "ALL" || template.status === filters.status;
    const matchesCategory = !filters.category || filters.category === "ALL" || template.category === filters.category;
    const matchesLanguage =
      !filters.languageCode || filters.languageCode === "ALL" || template.languageCode === filters.languageCode;
    const matchesType = !filters.type || filters.type === "ALL" || template.type === filters.type;

    return matchesSearch && matchesStatus && matchesCategory && matchesLanguage && matchesType;
  });
}

export const templateApi = {
  async getTemplates(filters: TemplateListFilters = {}): Promise<TemplateListResponse> {
    const filteredTemplates = applyTemplateFilters(mockTemplates, filters);

    return Promise.resolve({
      data: filteredTemplates,
      pagination: {
        page: 1,
        limit: filteredTemplates.length,
        total: filteredTemplates.length
      }
    });
  },

  async getTemplateById(id: string): Promise<TemplateDetailResponse> {
    const template = mockTemplates.find((template) => template.id === id);

    if (!template) {
      throw new Error("Template not found.");
    }

    return Promise.resolve({ data: template });
  },

  async createTemplate(payload: CreateTemplatePayload): Promise<CreateTemplateResponse> {
    if (!payload.category) {
      throw new Error("Template category is required.");
    }

    const now = new Date().toISOString();
    const template: Template = {
      id: `tmpl_${payload.name}`,
      name: payload.name,
      displayName: payload.displayName,
      category: payload.category,
      type: payload.type,
      languageCode: payload.languageCode,
      status: "DRAFT",
      createdAt: now,
      updatedAt: now
    };

    return Promise.resolve({
      data: template,
      message: "Template created successfully"
    });
  },

  async syncTemplates(): Promise<SyncTemplatesResponse> {
    return Promise.resolve({
      data: mockTemplates,
      message: "Templates synced successfully",
      syncedAt: new Date().toISOString()
    });
  }
};
