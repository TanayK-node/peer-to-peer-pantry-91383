import { ArrowLeft, Search, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";

const chatData = [
  {
    id: 1,
    name: "Robert Paul",
    message: "Can we meet today at building 28?",
    time: "Today 12:30 PM",
    avatar: "/placeholder.svg",
    category: "Books",
    unread: true,
  },
  {
    id: 2,
    name: "Robert Paul",
    message: "Can we meet today at building 28?",
    time: "Today 12:30 PM",
    avatar: "/placeholder.svg",
    category: "Books",
    unread: true,
  },
  {
    id: 3,
    name: "Robert Paul",
    message: "Can we meet today at building 28?",
    time: "Today 12:30 PM",
    avatar: "/placeholder.svg",
    category: "Books",
    unread: true,
  },
];

const Chats = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Chats</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-full">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-muted rounded-full">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", "Unread", "Important", "Selling Fast", "Popular"].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === "All"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto">
        {/* Chat List */}
        <div className="divide-y divide-border">
          {chatData.map((chat) => (
            <div
              key={chat.id}
              className="px-4 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full bg-primary/10 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-sm">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">✓</span>
                    <p className="text-sm text-muted-foreground truncate">{chat.message}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Category: {chat.category}
                  </Badge>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {chat.unread && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                  <button className="p-1 hover:bg-muted rounded">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Context Menu Options (shown on long press/right click) */}
        <div className="hidden">
          <button className="block w-full px-4 py-3 text-left hover:bg-muted">
            Mark as Read
          </button>
          <button className="block w-full px-4 py-3 text-left hover:bg-muted">
            Delete
          </button>
          <button className="block w-full px-4 py-3 text-left hover:bg-muted">
            Mark Important
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Chats;
