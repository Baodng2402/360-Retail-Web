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
import type {
  OrderStatusOverview,
  InventorySummary,
  RecentActivityItem,
} from "@/shared/lib/salesDashboardApi";
import { useDashboardEventsStore } from "@/shared/store/dashboardEventsStore";
import { Card } from "@/shared/components/ui/card";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import { Badge } from "@/shared/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const DashboardPage = () => {
  const { t: tDashboard } = useTranslation("dashboard");
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

  const [orderStatusOverview, setOrderStatusOverview] =
    useState<OrderStatusOverview | null>(null);
  const [inventorySummary, setInventorySummary] =
    useState<InventorySummary | null>(null);

  const orderCodeToId = useMemo(() => {
    const m: Record<string, string> = {};
    for (const o of recentOrders) {
      if (o.code) m[o.code] = o.id;
    }
    return m;
  }, [recentOrders]);

  // Subscription expiry warning
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [expiryInfo, setExpiryInfo] = useState<any>(null);

  const chartConfig = useMemo(
    () =>
      ({
        values: { label: tDashboard("dashboardPage.charts.productsSold") },
      }) satisfies ChartConfig,
    [tDashboard],
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
    // Load subscription expiry for StoreOwner
    if (user?.role === "StoreOwner") {
      subscriptionApi.getMyExpiry().then(setExpiryInfo).catch(() => null);
    }
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
          orderStatusRes,
          inventorySummaryRes,
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
            top: 8,
          }),
          salesDashboardApi.getRecentActivity(20),
          employeesApi.getEmployees(true).catch(() => []),
          productsApi.getProducts({ pageSize: 100, includeInactive: false }),
          ordersApi
            .getOrdersPaged({ page: 1, pageSize: 80 })
            .then((res) => res.items)
            .catch(() => []),
          salesDashboardApi
            .getOrderStatus({
              from: rangeFrom.toISOString(),
              to: now.toISOString(),
            })
            .catch(() => null),
          salesDashboardApi.getInventorySummary().catch(() => null),
        ]);

        setOverview(overviewRes);
        setTodayOverview(todayOverviewRes);
        setOrders(
          (activityRes.activities || []).map((a) => {
            const ext = a as RecentActivityItem & { reference_id?: string };
            return {
              ...a,
              referenceId: ext.referenceId ?? ext.reference_id,
            };
          }),
        );
        setEmployees(employeesRes);
        setProducts(productsRes);
        setRecentOrders(recentOrdersRes);
        setOrderStatusOverview(orderStatusRes);
        setInventorySummary(inventorySummaryRes);

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
        ? tDashboard("dashboardPage.range.today")
        : dateRange === "7d"
          ? tDashboard("dashboardPage.range.7d")
          : tDashboard("dashboardPage.range.30d");

    const items: StatItem[] = [
      {
        label: tDashboard("dashboardPage.stats.totalRevenueLabel"),
        subLabel: tDashboard("dashboardPage.stats.totalRevenueSubLabel", {
          range: rangeLabel,
        }),
        value: formatVnd(overview.totalRevenue),
        change:
          hasRevenueGrowth && dateRange !== "today"
            ? `${overview.revenueGrowth.toFixed(1)}%`
            : null,
        icon: DollarSign,
        color: "bg-teal-100 text-black",
      },
      {
        label: tDashboard("dashboardPage.stats.totalOrdersLabel"),
        subLabel: tDashboard("dashboardPage.stats.totalOrdersSubLabel", {
          range: rangeLabel,
        }),
        value: String(overview.totalOrders),
        change:
          hasOrderGrowth && dateRange !== "today"
            ? `${overview.orderGrowth.toFixed(1)}%`
            : null,
        icon: ShoppingBag,
        color: "bg-purple-100 text-black",
      },
      {
        label: tDashboard("dashboardPage.stats.avgOrderValueLabel"),
        subLabel: tDashboard("dashboardPage.stats.avgOrderValueSubLabel"),
        value: formatVnd(overview.avgOrderValue),
        change: null,
        icon: DollarSign,
        color: "bg-teal-100 text-black",
      },
      {
        label: tDashboard("dashboardPage.stats.activeEmployeesLabel"),
        subLabel: tDashboard("dashboardPage.stats.activeEmployeesSubLabel"),
        value: `${activeEmployees.length}/${employees.length}`,
        change: undefined,
        icon: Users,
        color: "bg-orange-100 text-black",
      },
    ];

    if (todayOverview) {
      items.unshift({
        label: tDashboard("dashboardPage.stats.todayRevenueLabel"),
        subLabel: tDashboard("dashboardPage.stats.todayRevenueSubLabel"),
        value: formatVnd(todayOverview.totalRevenue),
        change: null,
        icon: DollarSign,
        color: "bg-emerald-100 text-black",
      });
    }

    return items;
  }, [overview, employees, dateRange, todayOverview]);

  // formatOrderTime hiện không được dùng trong UI sau khi đơn hàng được tách sang trang khác,
  // nên tạm thời bỏ để tránh cảnh báo TypeScript.

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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center shadow-xl shadow-orange-500/30">
              <Store className="h-10 w-10 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-lg"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
            {tDashboard("dashboardPage.onboarding.welcomeTitle")}
          </h1>

          <p className="text-muted-foreground text-lg mb-8">
            {tDashboard("dashboardPage.onboarding.needStore")}
            <br />
            <span
              dangerouslySetInnerHTML={{
                __html: tDashboard("dashboardPage.onboarding.trialCta"),
              }}
            />
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 mb-8 text-left border border-border/50 shadow-lg"
          >
            <h3 className="font-semibold mb-4">
              {tDashboard("dashboardPage.onboarding.benefitsTitle")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-md">
                  <Gift className="h-4 w-4 text-white" />
                </div>
                <span>
                  {tDashboard("dashboardPage.onboarding.benefits.noCard")}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF7B21] to-[#FF9F45] flex items-center justify-center shadow-md">
                  <Store className="h-4 w-4 text-white" />
                </div>
                <span>
                  {tDashboard("dashboardPage.onboarding.benefits.setupStore")}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#19D6C8] to-cyan-500 flex items-center justify-center shadow-md">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
                <span>
                  {tDashboard("dashboardPage.onboarding.benefits.fullAccess")}
                </span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button
              onClick={handleCreateStore}
              className="h-12 w-full text-lg font-semibold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]"
            >
              <Gift className="mr-2 h-5 w-5" />
              {tDashboard("dashboardPage.onboarding.createStore")}
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              {tDashboard("dashboardPage.onboarding.afterTrialNote")}
            </p>
          </motion.div>

          <StartTrialDialog
            open={showStartTrialDialog}
            onOpenChange={setShowStartTrialDialog}
            userEmail={user?.email}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Subscription Expiry Warning */}
      {expiryInfo && expiryInfo.daysRemaining !== undefined && expiryInfo.daysRemaining <= 14 && (
        <motion.div variants={itemVariants}>
          <Card className="border-amber-200/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30 px-4 py-3 flex items-center gap-3 shadow-lg shadow-amber-500/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 text-sm">
              <span className="font-medium text-amber-900 dark:text-amber-200">
                {tDashboard("dashboardPage.expiry.title")}
              </span>{" "}
              <span className="text-amber-800 dark:text-amber-300">
                <span
                  dangerouslySetInnerHTML={{
                    __html: tDashboard(
                      expiryInfo.endDate
                        ? "dashboardPage.expiry.remainingWithEndDate"
                        : "dashboardPage.expiry.remainingNoEndDate",
                      {
                        days: expiryInfo.daysRemaining,
                        endDate: expiryInfo.endDate,
                      },
                    ),
                  }}
                />
              </span>
            </div>
            <Badge variant="warning" className="shrink-0">
              {tDashboard("dashboardPage.expiry.badgeDays", {
                days: expiryInfo.daysRemaining,
              })}
            </Badge>
          </Card>
        </motion.div>
      )}

      <motion.section
        variants={itemVariants}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            {tDashboard("dashboardPage.sections.salesOverview")}
          </h2>
          <div className="inline-flex rounded-xl border bg-background p-1 text-xs sm:text-sm shadow-sm">
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all duration-200",
                dateRange === "today"
                  ? "bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-md"
                  : "text-muted-foreground hover:bg-accent"
              )}
              onClick={() => setDateRange("today")}
            >
              {tDashboard("dashboardPage.actions.today")}
            </button>
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all duration-200",
                dateRange === "7d"
                  ? "bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-md"
                  : "text-muted-foreground hover:bg-accent"
              )}
              onClick={() => setDateRange("7d")}
            >
              {tDashboard("dashboardPage.actions.days7")}
            </button>
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all duration-200",
                dateRange === "30d"
                  ? "bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-md"
                  : "text-muted-foreground hover:bg-accent"
              )}
              onClick={() => setDateRange("30d")}
            >
              {tDashboard("dashboardPage.actions.days30")}
            </button>
          </div>
        </div>
        <DashboardStats stats={stats} />
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full items-start min-w-0"
      >
        <div className="xl:col-span-2 flex flex-col gap-4 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
            <ChartBar
              chartData={chartBarData}
              chartConfig={chartConfig}
              title={tDashboard("dashboardPage.charts.topProductsTitle")}
            />
            <ChartLineDefault
              data={chartLineData}
              isLoading={dashboardLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
            <Card className="p-4 min-w-0">
              <h3 className="text-sm font-semibold mb-3">
                {tDashboard("dashboardPage.charts.orderStatusTitle", {
                  defaultValue: "Đơn hàng theo trạng thái",
                })}
              </h3>
              {orderStatusOverview &&
              orderStatusOverview.statuses?.length > 0 ? (
                <ul className="space-y-2.5">
                  {orderStatusOverview.statuses.map((s) => (
                    <li key={s.status} className="space-y-1">
                      <div className="flex justify-between text-xs gap-2">
                        <span className="text-muted-foreground truncate">
                          {s.status}
                        </span>
                        <span className="font-medium tabular-nums shrink-0">
                          {s.count}{" "}
                          <span className="text-muted-foreground font-normal">
                            ({s.percentage.toFixed(0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF7B21] to-[#19D6C8]"
                          style={{
                            width: `${Math.min(100, Math.max(0, s.percentage))}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  {dashboardLoading
                    ? "…"
                    : tDashboard("dashboardPage.charts.noOrderStatus", {
                        defaultValue: "Chưa có dữ liệu",
                      })}
                </p>
              )}
            </Card>

            <Card className="p-4 min-w-0">
              <h3 className="text-sm font-semibold mb-3">
                {tDashboard("dashboardPage.charts.inventoryTitle", {
                  defaultValue: "Tổng quan tồn kho",
                })}
              </h3>
              {inventorySummary ? (
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <div className="text-lg font-bold tabular-nums">
                      {inventorySummary.totalProducts}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {tDashboard("dashboardPage.charts.skuTotal", {
                        defaultValue: "SKU",
                      })}
                    </div>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-3">
                    <div className="text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {inventorySummary.inStockCount}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {tDashboard("dashboardPage.charts.inStock", {
                        defaultValue: "Còn hàng",
                      })}
                    </div>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 p-3">
                    <div className="text-lg font-bold tabular-nums text-amber-800 dark:text-amber-400">
                      {inventorySummary.lowStockCount}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {tDashboard("dashboardPage.charts.lowStock", {
                        defaultValue: "Sắp hết",
                      })}
                    </div>
                  </div>
                  <div className="rounded-lg bg-red-500/10 p-3">
                    <div className="text-lg font-bold tabular-nums text-red-700 dark:text-red-400">
                      {inventorySummary.outOfStockCount}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {tDashboard("dashboardPage.charts.outOfStock", {
                        defaultValue: "Hết hàng",
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  {dashboardLoading
                    ? "…"
                    : tDashboard("dashboardPage.charts.noInventory", {
                        defaultValue: "Chưa có dữ liệu",
                      })}
                </p>
              )}
            </Card>
          </div>

          <RecentTransactions
            activities={orders}
            isLoading={dashboardLoading}
            orderCodeToId={orderCodeToId}
          />
        </div>

        <div className="xl:col-span-1 min-w-0">
          <DashboardAlerts
            lowStockProducts={lowStockProducts}
            onRestockClick={handleRestockClick}
          />
        </div>
      </motion.section>

      <RestockModal
        open={restockModalOpen}
        onOpenChange={setRestockModalOpen}
        product={selectedProduct}
      />
    </motion.div>
  );
};

export default DashboardPage;
