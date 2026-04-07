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
import { WowDialogInner } from "@/shared/components/ui/wow-dialog-inner";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["staff", "common"]);
  const { currentStore } = useStoreStore();
  const { user } = useAuthStore();
  const storeId = currentStore?.id ?? undefined;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Staff");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error(t("staff:inviteModal.toast.emailRequired"));
      return;
    }
    if (!storeId) {
      toast.error(t("staff:inviteModal.toast.storeRequired"));
      return;
    }
    setIsSubmitting(true);
    try {
      await staffApi.inviteStaff({ email: email.trim(), storeId, role });
      toast.success(t("staff:inviteModal.toast.success"));
      setEmail("");
      setRole("Staff");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Invite failed:", err);
      toast.error(t("staff:inviteModal.toast.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 gap-0">
        <WowDialogInner>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center text-white shadow-lg shadow-[#FF7B21]/30">
              <UserPlus className="h-4 w-4" />
            </div>
            {t("staff:inviteModal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("staff:inviteModal.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("staff:inviteModal.fields.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("staff:inviteModal.placeholders.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/80 backdrop-blur-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{t("staff:inviteModal.fields.role")}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Staff">{t("staff:inviteModal.roles.staff")}</SelectItem>
                {user?.role === "StoreOwner" && (
                  <SelectItem value="Manager">{t("staff:inviteModal.roles.manager")}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common:actions.cancel")}
          </Button>
          <Button
            className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? t("staff:inviteModal.actions.submitting") : t("staff:inviteModal.actions.submit")}
          </Button>
        </DialogFooter>
        </WowDialogInner>
      </DialogContent>
    </Dialog>
  );
};

export default InviteStaffModal;
