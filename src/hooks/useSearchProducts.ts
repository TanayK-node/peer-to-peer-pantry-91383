import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "./useProducts";

export interface SearchFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
}

export const useSearchProducts = (searchQuery: string, filters?: SearchFilters) => {
  return useQuery({
    queryKey: ["products", "search", searchQuery, filters],
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

      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte("price", filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte("price", filters.maxPrice);
      }

      if (filters?.condition && filters.condition !== "all") {
        query = query.eq("condition", filters.condition as any);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    },
    enabled: searchQuery.length > 0 || !!filters?.categoryId || !!filters?.condition || filters?.minPrice !== undefined || filters?.maxPrice !== undefined,
  });
};
