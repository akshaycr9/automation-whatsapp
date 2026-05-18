export type TemplateType = "TEXT" | "MEDIA" | "CAROUSEL" | "AUTHENTICATION";

export type TemplateCategory = "UTILITY" | "MARKETING" | "AUTHENTICATION";

export type TemplateStatus =
  | "DRAFT"
  | "SUBMITTING"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PAUSED"
  | "DISABLED"
  | "DELETED"
  | "ERROR";

export type TemplateComponentType = "HEADER" | "BODY" | "FOOTER" | "BUTTONS" | "CAROUSEL";

export type TemplateHeaderFormat = "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";

export type TemplateButtonType = "QUICK_REPLY" | "URL" | "PHONE_NUMBER" | "COPY_CODE" | "FLOW";

export type TemplateQualityRating = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export type TemplateVariable = {
  key: string;
  index: number;
  token: string;
  sampleValue?: string;
};

export type TemplateButton = {
  id: string;
  type: TemplateButtonType;
  text: string;
  value?: string;
};

export type TemplateComponent = {
  id: string;
  type: TemplateComponentType;
  format?: TemplateHeaderFormat;
  text?: string;
  buttons?: TemplateButton[];
  variables?: TemplateVariable[];
};

export type Template = {
  id: string;
  name: string;
  displayName: string;
  category: TemplateCategory;
  type: TemplateType;
  languageCode: string;
  status: TemplateStatus;
  qualityRating?: TemplateQualityRating;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  components?: TemplateComponent[];
};

export type TemplateListFilters = {
  search?: string;
  status?: TemplateStatus | "ALL";
  category?: TemplateCategory | "ALL";
  languageCode?: string | "ALL";
  type?: TemplateType | "ALL";
};

export type CreateTemplateFormValues = {
  name: string;
  displayName: string;
  category: TemplateCategory;
  type: TemplateType;
  languageCode: string;
  headerFormat: TemplateHeaderFormat;
  headerText?: string;
  bodyText: string;
  footerText?: string;
  buttons: TemplateButton[];
  variableSamples: Record<string, string>;
};

export type CreateTemplatePayload = CreateTemplateFormValues;
