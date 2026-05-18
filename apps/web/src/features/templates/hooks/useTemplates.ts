import { useQuery } from "@tanstack/react-query";
import { templateKeys } from "../api/template.keys";
import { templateApi } from "../api/templateApi";
import type { TemplateListFilters } from "../types/template.types";

export function useTemplates(filters: TemplateListFilters = {}) {
  return useQuery({
    queryKey: templateKeys.list(filters),
    queryFn: () => templateApi.getTemplates(filters)
  });
}
