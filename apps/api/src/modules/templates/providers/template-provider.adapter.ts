import type { TemplateCategory, TemplateQualityRating, TemplateStatus, TemplateType } from "@prisma/client";

export type TemplateProviderCredentials = {
  graphApiVersion: string;
  wabaId: string;
  accessToken: string;
};

export type ProviderCreateTemplateInput = {
  credentials: TemplateProviderCredentials;
  payload: unknown;
};

export type ProviderListTemplatesInput = {
  credentials: TemplateProviderCredentials;
};

export type ProviderTemplateSummary = {
  providerTemplateId: string | null;
  name: string;
  category: TemplateCategory;
  type: TemplateType;
  languageCode: string;
  status: TemplateStatus;
  qualityRating: TemplateQualityRating;
  rejectionReason: string | null;
  raw: unknown;
};

export type ProviderCreateTemplateResult = {
  providerTemplateId: string | null;
  status: TemplateStatus;
  raw: unknown;
  statusCode: number;
};

export type ProviderListTemplatesResult = {
  templates: ProviderTemplateSummary[];
  raw: unknown;
  statusCode: number;
};

export type ProviderTemplateResult = {
  template: ProviderTemplateSummary;
  raw: unknown;
  statusCode: number;
};

export type ProviderDeleteTemplateResult = {
  providerTemplateId: string | null;
  raw: unknown;
  statusCode: number;
};

export interface TemplateProviderAdapter {
  createTemplate(input: ProviderCreateTemplateInput): Promise<ProviderCreateTemplateResult>;
  listTemplates(input: ProviderListTemplatesInput): Promise<ProviderListTemplatesResult>;
  getTemplate?(input: ProviderListTemplatesInput & { providerTemplateId: string }): Promise<ProviderTemplateResult>;
  deleteTemplate?(
    input: ProviderListTemplatesInput & { providerTemplateId: string }
  ): Promise<ProviderDeleteTemplateResult>;
}
