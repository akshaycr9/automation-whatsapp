import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { templateApi } from "../api/templateApi";
import type { TemplateListFilters } from "../types/template.types";
import { templateKeys } from "./templateKeys";

export function useTemplates(filters: TemplateListFilters = {}) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: templateKeys.list(filters),
    queryFn: async () => {
      const response = await templateApi.getTemplates(filters, { accessToken });
      return response.data;
    },
    enabled: Boolean(accessToken)
  });
}
