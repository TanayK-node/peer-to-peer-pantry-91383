import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubmitProductRatingParams {
  type: "product";
  productId: string;
  sellerId: string;
  rating: number;
}

interface SubmitItemRequestRatingParams {
  type: "item_request";
  itemRequestId: string;
  fulfillerId: string;
  rating: number;
}

type SubmitRatingParams = SubmitProductRatingParams | SubmitItemRequestRatingParams;

export const useSubmitRating = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: SubmitRatingParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (params.type === "product") {
        const { error } = await supabase
          .from("ratings")
          .insert({
            product_id: params.productId,
            seller_id: params.sellerId,
            buyer_id: user.id,
            rating: params.rating,
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("ratings")
          .insert({
            item_request_id: params.itemRequestId,
            seller_id: params.fulfillerId,
            buyer_id: user.id,
            rating: params.rating,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRatings"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Success",
        description: "Rating submitted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
