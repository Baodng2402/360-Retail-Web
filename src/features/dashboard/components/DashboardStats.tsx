import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react";

export const DashboardStats = () => {
  const stats = [
    {
      title: "Tổng doanh thu",
      value: "12,345,000",
      icon: DollarSign,
      change: "+12.5%",
      trend: "up",
    },
    {
      title: "Đơn hàng",
      value: "1,234",
      icon: ShoppingCart,
      change: "+8.2%",
      trend: "up",
    },
    {
      title: "Khách hàng",
      value: "5,678",
      icon: Users,
      change: "+15.3%",
      trend: "up",
    },
    {
      title: "Tăng trưởng",
      value: "23.4%",
      icon: TrendingUp,
      change: "+2.1%",
      trend: "up",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-card border border-border rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <Icon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-green-600 font-medium">
                {stat.change}
              </span>
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
};
