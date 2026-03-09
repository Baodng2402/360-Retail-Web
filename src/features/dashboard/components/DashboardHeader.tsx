import { useAuthStore } from "@/shared/store/authStore";
import AvatarDropĐown from "@/shared/components/ui/dropdown-menu-profile-2";
import { useLocation } from "react-router-dom";
import ThemeMode from "@/shared/components/ui/themeMode";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

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

interface DashboardHeaderProps {
  isSidebarCollapsed: boolean;
}

export const DashboardHeader = ({
  isSidebarCollapsed,
}: DashboardHeaderProps) => {
  const { t } = useTranslation("dashboard");
  const { user } = useAuthStore();
  const location = useLocation();
  const pageName = PAGE_NAME[location.pathname as keyof typeof PAGE_NAME];
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-background sticky top-0 z-50 h-[73px] flex items-center">
      <div
        className={`flex items-center justify-between w-full transition-all duration-300 ${
          isSidebarCollapsed ? "px-4" : "container mx-auto px-4"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">
              {pageName ? t(pageName.nameKey) : ""}
            </h1>
            <h2 className="text-sm text-muted-foreground">
              {pageName ? t(pageName.titleKey) : ""}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="scale-75 origin-right">
            <ThemeMode />
          </div>
          <LanguageSwitcher />
          <AvatarDropĐown />
          <div className="flex flex-col">
            <span className="text-sm">
              {t("header.greeting", { name: user?.name || "User" })}
            </span>
            <span className="text-sm text-muted-foreground">
              {typeof user?.role === "string"
                ? user.role.replace(/([A-Z])/g, " $1").trim()
                : "Store Owner"}{" "}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
