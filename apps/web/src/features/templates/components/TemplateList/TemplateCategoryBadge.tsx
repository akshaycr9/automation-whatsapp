import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TemplateCategory } from "../../types/template.types";
import { formatTemplateCategory, getCategoryBadgeClasses } from "../../utils/templateFormatters";

type TemplateCategoryBadgeProps = {
  category: TemplateCategory;
};

export function TemplateCategoryBadge({ category }: TemplateCategoryBadgeProps) {
  return (
    <Badge className={cn("capitalize", getCategoryBadgeClasses(category))}>{formatTemplateCategory(category)}</Badge>
  );
}
