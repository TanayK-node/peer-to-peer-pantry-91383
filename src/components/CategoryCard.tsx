import { Category } from "@/hooks/useCategories";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link to={`/listings?category=${category.id}`} className="flex flex-col items-center gap-3 group">
      <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center hover:from-primary/20 hover:to-primary/10 transition-all duration-300 border border-border/50 group-hover:border-primary/30 group-hover:scale-105 shadow-sm group-hover:shadow-md">
        <span className="text-4xl transition-transform group-hover:scale-110">{category.icon}</span>
      </div>
      <span className="text-sm font-semibold text-center text-foreground group-hover:text-primary transition-colors">{category.name}</span>
    </Link>
  );
};

export default CategoryCard;
