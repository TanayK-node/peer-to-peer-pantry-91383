import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ItemRequest } from "@/hooks/useItemRequests";
import { useCreateItemRequestConversation } from "@/hooks/useCreateItemRequestConversation";

const ItemRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createConversation = useCreateItemRequestConversation();

  const { data: request, isLoading } = useQuery({
    queryKey: ["item-request", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("item_requests")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            rating,
            total_ratings
          )
        `)
        .eq("id", id || "")
        .single();

      if (error) throw error;
      return data as ItemRequest & {
        profiles: {
          full_name: string;
          avatar_url: string | null;
          rating: number | null;
          total_ratings: number | null;
        };
      };
    },
    enabled: !!id,
  });

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "like_new":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "good":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "fair":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "poor":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatCondition = (condition: string) => {
    return condition
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleFulfillRequest = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to fulfill this request",
      });
      navigate("/auth?redirect=" + window.location.pathname);
      return;
    }

    if (user.id === request?.user_id) {
      toast({
        title: "Cannot fulfill your own request",
        description: "You cannot fulfill your own item request",
      });
      return;
    }

    try {
      const conversationId = await createConversation.mutateAsync({
        itemRequestId: id || "",
        requesterId: request?.user_id || "",
      });
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading request...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Request not found</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const formattedDate = format(new Date(request.created_at), "MMM dd, yyyy");
  const requester = request.profiles;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Item Request Details</h1>
        </div>
      </div>

      <div className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Request Icon */}
        <div className="flex justify-center">
          <div className="bg-primary/10 p-8 rounded-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title and Price */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{request.title}</h2>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">
              ${request.price_quote}
            </span>
            <Badge className={getConditionColor(request.condition)}>
              {formatCondition(request.condition)}
            </Badge>
          </div>
        </div>

        {/* Meetup Preference */}
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Meetup Preference</p>
          <p className="font-medium text-foreground">{request.meetup_preference}</p>
        </div>

        {/* Requester Info */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-3">Requested by</p>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={requester?.avatar_url || ""} />
              <AvatarFallback>
                {requester?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {requester?.full_name || "Anonymous"}
              </p>
              {requester?.rating !== null && requester?.rating !== undefined && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>⭐ {requester.rating.toFixed(1)}</span>
                  <span>({requester.total_ratings || 0} ratings)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posted Date */}
        <div className="text-center text-sm text-muted-foreground">
          Posted on {formattedDate}
        </div>

        {/* Fulfill Button */}
        <Button
          onClick={handleFulfillRequest}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          Fulfill Item Request
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ItemRequestDetail;
