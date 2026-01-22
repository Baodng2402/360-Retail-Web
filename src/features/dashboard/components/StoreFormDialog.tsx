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

interface StoreFormData {
  storeName: string;
  address: string;
  phone: string;
  isActive: boolean;
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
              <Label htmlFor="store-address">Địa chỉ</Label>
              <Input
                id="store-address"
                value={formData.address}
                onChange={(e) =>
                  onFormChange({ ...formData, address: e.target.value })
                }
                placeholder="Ví dụ: S5.03"
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
