import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { Receipt, TrendingUp } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import {
  superAdminDashboardApi,
  type SuperAdminGroupBy,
} from "@/shared/lib/superAdminDashboardApi";
import { superAdminSaasApi } from "@/shared/lib/superAdminSaasApi";
import { formatVnd } from "@/shared/utils/formatMoney";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";

type PaymentStatusFilter = "all" | "Completed" | "Pending" | "Failed";

const groupByOptions: SuperAdminGroupBy[] = ["day", "week", "month"];

const toIsoFromDateInput = (date: string, endOfDay = false) => {
  if (!date) return undefined;
  const time = endOfDay ? "T23:59:59.999" : "T00:00:00.000";
  return new Date(`${date}${time}`).toISOString();
};

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

const formatRevenueLabel = (label: string, groupBy: SuperAdminGroupBy) => {
  if (!label) return label;
  if (groupBy === "month" && /^\d{4}-\d{2}$/.test(label)) {
    const [year, month] = label.split("-");
    return `T${Number(month)}/${year}`;
  }
  if (groupBy === "day" && /^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const [, month, day] = label.split("-");
    return `${day}/${month}`;
  }
  if (groupBy === "week" && /^\d{4}-W\d{1,2}$/.test(label)) {
    const [year, week] = label.split("-W");
    return `Tuần ${Number(week)}/${year}`;
  }
  return label;
};

const getThisMonthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    fromYmd: first.toISOString().slice(0, 10),
    toYmd: now.toISOString().slice(0, 10),
  };
};

