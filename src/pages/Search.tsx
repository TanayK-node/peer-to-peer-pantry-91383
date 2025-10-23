import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "@/components/CategoryCard";
import { categories } from "@/data/mockData";

const recentSearches = ["Original text book", "Jeans"];

const Search = () => {
  const navigate = useNavigate();

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
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search books, electronics, or tickets..."
            className="w-full px-4 py-3 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>

        {/* Last Search */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-primary">Last search</h2>
            <button className="text-sm text-destructive">Clear all</button>
          </div>
          <div className="space-y-3">
            {recentSearches.map((search, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                  <span className="text-sm">{search}</span>
                </div>
                <button className="p-1">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Search with Category */}
        <section>
          <h2 className="text-base font-semibold text-primary mb-4">
            Search with Category
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Search;
