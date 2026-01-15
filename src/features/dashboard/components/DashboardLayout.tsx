import { Outlet } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

