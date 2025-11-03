import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUnreadConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["unread-conversations", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { data, error } = await supabase
        .from("conversations")
        .select("id, buyer_id, seller_id, is_unread_buyer, is_unread_seller")
        .or(`and(buyer_id.eq.${user.id},is_unread_buyer.eq.true),and(seller_id.eq.${user.id},is_unread_seller.eq.true)`);

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds to check for new messages
  });
};
