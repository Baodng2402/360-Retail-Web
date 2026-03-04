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
          setPlansError("Không thể tải danh sách gói dịch vụ. Bạn vẫn có thể nhập planId thủ công nếu biết.");
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
  }, [open, isEditing]);

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
              ? "Tạo cửa hàng đầu tiên"
              : isEditing
                ? "Sửa cửa hàng"
                : "Thêm cửa hàng"}
          </DialogTitle>
          <DialogDescription>
            {mandatory
              ? "Bạn cần tạo ít nhất một cửa hàng để tiếp tục sử dụng hệ thống"
              : "Điền thông tin cửa hàng bên dưới"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Tên cửa hàng *</Label>
              <Input
                id="store-name"
                value={formData.storeName}
                onChange={(e) =>
                  onFormChange({ ...formData, storeName: e.target.value })
                }
                placeholder="Ví dụ: VIPP"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-address">Address / Địa chỉ</Label>
              <Input
                id="store-address"
                value={formData.address}
                onChange={(e) =>
                  onFormChange({ ...formData, address: e.target.value })
                }
                placeholder="Nhập địa chỉ cửa hàng..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-phone">Số điện thoại</Label>
              <Input
                id="store-phone"
                value={formData.phone}
                onChange={(e) =>
                  onFormChange({ ...formData, phone: e.target.value })
                }
                placeholder="Ví dụ: 0789357788"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-status">Trạng thái</Label>
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
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="store-plan">Gói dịch vụ (plan)</Label>
                <p className="text-xs text-muted-foreground">
                  Chọn gói subscription cho cửa hàng này. Mặc định nên chọn cùng gói với store hiện tại.
                </p>
                {plansLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Đang tải danh sách gói dịch vụ...</span>
                  </div>
                ) : plans.length > 0 ? (
                  <Select
                    value={formData.planId || ""}
                    onValueChange={(value) =>
                      onFormChange({ ...formData, planId: value })
                    }
                  >
                    <SelectTrigger id="store-plan">
                      <SelectValue placeholder="Chọn gói dịch vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.planName}{" "}
                          {typeof plan.price === "number"
                            ? `- ${plan.price.toLocaleString("vi-VN")}₫/${plan.durationDays || 30
                              } ngày`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <>
                    <Input
                      id="store-plan"
                      placeholder="Không tải được danh sách gói - nhập planId nếu biết"
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
              Hủy
            </Button>
          )}
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang xử lý...
              </>
            ) : isEditing ? (
              "Cập nhật"
            ) : (
              "Thêm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
