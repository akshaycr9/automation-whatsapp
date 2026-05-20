import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { templateApi } from "../api/templateApi";
import { templateKeys } from "./templateKeys";

export function useSyncTemplates() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => templateApi.syncTemplates({ accessToken }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.all });
    }
  });
}
