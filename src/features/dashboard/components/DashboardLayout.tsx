import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSideBar } from "./DashboardSideBar";
import { StoreSetupGuard } from "./StoreSetupGuard";

export const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSideBar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader isSidebarCollapsed={isSidebarCollapsed} />
        <main className="flex-1 overflow-y-auto p-8">
          <StoreSetupGuard>
          <Outlet />
          </StoreSetupGuard>
        </main>
      </div>
    </div>
  );
};
