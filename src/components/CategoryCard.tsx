import { Category } from "@/hooks/useCategories";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link to={`/listings?category=${category.id}`} className="flex flex-col items-center gap-3 group">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center hover:from-primary/20 hover:to-accent/20 transition-all duration-300 border-2 border-border/50 group-hover:border-primary/40 group-hover:scale-105 group-hover:-translate-y-1 shadow-soft group-hover:shadow-glow">
        <span className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">{category.icon}</span>
      </div>
      <span className="text-sm font-semibold text-center text-foreground group-hover:text-primary transition-colors">{category.name}</span>
    </Link>
  );
};

export default CategoryCard;
