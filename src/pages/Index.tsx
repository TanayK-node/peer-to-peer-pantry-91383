import { Search } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: recentlyViewed = [], isLoading: recentlyViewedLoading } = useProducts(3);
  const { data: newlyAdded = [], isLoading: newlyAddedLoading } = useProducts(4);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 px-4 py-4 shadow-sm">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                <span className="text-white text-2xl">📚</span>
              </div>
              <h1 className="text-2xl font-bold text-primary">CampusTrades</h1>
            </Link>
            <ThemeToggle />
          </div>
          
          {/* Search Bar */}
          <Link to="/search" className="block">
            <div className="flex items-center gap-3 bg-muted hover:bg-muted/80 px-4 py-3 rounded-xl transition-colors border border-border/50">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search books, electronics, or tickets..."
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                readOnly
              />
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Category Section */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-5">Categories</h2>
          {categoriesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </section>

        {/* Recently Viewed Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground">Recently Viewed</h2>
            <Link to="/listings" className="text-sm text-primary font-semibold hover:underline">
              View All
            </Link>
          </div>
          {recentlyViewedLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading products...</div>
          ) : recentlyViewed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No products yet</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyViewed.map((product) => (
                <ProductCard key={product.id} product={product} showFeatured={false} />
              ))}
            </div>
          )}
        </section>

        {/* Newly Added Section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground">Newly Added</h2>
            <Link to="/listings" className="text-sm text-primary font-semibold hover:underline">
              View All
            </Link>
          </div>
          {newlyAddedLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading products...</div>
          ) : newlyAdded.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No products yet</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newlyAdded.map((product) => (
                <ProductCard key={product.id} product={product} showFeatured={false} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
