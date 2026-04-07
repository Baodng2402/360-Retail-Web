import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Loader2 } from "lucide-react";
// Lưu ý: map preview có thể gây lỗi hiển thị trong Dialog trên một số trình duyệt,
// nên modal tạo cửa hàng chỉ dùng input địa chỉ + toạ độ đơn giản.
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import type { Plan } from "@/shared/types/subscription";
import { useTranslation } from "react-i18next";

interface StoreFormData {
  storeName: string;
  address: string;
  phone: string;
  isActive: boolean;
  planId: string;
}

interface StoreFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: StoreFormData;
  onFormChange: (data: StoreFormData) => void;
  onSave: () => void;
  isSaving: boolean;
  mandatory?: boolean;
}

export const StoreFormDialog = ({
  open,
  onOpenChange,
  isEditing,
  formData,
  onFormChange,
  onSave,
  isSaving,
  mandatory = false,
}: StoreFormDialogProps) => {
  const { t, i18n } = useTranslation(["store", "common"]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || isEditing) return;
    let cancelled = false;
    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        setPlansError(null);
        const res = await subscriptionApi.getPlans();
        if (!cancelled) {
          setPlans(res);
        }
      } catch (err) {
        console.error("Failed to load subscription plans for store dialog:", err);
        if (!cancelled) {
          setPlansError(t("store:formDialog.planLoadError"));
        }
      } finally {
        if (!cancelled) {
          setPlansLoading(false);
        }
      }
    };
    void loadPlans();
    return () => {
      cancelled = true;
    };
  }, [open, isEditing, t]);

  return (
    <Dialog open={open} onOpenChange={mandatory ? () => {} : onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => mandatory && e.preventDefault()}
        onEscapeKeyDown={(e) => mandatory && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {mandatory
              ? t("store:formDialog.titles.mandatory")
              : isEditing
                ? t("store:formDialog.titles.edit")
                : t("store:formDialog.titles.create")}
          </DialogTitle>
          <DialogDescription>
            {mandatory
              ? t("store:formDialog.descriptions.mandatory")
              : t("store:formDialog.descriptions.default")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">{t("store:formDialog.fields.storeName")} *</Label>
              <Input
                id="store-name"
                value={formData.storeName}
                onChange={(e) =>
                  onFormChange({ ...formData, storeName: e.target.value })
                }
                placeholder={t("store:formDialog.placeholders.storeName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-address">{t("store:formDialog.fields.address")}</Label>
              <Input
                id="store-address"
                value={formData.address}
                onChange={(e) =>
                  onFormChange({ ...formData, address: e.target.value })
                }
                placeholder={t("store:formDialog.placeholders.address")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-phone">{t("store:formDialog.fields.phone")}</Label>
              <Input
                id="store-phone"
                value={formData.phone}
                onChange={(e) =>
                  onFormChange({ ...formData, phone: e.target.value })
                }
                placeholder={t("store:formDialog.placeholders.phone")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-status">{t("store:formDialog.fields.status")}</Label>
              <Select
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  onFormChange({ ...formData, isActive: value === "active" })
                }
              >
                <SelectTrigger id="store-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("store:management.status.active")}</SelectItem>
                  <SelectItem value="inactive">{t("store:management.status.inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="store-plan">{t("store:formDialog.fields.plan")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("store:formDialog.planHint")}
                </p>
                {plansLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>{t("store:formDialog.planLoading")}</span>
                  </div>
                ) : plans.length > 0 ? (
                  <Select
                    value={formData.planId || ""}
                    onValueChange={(value) =>
                      onFormChange({ ...formData, planId: value })
                    }
                  >
                    <SelectTrigger id="store-plan">
                      <SelectValue placeholder={t("store:formDialog.placeholders.plan")} />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.planName}{" "}
                          {typeof plan.price === "number"
                            ? t("store:formDialog.planPrice", {
                                price: plan.price.toLocaleString(i18n.language),
                                days: plan.durationDays || 30,
                              })
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <>
                    <Input
                      id="store-plan"
                      placeholder={t("store:formDialog.placeholders.planManual")}
                      value={formData.planId}
                      onChange={(e) =>
                        onFormChange({ ...formData, planId: e.target.value })
                      }
                    />
                    {plansError && (
                      <p className="text-[11px] text-red-500">{plansError}</p>
                    )}
                  </>
                )}
              </div>
            )}

          </div>
        </div>

        <DialogFooter>
          {!mandatory && (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t("common:actions.cancel")}
            </Button>
          )}
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("common:states.saving")}
              </>
            ) : isEditing ? (
              t("common:actions.saveChanges")
            ) : (
              t("common:actions.create")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
