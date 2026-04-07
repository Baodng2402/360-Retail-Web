import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { superAdminSaasApi, type SuperAdminPlan } from "@/shared/lib/superAdminSaasApi";
import { Ban, CalendarPlus, Loader2, CreditCard } from "lucide-react";
import { JsonViewerDialog } from "@/shared/components/JsonViewerDialog";
import { useNavigate } from "react-router-dom";
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

export default function AdminSubscriptionsPage() {
  const { t } = useTranslation(["admin", "common"]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);

  const [plans, setPlans] = useState<SuperAdminPlan[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [planId, setPlanId] = useState<string>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [actionTarget, setActionTarget] = useState<Record<string, unknown> | null>(null);
  const [actionType, setActionType] = useState<"cancel" | "extend" | null>(null);
  const [days, setDays] = useState(30);
  const [acting, setActing] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);
  const [rawTitle, setRawTitle] = useState(() => t("admin:subscriptionsPage.rawDialogDefaultTitle"));
  const [rawValue, setRawValue] = useState<unknown>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [list, planList] = await Promise.all([
        superAdminSaasApi.listDashboardSubscriptions({
          status: status === "all" ? undefined : status,
          planId: planId === "all" ? undefined : planId,
        }),
        superAdminSaasApi.listPlans().catch(() => []),
      ]);
      setItems(list);
      setPlans(planList);
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
      toast.error(t("admin:subscriptionsPage.toast.loadError"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, planId]);

  const tableRows = useMemo(() => {
    const rows = items.map((x) => {
      const o = x as Record<string, unknown>;
      const id = getStr(o, ["id", "subscriptionId", "subscription_id"]);
      const storeName = getStr(o, ["storeName", "store_name", "store"]);
      const planName = getStr(o, ["planName", "plan_name", "plan"]);
      const st = getStr(o, ["status", "subscriptionStatus"]);
      const startDate = getStr(o, ["startDate", "start_date", "createdAt", "created_at"]);
      const endDate = getStr(o, ["endDate", "end_date", "expiresAt", "expiryDate"]);
      const daysRemaining = getNum(o, ["daysRemaining", "days_remaining"]);
      return { raw: o, id, storeName, planName, status: st, startDate, endDate, daysRemaining };
    });

    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => {
      return (
        r.id.toLowerCase().includes(term) ||
        r.storeName.toLowerCase().includes(term) ||
        r.planName.toLowerCase().includes(term) ||
        (r.status ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, q]);

  const totalPages = Math.max(1, Math.ceil(tableRows.length / pageSize) || 1);
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tableRows.slice(start, start + pageSize);
  }, [tableRows, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [status, planId, q]);

  const openCancel = (o: Record<string, unknown>) => {
    setActionTarget(o);
    setActionType("cancel");
  };

  const openExtend = (o: Record<string, unknown>) => {
    setActionTarget(o);
    setActionType("extend");
    setDays(30);
  };

  const doAction = async () => {
    if (!actionTarget || !actionType) return;
    const id = getStr(actionTarget, ["id", "subscriptionId", "subscription_id"]);
    if (!id) {
      toast.error(t("admin:subscriptionsPage.toast.missingId"));
      return;
    }
    try {
      setActing(true);
      if (actionType === "cancel") {
        await superAdminSaasApi.cancelSubscription(id);
        toast.success(t("admin:subscriptionsPage.toast.cancelSuccess"));
      } else {
        const r = await superAdminSaasApi.extendSubscription(id, Number(days) || 0);
        toast.success(
          r?.newEndDate
            ? t("admin:subscriptionsPage.toast.extendSuccessWithDate", { date: r.newEndDate })
            : t("admin:subscriptionsPage.toast.extendSuccess"),
        );
      }
      setActionTarget(null);
      setActionType(null);
      await load();
    } catch (err) {
      console.error("Subscription action failed:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        t("admin:subscriptionsPage.toast.actionFailed");
      toast.error(message);
    } finally {
      setActing(false);
    }
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
        <Card className="p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/20">
                  {t("admin:subscriptionsPage.badge")}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {t("admin:subscriptionsPage.caption")}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">{t("admin:subscriptionsPage.filters.status")}</div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                    <SelectValue placeholder={t("admin:dashboard.filters.selectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("admin:subscriptionsPage.status.all")}</SelectItem>
                    <SelectItem value="Active">{t("admin:subscriptionsPage.status.active")}</SelectItem>
                    <SelectItem value="Trial">{t("admin:subscriptionsPage.status.trial")}</SelectItem>
                    <SelectItem value="Expired">{t("admin:subscriptionsPage.status.expired")}</SelectItem>
                    <SelectItem value="Cancelled">{t("admin:subscriptionsPage.status.cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">{t("admin:subscriptionsPage.filters.plan")}</div>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                    <SelectValue placeholder={t("admin:dashboard.filters.selectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("admin:subscriptionsPage.status.all")}</SelectItem>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.planName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">{t("admin:subscriptionsPage.filters.search")}</div>
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("admin:subscriptionsPage.filters.searchPlaceholder")}
                  className="bg-background/80 backdrop-blur-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => void load()}
                  className="w-full bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("admin:subscriptionsPage.actions.refresh")
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#FF7B21]" />
              {t("admin:subscriptionsPage.list.title")}
            </h3>
            <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
              {tableRows.length.toLocaleString()}
            </Badge>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : tableRows.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                {t("common:states.noData")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#FF7B21]/5 to-[#19D6C8]/5">
                      <TableHead>{t("admin:subscriptionsPage.columns.store")}</TableHead>
                      <TableHead>{t("admin:subscriptionsPage.columns.plan")}</TableHead>
                      <TableHead>{t("admin:subscriptionsPage.columns.status")}</TableHead>
                      <TableHead>{t("admin:subscriptionsPage.columns.start")}</TableHead>
                      <TableHead>{t("admin:subscriptionsPage.columns.end")}</TableHead>
                      <TableHead>{t("admin:subscriptionsPage.columns.daysLeft")}</TableHead>
                      <TableHead className="text-right">{t("admin:subscriptionsPage.columns.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedRows.map((r, index) => (
                      <motion.tr
                        key={r.id || JSON.stringify(r.raw)}
                        className="cursor-pointer border-b last:border-0 hover:bg-gradient-to-r hover:from-[#FF7B21]/5 hover:to-transparent transition-all duration-200"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        onClick={() => {
                          if (r.id) navigate(`/admin/subscriptions/${r.id}`);
                        }}
                      >
                        <TableCell className="max-w-[240px] truncate">
                          <div className="font-medium">{r.storeName || "—"}</div>
                          <div className="text-xs text-muted-foreground truncate">{r.id || "—"}</div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{r.planName || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={r.status === "Active" ? "border-emerald-500/50 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : ""}>
                            {r.status || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                          {r.startDate || "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                          {r.endDate || "—"}
                        </TableCell>
                        <TableCell>
                          {r.daysRemaining ? r.daysRemaining.toLocaleString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
                              onClick={() => openExtend(r.raw)}
                            >
                              <CalendarPlus className="h-4 w-4" />
                              {t("admin:subscriptionsPage.actions.extend")}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1"
                              onClick={() => openCancel(r.raw)}
                            >
                              <Ban className="h-4 w-4" />
                              {t("admin:subscriptionsPage.actions.cancel")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                              onClick={() => {
                                setRawTitle(t("admin:subscriptionsPage.rawTitle", { id: r.id || "—" }));
                                setRawValue(r.raw);
                                setRawOpen(true);
                              }}
                            >
                              {t("admin:subscriptionsPage.columns.raw")}
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {!loading && tableRows.length > 0 && (
        <motion.div
          className="flex items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div>
            {t("admin:subscriptionsPage.pagination.summary", {
              from: pagedRows.length > 0 ? (page - 1) * pageSize + 1 : 0,
              to: (page - 1) * pageSize + pagedRows.length,
              total: tableRows.length,
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("admin:subscriptionsPage.pagination.prev")}
            </Button>
            <span>
              {t("admin:subscriptionsPage.pagination.page", { page, totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("admin:subscriptionsPage.pagination.next")}
            </Button>
          </div>
        </motion.div>
      )}

      <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setActionTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "cancel" ? (
                <>
                  <Ban className="h-5 w-5 text-red-500" />
                  {t("admin:subscriptionsPage.dialog.cancelTitle")}
                </>
              ) : (
                <>
                  <CalendarPlus className="h-5 w-5 text-[#FF7B21]" />
                  {t("admin:subscriptionsPage.dialog.extendTitle")}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {t("admin:subscriptionsPage.dialog.description")}
            </DialogDescription>
          </DialogHeader>

          {actionType === "extend" && (
            <div className="space-y-2 pt-2">
              <Label>{t("admin:subscriptionsPage.dialog.daysLabel")}</Label>
              <Input
                inputMode="numeric"
                value={String(days)}
                onChange={(e) => setDays(Number(e.target.value || 0))}
                placeholder={t("admin:subscriptionsPage.dialog.daysPlaceholder")}
                className="bg-background/80"
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => { setActionType(null); setActionTarget(null); }} disabled={acting}>
              {t("common:actions.cancel")}
            </Button>
            <Button
              variant={actionType === "cancel" ? "destructive" : "default"}
              onClick={() => void doAction()}
              disabled={acting || (actionType === "extend" && Number(days) <= 0)}
              className={actionType === "extend" ? "bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300" : undefined}
            >
              {acting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common:actions.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <JsonViewerDialog
        open={rawOpen}
        onOpenChange={setRawOpen}
        title={rawTitle}
        value={rawValue}
      />
    </motion.div>
  );
}

