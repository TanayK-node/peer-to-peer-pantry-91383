import { Home, MessageCircle, PlusCircle, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadConversations } from "@/hooks/useUnreadConversations";
import { useState } from "react";
import SellOptionsDialog from "./SellOptionsDialog";
import LoginPromptDialog from "./LoginPromptDialog";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: unreadCount = 0 } = useUnreadConversations();
  const [showSellOptions, setShowSellOptions] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageCircle, label: "Chats", path: "/chats" },
    { icon: PlusCircle, label: "Sell", path: "/sell" },
    { icon: User, label: "Account", path: "/account" },
  ];

  const handleNavigation = (path: string) => {
    if ((path === "/sell" || path === "/account") && !user) {
      setShowLoginPrompt(true);
      return;
    }
    if (path === "/sell") {
      setShowSellOptions(true);
      return;
    }
    navigate(path);
  };

  return (
    <>
      <SellOptionsDialog open={showSellOptions} onOpenChange={setShowSellOptions} />
      <LoginPromptDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 shadow-lg">
        <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
                  isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className={`h-6 w-6 transition-all ${isActive ? "stroke-[2.5]" : ""}`} />
                  {item.path === "/chats" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-background" />
                  )}
                </div>
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
