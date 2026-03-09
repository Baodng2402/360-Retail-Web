import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Store,
  ArrowRight,
  X,
  CheckCircle2,
  Building2,
  MapPin,
  Phone,
  Loader2,
} from "lucide-react";
import { authApi } from "@/shared/lib/authApi";
import { useStoreStore } from "@/shared/store/storeStore";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SetupStoreBannerProps {
  className?: string;
}

export function SetupStoreBanner({ className }: SetupStoreBannerProps) {
  const { t } = useTranslation("store");
  const [isVisible, setIsVisible] = useState(true);
  const [hasStore, setHasStore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStoreStatus();
  }, []);

  const checkStoreStatus = async () => {
    try {
      setLoading(true);
      const subscriptionStatus = await authApi.checkStoreTrial();
      setHasStore(subscriptionStatus.hasStore);
      // Show banner if user doesn't have a store
      setIsVisible(!subscriptionStatus.hasStore);
    } catch {
      // If API fails, show banner as fallback
      setHasStore(false);
      setIsVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleNavigateToSetup = () => {
    navigate("/dashboard/settings?tab=store");
  };

  const navigate = useNavigate();

  if (loading) {
    return null;
  }

  if (!isVisible || hasStore) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Sapo-style banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-white/20 rounded-full flex-shrink-0">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {t("setup.bannerTitle")}
                </h3>
                <p className="text-blue-100 text-sm">
                  {t("setup.bannerSubtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleNavigateToSetup}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white gap-2"
              >
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t("setup.setupNowLong")}</span>
                <span className="sm:hidden">{t("setup.setupNowShort")}</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact banner for dashboard pages
 */
export function SetupStoreCompactBanner() {
  const { t } = useTranslation("store");
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full">
            <Store className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-amber-800">{t("setup.compactTitle")}</p>
            <p className="text-sm text-amber-600">
              {t("setup.compactSubtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate("/dashboard/settings?tab=store")}
            className="gap-1"
          >
            {t("setup.setupNowShort")}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
          >
            {t("setup.dismiss")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Full setup dialog (non-blocking) for settings page
 */
interface StoreSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoreSetupDialog({ open, onOpenChange }: StoreSetupDialogProps) {
  const { t } = useTranslation("store");
  const _navigate = useNavigate();
  const { currentStore: _currentStore } = useStoreStore();
  void _navigate;
  void _currentStore;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    address: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.storeName.trim()) {
      toast.error(t("setup.validation.storeNameRequired"));
      return;
    }

    try {
      setLoading(true);
      await authApi.createStoreTrial({
        storeName: formData.storeName,
      });

      toast.success(t("setup.toast.createTrialSuccess"));

      // Refresh token and reload
      const refreshRes = await authApi.refreshAccess();
      if (refreshRes.accessToken) {
        localStorage.setItem("token", refreshRes.accessToken);
      }

      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to create store:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("setup.toast.createTrialError");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative bg-background rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in-0 zoom-in-95">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{t("setup.dialog.title")}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("setup.dialog.subtitle")}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">{t("setup.dialog.storeNameLabel")}</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="storeName"
                    placeholder={t("setup.dialog.storeNamePlaceholder")}
                    className="pl-10"
                    value={formData.storeName}
                    onChange={(e) =>
                      handleInputChange("storeName", e.target.value)
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t("setup.dialog.addressLabel")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    placeholder={t("setup.dialog.addressPlaceholder")}
                    className="pl-10 resize-none"
                    rows={2}
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("setup.dialog.phoneLabel")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t("setup.dialog.phonePlaceholder")}
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  {t("setup.dialog.cancel")}
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("setup.dialog.creating")}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t("setup.dialog.create")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Badge to show on settings menu when store is not set up
 */
export function SetupStoreBadge() {
  const [hasStore, setHasStore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStoreStatus();
  }, []);

  const checkStoreStatus = async () => {
    try {
      const subscriptionStatus = await authApi.checkStoreTrial();
      setHasStore(subscriptionStatus.hasStore);
    } catch {
      setHasStore(true); // Assume has store if API fails
    } finally {
      setLoading(false);
    }
  };

  if (loading || hasStore) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 w-4">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
    </span>
  );
}

