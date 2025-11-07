import { ArrowLeft, User, HelpCircle, Mail, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useCurrentUserProfile } from "@/hooks/useProfile";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Account = () => {
  const navigate = useNavigate();
  const { data: profile } = useCurrentUserProfile();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (profile?.unique_code) {
      navigator.clipboard.writeText(profile.unique_code);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Your unique ID has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Unique ID</CardTitle>
            <CardDescription>Share your unique ID to the purchaser after completing your transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-lg font-mono bg-muted px-4 py-3 rounded-md text-center">
                {profile?.unique_code || "Loading..."}
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

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
