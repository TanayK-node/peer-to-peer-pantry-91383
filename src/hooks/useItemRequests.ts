import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ItemRequest {
  id: string;
  user_id: string;
  title: string;
  price_quote: number;
  condition: string;
  meetup_preference: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const useItemRequests = (limit?: number) => {
  return useQuery({
    queryKey: ["item-requests", limit],
    queryFn: async () => {
      let query = supabase
        .from("item_requests")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ItemRequest[];
    },
  });
};
