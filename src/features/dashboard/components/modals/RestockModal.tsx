import { useState } from "react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { WowDialogInner } from "@/shared/components/ui/wow-dialog-inner";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["inventory", "common"]);
  const [operation, setOperation] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!quantity || parseInt(quantity) <= 0) {
      toast.error(t("inventory:restockModal.toast.invalidQuantity"));
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

      toast.success(
        t("inventory:restockModal.toast.success", {
          operation: operation === "in" ? t("inventory:restockModal.operations.in") : t("inventory:restockModal.operations.out"),
          quantity,
          name: product.name,
        }),
      );

      setIsSubmitting(false);
      setQuantity("");
      setReason("");
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 gap-0">
        <WowDialogInner>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {operation === "in" ? (
              <>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                  <ArrowDownToLine className="h-4 w-4" />
                </div>
                Stock In / Nhập kho
              </>
            ) : (
              <>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                  <ArrowUpFromLine className="h-4 w-4" />
                </div>
                {t("inventory:restockModal.title.out")}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {t("inventory:restockModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <motion.div
            className="flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-r from-[#FF7B21]/5 to-[#19D6C8]/5 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-4xl">{product.image}</span>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {t("inventory:restockModal.currentStock")}:{" "}
                <span className="font-bold text-[#FF7B21]">{product.stock}</span>
              </p>
            </div>
          </motion.div>

          <div className="space-y-2">
            <Label>{t("inventory:restockModal.fields.operationType")}</Label>
            <RadioGroup
              value={operation}
              onValueChange={(val) => setOperation(val as "in" | "out")}
            >
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="in" id="in" />
                <Label htmlFor="in" className="font-normal cursor-pointer flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4 text-emerald-500" />
                  {t("inventory:restockModal.title.in")}
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="out" id="out" />
                <Label htmlFor="out" className="font-normal cursor-pointer flex items-center gap-2">
                  <ArrowUpFromLine className="h-4 w-4 text-orange-500" />
                  {t("inventory:restockModal.title.out")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {t("inventory:restockModal.fields.quantity")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder={t("inventory:restockModal.placeholders.quantity")}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-background/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t("inventory:restockModal.fields.reason")}</Label>
            <Input
              id="reason"
              placeholder={t("inventory:restockModal.placeholders.reason")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-background/80 backdrop-blur-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("common:actions.cancel")}
          </Button>
          <Button
            className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? t("inventory:restockModal.actions.submitting") : t("common:actions.confirm")}
          </Button>
        </DialogFooter>
        </WowDialogInner>
      </DialogContent>
    </Dialog>
  );
};

export default RestockModal;
