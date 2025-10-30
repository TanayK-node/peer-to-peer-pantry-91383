import { ArrowLeft, Search, MoreVertical, Star, Trash2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Chats = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "important">("all");
  const { data: conversations, isLoading } = useConversations(user?.id);


  const handleToggleImportant = async (conversationId: string, isBuyer: boolean, currentValue: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const field = isBuyer ? 'is_important_buyer' : 'is_important_seller';
    
    const { error } = await supabase
      .from('conversations')
      .update({ [field]: !currentValue })
      .eq('id', conversationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update conversation",
        variant: "destructive",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  };

  const handleToggleUnread = async (conversationId: string, isBuyer: boolean, currentValue: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const field = isBuyer ? 'is_unread_buyer' : 'is_unread_seller';
    
    const { error } = await supabase
      .from('conversations')
      .update({ [field]: !currentValue })
      .eq('id', conversationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update conversation",
        variant: "destructive",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Conversation deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  };

  // Filter conversations based on active tab
  const filteredConversations = conversations?.filter((conv) => {
    const isBuyer = user?.id === conv.buyer_id;
    const isUnread = isBuyer ? conv.is_unread_buyer : conv.is_unread_seller;
    const isImportant = isBuyer ? conv.is_important_buyer : conv.is_important_seller;

    if (activeTab === "unread") return isUnread;
    if (activeTab === "important") return isImportant;
    return true; // "all" tab
  }) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Chats</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-full">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { label: "All", value: "all" as const },
            { label: "Unread", value: "unread" as const },
            { label: "Important", value: "important" as const },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveTab(filter.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                activeTab === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto">
        {/* Chat List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              {activeTab === "unread" ? "No unread conversations" : 
               activeTab === "important" ? "No important conversations" : 
               "No conversations yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => {
              const otherUser =
                user?.id === conversation.buyer_id
                  ? conversation.seller_profile
                  : conversation.buyer_profile;

              const isBuyer = user?.id === conversation.buyer_id;
              const isUnread = isBuyer ? conversation.is_unread_buyer : conversation.is_unread_seller;
              const isImportant = isBuyer ? conversation.is_important_buyer : conversation.is_important_seller;

              return (
                <div
                  key={conversation.id}
                  className="px-4 py-4 hover:bg-muted/50 transition-colors relative"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 flex-shrink-0 bg-primary/10">
                      {otherUser?.avatar_url ? (
                        <img src={otherUser.avatar_url} alt={otherUser.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-primary font-semibold">
                          {otherUser?.full_name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </Avatar>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/chat/${conversation.id}`)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`font-semibold text-sm ${isUnread ? 'text-primary' : ''}`}>
                          {otherUser?.full_name || "Unknown User"}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {conversation.last_message_at
                            ? formatDistanceToNow(new Date(conversation.last_message_at), {
                                addSuffix: true,
                              })
                            : ""}
                        </span>
                      </div>
                      {conversation.products && (
                        <Badge variant="secondary" className="text-xs mb-1">
                          {conversation.products.title}
                        </Badge>
                      )}
                    </div>
                    
                    {/* 3 Dots Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-2 hover:bg-muted rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card z-50">
                        <DropdownMenuItem onClick={(e) => handleToggleUnread(conversation.id, isBuyer, isUnread || false, e)}>
                          <Mail className="h-4 w-4 mr-2" />
                          {isUnread ? "Mark as read" : "Mark as unread"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleToggleImportant(conversation.id, isBuyer, isImportant || false, e)}>
                          <Star className={`h-4 w-4 mr-2 ${isImportant ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          {isImportant ? "Remove from important" : "Mark as important"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Chats;
