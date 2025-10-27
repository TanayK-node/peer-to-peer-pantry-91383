import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  created_at: string;
  products: {
    title: string;
    image_urls: string[];
  } | null;
  buyer_profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  seller_profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  last_message: {
    content: string;
    created_at: string;
  } | null;
}

export const useConversations = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          products (title, image_urls),
          buyer_profile:profiles!buyer_id (id, full_name, avatar_url),
          seller_profile:profiles!seller_id (id, full_name, avatar_url)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!userId,
  });
};
