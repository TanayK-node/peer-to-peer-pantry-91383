import { useItemRequests } from "@/hooks/useItemRequests";
import ItemRequestCard from "@/components/ItemRequestCard";
import BottomNav from "@/components/BottomNav";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const ItemRequests = () => {
  const { data: itemRequests = [], isLoading } = useItemRequests();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 px-4 py-4 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">Item Requests</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading requests...</div>
        ) : itemRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No item requests yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemRequests.map((request) => (
              <ItemRequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ItemRequests;
