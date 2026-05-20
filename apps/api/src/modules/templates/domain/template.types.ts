import type {
  TemplateButtonType,
  TemplateCategory,
  TemplateComponentType,
  TemplateHeaderFormat,
  TemplateQualityRating,
  TemplateStatus,
  TemplateType
} from "@prisma/client";

export type TemplateScope = {
  adminUserId: string;
};

export type TemplateComponentInput = {
  header?: {
    format: Extract<TemplateHeaderFormat, "NONE" | "TEXT">;
    text?: string;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  buttons?: TemplateButtonInput[];
};

export type TemplateVariableInput = {
  componentType: Extract<TemplateComponentType, "HEADER" | "BODY">;
  position: number;
  placeholder: string;
  sampleValue: string;
  sourceKey?: string | null;
  label?: string | null;
  fallbackValue?: string | null;
};

export type TemplateButtonInput = {
  type: TemplateButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
  payload?: string;
  flowId?: string;
};

export type CreateTemplateInput = {
  name: string;
  displayName?: string | null;
  category: TemplateCategory;
  type: TemplateType;
  languageCode: string;
  allowCategoryChange?: boolean;
  components: TemplateComponentInput;
  variables: TemplateVariableInput[];
};

export type TemplateListQuery = {
  search?: string;
  status?: TemplateStatus;
  category?: TemplateCategory;
  type?: TemplateType;
  languageCode?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "name" | "status" | "category";
  sortOrder?: "asc" | "desc";
};

export type TemplateValidationError = {
  field: string;
  message: string;
};

export type TemplateValidationResult = {
  isValid: boolean;
  errors: TemplateValidationError[];
};

export type DetectedTemplateVariable = {
  componentType: Extract<TemplateComponentType, "HEADER" | "BODY">;
  position: number;
  placeholder: string;
};

export type TemplateListItemResponse = {
  id: string;
  metaTemplateId: string | null;
  name: string;
  displayName: string;
  category: TemplateCategory;
  type: TemplateType;
  languageCode: string;
  status: TemplateStatus;
  qualityRating: TemplateQualityRating;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;
};

export type TemplateDetailResponse = TemplateListItemResponse & {
  components: {
    header?: {
      format: TemplateHeaderFormat;
      text: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    buttons: TemplateButtonInput[];
  };
  variables: Array<{
    componentType: TemplateComponentType;
    position: number;
    placeholder: string;
    sampleValue: string;
    sourceKey: string | null;
  }>;
};

export type PreparedTemplateCreateData = {
  template: {
    name: string;
    displayName: string | null;
    category: TemplateCategory;
    type: TemplateType;
    languageCode: string;
    status: TemplateStatus;
    allowCategoryChange: boolean;
    createdById?: string;
    updatedById?: string;
  };
  components: Array<{
    componentType: TemplateComponentType;
    format?: TemplateHeaderFormat | null;
    text?: string | null;
    sortOrder: number;
  }>;
  variables: Array<{
    componentType: TemplateComponentType;
    position: number;
    placeholder: string;
    sampleValue: string;
    sourceKey?: string | null;
    label?: string | null;
    fallbackValue?: string | null;
  }>;
  buttons: Array<{
    buttonType: TemplateButtonType;
    text: string;
    url?: string | null;
    phoneNumber?: string | null;
    payload?: string | null;
    flowId?: string | null;
    sortOrder: number;
  }>;
  event?: {
    eventType: "CREATED";
    newStatus: TemplateStatus;
    message: string;
    createdById?: string;
  };
};
