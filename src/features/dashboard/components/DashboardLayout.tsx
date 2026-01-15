import { Outlet } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSideBar } from "./DashboardSideBar";

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSideBar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
