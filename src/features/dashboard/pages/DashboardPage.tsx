import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import type { StatItem } from "@/features/dashboard/components/DashboardStats";
import { DollarSign, Users, ShoppingBag } from "lucide-react";
import ChartBar, {
  type ChartDataItem,
} from "@/shared/components/ui/chart-bar-mixed";
import type { ChartConfig } from "@/shared/components/ui/chart";
import ChartLineDefault, {
  type ChartLineDataItem,
} from "@/shared/components/ui/chart-line-default";
import QuickActions from "@/features/dashboard/components/QuickActions";
import RecentTransactions from "@/features/dashboard/components/RecentTransactions";
import DashboardAlerts from "@/features/dashboard/components/DashboardAlerts";
import RestockModal from "@/features/dashboard/components/modals/RestockModal";
import { StartTrialDialog } from "@/shared/components/ui/StartTrialDialog";
import { useState, useEffect, useMemo } from "react";
import { authApi } from "@/shared/lib/authApi";
import { UserStatus } from "@/shared/types/jwt-claims";
import { Button } from "@/shared/components/ui/button";
import { Store, ArrowRight, Gift } from "lucide-react";
import { useAuthStore } from "@/shared/store/authStore";
import { productsApi } from "@/shared/lib/productsApi";
import { employeesApi } from "@/shared/lib/employeesApi";
import { salesDashboardApi } from "@/shared/lib/salesDashboardApi";
import { formatVnd } from "@/shared/utils/formatMoney";
import { motion } from "motion/react";
import { ordersApi } from "@/shared/lib/ordersApi";
import type { Order } from "@/shared/types/orders";
import { useDashboardEventsStore } from "@/shared/store/dashboardEventsStore";
import { Card } from "@/shared/components/ui/card";

const chartConfig = {
  values: { label: "Products Sold" },
} satisfies ChartConfig;

