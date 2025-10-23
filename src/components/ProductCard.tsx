import { Product } from "@/types/product";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";

interface ProductCardProps {
  product: Product;
  showFeatured?: boolean;
}

const ProductCard = ({ product, showFeatured = true }: ProductCardProps) => {
  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-video bg-muted">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {showFeatured && product.featured && (
            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}
          <button className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
            <Heart className="h-4 w-4" />
          </button>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-foreground mb-1">{product.title}</h3>
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-muted-foreground">{product.condition}</p>
            <p className="text-xs text-muted-foreground">{product.postedDate}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{product.location}</p>
            <p className="text-lg font-bold text-foreground">
              $ {product.price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
