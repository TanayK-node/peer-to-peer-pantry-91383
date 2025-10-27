import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "./useProducts";

export const useSearchProducts = (searchQuery: string, categoryId?: string) => {
  return useQuery({
    queryKey: ["products", "search", searchQuery, categoryId],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          profiles!seller_id (
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
        .eq("status", "available");

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    },
    enabled: searchQuery.length > 0 || !!categoryId,
  });
};
