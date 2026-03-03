import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ShoppingBag, Clock, ArrowRight } from "lucide-react";
import { ordersApi } from "@/shared/lib/ordersApi";
import type { Order } from "@/shared/types/orders";
import { formatVnd } from "@/shared/utils/formatMoney";

const CustomerDashboardPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await ordersApi.getOrders({ pageSize: 20 });
        setOrders(list);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card className="p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Đơn hàng của bạn
            </h1>
            <p className="text-xs text-muted-foreground">
              Xem lại lịch sử đơn hàng và trạng thái xử lý.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            Đang tải đơn hàng...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            Bạn chưa có đơn hàng nào.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 10).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border rounded-lg px-3 py-2 bg-card"
              >
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-foreground">
                    {order.code || order.id.slice(0, 8)}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </span>
                  <span className="text-muted-foreground">
                    Trạng thái:{" "}
                    <span className="font-medium">{order.status}</span>
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-foreground">
                    {formatVnd(order.totalAmount)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[11px] gap-1"
                    onClick={() =>
                      navigate(`/customer/orders/${order.id}`)
                    }
                  >
                    <span>Chi tiết</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerDashboardPage;

