import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { ordersApi } from "@/shared/lib/ordersApi";
import type { Order } from "@/shared/types/orders";
import { formatVnd } from "@/shared/utils/formatMoney";
import { useTranslation } from "react-i18next";

const CustomerOrderDetailPage = () => {
  const { t: tCustomer, i18n } = useTranslation(["customer", "orders", "common"]);
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
        {tCustomer("common:actions.back")}
      </Button>

      <Card className="p-6 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">{tCustomer("portal.orderDetail.loading")}</p>
        ) : !order ? (
          <p className="text-sm text-muted-foreground">
            {tCustomer("portal.orderDetail.notFound")}
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
                    {tCustomer("portal.orderDetail.title", { code: order.code || order.id.slice(0, 8) })}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {tCustomer("portal.orderDetail.createdAt")}:{" "}
                    {new Date(order.createdAt).toLocaleString(i18n.language)}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">{tCustomer("portal.orderDetail.statusLabel")}</p>
                <p className="font-semibold text-foreground">
                  {tCustomer(`orders:statusLabels.${order.status}` as const, { defaultValue: order.status })}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <h2 className="font-semibold mb-1">{tCustomer("portal.orderDetail.itemsTitle")}</h2>
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
                  {tCustomer("portal.orderDetail.noItems")}
                </p>
              )}
            </div>

            <div className="border-t pt-4 text-sm flex justify-between">
              <span className="text-muted-foreground">{tCustomer("portal.orderDetail.totalLabel")}</span>
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

