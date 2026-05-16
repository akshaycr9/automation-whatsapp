export const TEMPLATE_CATEGORIES = ["marketing", "utility", "authentication"] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];
