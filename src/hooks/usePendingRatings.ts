import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePendingRatings = () => {
  return useQuery({
    queryKey: ["pendingRatings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get products where the current user is the buyer and hasn't rated yet
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          title,
          seller_id,
          profiles!products_seller_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("buyer_id", user.id)
        .eq("status", "sold");

      if (error) throw error;

      // Filter out products that already have ratings
      const productsWithoutRatings = await Promise.all(
        (data || []).map(async (product) => {
          const { data: existingRating } = await supabase
            .from("ratings")
            .select("id")
            .eq("product_id", product.id)
            .eq("buyer_id", user.id)
            .single();

          return existingRating ? null : product;
        })
      );

      return productsWithoutRatings.filter((p) => p !== null);
    },
  });
};
