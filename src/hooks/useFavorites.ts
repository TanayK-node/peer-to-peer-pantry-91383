import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Product } from "./useProducts";

interface FavoriteWithProduct {
  id: string;
  product_id: string;
  created_at: string;
  products: Product;
}

export const useFavorites = (userId?: string) => {
  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          product_id,
          created_at,
          products (
            id,
            title,
            description,
            price,
            condition,
            status,
            location,
            image_urls,
            featured,
            views,
            created_at,
            category_id,
            seller_id,
            profiles!products_seller_id_fkey (
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
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;
      return data as FavoriteWithProduct[];
    },
    enabled: !!userId,
  });
};

export const useIsFavorite = (productId: string, userId?: string) => {
  return useQuery({
    queryKey: ["favorite", productId, userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!userId && !!productId,
  });
};

export const useToggleFavorite = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, userId, isFavorite }: { 
      productId: string; 
      userId: string;
      isFavorite: boolean;
    }) => {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: userId, product_id: productId });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["favorite", variables.productId, variables.userId] });
      
      toast({
        title: variables.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: variables.isFavorite 
          ? "Product removed from your saved items" 
          : "Product saved to your favorites",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
      console.error("Error toggling favorite:", error);
    },
  });
};
