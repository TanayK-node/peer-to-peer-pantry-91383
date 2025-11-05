import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MarkAsSoldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onSuccess: () => void;
}

export const MarkAsSoldDialog = ({
  isOpen,
  onClose,
  productId,
  onSuccess,
}: MarkAsSoldDialogProps) => {
  const [buyerCode, setBuyerCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!buyerCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the buyer's ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Find buyer by unique code
      const { data: buyer, error: buyerError } = await supabase
        .from("profiles")
        .select("id")
        .eq("unique_code", buyerCode.toUpperCase())
        .single();

      if (buyerError || !buyer) {
        toast({
          title: "Error",
          description: "Buyer ID not found. Please check and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Update product with buyer_id and status
      const { error: updateError } = await supabase
        .from("products")
        .update({
          status: "sold",
          buyer_id: buyer.id,
        })
        .eq("id", productId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Product marked as sold successfully!",
      });

      setBuyerCode("");
      onClose();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Sold</DialogTitle>
          <DialogDescription>
            Enter the buyer's 5-digit alphanumeric ID to mark this product as sold.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="buyerCode">Buyer's ID</Label>
            <Input
              id="buyerCode"
              placeholder="e.g., A1B2C"
              value={buyerCode}
              onChange={(e) => setBuyerCode(e.target.value.toUpperCase())}
              maxLength={5}
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              The buyer can find their ID in their account settings
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Processing..." : "Mark as Sold"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
