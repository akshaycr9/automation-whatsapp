import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { templateApi } from "../api/templateApi";
import { templateKeys } from "./templateKeys";

export function useCreateTemplate() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof templateApi.createTemplate>[0]) =>
      templateApi.createTemplate(payload, { accessToken }),
    onSuccess: async (response) => {
      if (response.data.id) {
        queryClient.setQueryData(templateKeys.detail(response.data.id), response.data);
      }
      await queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    }
  });
}
