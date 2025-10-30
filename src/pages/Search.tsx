import { X, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { useCategories } from "@/hooks/useCategories";
import { useSearchProducts, SearchFilters } from "@/hooks/useSearchProducts";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data: categories = [], isLoading } = useCategories();
  const { data: searchResults = [], isLoading: isSearching } = useSearchProducts(searchQuery, filters);

  const handleApplyFilters = () => {
    setFilters({
      ...filters,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setMinPrice("");
    setMaxPrice("");
  };

  const activeFiltersCount = 
    (filters.categoryId ? 1 : 0) + 
    (filters.condition ? 1 : 0) + 
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0);

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
        {/* Search Input and Filter Button */}
        <div className="mb-6 flex gap-2">
          <div className="flex-1 relative">
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
          
          {/* Filter Button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-12 w-12 relative">
                <SlidersHorizontal className="h-5 w-5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-background z-50">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={filters.categoryId || "all"}
                    onValueChange={(value) => setFilters({ ...filters, categoryId: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>

                {/* Condition Filter */}
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select
                    value={filters.condition || "all"}
                    onValueChange={(value) => setFilters({ ...filters, condition: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="all">All Conditions</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                    Clear All
                  </Button>
                  <Button onClick={handleApplyFilters} className="flex-1">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search Results */}
        {(searchQuery.trim() || activeFiltersCount > 0) && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-primary mb-4">
              {searchQuery.trim() ? `Search Results ${searchResults.length > 0 ? `(${searchResults.length})` : ''}` : 'Filtered Results'}
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
                No products found{searchQuery.trim() ? ` for "${searchQuery}"` : ' with these filters'}
              </div>
            )}
          </section>
        )}

        {/* Search with Category */}
        {!searchQuery && !activeFiltersCount && (
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
                      setFilters({ ...filters, categoryId: category.id });
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
