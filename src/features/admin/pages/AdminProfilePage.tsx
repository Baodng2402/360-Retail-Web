import { useState } from "react";
import { motion } from "motion/react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "@/shared/store/authStore";
import { authApi } from "@/shared/lib/authApi";
import { Loader2, User, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function AdminProfilePage() {
  const { t } = useTranslation("admin");
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error(t("profile.toast.error"));
      return;
    }
    try {
      setSubmitting(true);
      await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(t("profile.toast.success"));
    } catch (err) {
      console.error("Failed to change password:", err);
      toast.error(t("profile.toast.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-4 flex items-center justify-between gap-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center text-white shadow-lg shadow-[#FF7B21]/20">
              <User className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">
                {t("profile.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("profile.subtitle")}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
            {user?.role ?? t("sidebar.brand.title")}
          </Badge>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-4 space-y-3 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-[#FF7B21]" />
              {t("profile.section.account")}
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t("profile.fields.email")}
                </div>
                <div className="text-sm font-medium">
                  {user?.email ?? "—"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t("profile.fields.role")}
                </div>
                <div className="text-sm">
                  <Badge variant="outline">{user?.role ?? t("sidebar.brand.title")}</Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-4 space-y-3 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#FF7B21]" />
              {t("profile.section.security")}
            </h3>
            <form className="space-y-3" onSubmit={handleChangePassword}>
              <div className="space-y-1">
                <Label htmlFor="current-password">
                  {t("profile.changePassword.current")}
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-background/80 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-password">
                  {t("profile.changePassword.new")}
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-background/80 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-password">
                  {t("profile.changePassword.confirm")}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background/80 backdrop-blur-sm"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300"
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {submitting
                  ? t("profile.changePassword.submitting")
                  : t("profile.changePassword.submit")}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

