import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Product } from "@/hooks/useProducts";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useIsFavorite, useToggleFavorite } from "@/hooks/useFavorites";

interface ProductCardProps {
  product: Product;
  showFeatured?: boolean;
}

const ProductCard = ({ product, showFeatured = true }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isFavorite = false } = useIsFavorite(product.id, user?.id);
  const toggleFavorite = useToggleFavorite();
  
  const imageUrl = product.image_urls?.[0] || "/placeholder.svg";
  const formattedDate = format(new Date(product.created_at), "MMM dd");

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/auth?redirect=" + window.location.pathname);
      return;
    }

    toggleFavorite.mutate({
      productId: product.id,
      userId: user.id,
      isFavorite,
    });
  };
  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-video bg-muted overflow-hidden">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          {showFeatured && product.featured && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-semibold shadow-md">
              Featured
            </Badge>
          )}
          <button 
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background transition-all hover:scale-110"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-foreground"}`} />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{product.title}</h3>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-muted-foreground capitalize font-medium">{product.condition.replace(/_/g, ' ')}</p>
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
  );
};

export default ProductCard;
