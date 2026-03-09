import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "@/shared/store/authStore";
import { authApi } from "@/shared/lib/authApi";
import { Loader2 } from "lucide-react";
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
    <div className="space-y-6">
      <Card className="p-4 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            {t("profile.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("profile.subtitle")}
          </p>
        </div>
        <Badge variant="outline">
          {user?.role ?? "SuperAdmin"}
        </Badge>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4 space-y-3">
          <h3 className="text-base font-semibold">
            {t("profile.section.account")}
          </h3>
          <div className="space-y-2">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t("profile.fields.email")}
              </div>
              <div className="text-sm">
                {user?.email ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t("profile.fields.role")}
              </div>
              <div className="text-sm">
                {user?.role ?? "SuperAdmin"}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="text-base font-semibold">
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
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="mt-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
            >
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitting
                ? t("profile.changePassword.submitting")
                : t("profile.changePassword.submit")}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

