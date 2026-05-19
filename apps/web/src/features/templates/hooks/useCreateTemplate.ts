import { useMutation, useQueryClient } from "@tanstack/react-query";
import { templateApi } from "../api/templateApi";
import { templateKeys } from "./templateKeys";

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templateApi.createTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    }
  });
}
