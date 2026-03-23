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
  ArrowLeft,
} from "lucide-react";
import { authApi, decodeTokenToUser } from "@/shared/lib/authApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/shared/store/authStore";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

const CreateStorePage = () => {
  const { t } = useTranslation(["store", "auth"]);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    if (user?.email) {
      const name = user.email.split("@")[0] ?? "";
      setStoreName(t("store:trial.start.defaultStoreName", { name }));
    }
  }, [user?.email, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await authApi.createStoreTrial({
        storeName:
          storeName.trim() ||
          t("store:trial.start.defaultStoreName", { name: user?.email ?? "" }),
      });

      toast.success(t("store:trial.start.toastSuccess"));

      // Backend xác nhận: token từ refresh-access đã có store_id và StoreOwner
      const refreshRes = await authApi.refreshAccess();
      if (refreshRes.accessToken) {
        localStorage.setItem("token", refreshRes.accessToken);
        // Update auth store with new token
        const newUser = decodeTokenToUser(refreshRes.accessToken);
        useAuthStore.getState().setAuthFromToken(newUser, refreshRes.accessToken);
      }

      sessionStorage.removeItem("pendingGoogleNewUser");

      // Redirect đến dashboard sau khi tạo store thành công
      navigate("/dashboard", { replace: true });
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
    navigate("/dashboard/subscription");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="360 Retail" className="h-12 w-auto" />
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-500 shadow-lg">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {t("store:trial.start.title")}
              </CardTitle>
              <CardDescription className="text-base">
                {t("store:trial.start.subtitle")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-teal-600" />
                  </div>
                  <span>{t("store:trial.start.benefits.trial")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Store className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>{t("store:trial.start.benefits.instant")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>{t("store:trial.start.benefits.premium")}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">
                    {t("store:trial.start.storeNameLabel")}
                  </Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storeName"
                      placeholder={t("store:trial.start.storeNamePlaceholder")}
                      className="pl-10 h-12"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("store:trial.start.storeNameHint", {
                      storeName: t("store:trial.start.defaultStoreName", {
                        name: user?.email?.split("@")[0] ?? "",
                      }),
                    })}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={handleSkip}
                    disabled={loading}
                  >
                    {t("store:trial.start.later")}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                    disabled={loading}
                  >
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

              <div className="mt-6 pt-4 border-t">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-teal-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("auth:login.title")}
                </Link>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-4">
                {t("store:trial.start.note")}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateStorePage;
