import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ItemRequest } from "@/hooks/useItemRequests";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ItemRequestCardProps {
  request: ItemRequest;
}

const ItemRequestCard = ({ request }: ItemRequestCardProps) => {
  const navigate = useNavigate();
  
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "like_new":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "good":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "fair":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "poor":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatCondition = (condition: string) => {
    return condition
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card 
      className="p-4 transition-all duration-300 border cursor-pointer rounded-2xl bg-[#D8E1E6] border-[#BEB7AB]/20 hover:bg-[#E3EAF0] hover:shadow-md"
      onClick={() => navigate(`/item-request/${request.id}`)}
    >
      <div className="flex items-start gap-3">
        <div className="bg-white/60 p-3 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-[#404545]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#404545] mb-1 line-clamp-1">
            Looking for: {request.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-[#404545] bg-white/80 px-3 py-1 rounded-lg">
              ${request.price_quote}
            </span>
            <Badge className={getConditionColor(request.condition)}>
              {formatCondition(request.condition)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#8B877B]">
            <Avatar className="h-6 w-6">
              <AvatarImage src={request.profiles?.avatar_url || ""} />
              <AvatarFallback>
                {request.profiles?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span>{request.profiles?.full_name || "Anonymous"}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ItemRequestCard;
