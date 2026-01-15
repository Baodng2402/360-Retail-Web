import {
  DollarSign,
  Users,
  ShoppingBag,
  Gift,
  TrendingUp,
  UserPlus,
  Package,
  Send,
  Clock,
} from "lucide-react";

const metrics = [
  {
    title: "Today's Revenue",
    titleVn: "Doanh thu hôm nay",
    value: "₫2,450,000",
    change: "+12.5%",
    icon: DollarSign,
    color: "from-teal-500 to-teal-600",
  },
  {
    title: "Active Staff",
    titleVn: "Nhân viên đang làm",
    value: "8/12",
    change: "66%",
    icon: Users,
    color: "from-orange-500 to-orange-600",
  },
  {
    title: "New Orders",
    titleVn: "Đơn hàng mới",
    value: "34",
    change: "+8",
    icon: ShoppingBag,
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "Loyalty Points Given",
    titleVn: "Điểm tích lũy",
    value: "1,240",
    change: "+156",
    icon: Gift,
    color: "from-pink-500 to-pink-600",
  },
] as const;

const topProducts = [
  { name: "Cà phê Sữa Đá", sales: 45, revenue: "₫675,000", image: "☕" },
  { name: "Bánh Mì Thịt", sales: 38, revenue: "₫570,000", image: "🥖" },
  { name: "Trà Sữa Trân Châu", sales: 32, revenue: "₫480,000", image: "🧋" },
] as const;

const staffRanking = [
  { name: "Nguyễn Văn A", sales: "₫1,250,000", orders: 28, avatar: "A" },
  { name: "Trần Thị B", sales: "₫980,000", orders: 24, avatar: "B" },
  { name: "Lê Văn C", sales: "₫850,000", orders: 19, avatar: "C" },
] as const;

const recentActivity = [
  {
    action: "New order #1234",
    customer: "Nguyễn Thị D",
    time: "2 mins ago",
    type: "order",
  },
  {
    action: "Staff check-in",
    customer: "Trần Văn E",
    time: "15 mins ago",
    type: "checkin",
  },
  {
    action: "Loyalty points redeemed",
    customer: "Phạm Thị F",
    time: "32 mins ago",
    type: "points",
  },
  {
    action: "Low stock alert",
    customer: "Bánh Mì Pate",
    time: "1 hour ago",
    type: "alert",
  },
] as const;

const DashboardPage = () => {
  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <section>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold text-stone-900 tracking-[-0.02em] mb-2">
          Welcome Back! 👋
        </h1>
        <p className="text-base text-stone-500 tracking-[0.01em]">
          Chào mừng trở lại · Here's what's happening with your shop today
        </p>
      </section>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="relative bg-white rounded-[24px] p-6 border border-stone-200 shadow-lg shadow-black/5 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-2xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-[12px] font-semibold">
                  {metric.change}
                </span>
              </div>
              <p className="text-[13px] text-stone-500 mb-1">
                {metric.titleVn}
              </p>
              <p className="text-[28px] font-extrabold text-stone-900 tracking-[-0.01em]">
                {metric.value}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-1 bg-white rounded-[24px] p-6 border border-stone-200 shadow-lg shadow-black/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] font-bold text-stone-900">
              Top Selling
              <br />
              <span className="text-[14px] font-normal text-stone-500">
                Bán chạy nhất
              </span>
            </h3>
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div
                key={product.name}
                className="flex items-center gap-4 p-3 bg-teal-50/50 rounded-2xl"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl">
                  {product.image}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-stone-900">
                    {product.name}
                  </p>
                  <p className="text-[12px] text-stone-500">
                    {product.sales} orders
                  </p>
                </div>
                <p className="text-[14px] font-bold text-teal-700">
                  {product.revenue}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Ranking */}
        <div className="lg:col-span-1 bg-white rounded-[24px] p-6 border border-stone-200 shadow-lg shadow-black/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] font-bold text-stone-900">
              Staff Ranking
              <br />
              <span className="text-[14px] font-normal text-stone-500">
                Xếp hạng nhân viên
              </span>
            </h3>
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <div className="space-y-4">
            {staffRanking.map((staff, index) => (
              <div key={staff.name} className="flex items-center gap-4">
                <div
                  className={[
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    index === 0
                      ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
                      : index === 1
                      ? "bg-gradient-to-br from-gray-300 to-gray-400"
                      : "bg-gradient-to-br from-orange-300 to-orange-400",
                  ].join(" ")}
                >
                  <span className="text-[14px] font-bold text-white">
                    {staff.avatar}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-stone-900">
                    {staff.name}
                  </p>
                  <p className="text-[12px] text-stone-500">
                    {staff.orders} orders
                  </p>
                </div>
                <p className="text-[14px] font-bold text-stone-900">
                  {staff.sales}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1 bg-white rounded-[24px] p-6 border border-stone-200 shadow-lg shadow-black/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] font-bold text-stone-900">
              Recent Activity
              <br />
              <span className="text-[14px] font-normal text-stone-500">
                Hoạt động gần đây
              </span>
            </h3>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={`${activity.action}-${activity.time}`}
                className="flex items-start gap-3"
              >
                <div
                  className={[
                    "w-2 h-2 rounded-full mt-2",
                    activity.type === "order"
                      ? "bg-teal-500"
                      : activity.type === "checkin"
                      ? "bg-orange-500"
                      : activity.type === "points"
                      ? "bg-purple-500"
                      : "bg-red-500",
                  ].join(" ")}
                />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-stone-900">
                    {activity.action}
                  </p>
                  <p className="text-[12px] text-stone-500">
                    {activity.customer}
                  </p>
                </div>
                <p className="text-[11px] text-stone-400">
                  {activity.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h3 className="text-[20px] font-bold text-stone-900">
          Quick Actions ·{" "}
          <span className="text-[16px] font-normal text-stone-500">
            Thao tác nhanh
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="group flex items-center gap-4 p-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-[24px] text-white shadow-lg shadow-teal-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <UserPlus className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <p className="text-[16px] font-bold">Add Staff</p>
              <p className="text-[13px] opacity-90">Thêm nhân viên</p>
            </div>
          </button>

          <button className="group flex items-center gap-4 p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[24px] text-white shadow-lg shadow-orange-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Package className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <p className="text-[16px] font-bold">Add Product</p>
              <p className="text-[13px] opacity-90">Thêm sản phẩm</p>
            </div>
          </button>

          <button className="group flex items-center gap-4 p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-[24px] text-white shadow-lg shadow-purple-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Send className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <p className="text-[16px] font-bold">Send ZNS</p>
              <p className="text-[13px] opacity-90">Gửi tin nhắn Zalo</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

