import { mockTemplates } from "../data/mockTemplates";
import type { CreateTemplatePayload, Template, TemplateListFilters } from "../types/template.types";

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
  async getTemplates(filters: TemplateListFilters = {}) {
    return Promise.resolve(applyTemplateFilters(mockTemplates, filters));
  },

  async getTemplateById(id: string) {
    return Promise.resolve(mockTemplates.find((template) => template.id === id) ?? null);
  },

  async createTemplate(payload: CreateTemplatePayload) {
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

    return Promise.resolve(template);
  },

  async syncTemplates() {
    return Promise.resolve({ syncedAt: new Date().toISOString(), templates: mockTemplates });
  }
};
