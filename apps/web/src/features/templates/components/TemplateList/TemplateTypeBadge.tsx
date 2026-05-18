import { Badge } from "@/components/ui/badge";
import type { TemplateType } from "../../types/template.types";
import { formatTemplateType } from "../../utils/templateFormatters";

type TemplateTypeBadgeProps = {
  type: TemplateType;
};

export function TemplateTypeBadge({ type }: TemplateTypeBadgeProps) {
  return <Badge className="bg-surface-2 text-text-muted">{formatTemplateType(type)}</Badge>;
}
