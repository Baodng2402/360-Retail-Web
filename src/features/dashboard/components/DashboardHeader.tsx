import { useAuthStore } from "@/shared/store/authStore";
import AvatarDropĐown from "@/shared/components/ui/dropdown-menu-profile-2";
import { useLocation } from "react-router-dom";
import ThemeMode from "@/shared/components/ui/themeMode";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";

const PAGE_NAME = {
  "/dashboard": {
    nameKey: "header.pages.dashboard.name",
    titleKey: "header.pages.dashboard.title",
  },
  "/dashboard/staff": {
    nameKey: "header.pages.staff.name",
    titleKey: "header.pages.staff.title",
  },
  "/dashboard/stores": {
    nameKey: "header.pages.stores.name",
    titleKey: "header.pages.stores.title",
  },
  "/dashboard/sales": {
    nameKey: "header.pages.sales.name",
    titleKey: "header.pages.sales.title",
  },
  "/dashboard/customers": {
    nameKey: "header.pages.customers.name",
    titleKey: "header.pages.customers.title",
  },
  "/dashboard/reports": {
    nameKey: "header.pages.reports.name",
    titleKey: "header.pages.reports.title",
  },
  "/dashboard/settings": {
    nameKey: "header.pages.settings.name",
    titleKey: "header.pages.settings.title",
  },
  "/dashboard/timekeeping": {
    nameKey: "header.pages.timekeeping.name",
    titleKey: "header.pages.timekeeping.title",
  },
} as const;

/** Role display labels */
const ROLE_DISPLAY_LABELS: Record<string, string> = {
  SuperAdmin: "SuperAdmin",
  StoreOwner: "StoreOwner",
  Manager: "Manager",
  Staff: "Staff",
  PotentialOwner: "PotentialOwner",
  Customer: "Customer",
};

interface DashboardHeaderProps {
  isSidebarCollapsed: boolean;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const DashboardHeader = ({
  isSidebarCollapsed,
  onMobileMenuToggle,
  isMobileMenuOpen,
}: DashboardHeaderProps) => {
  const { t } = useTranslation("dashboard");
  const { user } = useAuthStore();
  const location = useLocation();
  const pageName = PAGE_NAME[location.pathname as keyof typeof PAGE_NAME];

  // Get display role (handle comma-separated roles)
  const displayRole = (() => {
    const role = user?.role;
    if (!role) return "User";
    return ROLE_DISPLAY_LABELS[role] ?? role;
  })();

  return (
    <header className="border-b border-border/50 bg-gradient-to-r from-background via-background to-muted/20 backdrop-blur-md sticky top-0 z-50 h-[73px]">
      <div
        className={`flex items-center justify-between h-full w-full transition-all duration-300 ${
          isSidebarCollapsed ? "px-4 lg:px-6" : "container mx-auto px-4 lg:px-6"
        }`}
      >
        {/* Left: Mobile menu button + Page title */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-accent/50 hover:bg-accent transition-all duration-200 active:scale-95"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.div>
          </button>

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
              {pageName ? t(pageName.nameKey) : ""}
            </h1>
            <h2 className="text-xs sm:text-sm text-muted-foreground leading-tight">
              {pageName ? t(pageName.titleKey) : ""}
            </h2>
          </motion.div>
        </div>

        {/* Right: Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <div className="scale-90 sm:scale-100 origin-right">
            <ThemeMode />
          </div>
          <LanguageSwitcher />

          {/* User info */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border/50">
            <div className="flex flex-col justify-center">
              <span className="text-sm font-medium leading-tight">
                {t("header.greeting", { name: user?.name || "User" })}
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                {displayRole}
              </span>
            </div>
            <AvatarDropĐown />
          </div>

          {/* Mobile user avatar */}
          <div className="sm:hidden">
            <AvatarDropĐown />
          </div>
        </motion.div>
      </div>
    </header>
  );
};
