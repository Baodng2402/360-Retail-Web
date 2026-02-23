import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import type { StatItem } from "@/features/dashboard/components/DashboardStats";
import { DollarSign, Users, ShoppingBag } from "lucide-react";
import ChartBar, {
  type ChartDataItem,
} from "@/shared/components/ui/chart-bar-mixed";
import type { ChartConfig } from "@/shared/components/ui/chart";
import ChartLineDefault from "@/shared/components/ui/chart-line-default";
import { Box } from "lucide-react";
import QuickActions from "@/features/dashboard/components/QuickActions";
import RecentTransactions from "@/features/dashboard/components/RecentTransactions";
import RestockModal from "@/features/dashboard/components/modals/RestockModal";
import CreateTaskModal from "@/features/dashboard/components/modals/CreateTaskModal";
import { StartTrialDialog } from "@/shared/components/ui/StartTrialDialog";
import { useState, useEffect } from "react";
import { authApi } from "@/shared/lib/authApi";
import { UserStatus } from "@/shared/types/jwt-claims";
import { Button } from "@/shared/components/ui/button";
import { Store, ArrowRight, Gift } from "lucide-react";
import { useAuthStore } from "@/shared/store/authStore";

const metrics: StatItem[] = [
  {
    label: "Today's Revenue",
    subLabel: "Doanh thu hôm nay",
    value: "₫2,450,000",
    change: "+12.5%",
    icon: DollarSign,
    color: "bg-teal-100 text-black",
  },
  {
    label: "Active Staff",
    subLabel: "Nhân viên đang làm",
    value: "8/12",
    change: "66%",
    icon: Users,
    color: "bg-orange-100 text-black",
  },
  {
    label: "New Orders",
    subLabel: "Đơn hàng mới",
    value: "34",
    change: "+8",
    icon: ShoppingBag,
    color: "bg-purple-100 text-black",
  },
  {
    label: "Monthly Revenue",
    subLabel: "Doanh thu hàng tháng",
    value: "₫2,450,000",
    change: "+12.5%",
    icon: DollarSign,
    color: "bg-teal-100 text-black",
  },
] as const;

const chartData: ChartDataItem[] = [
  { items: "Quần jeans", values: 12, fill: "#14b8a6" },
  { items: "Áo thun nam", values: 20, fill: "#3b82f6" },
  { items: "Giày Sneaker", values: 15, fill: "#a855f7" },
  { items: "Phụ kiện", values: 25, fill: "#f97316" },
];

const chartConfig = {
  values: { label: "Products Sold" },
} satisfies ChartConfig;

