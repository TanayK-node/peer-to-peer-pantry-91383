import { useState, useEffect } from "react";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  price: z.number().min(0, "Price must be positive"),
  condition: z.enum(["new", "like_new", "good", "fair", "poor"]),
  category_id: z.string().uuid("Please select a category"),
  location: z.string().min(1, "Please select a location"),
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
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});


  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images",
        variant: "destructive",
      });
      return;
    }

    setImages([...images, ...files]);
    
    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (images.length === 0) {
      toast({
        title: "No images",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    try {
      const validated = productSchema.parse({
        ...formData,
        price: parseFloat(formData.price),
      });

      const imageUrls = await uploadImages();

      await createProduct.mutateAsync({
        title: validated.title,
        description: validated.description,
        price: validated.price,
        condition: validated.condition,
        category_id: validated.category_id,
        location: validated.location,
        image_urls: imageUrls,
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
          <div className="bg-muted py-8 px-4">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {imagePreviews.length === 0 ? (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer py-8"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 bg-card rounded-2xl mb-4">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Upload product images (up to 5)</p>
                <p className="text-xs text-muted-foreground mt-1">Click to browse</p>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <label
                      htmlFor="image-upload"
                      className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">Add more</p>
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {imagePreviews.length}/5 images • First image will be the main photo
                </p>
              </div>
            )}
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
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select campus location" />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  <SelectItem value="George Vari Engineering and Computing Centre (ENG)">George Vari Engineering and Computing Centre (ENG)</SelectItem>
                  <SelectItem value="Daphne Cockwell Health Sciences Complex (DCC)">Daphne Cockwell Health Sciences Complex (DCC)</SelectItem>
                  <SelectItem value="Kerr Hall">Kerr Hall</SelectItem>
                  <SelectItem value="Student Learning Centre (SLC)">Student Learning Centre (SLC)</SelectItem>
                  <SelectItem value="Library Building (LIB)">Library Building (LIB)</SelectItem>
                  <SelectItem value="Centre for Urban Innovation (CUI)">Centre for Urban Innovation (CUI)</SelectItem>
                  <SelectItem value="Jorgenson Hall">Jorgenson Hall</SelectItem>
                  <SelectItem value="International Living/Learning Centre (ILC)">International Living/Learning Centre (ILC)</SelectItem>
                  <SelectItem value="Ted Rogers School Of Management">Ted Rogers School Of Management</SelectItem>
                  <SelectItem value="Architecture Building (ARC)">Architecture Building (ARC)</SelectItem>
                  <SelectItem value="The Chang School of continuing education">The Chang School of continuing education</SelectItem>
                  <SelectItem value="Mattamy Athletic Centre">Mattamy Athletic Centre</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={createProduct.isPending || uploadingImages}
            >
              {uploadingImages ? "Uploading images..." : createProduct.isPending ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
};

export default Sell;
