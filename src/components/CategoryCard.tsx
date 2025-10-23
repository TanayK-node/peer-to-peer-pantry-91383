import { Category } from "@/types/product";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link to={`/listings?category=${category.id}`} className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
        <span className="text-3xl">{category.icon}</span>
      </div>
      <span className="text-xs font-medium text-center text-foreground">{category.name}</span>
    </Link>
  );
};

export default CategoryCard;
