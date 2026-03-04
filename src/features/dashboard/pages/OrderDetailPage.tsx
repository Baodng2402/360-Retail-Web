import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ordersApi } from "@/shared/lib/ordersApi";
import type { Order, OrderStatus } from "@/shared/types/orders";
import { formatVnd } from "@/shared/utils/formatMoney";
import { useAuthStore } from "@/shared/store/authStore";
import toast from "react-hot-toast";

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

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const canUpdateStatus =
    user?.role === "StoreOwner" || user?.role === "Manager";

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await ordersApi.getOrderById(id);
        setOrder(res);
        setNewStatus(res.status);
      } catch (err) {
        console.error("Failed to load order:", err);
        toast.error("Không thể tải chi tiết đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order || !newStatus || newStatus === order.status) return;
    if (!canUpdateStatus) return;

    try {
      setUpdating(true);
      const updated = await ordersApi.updateOrderStatus(order.id, newStatus);
      setOrder(updated);
      toast.success("Cập nhật trạng thái đơn hàng thành công.");
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setCancelling(true);
      const updated = await ordersApi.cancelOrder(order.id);
      setOrder(updated);
      setNewStatus(updated.status);
      setShowCancelDialog(false);
      toast.success("Đã hủy đơn hàng thành công.");
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error("Không thể hủy đơn hàng.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard/orders")}
        >
          Quay lại danh sách
        </Button>
        <Card className="p-6">
          <div className="h-6 w-40 mb-4 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 mb-2 rounded bg-muted animate-pulse" />
          <div className="h-4 w-56 mb-2 rounded bg-muted animate-pulse" />
          <div className="h-4 w-48 mb-2 rounded bg-muted animate-pulse" />
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard/orders")}
        >
          Quay lại danh sách
        </Button>
        <Card className="p-6 text-sm text-muted-foreground">
          Không tìm thấy đơn hàng.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/dashboard/orders")}
      >
        Quay lại danh sách
      </Button>

      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Đơn hàng {order.code || order.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-muted-foreground">
              Tạo lúc{" "}
              {new Date(order.createdAt).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <Badge
              variant="outline"
              className={statusColorClasses[order.status]}
            >
              {statusLabels[order.status]}
            </Badge>
            {canUpdateStatus && (
              <div className="flex items-center gap-2">
                <Select
                  value={newStatus}
                  onValueChange={(val) => setNewStatus(val as OrderStatus)}
                  disabled={updating}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Trạng thái mới" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleUpdateStatus}
                  disabled={
                    updating || !newStatus || newStatus === order.status
                  }
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                >
                  Lưu
                </Button>
                {(order.status === "Pending" || order.status === "Processing") && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={cancelling}
                  >
                    Hủy đơn
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Khách hàng</p>
            <p className="font-medium">
              {order.customerName || "Khách lẻ"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Thanh toán</p>
            <p className="font-medium">
              {order.paymentMethod || "Chưa rõ"}
              {order.paymentStatus
                ? ` • ${order.paymentStatus}`
                : ""}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tổng tiền</p>
            <p className="font-semibold text-foreground">
              {formatVnd(order.totalAmount)}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <h2 className="text-sm font-semibold text-foreground">
            Sản phẩm trong đơn
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Mã vạch / SKU</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {item.productName || item.productId}
                      </span>
                      {item.size || item.color ? (
                        <span className="text-xs text-muted-foreground">
                          {item.size ? `Size: ${item.size}` : ""}
                          {item.size && item.color ? " • " : ""}
                          {item.color ? `Màu: ${item.color}` : ""}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.barCode || item.sku || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatVnd(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatVnd(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Cancel Order Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-lg font-semibold">Xác nhận hủy đơn hàng</h3>
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn hủy đơn hàng{" "}
              <strong>{order.code || order.id.slice(0, 8)}</strong>? Hành động
              này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelling}
              >
                Không
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => void handleCancelOrder()}
                disabled={cancelling}
              >
                {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;

