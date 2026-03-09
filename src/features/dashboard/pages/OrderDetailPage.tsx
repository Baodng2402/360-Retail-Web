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
import { useStoreStore } from "@/shared/store/storeStore";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

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

const OrderDetailPage = () => {
  const { t: tOrders, i18n } = useTranslation("orders");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentStore } = useStoreStore();
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
        toast.error(tOrders("detail.toasts.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [id, tOrders]);

  const handleUpdateStatus = async () => {
    if (!order || !newStatus || newStatus === order.status) return;
    if (!canUpdateStatus) return;

    try {
      setUpdating(true);
      const updated = await ordersApi.updateOrderStatus(order.id, newStatus);
      setOrder(updated);
      toast.success(tOrders("detail.toasts.updateStatusSuccess"));
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error(tOrders("detail.toasts.updateStatusFailed"));
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
      toast.success(tOrders("detail.toasts.cancelSuccess"));
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error(tOrders("detail.toasts.cancelFailed"));
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
          {tOrders("detail.backToList")}
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
          {tOrders("detail.backToList")}
        </Button>
        <Card className="p-6 text-sm text-muted-foreground">
          {tOrders("detail.notFound")}
        </Card>
      </div>
    );
  }

  const effectiveStoreId = order.storeId || currentStore?.id || null;
  const feedbackUrl =
    order.customerId && effectiveStoreId
      ? `${window.location.origin}/feedback/${order.id}?customerId=${order.customerId}&storeId=${effectiveStoreId}`
      : null;

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/dashboard/orders")}
      >
        {tOrders("detail.backToList")}
      </Button>

      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {tOrders("detail.title", {
                code: order.code || order.id.slice(0, 8),
              })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {tOrders("detail.createdAtLabel")}{" "}
              {new Intl.DateTimeFormat(
                i18n.language.toLowerCase().startsWith("en") ? "en-US" : "vi-VN",
                {
                  dateStyle: "short",
                  timeStyle: "short",
                },
              ).format(new Date(order.createdAt))}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <Badge
              variant="outline"
              className={statusColorClasses[order.status]}
            >
              {tOrders(STATUS_LABEL_KEYS[order.status])}
            </Badge>
            {canUpdateStatus && (
              <div className="flex items-center gap-2">
                <Select
                  value={newStatus}
                  onValueChange={(val) => setNewStatus(val as OrderStatus)}
                  disabled={updating}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={tOrders("detail.newStatusPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {tOrders(STATUS_LABEL_KEYS[s])}
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
                  {tOrders("detail.save")}
                </Button>
                {(order.status === "Pending" || order.status === "Processing") && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={cancelling}
                  >
                    {tOrders("detail.cancelOrder")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {tOrders("detail.customerLabel")}
            </p>
            <p className="font-medium">
              {order.customerName || tOrders("table.walkInCustomer")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {tOrders("detail.paymentLabel")}
            </p>
            <p className="font-medium">
              {order.paymentMethod || tOrders("detail.paymentUnknown")}
              {order.paymentStatus
                ? ` • ${order.paymentStatus}`
                : ""}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {tOrders("detail.totalLabel")}
            </p>
            <p className="font-semibold text-foreground">
              {formatVnd(order.totalAmount)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-2 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {tOrders("detail.feedbackQrTitle")}
            </p>
            <p className="text-xs text-muted-foreground">
              {tOrders("detail.feedbackQrDescription")}
            </p>
            {feedbackUrl ? (
              <div className="mt-2 space-y-2">
                <p className="text-[11px] text-muted-foreground">
                  {tOrders("detail.feedbackUrlLabel")}
                </p>
                <div className="rounded-md border bg-muted/40 px-2 py-1 text-[11px] break-all font-mono">
                  {feedbackUrl}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                {tOrders("detail.feedbackUnavailable")}
              </p>
            )}
          </div>
          {feedbackUrl && (
            <div className="flex justify-center md:justify-end">
              <div className="inline-flex flex-col items-center gap-2 rounded-xl border bg-background p-3">
                <div className="bg-white p-2 rounded-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      feedbackUrl,
                    )}`}
                    alt={tOrders("detail.feedbackQrTitle")}
                    className="h-40 w-40"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground text-center max-w-[160px]">
                  {tOrders("detail.feedbackQrHint")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-4">
          <h2 className="text-sm font-semibold text-foreground">
            {tOrders("detail.itemsTitle")}
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tOrders("detail.itemsTable.product")}</TableHead>
                <TableHead>{tOrders("detail.itemsTable.barcodeSku")}</TableHead>
                <TableHead className="text-right">
                  {tOrders("detail.itemsTable.quantity")}
                </TableHead>
                <TableHead className="text-right">
                  {tOrders("detail.itemsTable.unitPrice")}
                </TableHead>
                <TableHead className="text-right">
                  {tOrders("detail.itemsTable.lineTotal")}
                </TableHead>
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
                          {item.size
                            ? tOrders("detail.itemsTable.sizeLabel", {
                                size: item.size,
                              })
                            : ""}
                          {item.size && item.color ? " • " : ""}
                          {item.color
                            ? tOrders("detail.itemsTable.colorLabel", {
                                color: item.color,
                              })
                            : ""}
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
            <h3 className="text-lg font-semibold">
              {tOrders("detail.cancelDialog.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              <span
                dangerouslySetInnerHTML={{
                  __html: tOrders("detail.cancelDialog.description", {
                    code: order.code || order.id.slice(0, 8),
                  }),
                }}
              />
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelling}
              >
                {tOrders("detail.cancelDialog.no")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => void handleCancelOrder()}
                disabled={cancelling}
              >
                {cancelling
                  ? tOrders("detail.cancelDialog.cancelling")
                  : tOrders("detail.cancelDialog.confirm")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;

