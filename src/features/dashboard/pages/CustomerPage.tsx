import {
  Search,
  Phone,
  DollarSign,
  Gift,
  Send,
  X,
  Clock,
  ShoppingBag,
  Users,
  Star,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import StoreSelector from "@/features/dashboard/components/StoreSelector";

const CustomerPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);

  const customers = [
    {
      id: 1,
      name: "Nguyễn Thị D",
      phone: "0945678901",
      totalSpend: "₫3,450,000",
      points: 345,
      avatar: "D",
      lastVisit: "2 days ago",
      purchases: [
        { date: "2024-12-27", items: "Cà phê, Bánh mì", amount: "₫30,000" },
        { date: "2024-12-25", items: "Trà sữa x2", amount: "₫50,000" },
        { date: "2024-12-23", items: "Nước cam, Bánh", amount: "₫35,000" },
      ],
    },
    {
      id: 2,
      name: "Trần Văn E",
      phone: "0956789012",
      totalSpend: "₫2,890,000",
      points: 289,
      avatar: "E",
      lastVisit: "1 day ago",
      purchases: [
        { date: "2024-12-28", items: "Cà phê sữa đá x3", amount: "₫45,000" },
        { date: "2024-12-26", items: "Bánh mì, Nước cam", amount: "₫35,000" },
      ],
    },
    {
      id: 3,
      name: "Phạm Thị F",
      phone: "0967890123",
      totalSpend: "₫1,750,000",
      points: 175,
      avatar: "F",
      lastVisit: "5 days ago",
      purchases: [
        { date: "2024-12-24", items: "Trà sữa, Bánh", amount: "₫40,000" },
      ],
    },
    {
      id: 4,
      name: "Lê Văn G",
      phone: "0978901234",
      totalSpend: "₫4,120,000",
      points: 412,
      avatar: "G",
      lastVisit: "Today",
      purchases: [
        {
          date: "2024-12-29",
          items: "Cà phê, Bánh mì, Trà",
          amount: "₫55,000",
        },
        { date: "2024-12-27", items: "Nước cam x2", amount: "₫40,000" },
      ],
    },
  ];

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

  const currentCustomer = selectedCustomer
    ? customers.find((c) => c.id === selectedCustomer)
    : null;

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription="Chuyển đổi để xem khách hàng của cửa hàng khác" />
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name or phone · Tìm theo tên hoặc SĐT..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold">
                All Customers ·{" "}
                <span className="text-base text-muted-foreground">
                  Tất cả khách hàng
                </span>
              </h3>
            </div>
            <div className="divide-y">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer.id)}
                  className={`p-6 hover:bg-muted/50 cursor-pointer transition-colors ${
                    selectedCustomer === customer.id ? "bg-teal-50/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-base font-bold text-white">
                        {customer.avatar}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold mb-1">
                        {customer.name}
                      </p>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-sm">{customer.lastVisit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-teal-600 mb-1">
                        {customer.totalSpend}
                      </p>
                      <Badge variant="secondary" className="gap-1">
                        <Gift className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">
                          {customer.points} pts
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {currentCustomer ? (
            <Card className="p-0 overflow-hidden sticky top-6">
              <div className="p-6 border-b">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {currentCustomer.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {currentCustomer.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentCustomer.phone}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCustomer(null)}
                    className="rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-teal-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-teal-600" />
                      <p className="text-xs text-muted-foreground">
                        Total Spend
                      </p>
                    </div>
                    <p className="text-base font-bold text-teal-600">
                      {currentCustomer.totalSpend}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-4 h-4 text-purple-600" />
                      <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                    <p className="text-base font-bold text-purple-600">
                      {currentCustomer.points}
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-600/25">
                  <Send className="w-5 h-5 mr-2" />
                  Send ZNS Message · Gửi tin Zalo
                </Button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-foreground" />
                  <h4 className="text-base font-bold">
                    Purchase History · Lịch sử mua hàng
                  </h4>
                </div>
                <div className="space-y-3">
                  {currentCustomer.purchases.map((purchase, index) => (
                    <div key={index} className="p-4 bg-muted rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-muted-foreground">
                          {purchase.date}
                        </p>
                        <p className="text-sm font-bold text-teal-600">
                          {purchase.amount}
                        </p>
                      </div>
                      <p className="text-sm">{purchase.items}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-base text-muted-foreground">
                Select a customer to view details
                <br />
                <span className="text-sm">Chọn khách hàng để xem chi tiết</span>
              </p>
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-200 dark:border-blue-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tổng khách hàng</p>
              <h3 className="text-2xl font-bold text-foreground">{customers.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-200 dark:border-green-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Chi tiêu trung bình</p>
              <h3 className="text-2xl font-bold text-foreground">₫3.0M</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-200 dark:border-purple-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tổng điểm tích lũy</p>
              <h3 className="text-2xl font-bold text-foreground">1,221</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background border-orange-200 dark:border-orange-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Hoạt động tuần này</p>
              <h3 className="text-2xl font-bold text-foreground">3</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomerPage;
