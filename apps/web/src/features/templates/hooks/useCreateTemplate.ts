import { useMutation, useQueryClient } from "@tanstack/react-query";
import { templateKeys } from "../api/template.keys";
import { templateApi } from "../api/templateApi";

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templateApi.createTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    }
  });
}
