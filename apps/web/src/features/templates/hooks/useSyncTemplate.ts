import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { templateApi } from "../api/templateApi";
import { templateKeys } from "./templateKeys";

export function useSyncTemplate() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => templateApi.syncTemplate(templateId, { accessToken }),
    onSuccess: async (_data, templateId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: templateKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) })
      ]);
    }
  });
}
