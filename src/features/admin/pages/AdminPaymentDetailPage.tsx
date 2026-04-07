import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Receipt, Braces, RefreshCcw, BadgeCheck, BadgeX } from "lucide-react";

import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { JsonViewerDialog } from "@/shared/components/JsonViewerDialog";
import { superAdminSaasApi } from "@/shared/lib/superAdminSaasApi";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import { formatVnd } from "@/shared/utils/formatMoney";
import type { PaymentStatus } from "@/shared/types/subscription";

const getStr = (o: Record<string, unknown>, keys: string[]) => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim() !== "") return v;
  }
  return "";
};

const getNum = (o: Record<string, unknown>, keys: string[]) => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  }
  return 0;
};

const toIsoFromDateInput = (date: string, endOfDay = false) => {
  if (!date) return undefined;
  const time = endOfDay ? "T23:59:59.999" : "T00:00:00.000";
  return new Date(`${date}${time}`).toISOString();
};

export default function AdminPaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rawOpen, setRawOpen] = useState(false);
  const [raw, setRaw] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);

  const query = useMemo(() => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 365);
    const fromYmd = from.toISOString().slice(0, 10);
    const toYmd = now.toISOString().slice(0, 10);
    return {
      from: toIsoFromDateInput(fromYmd, false),
      to: toIsoFromDateInput(toYmd, true),
    };
  }, []);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [list, st] = await Promise.all([
        superAdminSaasApi
          .listDashboardPayments({
            from: query.from,
            to: query.to,
          })
          .catch(() => []),
        subscriptionApi.getPaymentStatus(id).catch(() => null),
      ]);

      const found = (list ?? []).find((x) => getStr(x, ["id", "paymentId", "payment_id"]) === id) ?? null;
      setRaw(found);
      setStatus(st);

      if (!found && !st) {
        toast.error("Không tìm thấy payment.");
        navigate("/admin/payments", { replace: true });
      }
    } catch (err) {
      console.error("Failed to load payment detail:", err);
      toast.error("Không tải được chi tiết payment.");
      navigate("/admin/payments", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const view = useMemo(() => {
    const o = raw ?? {};
    return {
      id: getStr(o, ["id", "paymentId", "payment_id"]) || id || "—",
      storeName: getStr(o, ["storeName", "store_name", "store"]) || "—",
      planName: getStr(o, ["planName", "plan_name", "plan"]) || "—",
      provider: getStr(o, ["provider", "paymentProvider"]) || "—",
      status: getStr(o, ["status"]) || status?.status || "—",
      amount: getNum(o, ["amount", "totalAmount", "total_amount"]) || status?.amount || 0,
      paymentDate: getStr(o, ["paymentDate", "paidAt", "createdAt", "created_at"]) || status?.paymentDate || "—",
      transactionCode: getStr(o, ["transactionCode", "transaction_code", "txn"]) || status?.transactionCode || "—",
    };
  }, [raw, status, id]);

  const statusTone =
    view.status === "Completed"
      ? "border-emerald-500/50 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
      : view.status === "Failed"
        ? "border-red-500/50 text-red-600 bg-red-50 dark:bg-red-950/30"
        : "";

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-40" />
        <Card className="p-6 space-y-3">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      </div>
    );
  }

  if (!raw && !status) return null;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-[#FF7B21]/10 hover:text-[#FF7B21] transition-all duration-200"
          onClick={() => navigate("/admin/payments")}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách payments
        </Button>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="relative overflow-hidden p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21]/10 via-transparent to-[#19D6C8]/10 pointer-events-none" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/30">
              <Receipt className="h-6 w-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold truncate">{view.storeName}</h1>
                <Badge variant="outline">{view.planName}</Badge>
                <Badge variant="outline" className={statusTone}>{view.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                ID: <span className="font-mono break-all">{view.id}</span>
              </p>
            </div>
          </div>

          <div className="relative mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-background/60 px-3 py-2 text-sm space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span className="font-semibold">{formatVnd(view.amount ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Provider</span>
                <span className="font-medium">{view.provider}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Payment date</span>
                <span className="font-mono text-xs">{view.paymentDate}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Transaction</span>
                <span className="font-mono text-xs truncate">{view.transactionCode}</span>
              </div>
            </div>

            <div className="rounded-lg border bg-background/60 px-3 py-2 text-sm space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Trạng thái thanh toán hiện tại
              </div>
              {status ? (
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className="font-medium">{status.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Amount</span>
                    <span className="font-medium">{formatVnd(status.amount ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Transaction</span>
                    <span className="font-mono truncate">{status.transactionCode ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {status.status === "Completed" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <BadgeCheck className="h-4 w-4" />
                        Completed
                      </span>
                    ) : status.status === "Failed" ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <BadgeX className="h-4 w-4" />
                        Failed
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Không lấy được payment status.</div>
              )}
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => void load()}>
                <RefreshCcw className="h-4 w-4" />
                Reload
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setRawOpen(true)}>
                <Braces className="h-4 w-4" />
                Raw JSON
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3 hover:shadow-lg transition-shadow duration-300">
          <div className="text-sm font-semibold">Tóm tắt giao dịch</div>
          <div className="text-xs text-muted-foreground space-y-2">
            <div>
              Trạng thái: <span className="font-medium text-foreground">{view.status}</span>
            </div>
            <div>
              Giá trị: <span className="font-medium text-foreground">{formatVnd(view.amount ?? 0)}</span>
            </div>
            <div>
              Nhà cung cấp: <span className="font-medium text-foreground">{view.provider}</span>
            </div>
          </div>
        </Card>
      </div>

      <JsonViewerDialog
        open={rawOpen}
        onOpenChange={setRawOpen}
        title={`Payment raw: ${view.id}`}
        value={{ dashboardRow: raw, paymentStatus: status }}
      />
    </motion.div>
  );
}

