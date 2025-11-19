import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Product } from "@/hooks/useProducts";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useIsFavorite, useToggleFavorite } from "@/hooks/useFavorites";
import { useState } from "react";
import LoginPromptDialog from "./LoginPromptDialog";

interface ProductCardProps {
  product: Product;
  showFeatured?: boolean;
}

const ProductCard = ({ product, showFeatured = true }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isFavorite = false } = useIsFavorite(product.id, user?.id);
  const toggleFavorite = useToggleFavorite();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const imageUrl = product.image_urls?.[0] || "/placeholder.svg";
  const formattedDate = format(new Date(product.created_at), "MMM dd");

  const handleCardClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowLoginPrompt(true);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    toggleFavorite.mutate({
      productId: product.id,
      userId: user.id,
      isFavorite,
    });
  };

  return (
    <>
      <LoginPromptDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />
      <Link to={`/product/${product.id}`} onClick={handleCardClick} className="block group">
      <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
        <div className="relative aspect-video bg-gradient-subtle overflow-hidden">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
          {showFeatured && product.featured && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-semibold shadow-md">
              Featured
            </Badge>
          )}
          <button 
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2.5 bg-background/95 backdrop-blur-md rounded-full hover:bg-background transition-all duration-200 hover:scale-110 shadow-soft active:scale-95"
          >
            <Heart className={`h-4 w-4 transition-all ${isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-foreground"}`} />
          </button>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-foreground mb-3 line-clamp-1 text-base">{product.title}</h3>
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-muted-foreground capitalize font-medium bg-muted px-3 py-1 rounded-full">{product.condition.replace(/_/g, ' ')}</p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground line-clamp-1">{product.location || "Location not set"}</p>
            <p className="text-xl font-bold text-primary">
              ${Number(product.price).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
    </>
  );
};

export default ProductCard;
