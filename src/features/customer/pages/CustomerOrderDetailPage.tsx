import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { ordersApi } from "@/shared/lib/ordersApi";
import type { Order } from "@/shared/types/orders";
import { formatVnd } from "@/shared/utils/formatMoney";

const CustomerOrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await ordersApi.getOrderById(orderId);
        setOrder(data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [orderId]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Button>

      <Card className="p-6 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải đơn hàng...</p>
        ) : !order ? (
          <p className="text-sm text-muted-foreground">
            Không tìm thấy đơn hàng.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    Đơn hàng {order.code || order.id.slice(0, 8)}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Ngày tạo:{" "}
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Trạng thái</p>
                <p className="font-semibold text-foreground">{order.status}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <h2 className="font-semibold mb-1">Sản phẩm</h2>
              {order.orderItems && order.orderItems.length > 0 ? (
                <ul className="space-y-1">
                  {order.orderItems.map((item) => (
                    <li
                      key={item.productId}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-foreground">
                        {item.productName} x{item.quantity}
                      </span>
                      <span className="text-muted-foreground">
                        {formatVnd(item.unitPrice * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Không có thông tin sản phẩm.
                </p>
              )}
            </div>

            <div className="border-t pt-4 text-sm flex justify-between">
              <span className="text-muted-foreground">Tổng tiền</span>
              <span className="font-semibold text-foreground">
                {formatVnd(order.totalAmount)}
              </span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default CustomerOrderDetailPage;

