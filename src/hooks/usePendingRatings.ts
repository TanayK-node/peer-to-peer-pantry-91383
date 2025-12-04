import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PendingProductRating {
  type: "product";
  id: string;
  title: string;
  seller_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface PendingItemRequestRating {
  type: "item_request";
  id: string;
  title: string;
  fulfiller_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export type PendingRating = PendingProductRating | PendingItemRequestRating;

export const usePendingRatings = () => {
  return useQuery({
    queryKey: ["pendingRatings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get products where the current user is the buyer and hasn't rated yet
      const { data: products, error: productsError } = await supabase
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

      if (productsError) throw productsError;

      // Get item requests where the current user is the requester and it's fulfilled
      const { data: itemRequests, error: itemRequestsError } = await supabase
        .from("item_requests")
        .select(`
          id,
          title,
          fulfiller_id,
          profiles!item_requests_fulfiller_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "fulfilled")
        .not("fulfiller_id", "is", null);

      if (itemRequestsError) throw itemRequestsError;

      // Filter out products that already have ratings
      const productsWithoutRatings = await Promise.all(
        (products || []).map(async (product) => {
          const { data: existingRating } = await supabase
            .from("ratings")
            .select("id")
            .eq("product_id", product.id)
            .eq("buyer_id", user.id)
            .maybeSingle();

          if (existingRating) return null;
          
          return {
            type: "product" as const,
            id: product.id,
            title: product.title,
            seller_id: product.seller_id,
            profiles: product.profiles,
          };
        })
      );

      // Filter out item requests that already have ratings
      const itemRequestsWithoutRatings = await Promise.all(
        (itemRequests || []).map(async (request) => {
          if (!request.fulfiller_id || !request.profiles) return null;
          
          const { data: existingRating } = await supabase
            .from("ratings")
            .select("id")
            .eq("item_request_id", request.id)
            .eq("buyer_id", user.id)
            .maybeSingle();

          if (existingRating) return null;
          
          return {
            type: "item_request" as const,
            id: request.id,
            title: request.title,
            fulfiller_id: request.fulfiller_id,
            profiles: request.profiles,
          };
        })
      );

      const allPending: PendingRating[] = [
        ...productsWithoutRatings.filter((p): p is PendingProductRating => p !== null),
        ...itemRequestsWithoutRatings.filter((r): r is PendingItemRequestRating => r !== null),
      ];

      return allPending;
    },
  });
};
