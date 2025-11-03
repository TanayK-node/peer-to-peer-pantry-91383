import { ArrowLeft, User, Package, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import campusImage from "@/assets/campus-building.png";

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

      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">
            The exclusive marketplace for <span className="text-primary">Toronto Metropolitan University</span> students.
          </h2>
          <p className="text-muted-foreground text-base">
            A secure place to buy and sell books, electronics, and dorm essentials with fellow verified TMU students.
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-12 rounded-xl overflow-hidden shadow-lg">
          <img 
            src={campusImage} 
            alt="Toronto Metropolitan University Campus" 
            className="w-full h-64 object-cover"
          />
        </div>

        {/* Steps Section */}
        <div className="mb-12">
          <h3 className="font-bold text-2xl mb-6">Here's how you can start:</h3>
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-4 items-start p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust & Safety */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h3 className="font-bold text-2xl mb-6 text-center">Trust & Safety</h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <User className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium">Verified Students</p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium">Secure Chat</p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium">Safe Meetups</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default HowItWorks;
