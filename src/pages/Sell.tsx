import { useState, useEffect } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct } from "@/hooks/useCreateProduct";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  price: z.number().min(0, "Price must be positive"),
  condition: z.enum(["new", "like_new", "good", "fair", "poor"]),
  category_id: z.string().uuid("Please select a category"),
  location: z.string().min(2, "Location is required").max(100),
});

const Sell = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    description: "",
    price: "",
    condition: "good" as const,
    location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/sell");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = productSchema.parse({
        ...formData,
        price: parseFloat(formData.price),
      });

      await createProduct.mutateAsync({
        title: validated.title,
        description: validated.description,
        price: validated.price,
        condition: validated.condition,
        category_id: validated.category_id,
        location: validated.location,
        image_urls: [],
      });

      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Create Listing</h1>
          <div className="w-10" />
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
          <div className="px-4 space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., iPhone 14 Pro Max"
                className="h-12"
                required
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium">Category *</label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-xs text-destructive">{errors.category_id}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your item in detail..."
                className="resize-none"
                rows={4}
                required
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium">Price ($) *</label>
              <Input
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="h-12"
                type="number"
                step="0.01"
                min="0"
                required
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium">Condition *</label>
              <Select
                value={formData.condition}
                onValueChange={(value: any) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like_new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
              {errors.condition && <p className="text-xs text-destructive">{errors.condition}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium">Location *</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Campus Building 4"
                className="h-12"
                required
              />
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12"
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
};

export default Sell;
