import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Store,
  CheckCircle2,
  Loader2,
  Gift,
  Calendar,
} from "lucide-react";
import { authApi } from "@/shared/lib/authApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface StartTrialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
}

export function StartTrialDialog({ open, onOpenChange, userEmail }: StartTrialDialogProps) {
  const { t } = useTranslation(["store"]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    if (open && userEmail) {
      const name = userEmail.split("@")[0] ?? "";
      setStoreName(t("store:trial.start.defaultStoreName", { name }));
    }
  }, [open, userEmail, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await authApi.createStoreTrial({
        storeName:
          storeName.trim() ||
          t("store:trial.start.defaultStoreName", { name: userEmail ?? "" }),
      });

      toast.success(t("store:trial.start.toastSuccess"));

      // Backend xác nhận: token từ refresh-access đã có store_id và StoreOwner; không cần login lần 2.
      const refreshRes = await authApi.refreshAccess();
      if (refreshRes.accessToken) {
        localStorage.setItem("token", refreshRes.accessToken);
      }

      sessionStorage.removeItem("pendingGoogleNewUser");

      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to start trial:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("store:trial.start.toastError");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    navigate("/dashboard/subscription");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-in fade-in-0 zoom-in-95">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-500 shadow-lg">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">{t("store:trial.start.title")}</CardTitle>
            <CardDescription className="text-base">
              {t("store:trial.start.subtitle")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span>{t("store:trial.start.benefits.trial")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Store className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>{t("store:trial.start.benefits.instant")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span>{t("store:trial.start.benefits.premium")}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">{t("store:trial.start.storeNameLabel")}</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="storeName"
                    placeholder={t("store:trial.start.storeNamePlaceholder")}
                    className="pl-10 h-11"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("store:trial.start.storeNameHint", {
                    storeName: t("store:trial.start.defaultStoreName", {
                      name: userEmail?.split("@")[0] ?? "",
                    }),
                  })}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  {t("store:trial.start.later")}
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("store:trial.start.creating")}
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-4 w-4" />
                      {t("store:trial.start.startNow")}
                    </>
                  )}
                </Button>
              </div>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              {t("store:trial.start.note")}
            </p>
          </CardContent>
        </Card>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="sr-only">{t("store:trial.start.close")}</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

