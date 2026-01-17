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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RestockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    name: string;
    image: string;
    stock: number;
  };
}

const RestockModal = ({ open, onOpenChange, product }: RestockModalProps) => {
  const [operation, setOperation] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!quantity || parseInt(quantity) <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      console.log("Restock operation:", {
        product: product.name,
        operation,
        quantity: parseInt(quantity),
        reason,
      });

      alert(
        `Đã ${operation === "in" ? "nhập" : "xuất"} ${quantity} ${
          product.name
        } thành công!`
      );

      setIsSubmitting(false);
      setQuantity("");
      setReason("");
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {operation === "in"
              ? "Stock In / Nhập kho"
              : "Stock Out / Xuất kho"}
          </DialogTitle>
          <DialogDescription>
            Cập nhật số lượng tồn kho cho sản phẩm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
            <span className="text-4xl">{product.image}</span>
            <div className="flex-1">
              <p className="font-semibold text-stone-900">{product.name}</p>
              <p className="text-sm text-stone-600">
                Tồn kho hiện tại:{" "}
                <span className="font-bold">{product.stock}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Operation Type / Loại thao tác</Label>
            <RadioGroup
              value={operation}
              onValueChange={(val) => setOperation(val as "in" | "out")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in" id="in" />
                <Label htmlFor="in" className="font-normal cursor-pointer">
                  Stock In / Nhập kho
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="out" id="out" />
                <Label htmlFor="out" className="font-normal cursor-pointer">
                  Stock Out / Xuất kho
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity / Số lượng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Nhập số lượng..."
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason / Lý do</Label>
            <Input
              id="reason"
              placeholder="Nhà cung cấp hoặc lý do..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel / Hủy
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Confirm / Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RestockModal;
