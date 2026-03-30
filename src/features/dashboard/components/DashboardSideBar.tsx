import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  UserCircle,
  FileText,
  Settings,
  ClipboardCheck,
  MessageSquare,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Store as StoreIcon,
  Package,
  Warehouse,
  CreditCard,
  Lock,
  AlertCircle,
  MapPin,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { authApi } from "@/shared/lib/authApi";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import { UserStatus } from "@/shared/types/jwt-claims";
import { useFeatureGateStore } from "@/shared/store/featureGateStore";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface DashboardSideBarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

/** Feature codes from backend (same as 403 response field "feature") */
export const SIDEBAR_FEATURE_KEYS = [
  "has_dashboard",
  "has_gps_checkin",
  "has_tasks",
  "has_invite_staff",
  "has_multi_store",
  "has_variants",
  "has_inventory_tickets",
  "has_loyalty",
  "has_feedback_qr",
  "has_export_excel",
] as const;
export type SidebarFeatureKey = (typeof SIDEBAR_FEATURE_KEYS)[number];

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  subLabel: string;
  path: string;
  end: boolean;
  requiresStore: boolean;
  visibleFor?: string[];
  allowWhenExpired?: boolean;
  /** Backend feature code: if not in plan's allowed list, item is locked */
  featureKey?: SidebarFeatureKey;
}

