import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { staffApi } from "@/shared/lib/staffApi";
import { useStoreStore } from "@/shared/store/storeStore";

interface InviteStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const InviteStaffModal = ({
  open,
  onOpenChange,
  onSuccess,
}: InviteStaffModalProps) => {
  const { currentStore } = useStoreStore();
  const storeId = currentStore?.id ?? undefined;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Staff");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }
    if (!storeId) {
      toast.error("Không tìm thấy cửa hàng. Vui lòng chọn cửa hàng trước.");
      return;
    }
    setIsSubmitting(true);
    try {
      await staffApi.inviteStaff({ email: email.trim(), storeId, role });
      toast.success("Đã gửi lời mời thành công!");
      setEmail("");
      setRole("Staff");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Invite failed:", err);
      toast.error("Không thể gửi lời mời. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Staff / Mời nhân viên</DialogTitle>
          <DialogDescription>
            Gửi email mời nhân viên tham gia cửa hàng
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="staff@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role / Vai trò</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Staff">Staff / Nhân viên</SelectItem>
                <SelectItem value="Manager">Manager / Quản lý</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi lời mời"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteStaffModal;
