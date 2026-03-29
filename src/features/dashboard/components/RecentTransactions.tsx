import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { formatVnd } from "@/shared/utils/formatMoney";
import type { RecentActivityItem } from "@/shared/lib/salesDashboardApi";
import { motion } from "motion/react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "Import":
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
          <ArrowDownLeft className="w-4 h-4 text-white" />
        </div>
      );
    case "Export":
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
          <ArrowUpRight className="w-4 h-4 text-white" />
        </div>
      );
    case "Order":
    default:
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
          <ArrowUpRight className="w-4 h-4 text-white" />
        </div>
      );
  }
};

const getActivityBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return (
        <Badge variant="success" className="text-xs">
          Hoàn thành
        </Badge>
      );
    case "Cancelled":
      return (
        <Badge variant="warning" className="text-xs">
          Hủy
        </Badge>
      );
    case "Processing":
      return (
        <Badge variant="info" className="text-xs">
          Đang xử lý
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
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

const getActivityPath = (
  activity: RecentActivityItem,
  orderCodeToId: Record<string, string>,
): string => {
  if (activity.type === "Order") {
    if (activity.referenceId) {
      return `/dashboard/orders/${activity.referenceId}`;
    }
    const id = orderCodeToId[activity.code];
    if (id) return `/dashboard/orders/${id}`;
    return "/dashboard/orders";
  }
  if (activity.type === "Import" || activity.type === "Export") {
    if (activity.referenceId) {
      return `/dashboard/inventory?ticketId=${encodeURIComponent(activity.referenceId)}`;
    }
    return "/dashboard/inventory";
  }
  return "/dashboard/orders";
};

interface RecentTransactionsProps {
  activities: RecentActivityItem[];
  isLoading?: boolean;
  /** Map mã đơn (activity.code) → id để mở chi tiết khi API chưa gửi referenceId */
  orderCodeToId?: Record<string, string>;
}

const RecentTransactions = ({
  activities,
  isLoading,
  orderCodeToId = {},
}: RecentTransactionsProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-5 md:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex flex-col">
          <h3 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
            Recent Transactions
          </h3>
          <span className="text-sm text-muted-foreground">
            Giao dịch gần đây
          </span>
        </div>
        <Button
          onClick={() => navigate("/dashboard/orders")}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          View All
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="h-20 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 animate-pulse"
            />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-muted-foreground">Chưa có giao dịch nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 8).map((activity, index) => (
            <motion.div
              key={`${activity.type}-${activity.code}-${activity.createdAt}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-card to-muted/20 hover:from-[#FF7B21]/5 hover:to-muted/30 transition-all duration-300 cursor-pointer border border-border/50 hover:border-[#FF7B21]/30 hover:shadow-lg group"
              onClick={() => navigate(getActivityPath(activity, orderCodeToId))}
            >
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                {getActivityIcon(activity.type)}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-foreground truncate group-hover:text-[#FF7B21] transition-colors">
                      {activity.description || activity.code}
                    </span>
                    {getActivityBadge(activity.status)}
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{formatTimeAgo(activity.createdAt)}</span>
                    <span className="hidden sm:inline text-border/50">•</span>
                    <span className="hidden sm:inline">{activity.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end pl-4 sm:pl-0">
                <span
                  className={`font-bold text-sm md:text-base ${
                    activity.amount && activity.amount > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground"
                  }`}
                >
                  {activity.amount
                    ? `+${formatVnd(activity.amount)}`
                    : "-"}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {activity.code}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentTransactions;
