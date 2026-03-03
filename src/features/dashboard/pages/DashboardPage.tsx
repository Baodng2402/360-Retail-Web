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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
          overviewRes,
          revenueChart,
          topProducts,
          activityRes,
          employeesRes,
          productsRes,
        ] = await Promise.all([
          salesDashboardApi.getOverview({
            from: monthStart.toISOString(),
            to: new Date().toISOString(),
          }),
          salesDashboardApi.getRevenueChart({
            from: monthStart.toISOString(),
            to: new Date().toISOString(),
            groupBy: "month",
          }),
          salesDashboardApi.getTopProducts({
            from: monthStart.toISOString(),
            to: new Date().toISOString(),
            top: 5,
          }),
          salesDashboardApi.getRecentActivity(20),
          employeesApi.getEmployees(true).catch(() => []),
          productsApi.getProducts({ pageSize: 100, includeInactive: false }),
        ]);

        setOverview(overviewRes);
        setOrders(activityRes.activities || []);
        setEmployees(employeesRes);
        setProducts(productsRes);

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

    loadDashboardData();
  }, [userStatus]);

  const stats: StatItem[] = useMemo(() => {
    if (!overview) return [];
    const activeEmployees = employees.filter((e) => e.isActive);

    return [
      {
        label: "Total Revenue",
        subLabel: "Doanh thu (30 ngày)",
        value: formatVnd(overview.totalRevenue),
        change:
          overview.revenueGrowth !== undefined
            ? `${overview.revenueGrowth.toFixed(1)}%`
            : null,
        icon: DollarSign,
        color: "bg-teal-100 text-black",
      },
      {
        label: "Total Orders",
        subLabel: "Đơn hàng (30 ngày)",
        value: String(overview.totalOrders),
        change:
          overview.orderGrowth !== undefined
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
  }, [overview, employees]);

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
      <section>
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
          <RecentTransactions orders={orders} isLoading={dashboardLoading} />
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
