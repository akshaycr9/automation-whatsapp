import { useQuery } from "@tanstack/react-query";
import { templateApi } from "../api/templateApi";
import type { TemplateListFilters } from "../types/template.types";
import { templateKeys } from "./templateKeys";

export function useTemplates(filters: TemplateListFilters = {}) {
  return useQuery({
    queryKey: templateKeys.list(filters),
    queryFn: async () => {
      const response = await templateApi.getTemplates(filters);
      return response.data;
    }
  });
}
