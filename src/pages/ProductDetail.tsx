import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Star, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { useProduct } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { useIsFavorite, useToggleFavorite } from "@/hooks/useFavorites";
import { useCreateConversation } from "@/hooks/useCreateConversation";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import ProductCard from "@/components/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { data: product, isLoading } = useProduct(id || "");
  const { data: isFavorite = false } = useIsFavorite(id || "", user?.id);
  const toggleFavorite = useToggleFavorite();
  const createConversation = useCreateConversation();
  const { data: sellerProducts = [] } = useSellerProducts(product?.seller_id, id);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: url,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Product link has been copied to clipboard",
      });
    }
  };

  const handleFavorite = () => {
    if (!user) {
      navigate("/auth?redirect=" + window.location.pathname);
      return;
    }

    toggleFavorite.mutate({
      productId: id || "",
      userId: user.id,
      isFavorite,
    });
  };

  const handleContact = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact the seller",
      });
      navigate("/auth?redirect=" + window.location.pathname);
      return;
    }

    if (user.id === product?.seller_id) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot start a conversation with yourself",
      });
      return;
    }

    try {
      const conversationId = await createConversation.mutateAsync({
        productId: id || "",
        sellerId: product?.seller_id || "",
      });
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const imageUrl = product.image_urls?.[0] || "/placeholder.svg";
  const formattedDate = format(new Date(product.created_at), "MMM dd");
  const seller = product.profiles;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Post Name</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="p-2 hover:bg-muted rounded-full"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button 
              onClick={handleFavorite}
              className="p-2 hover:bg-muted rounded-full"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto lg:flex lg:gap-6 lg:px-4 lg:py-6">
        {/* Image Section */}
        <div className="lg:flex-1 lg:sticky lg:top-20 lg:self-start">
          <Carousel className="w-full">
            <CarouselContent>
              {product.image_urls.map((url, index) => (
                <CarouselItem key={index}>
                  <div 
                    className="relative aspect-video bg-muted cursor-pointer"
                    onClick={() => setSelectedImage(url)}
                  >
                    <img
                      src={url}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                    {product.featured && index === 0 && (
                      <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                        Featured
                      </Badge>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {product.image_urls.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        </div>

        {/* Image Zoom Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <img 
              src={selectedImage} 
              alt={product.title}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Details Section */}
        <div className="px-4 py-6 space-y-4 lg:flex-1 lg:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Title</p>
              <p className="font-medium">{product.title}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Price</p>
              <p className="font-medium">${product.price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Description</p>
              <p className="font-medium">{product.description}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Condition</p>
              <p className="font-medium">{product.condition}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-muted-foreground mb-1">Meetup Location</p>
              <p className="font-medium">{product.location || "Not specified"}</p>
            </div>
          </div>

          {/* Seller Info */}
          {seller && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={seller.avatar_url || "/placeholder.svg"}
                  alt={seller.full_name}
                  className="w-12 h-12 rounded-full bg-primary/10"
                />
                <div>
                  <p className="font-semibold text-sm">Posted by: {seller.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Posted on: {formattedDate}
                  </p>
                  <button 
                    onClick={() => navigate(`/profile/${seller.id}`)}
                    className="text-xs text-primary font-medium"
                  >
                    View Profile
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(Math.round(seller.rating || 0))].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
            </div>
          )}

          {/* Send Message Button */}
          <Button
            className="w-full h-12 text-base"
            onClick={handleContact}
            disabled={createConversation.isPending}
          >
            {createConversation.isPending ? "Starting conversation..." : "Send Message"}
          </Button>
        </div>
      </main>

      {/* Other Listings by This Seller */}
      {sellerProducts.length > 0 && (
        <section className="max-w-screen-xl mx-auto px-4 py-8 border-t border-border">
          <h2 className="text-xl font-bold mb-4">More from {seller?.full_name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sellerProducts.map((sellerProduct) => (
              <ProductCard key={sellerProduct.id} product={sellerProduct} />
            ))}
          </div>
        </section>
      )}

      <BottomNav />
    </div>
  );
};

export default ProductDetail;
