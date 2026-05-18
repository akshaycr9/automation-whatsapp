import { useQuery } from "@tanstack/react-query";
import { templateKeys } from "../api/template.keys";
import { templateApi } from "../api/templateApi";

export function useTemplate(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: templateKeys.detail(id ?? ""),
    queryFn: () => templateApi.getTemplateById(id ?? "")
  });
}
