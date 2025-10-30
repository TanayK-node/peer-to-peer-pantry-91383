import { ArrowLeft, User, Package, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: User,
      title: "Login with TMU email",
      description: "Login using your @torontomu.ca email to join our verified student marketplace.",
    },
    {
      icon: Package,
      title: "Browse or Sell",
      description: "Whether buying or selling, easily upload pictures, write a short description, and choose your price.",
    },
    {
      icon: MessageCircle,
      title: "Meet & swap payment",
      description: "Use our built-in chat to connect and meet up on campus.",
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
          <h1 className="text-xl font-bold">How it Works?</h1>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Introduction */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-3">
            The exclusive marketplace for <span className="text-primary">Toronto Metropolitan University</span> students.
          </h2>
          <p className="text-muted-foreground text-sm">
            A secure place to buy and sell books, electronics, and dorm essentials with fellow verified TMU students.
          </p>
        </div>

        {/* Hero Image Placeholder */}
        {/* <div className="mb-6 rounded-lg overflow-hidden bg-muted h-48 flex items-center justify-center">
          <img src="https://vastoverseaseducation.com/wp-content/uploads/2023/11/Toronto-Metropolitan-University-1-1024x529.jpg"/>
        </div> */}

        {/* Steps Section */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">Here's how you can start selling:</h3>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-semibold mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust & Safety */}
        <div className="mt-8 p-4 bg-card border border-border rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-center">Trust & Safety</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Verified Students</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Secure Chat</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Safe Meetups</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default HowItWorks;
