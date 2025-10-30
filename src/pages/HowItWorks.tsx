import { ArrowLeft, ShoppingBag, MessageSquare, DollarSign, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Search,
      title: "Browse or Search",
      description: "Explore products by category or use the search feature to find exactly what you need from fellow students.",
    },
    {
      icon: MessageSquare,
      title: "Message the Seller",
      description: "Contact sellers directly through our built-in chat to ask questions, negotiate prices, or arrange meetups.",
    },
    {
      icon: DollarSign,
      title: "Meet & Exchange",
      description: "Meet safely on campus at your preferred location and complete the transaction in person.",
    },
    {
      icon: ShoppingBag,
      title: "List Your Items",
      description: "Got something to sell? Create a listing with photos, set your price, and connect with interested buyers.",
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
          <h1 className="text-xl font-bold">How it Works</h1>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Introduction */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Welcome to Campus Marketplace</h2>
          <p className="text-muted-foreground">
            Your go-to platform for buying and selling items within the campus community. 
            Here's how to get started:
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Safety Tips */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Safety Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Always meet in public campus locations during daylight hours</li>
            <li>• Inspect items carefully before purchasing</li>
            <li>• Trust your instincts - if something feels off, walk away</li>
            <li>• Never share personal banking information</li>
            <li>• Report suspicious activity to campus security</li>
          </ul>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default HowItWorks;
