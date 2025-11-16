import { Search, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useSearchProducts, SearchFilters } from "@/hooks/useSearchProducts";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";
const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const {
    data: categories = []
  } = useCategories();
  const filters: SearchFilters = categoryId ? {
    categoryId
  } : {};
  const hasFilters = !!categoryId;

  // Use different hooks based on whether filters are active
  const {
    data: allProducts = [],
    isLoading: isLoadingAll
  } = useProducts();
  const {
    data: filteredProducts = [],
    isLoading: isLoadingFiltered
  } = useSearchProducts("", filters);
  const products = hasFilters ? filteredProducts : allProducts;
  const isLoading = hasFilters ? isLoadingFiltered : isLoadingAll;
  const selectedCategory = categories.find(cat => cat.id === categoryId);
  const removeFilter = () => {
    setSearchParams({});
  };
  return <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 px-4 py-4 shadow-sm">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2 group">
              
              <h1 className="font-bold text-2xl text-left text-blue-800 mx-0 px-0">CampusTrades</h1>
            </Link>
            <ThemeToggle />
          </div>
          
          {/* Search Bar */}
          <Link to="/search" className="block">
            <div className="flex items-center gap-3 bg-muted hover:bg-muted/80 px-4 py-3 rounded-xl transition-colors border border-border/50">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input type="text" placeholder="Search books, electronics, or tickets..." className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" readOnly />
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-4">
        {/* Filters */}
        {selectedCategory && <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Badge variant="secondary" className="px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
              {selectedCategory.icon} {selectedCategory.name}
              <button onClick={removeFilter} className="hover:bg-background/20 rounded-full p-0.5 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          </div>}

        {/* Products Grid */}
        {isLoading ? <div className="text-center py-16 text-muted-foreground">Loading products...</div> : products.length === 0 ? <div className="text-center py-16">
            <p className="text-muted-foreground mb-2">No products found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(product => <ProductCard key={product.id} product={product} />)}
          </div>}
      </main>

      <BottomNav />
    </div>;
};
export default Listings;