import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import StoreSelector from "@/features/dashboard/components/StoreSelector";
import { ordersApi } from "@/shared/lib/ordersApi";
import type {
  GetOrdersParams,
  Order,
  OrderStatus,
} from "@/shared/types/orders";
import { formatVnd } from "@/shared/utils/formatMoney";
import { useTranslation } from "react-i18next";

type StatusFilter = OrderStatus | "All";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Completed",
  "Cancelled",
  "Refunded",
] as const satisfies readonly OrderStatus[];

const STATUS_LABEL_KEYS: Record<
  OrderStatus,
  | "statusLabels.Pending"
  | "statusLabels.Processing"
  | "statusLabels.Completed"
  | "statusLabels.Cancelled"
  | "statusLabels.Refunded"
> = {
  Pending: "statusLabels.Pending",
  Processing: "statusLabels.Processing",
  Completed: "statusLabels.Completed",
  Cancelled: "statusLabels.Cancelled",
  Refunded: "statusLabels.Refunded",
};

const statusColorClasses: Record<OrderStatus, string> = {
  Pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  Processing: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  Completed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  Cancelled: "bg-red-500/10 text-red-700 border-red-500/30",
  Refunded: "bg-purple-500/10 text-purple-700 border-purple-500/30",
};

const OrdersPage = () => {
  const { t: tOrders, i18n } = useTranslation("orders");
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusFilter>("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params: GetOrdersParams = {
          page,
          pageSize,
        };

        if (status !== "All") {
          params.status = status as OrderStatus;
        }
        if (fromDate) {
          params.fromDate = new Date(
            `${fromDate}T00:00:00.000`,
          ).toISOString();
        }
        if (toDate) {
          params.toDate = new Date(
            `${toDate}T23:59:59.999`,
          ).toISOString();
        }

        const res = await ordersApi.getOrdersPaged(params);
        setOrders(res.items);
        setTotalPages(res.totalPages);
        setTotalCount(res.totalCount);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setOrders([]);
        setTotalPages(1);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, [status, fromDate, toDate, page, pageSize]);

  const handleResetFilters = () => {
    setStatus("All");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const handleRowClick = (order: Order) => {
    navigate(`/dashboard/orders/${order.id}`);
  };

  const formatOrderTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return tOrders("time.justNow");
    if (diffMin < 60) return tOrders("time.minutesAgo", { count: diffMin });
    if (diffHour < 24) return tOrders("time.hoursAgo", { count: diffHour });
    if (diffDay === 1) return tOrders("time.yesterday");
    if (diffDay < 7) return tOrders("time.daysAgo", { count: diffDay });

    const locale = i18n.language.toLowerCase().startsWith("en") ? "en-US" : "vi-VN";
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription={tOrders("page.storeSelectorHint")} />

      <Card className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {tOrders("page.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {tOrders("page.subtitle")}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {tOrders("page.totalOrdersLabel")}{" "}
            <span className="font-semibold text-foreground">{totalCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <Label>{tOrders("filters.statusLabel")}</Label>
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={tOrders("filters.statusPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{tOrders("filters.all")}</SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {tOrders(STATUS_LABEL_KEYS[s])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>{tOrders("filters.fromDate")}</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="space-y-1">
            <Label>{tOrders("filters.toDate")}</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleResetFilters}
              disabled={loading}
            >
              {tOrders("filters.reset")}
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {tOrders("states.loadingList")}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {tOrders("states.emptyList")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left px-4 py-2 font-medium">
                      {tOrders("table.orderCode")}
                    </th>
                    <th className="text-left px-4 py-2 font-medium">
                      {tOrders("table.customer")}
                    </th>
                    <th className="text-left px-4 py-2 font-medium">
                      {tOrders("table.total")}
                    </th>
                    <th className="text-left px-4 py-2 font-medium">
                      {tOrders("table.status")}
                    </th>
                    <th className="text-left px-4 py-2 font-medium">
                      {tOrders("table.paymentMethod")}
                    </th>
                    <th className="text-right px-4 py-2 font-medium">
                      {tOrders("table.time")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-muted/60 cursor-pointer"
                      onClick={() => handleRowClick(order)}
                    >
                      <td className="px-4 py-2 font-medium text-foreground">
                        {order.code || order.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-2">
                        {order.customerName || tOrders("table.walkInCustomer")}
                      </td>
                      <td className="px-4 py-2 font-semibold text-foreground">
                        {formatVnd(order.totalAmount)}
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          variant="outline"
                          className={statusColorClasses[order.status]}
                        >
                          {tOrders(STATUS_LABEL_KEYS[order.status])}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {order.paymentMethod || "-"}
                      </td>
                      <td className="px-4 py-2 text-right text-muted-foreground whitespace-nowrap">
                        {formatOrderTime(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 text-xs sm:text-sm text-muted-foreground">
          <span>
            {tOrders("pagination.pageLabel")}{" "}
            <span className="font-semibold text-foreground">{page}</span> /{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {tOrders("pagination.prev")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {tOrders("pagination.next")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrdersPage;

