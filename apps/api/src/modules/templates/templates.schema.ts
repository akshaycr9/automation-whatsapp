import { z } from "zod";

export const TEMPLATE_TYPES = ["TEXT", "MEDIA", "CAROUSEL", "AUTHENTICATION"] as const;
export const TEMPLATE_CATEGORIES = ["UTILITY", "MARKETING", "AUTHENTICATION"] as const;
export const TEMPLATE_STATUSES = [
  "DRAFT",
  "SUBMITTING",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "PAUSED",
  "DISABLED",
  "DELETED",
  "ERROR"
] as const;
export const TEMPLATE_COMPONENT_TYPES = ["HEADER", "BODY", "FOOTER", "BUTTONS", "CAROUSEL"] as const;
export const TEMPLATE_HEADER_FORMATS = ["NONE", "TEXT", "IMAGE", "VIDEO", "DOCUMENT"] as const;
export const TEMPLATE_BUTTON_TYPES = ["QUICK_REPLY", "URL", "PHONE_NUMBER", "COPY_CODE", "FLOW"] as const;
export const TEMPLATE_QUALITY_RATINGS = ["GREEN", "YELLOW", "RED", "UNKNOWN"] as const;

export const TEMPLATE_SORT_FIELDS = ["createdAt", "updatedAt", "name", "status", "category"] as const;
export const SORT_ORDERS = ["asc", "desc"] as const;

export const HEADER_TEXT_MAX_LENGTH = 60;
export const BODY_TEXT_MAX_LENGTH = 1024;
export const FOOTER_TEXT_MAX_LENGTH = 60;
export const BUTTON_TEXT_MAX_LENGTH = 25;

export const templateTypeSchema = z.enum(TEMPLATE_TYPES);
export const templateCategorySchema = z.enum(TEMPLATE_CATEGORIES);
export const templateStatusSchema = z.enum(TEMPLATE_STATUSES);
export const templateComponentTypeSchema = z.enum(TEMPLATE_COMPONENT_TYPES);
export const templateHeaderFormatSchema = z.enum(TEMPLATE_HEADER_FORMATS);
export const templateButtonTypeSchema = z.enum(TEMPLATE_BUTTON_TYPES);
export const templateQualityRatingSchema = z.enum(TEMPLATE_QUALITY_RATINGS);

export const listTemplatesQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: templateStatusSchema.optional(),
  category: templateCategorySchema.optional(),
  type: templateTypeSchema.optional(),
  languageCode: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.enum(TEMPLATE_SORT_FIELDS).optional(),
  sortOrder: z.enum(SORT_ORDERS).optional()
});

export const templateHeaderComponentSchema = z.object({
  format: z.literal("TEXT"),
  text: z.string().trim().min(1).max(HEADER_TEXT_MAX_LENGTH)
});

export const templateBodyComponentSchema = z.object({
  text: z.string().trim().min(1).max(BODY_TEXT_MAX_LENGTH)
});

export const templateFooterComponentSchema = z.object({
  text: z.string().trim().min(1).max(FOOTER_TEXT_MAX_LENGTH)
});

export const templateButtonSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("QUICK_REPLY"),
    text: z.string().trim().min(1).max(BUTTON_TEXT_MAX_LENGTH)
  }),
  z.object({
    type: z.literal("URL"),
    text: z.string().trim().min(1).max(BUTTON_TEXT_MAX_LENGTH),
    url: z.string().trim().url()
  }),
  z.object({
    type: z.literal("PHONE_NUMBER"),
    text: z.string().trim().min(1).max(BUTTON_TEXT_MAX_LENGTH),
    phoneNumber: z.string().trim().min(1)
  }),
  z.object({
    type: z.literal("COPY_CODE"),
    text: z.string().trim().min(1).max(BUTTON_TEXT_MAX_LENGTH)
  }),
  z.object({
    type: z.literal("FLOW"),
    text: z.string().trim().min(1).max(BUTTON_TEXT_MAX_LENGTH)
  })
]);

export const templateComponentsContractSchema = z.object({
  header: templateHeaderComponentSchema.optional(),
  body: templateBodyComponentSchema,
  footer: templateFooterComponentSchema.optional(),
  buttons: z.array(templateButtonSchema).default([])
});

export const templateVariableContractSchema = z.object({
  componentType: z.literal("BODY"),
  position: z.number().int().positive(),
  placeholder: z.string().regex(/^\{\{\d+\}\}$/),
  sampleValue: z.string().trim().min(1),
  sourceKey: z.string().trim().min(1).nullable().optional()
});

export const createTemplateBodySchema = z.object({
  name: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]+$/),
  displayName: z.string().trim().min(1),
  category: templateCategorySchema,
  type: z.literal("TEXT"),
  languageCode: z.string().trim().min(1),
  components: templateComponentsContractSchema,
  variables: z.array(templateVariableContractSchema)
});

export type TemplateType = z.infer<typeof templateTypeSchema>;
export type TemplateCategory = z.infer<typeof templateCategorySchema>;
export type TemplateStatus = z.infer<typeof templateStatusSchema>;
export type TemplateComponentType = z.infer<typeof templateComponentTypeSchema>;
export type TemplateHeaderFormat = z.infer<typeof templateHeaderFormatSchema>;
export type TemplateButtonType = z.infer<typeof templateButtonTypeSchema>;
export type TemplateQualityRating = z.infer<typeof templateQualityRatingSchema>;
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>;
export type CreateTemplateBody = z.infer<typeof createTemplateBodySchema>;
