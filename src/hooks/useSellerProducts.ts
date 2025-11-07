import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "./useProducts";

export const useSellerProducts = (sellerId: string | undefined, currentProductId: string | undefined) => {
  return useQuery({
    queryKey: ["sellerProducts", sellerId, currentProductId],
    queryFn: async () => {
      if (!sellerId) return [];

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          seller:profiles!seller_id (
            id,
            full_name,
            avatar_url,
            rating,
            member_since
          ),
          categories (
            id,
            name,
            icon,
            slug
          )
        `)
        .eq("seller_id", sellerId)
        .eq("status", "available")
        .neq("id", currentProductId || "") // Exclude current product
        .order("created_at", { ascending: false })
        .limit(6); // Limit to 6 other products

      if (error) throw error;
      
      // Transform data to match Product type
      return (data || []).map(item => ({
        ...item,
        profiles: item.seller
      })) as unknown as Product[];
    },
    enabled: !!sellerId,
  });
};
