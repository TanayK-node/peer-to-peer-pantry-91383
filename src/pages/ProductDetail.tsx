import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { useProduct } from "@/hooks/useProducts";
import { format } from "date-fns";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id || "");

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
            <button className="p-2 hover:bg-muted rounded-full">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-muted rounded-full">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto">
        {/* Image Section */}
        <div className="relative aspect-video bg-muted">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.featured && (
            <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}
          {product.image_urls.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
              {product.image_urls.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === 0 ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="px-4 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
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
            <div className="col-span-2">
              <p className="text-muted-foreground mb-1">Meetup Preference</p>
              <p className="font-medium">{product.condition}</p>
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
                  <button className="text-xs text-primary font-medium">View Profile</button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(Math.round(seller.rating || 0))].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
            </div>
          )}

          {/* AD ID */}
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">AD ID: {product.id.slice(0, 8).toUpperCase()}</p>
            <button className="text-primary font-medium">Report AD</button>
          </div>

          {/* Send Message Button */}
          <Button className="w-full h-12 text-base">Send Message</Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProductDetail;
