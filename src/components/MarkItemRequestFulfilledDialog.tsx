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

interface MarkItemRequestFulfilledDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemRequestId: string;
  onSuccess: () => void;
}

export const MarkItemRequestFulfilledDialog = ({
  isOpen,
  onClose,
  itemRequestId,
  onSuccess,
}: MarkItemRequestFulfilledDialogProps) => {
  const [purchaserCode, setPurchaserCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!purchaserCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the purchaser's ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Find purchaser by unique code
      const { data: purchaser, error: purchaserError } = await supabase
        .from("profiles")
        .select("id")
        .eq("unique_code", purchaserCode.toUpperCase())
        .single();

      if (purchaserError || !purchaser) {
        toast({
          title: "Error",
          description: "Purchaser ID not found. Please check and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update item request with fulfiller_id and status
      const { error: updateError } = await supabase
        .from("item_requests")
        .update({
          status: "fulfilled",
          fulfiller_id: user.id,
        })
        .eq("id", itemRequestId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Item request marked as fulfilled successfully!",
      });

      setPurchaserCode("");
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
          <DialogTitle>Mark as Fulfilled</DialogTitle>
          <DialogDescription>
            Enter the purchaser's 5-digit alphanumeric ID to mark this item request as fulfilled.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="purchaserCode">Purchaser's ID</Label>
            <Input
              id="purchaserCode"
              placeholder="e.g., A1B2C"
              value={purchaserCode}
              onChange={(e) => setPurchaserCode(e.target.value.toUpperCase())}
              maxLength={5}
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              The purchaser can find their ID in their account settings
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Processing..." : "Mark as Fulfilled"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
