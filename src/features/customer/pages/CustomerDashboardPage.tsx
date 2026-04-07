import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ShoppingBag, Clock, ArrowRight, Coins, Loader2 } from "lucide-react";
import { ordersApi } from "@/shared/lib/ordersApi";
import { customersApi } from "@/shared/lib/customersApi";
import type { Order } from "@/shared/types/orders";
import { formatVnd } from "@/shared/utils/formatMoney";
import { useAuthStore } from "@/shared/store/authStore";
import { useTranslation } from "react-i18next";

const CustomerDashboardPage = () => {
  const { t: tCustomer, i18n } = useTranslation(["customer", "orders", "common"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Loyalty state
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<any[]>([]);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);

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

    // Load loyalty if user has a customer profile
    if (user?.id) {
      void loadLoyalty(user.id);
    }
  }, []);

  const loadLoyalty = async (customerId: string) => {
    try {
      setLoyaltyLoading(true);
      const [pointsData, transactions] = await Promise.all([
        customersApi.getLoyaltySummary(customerId).catch(() => null),
        customersApi
          .getLoyaltyTransactions(customerId, { page: 1, pageSize: 10 })
          .catch(() => []),
      ]);
      if (pointsData && typeof pointsData === "object" && "totalPoints" in pointsData) {
        setLoyaltyPoints(pointsData.totalPoints);
      } else if (typeof pointsData === "number") {
        setLoyaltyPoints(pointsData);
      }
      setLoyaltyTransactions(Array.isArray(transactions) ? transactions : []);
    } catch {
      // ignore
    } finally {
      setLoyaltyLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card className="p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {tCustomer("portal.dashboard.title")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {tCustomer("portal.dashboard.subtitle")}
            </p>
          </div>
        </div>
      </Card>

      {/* Loyalty Points Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-foreground">
              {tCustomer("portal.loyalty.title")}
            </h2>
          </div>
          {loyaltyLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : loyaltyPoints !== null ? (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm px-3 py-1">
              {tCustomer("portal.loyalty.points", {
                points: loyaltyPoints,
              })}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">
              {tCustomer("portal.states.noData")}
            </span>
          )}
        </div>
        {loyaltyTransactions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {tCustomer("portal.loyalty.recent.title")}
            </h3>
            {loyaltyTransactions.slice(0, 5).map((tx, i) => (
              <div
                key={tx.id || i}
                className="flex items-center justify-between text-xs border rounded px-2 py-1.5"
              >
                <div className="flex flex-col">
                  <span className="text-foreground font-medium">
                    {tx.description || tx.type || tCustomer("portal.loyalty.recent.fallback")}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {tx.createdAt
                      ? new Date(tx.createdAt).toLocaleString(i18n.language)
                      : ""}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    tx.points > 0
                      ? "text-emerald-600 border-emerald-300"
                      : "text-red-600 border-red-300"
                  }
                >
                  {tx.points > 0 ? "+" : ""}
                  {tx.points}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Orders Section */}
      <Card className="p-6">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            {tCustomer("portal.orders.loading")}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            {tCustomer("portal.orders.empty")}
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
                    {new Date(order.createdAt).toLocaleString(i18n.language)}
                  </span>
                  <span className="text-muted-foreground">
                    {tCustomer("portal.orders.statusLabel")}:{" "}
                    <span className="font-medium">
                      {tCustomer(`orders:statusLabels.${order.status}` as const, {
                        defaultValue: order.status,
                      })}
                    </span>
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
                    <span>{tCustomer("portal.orders.viewDetail")}</span>
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
