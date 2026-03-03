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

type StatusFilter = OrderStatus | "All";

const statusLabels: Record<OrderStatus, string> = {
  Pending: "Chờ xử lý",
  Processing: "Đang xử lý",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
  Refunded: "Hoàn tiền",
};

const statusColorClasses: Record<OrderStatus, string> = {
  Pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  Processing: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  Completed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  Cancelled: "bg-red-500/10 text-red-700 border-red-500/30",
  Refunded: "bg-purple-500/10 text-purple-700 border-purple-500/30",
};

const formatOrderTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) return "Hôm qua";
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleString("vi-VN");
};

const OrdersPage = () => {
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

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription="Quản lý các đơn hàng POS của cửa hàng" />

      <Card className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Order Management / Quản lý đơn hàng
            </h2>
            <p className="text-sm text-muted-foreground">
              Xem, lọc và truy cập chi tiết các đơn hàng đã tạo.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Tổng số đơn:{" "}
            <span className="font-semibold text-foreground">{totalCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <Label>Trạng thái</Label>
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Tất cả</SelectItem>
                <SelectItem value="Pending">{statusLabels.Pending}</SelectItem>
                <SelectItem value="Processing">
                  {statusLabels.Processing}
                </SelectItem>
                <SelectItem value="Completed">
                  {statusLabels.Completed}
                </SelectItem>
                <SelectItem value="Cancelled">
                  {statusLabels.Cancelled}
                </SelectItem>
                <SelectItem value="Refunded">
                  {statusLabels.Refunded}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Từ ngày</Label>
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
            <Label>Đến ngày</Label>
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
              Đặt lại
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Đang tải danh sách đơn hàng...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Không có đơn hàng nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left px-4 py-2 font-medium">Mã đơn</th>
                    <th className="text-left px-4 py-2 font-medium">
                      Khách hàng
                    </th>
                    <th className="text-left px-4 py-2 font-medium">
                      Tổng tiền
                    </th>
                    <th className="text-left px-4 py-2 font-medium">
                      Trạng thái
                    </th>
                    <th className="text-left px-4 py-2 font-medium">
                      Phương thức thanh toán
                    </th>
                    <th className="text-right px-4 py-2 font-medium">
                      Thời gian
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
                        {order.customerName || "Khách lẻ"}
                      </td>
                      <td className="px-4 py-2 font-semibold text-foreground">
                        {formatVnd(order.totalAmount)}
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          variant="outline"
                          className={statusColorClasses[order.status]}
                        >
                          {statusLabels[order.status]}
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
            Trang{" "}
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
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrdersPage;

