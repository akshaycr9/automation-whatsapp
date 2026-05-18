import { Badge } from "@/components/ui/badge";
import type { TemplateStatus } from "../../types/template.types";

type TemplateStatusBadgeProps = {
  status: TemplateStatus;
};

export function TemplateStatusBadge({ status }: TemplateStatusBadgeProps) {
  return <Badge>{status.toLowerCase()}</Badge>;
}
