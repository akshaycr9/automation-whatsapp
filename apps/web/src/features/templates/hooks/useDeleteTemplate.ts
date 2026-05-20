import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { templateApi } from "../api/templateApi";
import { templateKeys } from "./templateKeys";

export function useDeleteTemplate() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templateApi.deleteTemplate(id, { accessToken }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    }
  });
}
