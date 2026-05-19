import { useQuery } from "@tanstack/react-query";
import { templateApi } from "../api/templateApi";
import { templateKeys } from "./templateKeys";

export function useTemplate(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: templateKeys.detail(id ?? ""),
    queryFn: async () => {
      const response = await templateApi.getTemplateById(id ?? "");
      return response.data;
    }
  });
}
