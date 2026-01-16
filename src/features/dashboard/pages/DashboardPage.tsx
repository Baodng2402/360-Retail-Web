import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import type { StatItem } from "@/features/dashboard/components/DashboardStats";
import { DollarSign, Users, ShoppingBag } from "lucide-react";
import ChartBar, { type ChartDataItem } from "@/components/chart-bar-mixed";
import type { ChartConfig } from "@/components/ui/chart";
import ChartLineDefault from "@/components/chart-line-default";
import { Box } from "lucide-react";
import DateTimeClock from "@/features/dashboard/components/DateTimeClock";
import QuickActions from "@/features/dashboard/components/QuickActions";
import RecentTransactions from "@/features/dashboard/components/RecentTransactions";
import RestockModal from "@/features/dashboard/components/modals/RestockModal";
import CreateTaskModal from "@/features/dashboard/components/modals/CreateTaskModal";
import { useState } from "react";

const metrics: StatItem[] = [
  {
    label: "Today's Revenue",
    subLabel: "Doanh thu hôm nay",
    value: "₫2,450,000",
    change: "+12.5%",
    icon: DollarSign,
    color: "bg-teal-100",
  },
  {
    label: "Active Staff",
    subLabel: "Nhân viên đang làm",
    value: "8/12",
    change: "66%",
    icon: Users,
    color: "bg-orange-100",
  },
  {
    label: "New Orders",
    subLabel: "Đơn hàng mới",
    value: "34",
    change: "+8",
    icon: ShoppingBag,
    color: "bg-purple-100",
  },
  {
    label: "Monthly Revenue",
    subLabel: "Doanh thu hàng tháng",
    value: "₫2,450,000",
    change: "+12.5%",
    icon: DollarSign,
    color: "bg-teal-100",
  },
] as const;

const chartData: ChartDataItem[] = [
  {
    items: "Quần jeans",
    values: 12,
    fill: "#14b8a6", // Teal
  },
  {
    items: "Áo thun nam",
    values: 20,
    fill: "#3b82f6", // Blue
  },
  {
    items: "Giày Sneaker",
    values: 15,
    fill: "#a855f7", // Purple
  },
  {
    items: "Phụ kiện",
    values: 25,
    fill: "#f97316", // Orange
  },
];

const chartConfig = {
  values: {
    label: "Products Sold",
  },
} satisfies ChartConfig;

const DashboardPage = () => {
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({
    name: "",
    image: "",
    stock: 0,
  });
  const [selectedFeedback, setSelectedFeedback] = useState({
    customer: "",
    issue: "",
  });

  const handleRestockClick = (product: {
    name: string;
    image: string;
    stock: number;
  }) => {
    setSelectedProduct(product);
    setRestockModalOpen(true);
  };

  const handleCreateTaskClick = (feedback: {
    customer: string;
    issue: string;
  }) => {
    setSelectedFeedback(feedback);
    setCreateTaskModalOpen(true);
  };

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold text-stone-900 tracking-[-0.02em] mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-base text-stone-500 tracking-[0.01em]">
            Chào mừng trở lại · Here's what's happening with your shop today
          </p>
        </div>
        <DateTimeClock />
      </section>
      <section>
        <DashboardStats stats={metrics} />
      </section>

      {/* Quick Actions Section */}
      <section>
        <QuickActions />
      </section>

      {/* Grid Layout: Charts Left, Alerts Right */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
        {/* Left Side - Charts (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Charts Row - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Right Side - Alerts (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="w-full border rounded-md p-6 bg-background sticky top-6">
            {/* Header with Alert Icon */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-stone-900">
                  Alerts & Warnings
                </h3>
                <span className="text-sm text-stone-500">
                  Cảnh báo cần xử lý
                </span>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-red-500"
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

            {/* Low Stock Section */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-2 font-semibold text-stone-900">
                <Box className="w-5 h-5" />
                <span>Low Stock / Tồn kho thấp</span>
              </div>
              <ul className="flex flex-col gap-3">
                <li className="bg-red-50 p-4 rounded-xl border border-red-200 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-semibold text-stone-900">
                      Áo thun trắng size M
                    </span>
                    <span className="text-sm text-stone-500">
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
                    className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-full transition-all shadow-sm"
                  >
                    Restock
                  </button>
                </li>
                <li className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-semibold text-stone-900">
                      Giày sneaker đen size 42
                    </span>
                    <span className="text-sm text-stone-500">
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
                    className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-full transition-all shadow-sm"
                  >
                    Restock
                  </button>
                </li>
                <li className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-semibold text-stone-900">
                      Quần jean xanh size 30
                    </span>
                    <span className="text-sm text-stone-500">
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
                    className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-full transition-all shadow-sm"
                  >
                    Restock
                  </button>
                </li>
              </ul>
            </div>

            {/* Negative Feedback Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 font-semibold text-stone-900">
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
                <span>Negative Feedback / Phản hồi tiêu cực</span>
              </div>
              <ul className="flex flex-col gap-3">
                <li className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-stone-900">
                        Nguyễn Thị I
                      </span>
                      <span className="text-sm text-stone-500">
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
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-stone-400">2h ago</span>
                    <button
                      onClick={() =>
                        handleCreateTaskClick({
                          customer: "Nguyễn Thị I",
                          issue: "Sản phẩm không đúng mô tả",
                        })
                      }
                      className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-full transition-all shadow-sm text-sm"
                    >
                      Create Task
                    </button>
                  </div>
                </li>
                <li className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-stone-900">
                        Trần Văn J
                      </span>
                      <span className="text-sm text-stone-500">
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
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-stone-400">5h ago</span>
                    <button
                      onClick={() =>
                        handleCreateTaskClick({
                          customer: "Trần Văn J",
                          issue: "Giao hàng chậm",
                        })
                      }
                      className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-full transition-all shadow-sm text-sm"
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

      {/* Modals */}
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
