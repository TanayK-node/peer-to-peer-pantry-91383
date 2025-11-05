import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  member_since: string;
  rating: number | null;
  total_ratings: number | null;
  created_at: string;
  updated_at: string;
  unique_code: string;
}

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });
};

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });
};

export const useUserProducts = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userProducts", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            id,
            name,
            icon,
            slug
          )
        `)
        .eq("seller_id", userId)
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useUserSoldProducts = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userSoldProducts", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            id,
            name,
            icon,
            slug
          )
        `)
        .eq("seller_id", userId)
        .eq("status", "sold")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
