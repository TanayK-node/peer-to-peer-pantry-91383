import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  status: string;
  location: string | null;
  image_urls: string[];
  featured: boolean;
  views: number;
  created_at: string;
  category_id: string | null;
  seller_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    rating: number;
    member_since: string;
  } | null;
  categories: {
    id: string;
    name: string;
    icon: string;
    slug: string;
  } | null;
}

export const useProducts = (limit?: number) => {
  return useQuery({
    queryKey: ["products", limit],
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
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .eq("status", "available")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Product[];
    },
  });
};