export default function AdminRevenuePage() {
  const { t } = useTranslation("admin");

  const [groupBy, setGroupBy] = useState<SuperAdminGroupBy>("month");
  const [status, setStatus] = useState<PaymentStatusFilter>("Completed");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<{ totalRevenue: number; mrr: number } | null>(null);
  const [revenuePoints, setRevenuePoints] = useState<{ label: string; revenue: number }[]>([]);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);

  const query = useMemo(() => {
    const from = toIsoFromDateInput(fromDate, false);
    const to = toIsoFromDateInput(toDate, true);
    return { from, to };
  }, [fromDate, toDate]);

  const revenueConfig = useMemo(() => {
    return {
      revenue: { label: t("dashboard.revenueChart.tooltipLabel"), color: "var(--chart-1)" },
    } as const;
  }, [t]);

  const loadAll = async () => {
    if (!fromDate || !toDate) return;
    try {
      setLoading(true);
      const [ov, rev, pay] = await Promise.all([
        superAdminDashboardApi.getOverview(query),
        superAdminDashboardApi.getRevenueChart({ ...query, groupBy }),
        superAdminSaasApi.listDashboardPayments({
          status: status === "all" ? undefined : status,
          from: query.from,
          to: query.to,
        }),
      ]);

      setOverview({ totalRevenue: ov.totalRevenue, mrr: ov.mrr });
      setRevenuePoints((rev.dataPoints ?? []).map((p) => ({ label: p.label, revenue: p.revenue })));
      setPayments(pay ?? []);
    } catch (err) {
      console.error("Failed to load revenue view:", err);
      toast.error(t("revenuePage.toast.loadError"));
      setOverview(null);
      setRevenuePoints([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { fromYmd, toYmd } = getThisMonthRange();
    setFromDate(fromYmd);
    setToDate(toYmd);
  }, []);

  useEffect(() => {
    if (!fromDate || !toDate) return;
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, groupBy, status]);

  const paymentRows = useMemo(() => {
    const base = payments.map((x) => {
      const o = x as Record<string, unknown>;
      return {
        raw: o,
        id: getStr(o, ["id", "paymentId", "payment_id"]),
        storeName: getStr(o, ["storeName", "store_name", "store"]),
        planName: getStr(o, ["planName", "plan_name", "plan"]),
        provider: getStr(o, ["provider", "paymentProvider"]),
        status: getStr(o, ["status"]),
        amount: getNum(o, ["amount", "totalAmount", "total_amount"]),
        paymentDate: getStr(o, ["paymentDate", "paidAt", "createdAt", "created_at"]),
        transactionCode: getStr(o, ["transactionCode", "transaction_code", "txn"]),
      };
    });

    const term = search.trim().toLowerCase();
    if (!term) return base;
    return base.filter((r) => {
      return (
        r.id.toLowerCase().includes(term) ||
        r.storeName.toLowerCase().includes(term) ||
        r.planName.toLowerCase().includes(term) ||
        r.transactionCode.toLowerCase().includes(term) ||
        r.provider.toLowerCase().includes(term) ||
        (r.status ?? "").toLowerCase().includes(term)
      );
    });
  }, [payments, search]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <Card className="p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/20">
                SuperAdmin
              </Badge>
              <span className="text-sm text-muted-foreground">{t("revenuePage.caption")}</span>
            </div>
            <h1 className="text-lg font-semibold">{t("revenuePage.title")}</h1>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
            <div className="space-y-1 sm:col-span-1">
              <div className="text-xs text-muted-foreground">{t("revenuePage.filters.from")}</div>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-background/80 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-1 sm:col-span-1">
              <div className="text-xs text-muted-foreground">{t("revenuePage.filters.to")}</div>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-background/80 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-1 sm:col-span-1">
              <div className="text-xs text-muted-foreground">{t("revenuePage.filters.groupBy")}</div>
              <Select
                value={groupBy}
                onValueChange={(v) => setGroupBy(v as SuperAdminGroupBy)}
              >
                <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                  <SelectValue placeholder="Chọn..." />
                </SelectTrigger>
                <SelectContent>
                  {groupByOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {t(`dashboard.filters.groupByOptions.${opt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-1">
              <div className="text-xs text-muted-foreground">{t("revenuePage.filters.status")}</div>
              <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatusFilter)}>
                <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                  <SelectValue placeholder="Chọn..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="all">{t("revenuePage.filters.all")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-1">
              <div className="text-xs text-muted-foreground">{t("revenuePage.filters.search")}</div>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("revenuePage.filters.searchPlaceholder")}
                className="bg-background/80 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-end gap-2 sm:col-span-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const { fromYmd, toYmd } = getThisMonthRange();
                  setFromDate(fromYmd);
                  setToDate(toYmd);
                }}
              >
                {t("revenuePage.actions.thisMonth")}
              </Button>
              <Button
                onClick={() => void loadAll()}
                className="flex-1 bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300"
                disabled={loading}
              >
                {t("revenuePage.actions.refresh")}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">{t("dashboard.kpis.mrr")}</div>
              <div className="text-xl font-semibold">
                {loading && !overview ? <Skeleton className="h-7 w-40" /> : overview ? formatVnd(overview.mrr) : "—"}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">{t("dashboard.kpis.totalRevenue")}</div>
              <div className="text-xl font-semibold">
                {loading && !overview ? <Skeleton className="h-7 w-48" /> : overview ? formatVnd(overview.totalRevenue) : "—"}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center text-white shadow-lg">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">{t("revenuePage.payments.count")}</div>
              <div className="text-xl font-semibold">
                {loading ? <Skeleton className="h-7 w-24" /> : paymentRows.length.toLocaleString()}
              </div>
            </div>
            <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
              {status === "all" ? t("revenuePage.filters.all") : status}
            </Badge>
          </div>
        </Card>
      </div>

      <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">{t(`dashboard.revenueTrend.title.${groupBy}`)}</h3>
            <p className="text-xs text-muted-foreground">{t("revenuePage.chartHint")}</p>
          </div>
          <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
            {t(`dashboard.filters.groupByOptions.${groupBy}`)}
          </Badge>
        </div>

        <div className="mt-3">
          {loading && revenuePoints.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground">
              {t("dashboard.states.loading")}
            </div>
          ) : revenuePoints.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground">
              {t("revenuePage.states.noChartData")}
            </div>
          ) : (
            <ChartContainer config={revenueConfig} className="h-[280px] w-full">
              <LineChart data={revenuePoints} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => formatRevenueLabel(value, groupBy)}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                />
              </LineChart>
            </ChartContainer>
          )}
        </div>
      </Card>

      <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#FF7B21]" />
            {t("revenuePage.payments.title")}
          </h3>
          <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
            {paymentRows.length.toLocaleString()}
          </Badge>
        </div>

        <div className="mt-4">
          {loading && payments.length === 0 ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : paymentRows.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {t("revenuePage.states.noPayments")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#FF7B21]/5 to-[#19D6C8]/5">
                    <TableHead>{t("revenuePage.payments.columns.store")}</TableHead>
                    <TableHead>{t("revenuePage.payments.columns.plan")}</TableHead>
                    <TableHead>{t("revenuePage.payments.columns.status")}</TableHead>
                    <TableHead>{t("revenuePage.payments.columns.amount")}</TableHead>
                    <TableHead>{t("revenuePage.payments.columns.date")}</TableHead>
                    <TableHead>{t("revenuePage.payments.columns.provider")}</TableHead>
                    <TableHead>{t("revenuePage.payments.columns.transaction")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentRows.slice(0, 50).map((r) => (
                    <TableRow key={r.id || JSON.stringify(r.raw)}>
                      <TableCell className="max-w-[220px] truncate">
                        <div className="font-medium">{r.storeName || "—"}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.id || "—"}</div>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">{r.planName || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            r.status === "Completed"
                              ? "border-emerald-500/50 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                              : r.status === "Failed"
                                ? "border-red-500/50 text-red-600 bg-red-50 dark:bg-red-950/30"
                                : ""
                          }
                        >
                          {r.status || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatVnd(r.amount ?? 0)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{r.paymentDate || "—"}</TableCell>
                      <TableCell className="text-xs">{r.provider || "—"}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[220px] truncate">{r.transactionCode || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {paymentRows.length > 50 && (
                <div className="mt-3 text-xs text-muted-foreground">
                  {t("revenuePage.payments.limitNote", { count: 50 })}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