const DashboardPage = () => {
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({ name: "", image: "", stock: 0 });
  const [selectedFeedback, setSelectedFeedback] = useState({ customer: "", issue: "" });
  const [userStatus, setUserStatus] = useState<"loading" | "hasStore" | "noStore">("loading");
  const [showStartTrialDialog, setShowStartTrialDialog] = useState(false);
  const { user } = useAuthStore();

  const checkUserStoreStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserStatus("noStore");
        return;
      }

      const userInfo = await authApi.meWithSubscription();
      if (userInfo.status === UserStatus.Registered || !userInfo.storeId) {
        setUserStatus("noStore");
      } else {
        setUserStatus("hasStore");
      }
    } catch {
      setUserStatus("noStore");
    }
  };

  useEffect(() => {
    checkUserStoreStatus();
  }, []);

  const handleCreateStore = () => {
    setShowStartTrialDialog(true);
  };

  const handleRestockClick = (product: { name: string; image: string; stock: number }) => {
    setSelectedProduct(product);
    setRestockModalOpen(true);
  };

  const handleCreateTaskClick = (feedback: { customer: string; issue: string }) => {
    setSelectedFeedback(feedback);
    setCreateTaskModalOpen(true);
  };

  if (userStatus === "noStore") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
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

          {/* Modal tạo cửa hàng dùng thử - phải render trong noStore view để hiển thị khi bấm CTA */}
          <StartTrialDialog
            open={showStartTrialDialog}
            onOpenChange={setShowStartTrialDialog}
            userEmail={user?.email}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <DashboardStats stats={metrics} />
      </section>

      <section>
        <QuickActions />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full items-start">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartBar
              chartData={chartData}
              chartConfig={chartConfig}
              className=""
              title="Top 5 sản phẩm bán chạy"
            />
            <ChartLineDefault />
          </div>
          <RecentTransactions />
        </div>

        <div className="xl:col-span-1">
          <div className="w-full border border-border rounded-md p-4 md:p-6 bg-card xl:sticky xl:top-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  Alerts & Warnings
                </h3>
                <span className="text-sm text-muted-foreground">
                  Cảnh báo cần xử lý
                </span>
              </div>
              <div className="p-2 bg-destructive/10 rounded-lg">
                <svg
                  className="w-6 h-6 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Box className="w-5 h-5" />
                <span className="text-sm md:text-base">
                  Low Stock / Tồn kho thấp
                </span>
              </div>
              <ul className="flex flex-col gap-3">
                <li className="bg-destructive/10 p-3 md:p-4 rounded-xl border border-destructive/20 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      Áo thun trắng size M
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Only 3 items left
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleRestockClick({
                        name: "Áo thun trắng size M",
                        image: "👕",
                        stock: 3,
                      })
                    }
                    className="px-4 md:px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-semibold rounded-full transition-all shadow-sm whitespace-nowrap"
                  >
                    Restock
                  </button>
                </li>
                <li className="bg-yellow-500/10 dark:bg-yellow-500/20 p-3 md:p-4 rounded-xl border border-yellow-500/30 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      Giày sneaker đen size 42
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Only 5 items left
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleRestockClick({
                        name: "Giày sneaker đen size 42",
                        image: "👟",
                        stock: 5,
                      })
                    }
                    className="px-4 md:px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-semibold rounded-full transition-all shadow-sm whitespace-nowrap"
                  >
                    Restock
                  </button>
                </li>
                <li className="bg-yellow-500/10 dark:bg-yellow-500/20 p-3 md:p-4 rounded-xl border border-yellow-500/30 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      Quần jean xanh size 30
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Only 8 items left
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleRestockClick({
                        name: "Quần jean xanh size 30",
                        image: "👖",
                        stock: 8,
                      })
                    }
                    className="px-4 md:px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-semibold rounded-full transition-all shadow-sm whitespace-nowrap"
                  >
                    Restock
                  </button>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-sm md:text-base">
                  Negative Feedback / Phản hồi tiêu cực
                </span>
              </div>
              <ul className="flex flex-col gap-3">
                <li className="bg-destructive/10 p-3 md:p-4 rounded-xl border border-destructive/20">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        Nguyễn Thị I
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Sản phẩm không đúng mô tả
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= 2
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-stone-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      2h ago
                    </span>
                    <button
                      onClick={() =>
                        handleCreateTaskClick({
                          customer: "Nguyễn Thị I",
                          issue: "Sản phẩm không đúng mô tả",
                        })
                      }
                      className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-full transition-all shadow-sm text-sm whitespace-nowrap"
                    >
                      Create Task
                    </button>
                  </div>
                </li>
                <li className="bg-destructive/10 p-3 md:p-4 rounded-xl border border-destructive/20">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        Trần Văn J
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Giao hàng chậm
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= 2
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-stone-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      5h ago
                    </span>
                    <button
                      onClick={() =>
                        handleCreateTaskClick({
                          customer: "Trần Văn J",
                          issue: "Giao hàng chậm",
                        })
                      }
                      className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-full transition-all shadow-sm text-sm whitespace-nowrap"
                    >
                      Create Task
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <RestockModal
        open={restockModalOpen}
        onOpenChange={setRestockModalOpen}
        product={selectedProduct}
      />
      <CreateTaskModal
        open={createTaskModalOpen}
        onOpenChange={setCreateTaskModalOpen}
        feedbackData={selectedFeedback}
      />

    </div>
  );
};

export default DashboardPage;
