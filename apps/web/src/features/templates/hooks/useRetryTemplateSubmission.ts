import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { templateApi } from "../api/templateApi";
import { templateKeys } from "./templateKeys";

export function useRetryTemplateSubmission() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => templateApi.retryTemplateSubmission(templateId, { accessToken }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.all });
    }
  });
}
