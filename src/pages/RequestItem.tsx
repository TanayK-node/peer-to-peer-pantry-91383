import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const requestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  priceQuote: z.number().min(0, "Price quote must be positive"),
  condition: z.enum(["new", "like_new", "good", "fair", "poor"]),
  meetupPreference: z.string().min(1, "Please select a meetup preference"),
});

const RequestItem = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    priceQuote: "",
    condition: "good" as const,
    meetupPreference: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = requestSchema.parse({
        title: formData.title,
        priceQuote: parseFloat(formData.priceQuote),
        condition: formData.condition,
        meetupPreference: formData.meetupPreference,
      });

      const { error } = await supabase
        .from('item_requests')
        .insert({
          user_id: user.id,
          title: validated.title,
          price_quote: validated.priceQuote,
          condition: validated.condition,
          meetup_preference: validated.meetupPreference,
        });

      if (error) throw error;

      toast({
        title: "Request Submitted!",
        description: "Your item request has been submitted successfully.",
      });

      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        toast({
          title: "Error",
          description: "Failed to submit request. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 px-4 py-4 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Request an Item</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Item Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., iPhone 13 Pro Max"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Price Quote */}
          <div className="space-y-2">
            <Label htmlFor="priceQuote">
              Price Quote ($) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="priceQuote"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.priceQuote}
              onChange={(e) => setFormData({ ...formData, priceQuote: e.target.value })}
              className={errors.priceQuote ? "border-destructive" : ""}
            />
            {errors.priceQuote && (
              <p className="text-sm text-destructive">{errors.priceQuote}</p>
            )}
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">
              Condition <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.condition}
              onValueChange={(value: any) => setFormData({ ...formData, condition: value })}
            >
              <SelectTrigger className={errors.condition ? "border-destructive" : ""}>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like_new">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
            {errors.condition && (
              <p className="text-sm text-destructive">{errors.condition}</p>
            )}
          </div>

          {/* Meetup Preference */}
          <div className="space-y-2">
            <Label htmlFor="meetupPreference">
              Meetup Preference <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.meetupPreference}
              onValueChange={(value) => setFormData({ ...formData, meetupPreference: value })}
            >
              <SelectTrigger className={errors.meetupPreference ? "border-destructive" : ""}>
                <SelectValue placeholder="Select meetup preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eng">George Vari Engineering and Computing Centre (ENG)</SelectItem>
                <SelectItem value="dcc">Daphne Cockwell Health Sciences Complex (DCC)</SelectItem>
                <SelectItem value="kerr">Kerr Hall</SelectItem>
                <SelectItem value="cui">Centre for Urban Innovation (CUI)</SelectItem>
                <SelectItem value="jorgenson">Jorgenson Hall</SelectItem>
                <SelectItem value="ilc">International Living/Learning Centre (ILC)</SelectItem>
                <SelectItem value="trsm">Ted Rogers School Of Management</SelectItem>
                <SelectItem value="arc">Architecture Building (ARC)</SelectItem>
                <SelectItem value="chang">The Chang School of Continuing Education</SelectItem>
                <SelectItem value="mac">Mattamy Athletic Centre</SelectItem>
              </SelectContent>
            </Select>
            {errors.meetupPreference && (
              <p className="text-sm text-destructive">{errors.meetupPreference}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
};

export default RequestItem;
