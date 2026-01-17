import { useAuthStore } from "@/shared/store/authStore";
import AvatarDropĐown from "@/components/dropdown-menu-profile-2";
import { useLocation } from "react-router-dom";
import ThemeMode from "@/shared/components/ui/themeMode";

const PAGE_NAME: Record<string, { name: string; title: string }> = {
  "/dashboard": { name: "Dashboard", title: "Tổng quan 360°" },
  "/dashboard/staff": { name: "Staff", title: "Quản lý Nhân viên" },
  "/dashboard/sales": { name: "Sales & POS", title: "Quản lý Bán hàng" },
  "/dashboard/customers": { name: "Customers", title: "Quản lý Khách hàng" },
  "/dashboard/reports": { name: "Reports", title: "Báo cáo" },
  "/dashboard/settings": { name: "Settings", title: "Cài đặt" },
};

interface DashboardHeaderProps {
  isSidebarCollapsed: boolean;
}

export const DashboardHeader = ({
  isSidebarCollapsed,
}: DashboardHeaderProps) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const pageName = PAGE_NAME[location.pathname];
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-background sticky top-0 z-50 h-[73px] flex items-center">
      <div
        className={`flex items-center justify-between w-full transition-all duration-300 ${
          isSidebarCollapsed ? "px-4" : "container mx-auto px-4"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">{pageName?.name}</h1>
            <h2 className="text-sm text-muted-foreground">{pageName?.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="scale-75 origin-right">
            <ThemeMode />
          </div>
          <AvatarDropĐown />
          <div className="flex flex-col">
            <span className="text-sm">Xin chào, {user?.name || "User"}</span>
            <span className="text-sm text-muted-foreground">
              {user?.role?.replace(/([A-Z])/g, " $1").trim() || "Store Owner"}{" "}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
