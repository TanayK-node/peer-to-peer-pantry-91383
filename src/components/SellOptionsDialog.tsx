import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SellOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SellOptionsDialog = ({ open, onOpenChange }: SellOptionsDialogProps) => {
  const navigate = useNavigate();

  const handleSellItem = () => {
    onOpenChange(false);
    navigate("/sell");
  };

  const handleRequestItem = () => {
    onOpenChange(false);
    navigate("/request-item");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose an Option</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Button
            onClick={handleSellItem}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <Package className="h-6 w-6" />
            <span className="text-base font-semibold">Sell an Item</span>
          </Button>
          <Button
            onClick={handleRequestItem}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <FileText className="h-6 w-6" />
            <span className="text-base font-semibold">Request an Item</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellOptionsDialog;
