import { useState, useEffect } from "react";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  price: z.number().min(0, "Price must be positive"),
  condition: z.enum(["new", "like_new", "good", "fair", "poor"]),
  category_id: z.string().uuid("Please select a category"),
  location: z.string().min(1, "Please select a location"),
});

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    description: "",
    price: "",
    condition: "good" as "new" | "like_new" | "good" | "fair" | "poor",
    location: "",
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch product data
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Populate form when product data is loaded
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        category_id: product.category_id || "",
        description: product.description,
        price: product.price.toString(),
        condition: product.condition,
        location: product.location || "",
      });
      setExistingImages(product.image_urls || []);
    }
  }, [product]);

  // Check if current user owns this product
  useEffect(() => {
    if (product && user && product.seller_id !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You can only edit your own products",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [product, user, navigate, toast]);

  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (existingImages.length + newImages.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images",
        variant: "destructive",
      });
      return;
    }

    setNewImages([...newImages, ...files]);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const uploadNewImages = async (): Promise<string[]> => {
    if (newImages.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const image of newImages) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
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

    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
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

      setIsSubmitting(true);

      const newImageUrls = await uploadNewImages();
      const allImageUrls = [...existingImages, ...newImageUrls];

      const { error } = await supabase
        .from("products")
        .update({
          title: validated.title,
          description: validated.description,
          price: validated.price,
          condition: validated.condition,
          category_id: validated.category_id,
          location: validated.location,
          image_urls: allImageUrls,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["userProducts"] });

      navigate(`/product/${id}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Error",
          description: "Failed to update product",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const allPreviews = [...existingImages, ...newImagePreviews];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Edit Listing</h1>
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
              onChange={handleNewImageSelect}
              className="hidden"
            />
            
            {allPreviews.length === 0 ? (
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
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className="relative aspect-square">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
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
                  {newImagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {allPreviews.length < 5 && (
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
                  {allPreviews.length}/5 images • First image will be the main photo
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
              disabled={isSubmitting || uploadingImages}
            >
              {uploadingImages ? "Uploading images..." : isSubmitting ? "Updating..." : "Update Listing"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProduct;
