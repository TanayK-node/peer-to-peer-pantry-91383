import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  image_url: string | null;
  created_at: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      
      // Move "Other Items" to the end
      const categories = data as Category[];
      const otherItemsIndex = categories.findIndex(cat => cat.slug === 'other-items');
      if (otherItemsIndex > -1) {
        const otherItems = categories.splice(otherItemsIndex, 1)[0];
        categories.push(otherItems);
      }
      
      return categories;
    },
  });
};
