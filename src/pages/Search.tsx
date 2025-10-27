import { X, Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { useCategories } from "@/hooks/useCategories";
import { useSearchProducts } from "@/hooks/useSearchProducts";

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const { data: categories = [], isLoading } = useCategories();
  const { data: searchResults = [], isLoading: isSearching } = useSearchProducts(searchQuery, selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <X className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Search</h1>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Search Input */}
        <div className="mb-6 relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search books, electronics, or tickets..."
            className="w-full pl-12 pr-4 py-3 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Search Results */}
        {searchQuery && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-primary mb-4">
              Search Results {searchResults.length > 0 && `(${searchResults.length})`}
            </h2>
            {isSearching ? (
              <div className="text-center py-8 text-muted-foreground">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No products found for "{searchQuery}"
              </div>
            )}
          </section>
        )}

        {/* Search with Category */}
        {!searchQuery && (
          <section>
            <h2 className="text-base font-semibold text-primary mb-4">
              Search with Category
            </h2>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading categories...</div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSearchQuery(" ");
                    }}
                  >
                    <CategoryCard category={category} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Search;
