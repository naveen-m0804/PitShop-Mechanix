import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { vehicleType: 'TWO_WHEELER' | 'FOUR_WHEELER'; problemDescription: string }) => void;
  mechanicName?: string;
  isSubmitting?: boolean;
  shopTypes?: string[];
}

const RequestDialog: React.FC<RequestDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mechanicName,
  isSubmitting = false,
  shopTypes,
}) => {
  const [vehicleType, setVehicleType] = useState<'TWO_WHEELER' | 'FOUR_WHEELER'>('FOUR_WHEELER');
  const [problemDescription, setProblemDescription] = useState('');

  React.useEffect(() => {
    if (isOpen) {
        if (shopTypes && shopTypes.length === 1) {
            setVehicleType(shopTypes[0] as 'TWO_WHEELER' | 'FOUR_WHEELER');
        } else if (shopTypes && shopTypes.length > 0 && !shopTypes.includes(vehicleType)) {
            setVehicleType(shopTypes[0] as 'TWO_WHEELER' | 'FOUR_WHEELER');
        } else {
             // Reset to default if opening fresh or fallback
             // But valid only if shopTypes is undefined (all) or includes FOUR_WHEELER
             if (!shopTypes || shopTypes.includes('FOUR_WHEELER')) {
                 setVehicleType('FOUR_WHEELER');
             } else {
                 setVehicleType('TWO_WHEELER');
             }
        }
    }
  }, [isOpen, shopTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ vehicleType, problemDescription });
  };
  
  const showTwoWheeler = !shopTypes || shopTypes.includes('TWO_WHEELER');
  const showFourWheeler = !shopTypes || shopTypes.includes('FOUR_WHEELER');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-card border-none text-foreground">
        <DialogHeader>
          <DialogTitle>Request Service</DialogTitle>
          <DialogDescription>
            {mechanicName 
              ? `Send a request to ${mechanicName}.` 
              : "Send a request to nearby mechanics."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            {shopTypes && shopTypes.length === 1 ? (
                 <div className="p-3 bg-secondary/20 rounded-md border border-white/10 text-sm font-medium">
                    {shopTypes[0].replace('_', ' ')} Only
                 </div>
            ) : (
                <Select 
                value={vehicleType} 
                onValueChange={(value) => setVehicleType(value as any)}
                >
                <SelectTrigger id="vehicleType" className="input-glass">
                    <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    {showTwoWheeler && <SelectItem value="TWO_WHEELER">Two Wheeler</SelectItem>}
                    {showFourWheeler && <SelectItem value="FOUR_WHEELER">Four Wheeler</SelectItem>}
                </SelectContent>
                </Select>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="problem">Problem Description (Optional)</Label>
            <Textarea
              id="problem"
              placeholder="E.g., Flat tire, Engine overheating..."
              className="input-glass max-h-[100px]"
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-bg border-none" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDialog;
