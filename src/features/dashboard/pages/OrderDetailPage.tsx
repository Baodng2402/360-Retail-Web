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
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Package,
  User,
  CreditCard,
  Clock,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Copy,
  Loader2,
} from "lucide-react";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Completed",
  "Cancelled",
  "Refunded",
] as const satisfies readonly OrderStatus[];

const statusConfig: Record<OrderStatus, { color: string; bg: string }> = {
  Pending: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  Processing: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  Completed: { color: "text-green-700", bg: "bg-green-50 border-green-200" },
  Cancelled: { color: "text-red-700", bg: "bg-red-50 border-red-200" },
  Refunded: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
};

const OrderDetailPage = () => {
  const { t: tOrders, i18n } = useTranslation("orders");
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/orders")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tOrders("detail.backToList")}
        </Button>
        <Card className="p-6 text-center text-muted-foreground">
          {tOrders("detail.notFound")}
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status];
  const feedbackUrl =
    order.customerId
      ? `${window.location.origin}/feedback/${order.id}?customerId=${order.customerId}&storeId=${order.storeId || ""}`
      : null;

  const subtotal = order.orderItems.reduce((sum, item) => sum + item.total, 0);
  const discount = order.discountAmount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {tOrders("detail.title", {
                code: order.code || order.id.slice(0, 8).toUpperCase(),
              })}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  navigator.clipboard.writeText(order.code || order.id);
                  toast.success(tOrders("detail.toasts.copyOrderCodeSuccess"));
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </h1>
            <p className="text-sm text-muted-foreground">
              {tOrders("detail.createdAtLabel")}:{" "}
              {new Intl.DateTimeFormat(
                i18n.language.toLowerCase().startsWith("en") ? "en-US" : "vi-VN",
                { dateStyle: "full", timeStyle: "short" },
              ).format(new Date(order.createdAt))}
            </p>
          </div>
        </div>
        <Badge className={`${statusInfo.bg} ${statusInfo.color} border px-4 py-2 text-sm font-medium`}>
          {tOrders(`statusLabels.${order.status}`)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-teal-600" />
                {tOrders("detail.itemsTitle")} ({order.orderItems.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[50%]">{tOrders("detail.itemsTable.product")}</TableHead>
                    <TableHead className="text-center">{tOrders("detail.itemsTable.sizeColor")}</TableHead>
                    <TableHead className="text-right">{tOrders("detail.itemsTable.unitPrice")}</TableHead>
                    <TableHead className="text-center">{tOrders("detail.itemsTable.quantity")}</TableHead>
                    <TableHead className="text-right">{tOrders("detail.itemsTable.lineTotal")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderItems.map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {item.productName || tOrders("detail.itemsTable.productFallback")}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {item.barCode || item.sku || tOrders("detail.itemsTable.noCode")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.size || item.color ? (
                          <div className="flex flex-col items-center gap-0.5">
                            {item.size && <Badge variant="outline" className="text-xs">{item.size}</Badge>}
                            {item.color && <Badge variant="outline" className="text-xs">{item.color}</Badge>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatVnd(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">x{item.quantity}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-teal-600">
                        {formatVnd(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Summary */}
            <div className="border-t p-4 space-y-2 bg-muted/20">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{tOrders("detail.summary.subtotal")}</span>
                <span>{formatVnd(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{tOrders("detail.summary.discount")}</span>
                  <span>-{formatVnd(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>{tOrders("detail.summary.total")}</span>
                <span className="text-teal-600">{formatVnd(order.totalAmount)}</span>
              </div>
            </div>
          </Card>

          {/* Timeline / Status History could go here */}
          {(order.status === "Completed" || order.status === "Cancelled") && order.updatedAt && (
            <Card className="p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                {tOrders("detail.timeline.title")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${order.status === "Completed" ? "bg-green-500" : "bg-red-500"}`} />
                  <div className="flex-1">
                    <p className="font-medium">
                      {order.status === "Completed"
                        ? tOrders("detail.timeline.completed")
                        : tOrders("detail.timeline.cancelled")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.updatedAt).toLocaleString(i18n.language)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">{tOrders("detail.timeline.created")}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString(i18n.language)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Actions */}
          {canUpdateStatus && (
            <Card className="p-5">
              <h3 className="font-semibold mb-4">{tOrders("detail.actions.updateStatusTitle")}</h3>
              <div className="space-y-4">
                <Select
                  value={newStatus}
                  onValueChange={(val) => setNewStatus(val as OrderStatus)}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tOrders("detail.newStatusPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {tOrders(`statusLabels.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={updating || !newStatus || newStatus === order.status}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                >
                  {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {tOrders("detail.save")}
                </Button>
                {(order.status === "Pending" || order.status === "Processing") && (
                  <Button
                    variant="outline"
                    className="w-full text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={cancelling}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {tOrders("detail.cancelOrder")}
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Customer Info */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              {tOrders("detail.customerLabel")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {(order.customerName || "K")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">
                    {order.customerName || tOrders("table.walkInCustomer")}
                  </p>
                  {order.customerId && (
                    <p className="text-xs text-muted-foreground">ID: {order.customerId.slice(0, 8)}...</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Info */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              {tOrders("detail.paymentLabel")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{tOrders("detail.payment.method")}</span>
                <Badge variant="outline">
                  {order.paymentMethod || tOrders("detail.payment.cash")}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{tOrders("detail.payment.status")}</span>
                <Badge className={order.paymentStatus === "Paid" ? "bg-green-500" : "bg-yellow-500"}>
                  {order.paymentStatus || tOrders("detail.payment.unpaid")}
                </Badge>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">{tOrders("detail.totalLabel")}</span>
                <span className="font-bold text-lg text-teal-600">{formatVnd(order.totalAmount)}</span>
              </div>
            </div>
          </Card>

          {/* Feedback QR */}
          {feedbackUrl && (
            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                {tOrders("detail.feedbackQrTitle")}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {tOrders("detail.feedbackQrHint")}
              </p>
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-xl border shadow-sm inline-block">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(feedbackUrl)}`}
                    alt={tOrders("detail.feedbackQrAlt")}
                    className="h-44 w-44"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={() => {
                  navigator.clipboard.writeText(feedbackUrl);
                  toast.success(tOrders("detail.toasts.copyFeedbackLinkSuccess"));
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                {tOrders("detail.feedback.copyLink")}
              </Button>
            </Card>
          )}

          {/* Order Meta */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4">{tOrders("detail.meta.title")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tOrders("detail.meta.code")}</span>
                <code className="font-mono text-xs">{order.code || order.id.slice(0, 8)}</code>
              </div>
              {order.storeId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tOrders("detail.meta.store")}</span>
                  <span>{order.storeId.slice(0, 8)}...</span>
                </div>
              )}
              {order.employeeId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tOrders("detail.meta.employee")}</span>
                  <span>{order.employeeId.slice(0, 8)}...</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tOrders("detail.meta.itemsCount")}</span>
                <span>{order.orderItems.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{tOrders("detail.cancelDialog.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {tOrders("detail.cancelDialog.irreversible")}
                </p>
              </div>
            </div>
            <p className="text-sm">
              {tOrders("detail.cancelDialog.description", {
                code: order.code || order.id.slice(0, 8),
              })}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelling}
              >
                {tOrders("detail.cancelDialog.no")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleCancelOrder()}
                disabled={cancelling}
              >
                {cancelling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {tOrders("detail.cancelDialog.confirm")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
