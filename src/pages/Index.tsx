import { MapPin, Search, ChevronDown } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";

const Index = () => {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: allProducts = [], isLoading: productsLoading } = useProducts(6);

  const recentlyViewed = allProducts.slice(0, 3);
  const newlyAdded = allProducts.slice(3, 6);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📚</span>
              </div>
              <h1 className="text-xl font-bold text-primary">CampusTrades</h1>
            </div>
            <button className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Location, xyz</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          
          {/* Search Bar */}
          <Link to="/search" className="block">
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
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
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Category</h2>
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
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Recently Viewed</h2>
            <Link to="/listings" className="text-sm text-primary font-medium">
              View All
            </Link>
          </div>
          {productsLoading ? (
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Newly Added</h2>
            <Link to="/listings" className="text-sm text-primary font-medium">
              View All
            </Link>
          </div>
          {productsLoading ? (
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
