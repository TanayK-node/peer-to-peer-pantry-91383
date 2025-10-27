import { Home, MessageCircle, PlusCircle, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageCircle, label: "Chats", path: "/chats" },
    { icon: PlusCircle, label: "Sell", path: "/sell" },
    { icon: User, label: "Account", path: "/profile" },
  ];

  const handleNavigation = (path: string) => {
    if (path === "/profile" && !user) {
      navigate("/auth");
      return;
    }
    navigate(path);
  };

  return (
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
              <Icon className={`h-6 w-6 transition-all ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
