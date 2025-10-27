import { useEffect, useState } from "react";
import { MapPin, Search, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useSearchProducts } from "@/hooks/useSearchProducts";
import { useCategories } from "@/hooks/useCategories";

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const { data: categories = [] } = useCategories();
  const { data: products = [], isLoading } = useSearchProducts("", categoryId || undefined);

  const selectedCategory = categories.find((cat) => cat.id === categoryId);

  const removeFilter = () => {
    setSearchParams({});
  };

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

      <main className="max-w-screen-xl mx-auto px-4 py-4">
        {/* Filters */}
        {selectedCategory && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge
              variant="secondary"
              className="px-3 py-2 rounded-full flex items-center gap-2"
            >
              {selectedCategory.icon} {selectedCategory.name}
              <button onClick={removeFilter}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No products found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Listings;
