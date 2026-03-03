import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { formatVnd } from "@/shared/utils/formatMoney";
import type { RecentActivityItem } from "@/shared/lib/salesDashboardApi";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "Import":
      return (
        <ArrowDownLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      );
    case "Export":
      return (
        <ArrowUpRight className="w-4 h-4 text-orange-600 dark:text-orange-400" />
      );
    case "Order":
    default:
      return (
        <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
      );
  }
};

const getActivityBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return (
        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-green-500/20">
          Hoàn thành
        </Badge>
      );
    case "Cancelled":
      return (
        <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 border-orange-500/20">
          Hủy
        </Badge>
      );
    case "Processing":
      return (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/20">
          Đang xử lý
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20">
          {status}
        </Badge>
      );
  }
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

interface RecentTransactionsProps {
  activities: RecentActivityItem[];
  isLoading?: boolean;
}

const RecentTransactions = ({ activities, isLoading }: RecentTransactionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full border border-border rounded-md p-4 md:p-6 bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex flex-col">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">
            Recent Transactions
          </h3>
          <span className="text-sm text-muted-foreground">
            Giao dịch gần đây
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard/sales")}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all shadow-sm text-sm"
        >
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          Chưa có giao dịch nào
        </div>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 8).map((activity) => (
            <div
              key={`${activity.type}-${activity.code}-${activity.createdAt}`}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 rounded-xl bg-accent/50 hover:bg-accent transition-colors cursor-pointer border border-border"
              onClick={() => navigate("/dashboard/sales")}
            >
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div className="p-2 bg-background rounded-lg border border-border flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-foreground truncate">
                      {activity.description || activity.code}
                    </span>
                    {getActivityBadge(activity.status)}
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{formatTimeAgo(activity.createdAt)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{activity.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`font-bold text-sm md:text-base ${
                    activity.amount && activity.amount > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-foreground"
                  }`}
                >
                  {activity.amount
                    ? `+${formatVnd(activity.amount)}`
                    : "-"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {activity.code}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
