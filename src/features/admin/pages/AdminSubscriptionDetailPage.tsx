import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CalendarPlus, Ban, CreditCard, Braces, RefreshCcw } from "lucide-react";

import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { JsonViewerDialog } from "@/shared/components/JsonViewerDialog";
import { superAdminSaasApi } from "@/shared/lib/superAdminSaasApi";
import { formatVnd } from "@/shared/utils/formatMoney";
import { useTranslation } from "react-i18next";

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

export default function AdminSubscriptionDetailPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [days, setDays] = useState(30);
  const [rawOpen, setRawOpen] = useState(false);

  const [raw, setRaw] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const list = await superAdminSaasApi.listDashboardSubscriptions();
      const found = list.find((x) => getStr(x, ["id", "subscriptionId", "subscription_id"]) === id) ?? null;
      if (!found) {
        toast.error(t("admin:subscriptionDetail.toast.notFoundInList"));
        navigate("/admin/subscriptions", { replace: true });
        return;
      }
      setRaw(found);
    } catch (err) {
      console.error("Failed to load subscription detail:", err);
      toast.error(t("admin:subscriptionDetail.toast.loadError"));
      navigate("/admin/subscriptions", { replace: true });
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
      id: getStr(o, ["id", "subscriptionId", "subscription_id"]) || id || "—",
      storeName: getStr(o, ["storeName", "store_name", "store"]) || "—",
      planName: getStr(o, ["planName", "plan_name", "plan"]) || "—",
      planPrice: getNum(o, ["planPrice", "price", "amount"]),
      status: getStr(o, ["status", "subscriptionStatus"]) || "—",
      startDate: getStr(o, ["startDate", "start_date", "createdAt", "created_at"]) || "—",
      endDate: getStr(o, ["endDate", "end_date", "expiresAt", "expiryDate"]) || "—",
      daysRemaining: getNum(o, ["daysRemaining", "days_remaining"]),
    };
  }, [raw, id]);

  const cancel = async () => {
    if (!id) return;
    try {
      setActing(true);
      await superAdminSaasApi.cancelSubscription(id);
      toast.success(t("admin:subscriptionDetail.toast.cancelSuccess"));
      await load();
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      toast.error(t("admin:subscriptionDetail.toast.cancelError"));
    } finally {
      setActing(false);
    }
  };

  const extend = async () => {
    if (!id) return;
    try {
      setActing(true);
      const r = await superAdminSaasApi.extendSubscription(id, Number(days) || 0);
      toast.success(
        r?.newEndDate
          ? t("admin:subscriptionDetail.toast.extendSuccessWithDate", { date: r.newEndDate })
          : t("admin:subscriptionDetail.toast.extendSuccess"),
      );
      await load();
    } catch (err) {
      console.error("Failed to extend subscription:", err);
      toast.error(t("admin:subscriptionDetail.toast.extendError"));
    } finally {
      setActing(false);
    }
  };

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

  if (!raw) return null;

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
          onClick={() => navigate("/admin/subscriptions")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("admin:subscriptionDetail.backToList")}
        </Button>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="relative overflow-hidden p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21]/10 via-transparent to-[#19D6C8]/10 pointer-events-none" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/30">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold truncate">{view.storeName}</h1>
                <Badge variant="outline">{view.planName}</Badge>
                <Badge variant="outline">{view.status}</Badge>
                {view.daysRemaining > 0 && (
                  <Badge variant="outline">
                    {t("admin:subscriptionDetail.daysLeft", { days: view.daysRemaining })}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("admin:subscriptionDetail.fields.id")}:{" "}
                <span className="font-mono break-all">{view.id}</span>
              </p>
            </div>
          </div>

          <div className="relative mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-background/60 px-3 py-2 text-sm space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{t("admin:subscriptionDetail.fields.planPrice")}</span>
                <span className="font-semibold">{formatVnd(view.planPrice ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{t("admin:subscriptionDetail.fields.start")}</span>
                <span className="font-mono text-xs">{view.startDate}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{t("admin:subscriptionDetail.fields.end")}</span>
                <span className="font-mono text-xs">{view.endDate}</span>
              </div>
            </div>

            <div className="rounded-lg border bg-background/60 px-3 py-2 text-sm space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t("admin:subscriptionDetail.actions.title")}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="destructive"
                  className="gap-2 justify-start"
                  onClick={() => void cancel()}
                  disabled={acting}
                >
                  <Ban className="h-4 w-4" />
                  {t("admin:subscriptionDetail.actions.cancel")}
                </Button>
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="numeric"
                    value={String(days)}
                    onChange={(e) => setDays(Number(e.target.value || 0))}
                    className="bg-background/80"
                    placeholder={t("admin:subscriptionDetail.actions.daysPlaceholder")}
                  />
                  <Button
                    className="gap-2 bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white"
                    onClick={() => void extend()}
                    disabled={acting || Number(days) <= 0}
                  >
                    <CalendarPlus className="h-4 w-4" />
                    {t("admin:subscriptionDetail.actions.extend")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => void load()} disabled={acting}>
                <RefreshCcw className="h-4 w-4" />
                {t("admin:subscriptionDetail.actions.reload")}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setRawOpen(true)}>
                <Braces className="h-4 w-4" />
                {t("admin:subscriptionDetail.actions.rawJson")}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3 hover:shadow-lg transition-shadow duration-300">
          <div className="text-sm font-semibold">{t("admin:subscriptionDetail.summary.title")}</div>
          <div className="text-xs text-muted-foreground space-y-2">
            <div>
              {t("admin:subscriptionDetail.summary.currentStatus")}:{" "}
              <span className="font-medium text-foreground">{view.status}</span>
            </div>
            <div>
              {t("admin:subscriptionDetail.summary.period")}:{" "}
              <span className="font-medium text-foreground">
                {view.startDate} → {view.endDate}
              </span>
            </div>
            <div>
              {t("admin:subscriptionDetail.summary.remaining")}:{" "}
              <span className="font-medium text-foreground">{view.daysRemaining || 0}</span>{" "}
              {t("admin:subscriptionDetail.summary.days")}
            </div>
          </div>
        </Card>
      </div>

      <JsonViewerDialog
        open={rawOpen}
        onOpenChange={setRawOpen}
        title={t("admin:subscriptionDetail.rawTitle", { id: view.id })}
        value={raw}
      />
    </motion.div>
  );
}

