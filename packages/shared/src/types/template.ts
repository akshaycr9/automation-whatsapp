import { TemplateCategory } from "../constants/template-categories";

export type TemplateSummary = {
  id: string;
  name: string;
  category: TemplateCategory;
  status: string;
};
