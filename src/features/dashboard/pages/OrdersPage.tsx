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
import { motion } from "motion/react";
import {
  Package,
  Clock,
  Filter,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  Pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/20 transition-all duration-200",
  Processing: "bg-blue-500/10 text-blue-700 border-blue-500/30 hover:bg-blue-500/20 transition-all duration-200",
  Completed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20 transition-all duration-200",
  Cancelled: "bg-red-500/10 text-red-700 border-red-500/30 hover:bg-red-500/20 transition-all duration-200",
  Refunded: "bg-purple-500/10 text-purple-700 border-purple-500/30 hover:bg-purple-500/20 transition-all duration-200",
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
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StoreSelector pageDescription={tOrders("page.storeSelectorHint")} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-4 md:p-6 space-y-4 border-border/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <motion.div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#FF7B21]" />
                {tOrders("page.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {tOrders("page.subtitle")}
              </p>
            </div>
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF7B21]/10 to-[#19D6C8]/10 border border-[#FF7B21]/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Package className="h-4 w-4 text-[#FF7B21]" />
              <span className="text-sm text-muted-foreground">
                {tOrders("page.totalOrdersLabel")}{" "}
              </span>
              <span className="font-bold text-foreground text-lg">{totalCount}</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {tOrders("filters.statusLabel")}
              </Label>
              <Select
                value={status}
                onValueChange={(val) => {
                  setStatus(val as StatusFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="bg-background/80 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-[#FF7B21]/20">
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
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {tOrders("filters.fromDate")}
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="bg-background/80 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-[#FF7B21]/20"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {tOrders("filters.toDate")}
              </Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="bg-background/80 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-[#FF7B21]/20"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 hover:bg-[#FF7B21]/10 hover:border-[#FF7B21]/30 hover:text-[#FF7B21] transition-all duration-200"
                onClick={handleResetFilters}
                disabled={loading}
              >
                {tOrders("filters.reset")}
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="border rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
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
                  <thead className="bg-gradient-to-r from-[#FF7B21]/5 via-[#19D6C8]/5 to-[#FF7B21]/5 border-b">
                    <tr className="text-xs text-muted-foreground font-medium">
                      <th className="text-left px-4 py-3">
                        {tOrders("table.orderCode")}
                      </th>
                      <th className="text-left px-4 py-3">
                        {tOrders("table.customer")}
                      </th>
                      <th className="text-left px-4 py-3">
                        {tOrders("table.total")}
                      </th>
                      <th className="text-left px-4 py-3">
                        {tOrders("table.status")}
                      </th>
                      <th className="text-left px-4 py-3">
                        {tOrders("table.paymentMethod")}
                      </th>
                      <th className="text-right px-4 py-3">
                        {tOrders("table.time")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        className="border-b last:border-0 hover:bg-gradient-to-r hover:from-[#FF7B21]/5 hover:to-transparent cursor-pointer transition-all duration-200"
                        onClick={() => handleRowClick(order)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          <span className="bg-[#FF7B21]/10 text-[#FF7B21] px-2 py-0.5 rounded-md text-xs font-mono">
                            {order.code || order.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {order.customerName || tOrders("table.walkInCustomer")}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          <span className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent font-bold">
                            {formatVnd(order.totalAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={statusColorClasses[order.status]}
                          >
                            {tOrders(STATUS_LABEL_KEYS[order.status])}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {order.paymentMethod || "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">
                          {formatOrderTime(order.createdAt)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          <motion.div
            className="flex items-center justify-between gap-3 pt-2 text-xs sm:text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
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
                className="hover:bg-[#FF7B21]/10 hover:border-[#FF7B21]/30 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {tOrders("pagination.prev")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="hover:bg-[#FF7B21]/10 hover:border-[#FF7B21]/30 transition-all duration-200"
              >
                {tOrders("pagination.next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default OrdersPage;

