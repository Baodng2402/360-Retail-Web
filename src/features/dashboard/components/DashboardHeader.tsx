import { useAuthStore } from "@/shared/store/authStore";
import AvatarDropĐown from "@/shared/components/ui/dropdown-menu-profile-2";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeMode from "@/shared/components/ui/themeMode";
import { Menu } from "lucide-react";

const PAGE_NAME: Record<string, { name: string; title: string }> = {
  "/dashboard": { name: "Dashboard", title: "Tổng quan 360°" },
  "/dashboard/staff": { name: "Staff", title: "Quản lý Nhân viên" },
  "/dashboard/stores": { name: "Stores", title: "Quản lý Cửa hàng" },
  "/dashboard/sales": { name: "Sales & POS", title: "Quản lý Bán hàng" },
  "/dashboard/customers": { name: "Customers", title: "Quản lý Khách hàng" },
  "/dashboard/reports": { name: "Reports", title: "Báo cáo" },
  "/dashboard/settings": { name: "Settings", title: "Cài đặt" },
  "/dashboard/profile": { name: "Profile", title: "Thông tin cá nhân" },
};

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const pageName = PAGE_NAME[location.pathname];
  return (
    <section
      className={cn(
        "bg-background text-foreground transition-colors duration-300",
        "border-b border-border",
        "sticky top-0 z-50",
      )}
    >
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-lg md:text-2xl font-bold truncate">
              {pageName?.name}
            </h1>
            <h2 className="text-xs md:text-sm text-muted-foreground truncate">
              {pageName?.title}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="scale-75 md:scale-100 origin-right">
              <ThemeMode />
            </div>
            <AvatarDropĐown />
            <div className="hidden lg:flex flex-col">
              <span className="text-sm">{user?.name || "User"}</span>
              <span className="text-sm text-muted-foreground">
                {user?.role?.replace(/([A-Z])/g, " $1").trim() || "Store Owner"}
              </span>
            </div>
          </div>
        </div>
      </header>
    </section>
  );
};
