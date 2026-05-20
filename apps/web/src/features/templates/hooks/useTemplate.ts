import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { templateApi } from "../api/templateApi";
import { templateKeys } from "./templateKeys";

export function useTemplate(id?: string) {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(id && accessToken),
    queryKey: templateKeys.detail(id ?? ""),
    queryFn: async () => {
      const response = await templateApi.getTemplateById(id ?? "", { accessToken });
      return response.data;
    }
  });
}
