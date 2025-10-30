import { ArrowLeft, User, HelpCircle, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const Account = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: User,
      title: "Profile Section",
      description: "View and edit your profile",
      path: "/profile",
    },
    {
      icon: HelpCircle,
      title: "How it Works",
      description: "Learn how to use the platform",
      path: "/how-it-works",
    },
    {
      icon: Mail,
      title: "Contact Us",
      description: "Get in touch with support",
      path: "/contact-us",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Account</h1>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-base">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Account;
