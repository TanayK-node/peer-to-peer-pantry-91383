import { useState } from "react";
import { ArrowLeft, Share2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BottomNav from "@/components/BottomNav";

const Sell = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "Data Structures in C - 2nd Edition",
    category: "Book",
    description: "Overall good book with clean pages.",
    price: "450",
    condition: "Used - Good",
    meetupPreference: "Used - Good",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">View Your Listing</h1>
          <button className="p-2 hover:bg-muted rounded-full">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <div className="flex items-center justify-center bg-muted py-16 px-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-card rounded-2xl mb-4">
                <Upload className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Upload product images</p>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-1 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 1 ? "bg-muted-foreground" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Form Fields */}
          <div className="px-4 space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-transparent border-0 border-b rounded-none px-0 resize-none focus-visible:ring-0"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Price</label>
              <Input
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0"
                type="number"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Condition</label>
              <Input
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Meetup Preference
              </label>
              <Input
                value={formData.meetupPreference}
                onChange={(e) =>
                  setFormData({ ...formData, meetupPreference: e.target.value })
                }
                className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 text-destructive border-destructive"
            >
              Remove
            </Button>
            <Button type="submit" className="flex-1 h-12">
              Mark as Sold
            </Button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
};

export default Sell;
