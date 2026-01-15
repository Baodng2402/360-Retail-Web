import { useAuthStore } from "@/shared/store/authStore";
import { Button } from "@/shared/components/ui/button";
import AvatarDropĐown from "@/components/dropdown-menu-profile-2";

export const DashboardHeader = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <AvatarDropĐown />
          <div className="flex flex-col">
            <span className="text-sm">Xin chào, {user?.name || "User"}</span>
            <span className="text-sm text-muted-foreground">
              {user?.role || "Store Owner"}
            </span>
            {/* <Button onClick={logout} variant="outline" size="sm">
              Đăng xuất
            </Button> */}
          </div>
        </div>
      </div>
    </header>
  );
};