const DashboardPage = () => {
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({
    name: "",
    image: "",
    stock: 0,
  });
  const [userStatus, setUserStatus] = useState<
    "loading" | "hasStore" | "noStore"
  >("loading");
  const [showStartTrialDialog, setShowStartTrialDialog] = useState(false);
  const { user } = useAuthStore();

  const [overview, setOverview] = useState<
    Awaited<ReturnType<typeof salesDashboardApi.getOverview>> | null
  >(null);
  const [orders, setOrders] = useState<
    Awaited<ReturnType<typeof salesDashboardApi.getRecentActivity>>["activities"]
  >([]);
  const [products, setProducts] = useState<
    Awaited<ReturnType<typeof productsApi.getProducts>>
  >([]);
  const [employees, setEmployees] = useState<
    Awaited<ReturnType<typeof employeesApi.getEmployees>>
  >([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [chartBarData, setChartBarData] = useState<ChartDataItem[]>([]);
  const [chartLineData, setChartLineData] = useState<ChartLineDataItem[]>([]);
  const [todayOverview, setTodayOverview] = useState<
    Awaited<ReturnType<typeof salesDashboardApi.getOverview>> | null
  >(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "today">("30d");
  const lastOrderCreatedAt = useDashboardEventsStore(
    (state) => state.lastOrderCreatedAt,
  );

  const checkUserStoreStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserStatus("noStore");
        return;
      }
      const userInfo = await authApi.meWithSubscription();
      const pendingGoogleNewUser = sessionStorage.getItem("pendingGoogleNewUser");
      const needsOnboarding =
        pendingGoogleNewUser ||
        userInfo.status === UserStatus.Registered ||
        !userInfo.storeId;
      if (needsOnboarding) {
        setUserStatus("noStore");
      } else {
        sessionStorage.removeItem("pendingGoogleNewUser");
        setUserStatus("hasStore");
      }
    } catch {
      setUserStatus("noStore");
    }
  };

  useEffect(() => {
    checkUserStoreStatus();
  }, []);

  useEffect(() => {
    if (userStatus !== "hasStore") return;

    const loadDashboardData = async () => {
      setDashboardLoading(true);
      try {
        const now = new Date();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        let rangeFrom: Date;
        switch (dateRange) {
          case "today":
            rangeFrom = todayStart;
            break;
          case "7d":
            rangeFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
          default:
            rangeFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }

        const [
          overviewRes,
          todayOverviewRes,
          revenueChart,
          topProducts,
          activityRes,
          employeesRes,
          productsRes,
          recentOrdersRes,
        ] = await Promise.all([
          salesDashboardApi.getOverview({
            from: rangeFrom.toISOString(),
            to: now.toISOString(),
          }),
          salesDashboardApi.getOverview({
            from: todayStart.toISOString(),
            to: now.toISOString(),
          }),
          salesDashboardApi.getRevenueChart({
            from: rangeFrom.toISOString(),
            to: now.toISOString(),
            groupBy: "month",
          }),
          salesDashboardApi.getTopProducts({
            from: rangeFrom.toISOString(),
            to: now.toISOString(),
            top: 5,
          }),
          salesDashboardApi.getRecentActivity(20),
          employeesApi.getEmployees(true).catch(() => []),
          productsApi.getProducts({ pageSize: 100, includeInactive: false }),
          ordersApi
            .getOrdersPaged({ page: 1, pageSize: 5 })
            .then((res) => res.items)
            .catch(() => []),
        ]);

        setOverview(overviewRes);
        setTodayOverview(todayOverviewRes);
        setOrders(activityRes.activities || []);
        setEmployees(employeesRes);
        setProducts(productsRes);
        setRecentOrders(recentOrdersRes);

        const barData: ChartDataItem[] = topProducts.map((p, index) => ({
          items: p.productName,
          values: p.quantitySold,
          fill: ["#14b8a6", "#3b82f6", "#a855f7", "#f97316", "#22c55e"][
            index % 5
          ],
        }));
        setChartBarData(barData);

        const lineData: ChartLineDataItem[] = revenueChart.dataPoints.map(
          (p) => ({
            month: p.label,
            desktop: p.revenue,
          }),
        );
        setChartLineData(lineData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setDashboardLoading(false);
      }
    };

    void loadDashboardData();
  }, [userStatus, dateRange, lastOrderCreatedAt]);

  const stats: StatItem[] = useMemo(() => {
    if (!overview) return [];
    const activeEmployees = employees.filter((e) => e.isActive);

    const hasRevenueGrowth =
      typeof overview.revenueGrowth === "number" &&
      !Number.isNaN(overview.revenueGrowth);
    const hasOrderGrowth =
      typeof overview.orderGrowth === "number" &&
      !Number.isNaN(overview.orderGrowth);

    const rangeLabel =
      dateRange === "today"
        ? "Hôm nay"
        : dateRange === "7d"
          ? "7 ngày gần đây"
          : "30 ngày gần đây";

    const items: StatItem[] = [
      {
        label: "Total Revenue",
        subLabel: `Doanh thu (${rangeLabel})`,
        value: formatVnd(overview.totalRevenue),
        change:
          hasRevenueGrowth && dateRange !== "today"
            ? `${overview.revenueGrowth.toFixed(1)}%`
            : null,
        icon: DollarSign,
        color: "bg-teal-100 text-black",
      },
      {
        label: "Total Orders",
        subLabel: `Đơn hàng (${rangeLabel})`,
        value: String(overview.totalOrders),
        change:
          hasOrderGrowth && dateRange !== "today"
            ? `${overview.orderGrowth.toFixed(1)}%`
            : null,
        icon: ShoppingBag,
        color: "bg-purple-100 text-black",
      },
      {
        label: "Avg. Order Value",
        subLabel: "Giá trị đơn trung bình",
        value: formatVnd(overview.avgOrderValue),
        change: null,
        icon: DollarSign,
        color: "bg-teal-100 text-black",
      },
      {
        label: "Active Staff",
        subLabel: "Nhân viên đang làm",
        value: `${activeEmployees.length}/${employees.length}`,
        change: undefined,
        icon: Users,
        color: "bg-orange-100 text-black",
      },
    ];

    if (todayOverview) {
      items.unshift({
        label: "Today Revenue",
        subLabel: "Doanh thu hôm nay",
        value: formatVnd(todayOverview.totalRevenue),
        change: null,
        icon: DollarSign,
        color: "bg-emerald-100 text-black",
      });
    }

    return items;
  }, [overview, employees, dateRange, todayOverview]);

  const formatOrderTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay === 1) return "Hôm qua";
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return date.toLocaleString("vi-VN");
  };

  const lowStockProducts = useMemo(
    () =>
      products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 10),
    [products],
  );

  const handleCreateStore = () => {
    setShowStartTrialDialog(true);
  };

  const handleRestockClick = (product: {
    name: string;
    image: string;
    stock: number;
  }) => {
    setSelectedProduct(product);
    setRestockModalOpen(true);
  };

  if (userStatus === "noStore") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center"
      >
        <div className="w-full max-w-lg">
          <div className="mb-8 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Store className="h-10 w-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">
            Chào mừng bạn đến với 360 Retail!
          </h1>

          <p className="text-muted-foreground text-lg mb-8">
            Bạn cần tạo cửa hàng trước để bắt đầu quản lý doanh nghiệp của mình.
            <br />
            Đăng ký ngay để nhận <strong>7 ngày dùng thử miễn phí</strong>!
          </p>

          <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold mb-4">Bạn sẽ được:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-teal-500" />
                <span>7 ngày dùng thử miễn phí - Không cần thẻ tín dụng</span>
              </li>
              <li className="flex items-center gap-3">
                <Store className="h-5 w-5 text-blue-500" />
                <span>Tạo cửa hàng và quản lý sản phẩm ngay lập tức</span>
              </li>
              <li className="flex items-center gap-3">
                <ArrowRight className="h-5 w-5 text-purple-500" />
                <span>Truy cập tất cả tính năng quản lý bán hàng</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleCreateStore}
            className="h-12 w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-lg font-semibold"
          >
            <Gift className="mr-2 h-5 w-5" />
            Tạo cửa hàng ngay (Miễn phí 7 ngày)
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Sau 7 ngày, bạn có thể nâng cấp lên gói trả phí để tiếp tục sử dụng
          </p>

          <StartTrialDialog
            open={showStartTrialDialog}
            onOpenChange={setShowStartTrialDialog}
            userEmail={user?.email}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-10"
    >
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Tổng quan bán hàng
          </h2>
          <div className="inline-flex rounded-md border bg-background p-1 text-xs sm:text-sm">
            <button
              type="button"
              className={`px-3 py-1 rounded-md ${
                dateRange === "today"
                  ? "bg-teal-500 text-white"
                  : "text-muted-foreground"
              }`}
              onClick={() => setDateRange("today")}
            >
              Hôm nay
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-md ${
                dateRange === "7d"
                  ? "bg-teal-500 text-white"
                  : "text-muted-foreground"
              }`}
              onClick={() => setDateRange("7d")}
            >
              7 ngày
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-md ${
                dateRange === "30d"
                  ? "bg-teal-500 text-white"
                  : "text-muted-foreground"
              }`}
              onClick={() => setDateRange("30d")}
            >
              30 ngày
            </button>
          </div>
        </div>
        <DashboardStats stats={stats} />
      </section>

      <section>
        <QuickActions />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full items-start">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartBar
              chartData={chartBarData}
              chartConfig={chartConfig}
              title="Top 5 sản phẩm bán chạy"
            />
            <ChartLineDefault data={chartLineData} isLoading={dashboardLoading} />
          </div>
          <RecentTransactions activities={orders} isLoading={dashboardLoading} />

          <Card className="border border-border rounded-md p-4 md:p-6 bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Đơn hàng gần đây
                </h3>
                <p className="text-sm text-muted-foreground">
                  5 đơn mới nhất trong hệ thống
                </p>
              </div>
            </div>
            {dashboardLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded-md bg-muted/50 animate-pulse"
                  />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground text-sm">
                Chưa có đơn hàng nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="py-2 pr-3 text-left font-medium">
                        Mã đơn
                      </th>
                      <th className="py-2 px-3 text-left font-medium">
                        Khách hàng
                      </th>
                      <th className="py-2 px-3 text-left font-medium">
                        Tổng tiền
                      </th>
                      <th className="py-2 px-3 text-left font-medium">
                        Trạng thái
                      </th>
                      <th className="py-2 pl-3 text-right font-medium">
                        Thời gian
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="py-2 pr-3">
                          <span className="font-medium text-foreground">
                            {order.code || order.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-foreground">
                            {order.customerName || "Khách lẻ"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-foreground">
                            {formatVnd(order.totalAmount)}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-2 pl-3 text-right text-muted-foreground">
                          {formatOrderTime(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="xl:col-span-1">
          <DashboardAlerts
            lowStockProducts={lowStockProducts}
            onRestockClick={handleRestockClick}
          />
        </div>
      </section>

      <RestockModal
        open={restockModalOpen}
        onOpenChange={setRestockModalOpen}
        product={selectedProduct}
      />
    </motion.div>
  );
};

export default DashboardPage;
