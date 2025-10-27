import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type ProductCondition = Database["public"]["Enums"]["product_condition"];

interface CreateProductData {
  title: string;
  description: string;
  price: number;
  condition: ProductCondition;
  category_id: string | null;
  location: string | null;
  image_urls: string[];
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a product");
      }

      const { data: product, error } = await supabase
        .from("products")
        .insert({
          title: data.title,
          description: data.description,
          price: data.price,
          condition: data.condition,
          category_id: data.category_id,
          location: data.location,
          image_urls: data.image_urls,
          seller_id: user.id,
          status: "available",
        })
        .select()
        .single();

      if (error) throw error;
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Success!",
        description: "Your product has been listed successfully.",
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
