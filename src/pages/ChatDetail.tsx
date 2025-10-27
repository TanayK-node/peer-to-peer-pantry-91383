import { ArrowLeft, Send, MoreVertical } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const ChatDetail = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");

  const { data: conversations } = useConversations(user?.id);
  const conversation = conversations?.find((c) => c.id === conversationId);
  const { data: messages } = useMessages(conversationId);
  const sendMessage = useSendMessage();

  const otherUser =
    user?.id === conversation?.buyer_id
      ? conversation?.seller_profile
      : conversation?.buyer_profile;

  const handleSend = async () => {
    if (!messageText.trim() || !conversationId) return;

    await sendMessage.mutateAsync({
      conversationId,
      content: messageText,
    });

    setMessageText("");
  };

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-muted rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar className="h-10 w-10 bg-primary/10">
              {otherUser?.avatar_url ? (
                <img src={otherUser.avatar_url} alt={otherUser.full_name} />
              ) : (
                <div className="flex items-center justify-center h-full text-primary font-semibold">
                  {otherUser?.full_name?.[0]?.toUpperCase()}
                </div>
              )}
            </Avatar>
            <div>
              <h1 className="font-semibold">{otherUser?.full_name}</h1>
              {conversation.products && (
                <p className="text-xs text-muted-foreground">
                  {conversation.products.title}
                </p>
              )}
            </div>
          </div>
          <button className="p-2 hover:bg-muted rounded-full">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Product Info */}
      {conversation.products && (
        <div className="bg-card border-b border-border p-3">
          <div className="flex items-center gap-3">
            {conversation.products.image_urls?.[0] && (
              <img
                src={conversation.products.image_urls[0]}
                alt={conversation.products.title}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{conversation.products.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-screen-xl mx-auto">
          {messages?.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4">
        <div className="max-w-screen-xl mx-auto flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessage.isPending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
