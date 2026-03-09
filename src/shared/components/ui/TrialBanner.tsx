import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  ArrowRight,
} from "lucide-react";
import { authApi } from "@/shared/lib/authApi";
import { UserStatus, isTrial, isActiveSubscription, type UserStatusType } from "@/shared/types/jwt-claims";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface TrialBannerProps {
  variant?: "banner" | "card";
  showUpgradeButton?: boolean;
  className?: string;
}

interface BannerState {
  show: boolean;
  type: "trial" | "expired" | "subscription_expired" | null;
  daysRemaining: number | null;
  message?: string;
}

export function TrialBanner({
  variant = "banner",
  showUpgradeButton = true,
  className = "",
}: TrialBannerProps) {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const [state, setState] = useState<BannerState>({
    show: false,
    type: null,
    daysRemaining: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const user = await authApi.meWithSubscription();

      if (!user.status) {
        setLoading(false);
        return;
      }

      if (isTrial(user.status)) {
        if (user.trialExpired) {
          setState({
            show: true,
            type: "expired",
            daysRemaining: null,
            message:
              t("trial.banner.expiredMessage"),
          });
        } else {
          setState({
            show: true,
            type: "trial",
            daysRemaining: user.trialDaysRemaining ?? null,
            message: user.trialDaysRemaining
              ? t("trial.banner.trialMessageWithDays", {
                  days: user.trialDaysRemaining,
                })
              : t("trial.banner.trialMessageGeneric"),
          });
        }
      } else if (
        user.status === UserStatus.Registered &&
        !isActiveSubscription(user.status)
      ) {
        setState({
          show: true,
          type: "expired",
          daysRemaining: null,
          message: t("trial.banner.noSubscriptionMessage"),
        });
      }
    } catch (error) {
      console.error("Failed to check subscription status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setState((prev) => ({ ...prev, show: false }));
  };

  const handleUpgrade = () => {
    navigate("/dashboard/subscription");
  };

  if (loading || !state.show) {
    return null;
  }

  const getAlertContent = () => {
    switch (state.type) {
      case "trial":
        return {
          icon: Clock,
          title: t("trial.banner.trialTitle"),
          variant: "default" as const,
          className: "border-blue-200 bg-blue-50 text-blue-800",
        };
      case "expired":
        return {
          icon: AlertTriangle,
          title: t("trial.banner.expiredTitle"),
          variant: "destructive" as const,
          className: "border-red-200 bg-red-50 text-red-800",
        };
      case "subscription_expired":
        return {
          icon: AlertTriangle,
          title: t("trial.banner.subscriptionExpiredTitle"),
          variant: "destructive" as const,
          className: "border-red-200 bg-red-50 text-red-800",
        };
      default:
        return {
          icon: AlertTriangle,
          title: t("trial.banner.noticeTitle"),
          variant: "default" as const,
          className: "",
        };
    }
  };

  const content = getAlertContent();
  const Icon = content.icon;

  if (variant === "card") {
    return (
      <Alert className={`${content.className} ${className}`.trim()}>
        <Icon className="h-5 w-5" />
        <div className="flex-1 ml-3">
          <AlertTitle>{content.title}</AlertTitle>
          <AlertDescription className="mt-1">
            {state.message}
            {state.daysRemaining !== null && state.type === "trial" && (
              <span className="block mt-1 font-medium">
                {t("trial.banner.daysRemaining", { days: state.daysRemaining })}
              </span>
            )}
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {showUpgradeButton && (
            <Button size="sm" onClick={handleUpgrade} className="gap-1">
              {t("trial.banner.upgrade")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    );
  }

  // Banner variant
  return (
    <div
      className={`sticky top-0 z-50 w-full border-b ${content.className} ${className}`.trim()}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <span className="font-semibold">{content.title}</span>
              <span className="text-sm opacity-90">{state.message}</span>
              {state.daysRemaining !== null && state.type === "trial" && (
                <span className="text-sm font-medium bg-white/50 px-2 py-0.5 rounded">
                  {t("trial.banner.daysRemaining", { days: state.daysRemaining })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {showUpgradeButton && (
              <Button size="sm" onClick={handleUpgrade} className="gap-1">
                {t("trial.banner.upgradeNow")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact trial warning for use in dashboard header
 */
export function TrialWarningBadge() {
  const { t } = useTranslation("dashboard");
  const [showWarning, setShowWarning] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const user = await authApi.meWithSubscription();

        if (
          user.status === UserStatus.Trial &&
          !user.trialExpired &&
          user.trialDaysRemaining !== undefined
        ) {
          setShowWarning(true);
          setDaysRemaining(user.trialDaysRemaining);
        } else if (user.status === UserStatus.Trial && user.trialExpired) {
          setShowWarning(true);
          setDaysRemaining(null);
        }
      } catch {
        // Ignore errors
      }
    };

    checkStatus();
  }, []);

  if (!showWarning) return null;

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
        daysRemaining !== null && daysRemaining <= 3
          ? "bg-red-100 text-red-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      <Clock className="h-3 w-3" />
      {daysRemaining !== null
        ? t("trial.badges.daysLeft", { days: daysRemaining })
        : t("trial.badges.expired")}
    </div>
  );
}

/**
 * Subscription status indicator for active users
 */
export function SubscriptionStatusBadge() {
  const { t } = useTranslation("dashboard");
  const [status, setStatus] = useState<UserStatusType | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const user = await authApi.meWithSubscription();
        setStatus(user.status ?? null);
      } catch {
        // Ignore errors
      }
    };

    checkStatus();
  }, []);

  if (!status) return null;

  if (isActiveSubscription(status)) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="h-3 w-3" />
        {t("trial.badges.active")}
      </div>
    );
  }

  if (isTrial(status)) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <Clock className="h-3 w-3" />
        {t("trial.badges.trial")}
      </div>
    );
  }

  return null;
}

