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
import { useAuthStore } from "@/shared/store/authStore";
import { Loader2, UserPlus } from "lucide-react";

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
  const { user } = useAuthStore();
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
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center text-white shadow-lg shadow-[#FF7B21]/30">
              <UserPlus className="h-4 w-4" />
            </div>
            Invite Staff / Mời nhân viên
          </DialogTitle>
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
              className="bg-background/80 backdrop-blur-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role / Vai trò</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Staff">Staff / Nhân viên</SelectItem>
                {user?.role === "StoreOwner" && (
                  <SelectItem value="Manager">Manager / Quản lý</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Đang gửi..." : "Gửi lời mời"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteStaffModal;
