import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Users,
  Star,
  Package,
  CreditCard,
  IdCard,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCircle2,
} from "lucide-react";

import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "react-i18next";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

type AdminNavItem = {
  label: string;
  subLabel: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
  const { t } = useTranslation("admin");
  const items = useMemo<AdminNavItem[]>(
    () => [
      {
        label: t("sidebar.nav.dashboard.label"),
        subLabel: t("sidebar.nav.dashboard.subLabel"),
        to: "/admin/dashboard",
        icon: BarChart3,
      },
      {
        label: t("sidebar.nav.plans.label"),
        subLabel: t("sidebar.nav.plans.subLabel"),
        to: "/admin/plans",
        icon: Package,
      },
      {
        label: t("sidebar.nav.subscriptions.label"),
        subLabel: t("sidebar.nav.subscriptions.subLabel"),
        to: "/admin/subscriptions",
        icon: IdCard,
      },
      {
        label: t("sidebar.nav.payments.label"),
        subLabel: t("sidebar.nav.payments.subLabel"),
        to: "/admin/payments",
        icon: CreditCard,
      },
      {
        label: t("stores.title"),
        subLabel: t("stores.description"),
        to: "/admin/stores",
        icon: Shield,
      },
      {
        label: t("sidebar.nav.users.label"),
        subLabel: t("sidebar.nav.users.subLabel"),
        to: "/admin/users",
        icon: Users,
      },
      {
        label: t("sidebar.nav.reviews.label"),
        subLabel: t("sidebar.nav.reviews.subLabel"),
        to: "/admin/reviews",
        icon: Star,
      },
      {
        label: t("profile.title"),
        subLabel: t("profile.subtitle"),
        to: "/admin/profile",
        icon: UserCircle2,
      },
    ],
    [t],
  );

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-border/50 bg-gradient-to-b from-sidebar to-sidebar/95 dark:from-slate-900 dark:to-slate-950 transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
      )}
      style={{ willChange: "width" }}
    >
      <div className="h-[73px] flex items-center px-4 flex-shrink-0 border-b border-border/50">
        <div
          className={cn(
            "flex items-center gap-3 w-full",
            isCollapsed ? "justify-center" : "",
          )}
        >
          <div className="flex w-10 h-10 items-center justify-center flex-shrink-0">
            <img src={logo} alt="logo" className="w-full h-full object-contain" />
          </div>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isCollapsed ? "w-0 opacity-0 scale-95" : "w-auto opacity-100 scale-100 min-w-0",
            )}
            style={{ transitionDelay: isCollapsed ? "0ms" : "100ms" }}
          >
            <div className="whitespace-nowrap">
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
                {t("sidebar.brand.title")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t("sidebar.brand.subtitle")}
              </p>
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-auto flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] text-white shadow-md shadow-[#FF7B21]/20">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className={cn("flex-1 overflow-y-auto p-3", isCollapsed && "scrollbar-hide")}>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-xl transition-all duration-200",
                    isCollapsed ? "justify-center px-3 py-2.5" : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/20"
                      : "hover:bg-[#FF7B21]/10 dark:hover:bg-[#19D6C8]/10 text-gray-700 dark:text-gray-300 hover:text-[#FF7B21]",
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    <span className="text-xs opacity-70 truncate">{item.subLabel}</span>
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3 flex items-center justify-end flex-shrink-0 border-t border-border/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="rounded-full w-10 h-10"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
      </div>
    </aside>
  );
}

