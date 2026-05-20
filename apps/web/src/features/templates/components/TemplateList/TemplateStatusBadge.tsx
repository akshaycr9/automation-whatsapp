import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TemplateStatus } from "../../types/template.types";
import { formatTemplateStatus, getStatusBadgeClasses } from "../../utils/templateFormatters";

type TemplateStatusBadgeProps = {
  status: TemplateStatus;
};

export function TemplateStatusBadge({ status }: TemplateStatusBadgeProps) {
  return <Badge className={cn("capitalize", getStatusBadgeClasses(status))}>{formatTemplateStatus(status)}</Badge>;
}
