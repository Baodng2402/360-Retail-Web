import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardStats } from "../components/DashboardStats";
import { DashboardCharts } from "../components/DashboardCharts";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8">
        <DashboardStats />
        <DashboardCharts />
      </div>
    </div>
  );
};

export default DashboardPage;