export const DashboardSideBar = ({
  isCollapsed,
  onToggle,
}: DashboardSideBarProps) => {
  const { t } = useTranslation("dashboard");
  const [hoveredItem, setHoveredItem] = useState<{
    label: string;
    subLabel: string;
    x: number;
    y: number;
    lockHint?: string;
  } | null>(null);
  const [userStatus, setUserStatus] = useState<"loading" | "hasStore" | "noStore">("loading");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [allowedFeatures, setAllowedFeatures] = useState<string[]>([]);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const openUpgradeModal = useFeatureGateStore((s) => s.openUpgradeModal);

  async function checkUserStoreStatus() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserStatus("noStore");
        return;
      }

      const userInfo = await authApi.meWithSubscription();
      setUserRole(userInfo.role || null);
      setTrialExpired(userInfo.trialExpired ?? false);
      setSubscriptionExpired(userInfo.subscriptionExpired ?? false);
      if (userInfo.status === UserStatus.Registered || !userInfo.storeId) {
        setUserStatus("noStore");
      } else {
        setUserStatus("hasStore");
      }

      subscriptionApi
        .getAllowedFeatures()
        .then(setAllowedFeatures)
        .catch(() => setAllowedFeatures([]));
    } catch {
      setUserStatus("noStore");
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      void checkUserStoreStatus();
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const handleNavClick = (item: NavItem) => {
    const lockedByNoStore = item.requiresStore && userStatus === "noStore";
    const lockedByExpired =
      (trialExpired || subscriptionExpired) && !item.allowWhenExpired;
    const lockedByPlanFeature =
      item.featureKey != null && !allowedFeatures.includes(item.featureKey);

    if (lockedByNoStore) {
      setShowSetupDialog(true);
      return;
    }
    if (lockedByExpired || lockedByPlanFeature) {
      openUpgradeModal({
        errorType: "FeatureNotAvailable",
        message:
          "Tính năng này không khả dụng trong gói hiện tại. Vui lòng nâng cấp gói để sử dụng.",
        feature: item.featureKey ?? item.label,
      });
      return;
    }
    navigate(item.path);
  };

  const mainNavItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: t("sidebar.nav.dashboard.label"),
      subLabel: t("sidebar.nav.dashboard.subLabel"),
      path: "/dashboard",
      end: true,
      requiresStore: false,
      visibleFor: ["StoreOwner", "Manager", "Staff", "PotentialOwner"],
      allowWhenExpired: true,
      featureKey: "has_dashboard",
    },
    {
      icon: MapPin,
      label: t("sidebar.nav.timekeeping.label"),
      subLabel: t("sidebar.nav.timekeeping.subLabel"),
      path: "/dashboard/timekeeping",
      end: false,
      requiresStore: true,
      visibleFor: ["StoreOwner", "Manager", "Staff"],
      featureKey: "has_gps_checkin",
    },
    {
      icon: ListChecks,
      label: t("sidebar.nav.myTasks.label"),
      subLabel: t("sidebar.nav.myTasks.subLabel"),
      path: "/dashboard/my-tasks",
      end: false,
      requiresStore: true,
      visibleFor: ["StoreOwner", "Manager", "Staff"],
      featureKey: "has_tasks",
    },
    {
      icon: Users,
      label: t("sidebar.nav.staff.label"),
      subLabel: t("sidebar.nav.staff.subLabel"),
      path: "/dashboard/staff",
      end: false,
      requiresStore: true,
      visibleFor: ["StoreOwner", "Manager"],
    },
    {
      icon: StoreIcon,
      label: t("sidebar.nav.stores.label"),
      subLabel: t("sidebar.nav.stores.subLabel"),
      path: "/dashboard/stores",
      end: false,
      requiresStore: true,
      visibleFor: ["StoreOwner", "Manager"],
      featureKey: "has_multi_store",
    },
    {
      icon: Package,
      label: t("sidebar.nav.products.label"),
      subLabel: t("sidebar.nav.products.subLabel"),
      path: "/dashboard/products",
      end: false,
      requiresStore: true,
      visibleFor: ["StoreOwner", "Manager"],
    },
    {
      icon: Warehouse,
      label: t("sidebar.nav.inventory.label"),
      subLabel: t("sidebar.nav.inventory.subLabel"),
      path: "/dashboard/inventory",
      end: false,
      requiresStore: true,
      visibleFor: ["StoreOwner", "Manager"],
      featureKey: "has_inventory_tickets",
    },
    {
      icon: ShoppingCart,
      label: t("sidebar.nav.sales.label"),
      subLabel: t("sidebar.nav.sales.subLabel"),
      path: "/dashboard/sales",
      end: false,
      requiresStore: true,
      visibleFor: ["StoreOwner", "Manager", "Staff"],
    },
    {
      icon: ClipboardCheck,
      label: t("sidebar.nav.orders.label"),
      subLabel: t("sidebar.nav.orders.subLabel"),
      path: "/dashboard/orders",
      end: false,
      requiresStore: true,
      visibleFor: ["StoreOwner", "Manager", "Staff"],
    },
    {
      icon: UserCircle,
      label: t("sidebar.nav.customers.label"),
      subLabel: t("sidebar.nav.customers.subLabel"),
      path: "/dashboard/customers",
      end: false,
      requiresStore: true,
      visibleFor: ["StoreOwner", "Manager", "Staff"],
    },
    {
      icon: MessageSquare,
      label: t("sidebar.nav.crm.label"),
      subLabel: t("sidebar.nav.crm.subLabel"),
      path: "/dashboard/crm",
      end: false,
      requiresStore: true,
      visibleFor: ["StoreOwner", "Manager", "Staff"],
      featureKey: "has_loyalty",
    },
    {
      icon: FileText,
      label: t("sidebar.nav.reports.label"),
      subLabel: t("sidebar.nav.reports.subLabel"),
      path: "/dashboard/reports",
      end: false,
      requiresStore: true,
      visibleFor: ["StoreOwner", "Manager"],
      featureKey: "has_export_excel",
    },
    {
      icon: CreditCard,
      label: t("sidebar.nav.subscription.label"),
      subLabel: t("sidebar.nav.subscription.subLabel"),
      path: "/dashboard/subscription",
      end: false,
      requiresStore: true,
      visibleFor: ["StoreOwner", "PotentialOwner"],
      allowWhenExpired: true,
    },
    {
      icon: Settings,
      label: t("sidebar.nav.settings.label"),
      subLabel: t("sidebar.nav.settings.subLabel"),
      path: "/dashboard/settings",
      end: false,
      requiresStore: true,
      allowWhenExpired: true,
    },
  ];

  return (
    <>
      {isCollapsed && hoveredItem && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${hoveredItem.x}px`,
            top: `${hoveredItem.y}px`,
            transform: "translateY(-50%)",
          }}
        >
          <div className="px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-xl whitespace-nowrap">
            <div className="font-medium">{hoveredItem.label}</div>
            <div className="text-xs opacity-90">
              {hoveredItem.lockHint ?? hoveredItem.subLabel}
            </div>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-800"></div>
          </div>
        </div>
      )}
      <aside
        className={`relative flex h-full flex-col bg-gradient-to-b from-sidebar to-sidebar/95 dark:from-slate-900 dark:to-slate-950 border-r border-border/50 transition-[width] duration-300 ease-out ${isCollapsed ? "w-20" : "w-64"
          }`}
        style={{
          willChange: "width",
        }}
      >
        <div className="h-[73px] flex items-center px-4 flex-shrink-0 border-b border-border/50">
          <div
            className={`flex items-center gap-3 w-full ${isCollapsed ? "justify-center" : ""
              }`}
          >
            <div className="flex w-10 h-10 items-center justify-center flex-shrink-0">
              <img src={logo} alt="logo" className="w-full h-full object-contain" />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                isCollapsed
                  ? "w-0 opacity-0 scale-95"
                  : "w-auto opacity-100 scale-100 min-w-0"
              }`}
              style={{
                transitionDelay: isCollapsed ? "0ms" : "100ms",
              }}
            >
              <div className="whitespace-nowrap">
                <h1 className="text-lg font-bold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
                  {t("sidebar.brandLine1", { defaultValue: "Retail 360" })}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t("sidebar.brandLine2", { defaultValue: "SME Platform" })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className={`flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-border/50 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent ${isCollapsed ? "scrollbar-hide" : ""}`}>
          <ul className="space-y-1">
            {mainNavItems.map((item) => {
              let normalizedRoles: string[] = [];
              if (typeof userRole === "string") {
                normalizedRoles = userRole
                  .split(",")
                  .map((r: string) => r.trim())
                  .filter((r) => r.length > 0);
              } else if (Array.isArray(userRole)) {
                normalizedRoles = (userRole as unknown[])
                  .map((r) => String(r).trim())
                  .filter((r) => r.length > 0);
              }
              if (
                item.visibleFor &&
                normalizedRoles.length > 0 &&
                !item.visibleFor.some((r) => normalizedRoles.includes(r))
              ) {
                return null;
              }
              const lockedByNoStore = item.requiresStore && userStatus === "noStore";
              const lockedByExpired =
                (trialExpired || subscriptionExpired) && !item.allowWhenExpired;
              const lockedByPlanFeature =
                item.featureKey != null &&
                allowedFeatures !== null &&
                !allowedFeatures.includes(item.featureKey);
              const isLocked =
                lockedByNoStore || lockedByExpired || lockedByPlanFeature;
              const isActive = location.pathname === item.path ||
                (item.end === false && location.pathname.startsWith(item.path));

              return (
                <li key={item.path} className="relative">
                  <div
                    onClick={() => handleNavClick(item)}
                    onMouseEnter={(e) => {
                      if (isCollapsed) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredItem({
                          label: item.label,
                          subLabel: item.subLabel,
                          x: rect.right + 8,
                          y: rect.top + rect.height / 2,
                          lockHint:
                            lockedByPlanFeature || lockedByExpired
                              ? t("sidebar.locks.upgradePlan")
                              : lockedByNoStore
                                ? t("sidebar.locks.setupStoreFirst")
                                : undefined,
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      if (isCollapsed) {
                        setHoveredItem(null);
                      }
                    }}
                    className={cn(
                      "flex items-center rounded-xl transition-all duration-200 cursor-pointer group",
                      isCollapsed ? "justify-center px-3 py-3" : "gap-3 px-3 py-2.5 lg:py-3",
                      isActive
                        ? "bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-orange-500/20"
                        : isLocked
                          ? "opacity-50 cursor-not-allowed text-muted-foreground"
                          : "hover:bg-gradient-to-r hover:from-[#FF7B21]/10 hover:to-[#19D6C8]/10 hover:text-foreground dark:hover:bg-white/10"
                    )}
                  >
                    <div className="relative">
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                        !isActive && !isLocked && "group-hover:scale-110"
                      )} />
                      {isLocked && (
                        <Lock className="h-3 w-3 absolute -top-1 -right-1 text-destructive" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-out",
                        isCollapsed
                          ? "w-0 opacity-0 scale-95"
                          : "w-auto opacity-100 scale-100 ml-0"
                      )}
                      style={{
                        transitionDelay: isCollapsed ? "0ms" : "100ms",
                      }}
                    >
                      <div className="flex flex-col whitespace-nowrap relative">
                        <span className={cn("text-sm font-medium", isLocked && "text-muted-foreground")}>
                          {item.label}
                        </span>
                        <span className={cn("text-xs opacity-70", isLocked && "text-muted-foreground")}>
                          {item.subLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

        </nav>

        <div className="p-3 flex items-center justify-end flex-shrink-0 border-t border-border/50">
          <button
            onClick={onToggle}
            className="flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-accent active:scale-95 w-10 h-10"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </aside>

      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              {t("sidebar.setupStoreDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("sidebar.setupStoreDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-sm text-muted-foreground">
              {t("sidebar.setupStoreDialog.body")}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSetupDialog(false)}
              >
                {t("sidebar.setupStoreDialog.remindLater")}
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                onClick={() => {
                  setShowSetupDialog(false);
                  navigate("/dashboard");
                }}
              >
                {t("sidebar.setupStoreDialog.setupNow")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
