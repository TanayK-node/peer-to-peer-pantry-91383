import { useState } from "react";
import { X, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePendingRatings } from "@/hooks/usePendingRatings";
import { useSubmitRating } from "@/hooks/useSubmitRating";

export const RatingPrompt = () => {
  const { data: pendingRatings = [], isLoading } = usePendingRatings();
  const { mutate: submitRating } = useSubmitRating();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || pendingRatings.length === 0 || dismissed) return null;

  const currentProduct = pendingRatings[currentIndex];
  const seller = currentProduct?.profiles;

  const handleSubmit = () => {
    if (selectedRating === 0) return;

    submitRating({
      productId: currentProduct.id,
      sellerId: currentProduct.seller_id,
      rating: selectedRating,
    });

    // Move to next product or dismiss if done
    if (currentIndex < pendingRatings.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedRating(0);
    } else {
      setDismissed(true);
    }
  };

  const handleSkip = () => {
    if (currentIndex < pendingRatings.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedRating(0);
    } else {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center">Rate Your Purchase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={seller?.avatar_url || ""} />
              <AvatarFallback>{seller?.full_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                You recently bought from
              </p>
              <p className="font-semibold text-lg">{seller?.full_name}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Product: {currentProduct.title}
            </p>
            <p className="text-sm text-center font-medium">
              Rate your experience (1-5 stars)
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || selectedRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSkip}
            >
              Skip
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={selectedRating === 0}
            >
              Submit Rating
            </Button>
          </div>

          {pendingRatings.length > 1 && (
            <p className="text-xs text-center text-muted-foreground">
              {currentIndex + 1} of {pendingRatings.length} pending ratings
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
