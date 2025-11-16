import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCreateItemRequestConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemRequestId,
      requesterId,
    }: {
      itemRequestId: string;
      requesterId: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("item_request_id", itemRequestId)
        .eq("seller_id", user.id)
        .eq("buyer_id", requesterId)
        .single();

      if (existing) {
        return existing.id;
      }

      // Create new conversation for item request
      // buyer_id is the requester, seller_id is the fulfiller
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          item_request_id: itemRequestId,
          buyer_id: requesterId,
          seller_id: user.id,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
