import { useMutation, useQueryClient } from "@tanstack/react-query";
import { templateKeys } from "../api/template.keys";
import { templateApi } from "../api/templateApi";

export function useSyncTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templateApi.syncTemplates,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.all });
    }
  });
}
