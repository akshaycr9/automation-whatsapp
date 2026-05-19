import { useMutation, useQueryClient } from "@tanstack/react-query";
import { templateApi } from "../api/templateApi";
import { templateKeys } from "./templateKeys";

export function useSyncTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templateApi.syncTemplates,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.all });
    }
  });
}
