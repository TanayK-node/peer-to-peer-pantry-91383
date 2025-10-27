import { ArrowLeft, Search, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { formatDistanceToNow } from "date-fns";

const Chats = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: conversations, isLoading } = useConversations(user?.id);

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
            <button className="p-2 hover:bg-muted rounded-full">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", "Unread"].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === "All"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {filter}
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
        ) : !conversations || conversations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conversation) => {
              const otherUser =
                user?.id === conversation.buyer_id
                  ? conversation.seller_profile
                  : conversation.buyer_profile;

              return (
                <div
                  key={conversation.id}
                  onClick={() => navigate(`/chat/${conversation.id}`)}
                  className="px-4 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 flex-shrink-0 bg-primary/10">
                      {otherUser?.avatar_url ? (
                        <img src={otherUser.avatar_url} alt={otherUser.full_name} />
                      ) : (
                        <div className="flex items-center justify-center h-full text-primary font-semibold">
                          {otherUser?.full_name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-sm">
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
