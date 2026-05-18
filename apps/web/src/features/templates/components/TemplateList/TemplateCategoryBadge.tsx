import { Badge } from "@/components/ui/badge";
import type { TemplateCategory } from "../../types/template.types";

type TemplateCategoryBadgeProps = {
  category: TemplateCategory;
};

export function TemplateCategoryBadge({ category }: TemplateCategoryBadgeProps) {
  return <Badge>{category.toLowerCase()}</Badge>;
}
