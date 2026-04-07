import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatVnd } from "@/shared/utils/formatMoney";
import {
  superAdminDashboardApi,
  type SuperAdminGroupBy,
} from "@/shared/lib/superAdminDashboardApi";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { TrendingUp, Store, UserPlus, Layers, Percent } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const groupByOptions: SuperAdminGroupBy[] = ["day", "week", "month"];

const toIsoFromDateInput = (date: string, endOfDay = false) => {
  if (!date) return undefined;
  const time = endOfDay ? "T23:59:59.999" : "T00:00:00.000";
  return new Date(`${date}${time}`).toISOString();
};

const normalizeConversionRate = (v: number) => {
  // Backend may return 0..1 or 0..100
  if (v <= 1) return v * 100;
  return v;
};

const formatDateFilter = (value: string) => {
  if (!value) return "—";
  // Input from <input type="date" /> is "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [yyyy, mm, dd] = value.split("-");
    return `${dd}/${mm}/${yyyy}`;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
};

const formatRevenueLabel = (
  label: string,
  groupBy: SuperAdminGroupBy,
  t: (key: string, options?: Record<string, unknown>) => string,
) => {
  if (!label) return label;
  if (groupBy === "month" && /^\d{4}-\d{2}$/.test(label)) {
    const [year, month] = label.split("-");
    return t("dashboard.formats.monthLabel", { month: Number(month), year });
  }
  if (groupBy === "day" && /^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const [, month, day] = label.split("-");
    return `${day}/${month}`;
  }
  if (groupBy === "week" && /^\d{4}-W\d{1,2}$/.test(label)) {
    const [year, week] = label.split("-W");
    return t("dashboard.formats.weekLabel", { week: Number(week), year });
  }
  return label;
};

export default function AdminDashboardPage() {
  const { t } = useTranslation("admin");
  const tAny = (key: string, options?: Record<string, unknown>) =>
    String(t(key as never, options as never));
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [groupBy, setGroupBy] = useState<SuperAdminGroupBy>("month");

  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<{
    totalRevenue: number;
    mrr: number;
    activeStores: number;
    trialStores: number;
    expiredStores: number;
    conversionRate: number;
  } | null>(null);
  const [revenuePoints, setRevenuePoints] = useState<{ label: string; revenue: number; mrr?: number }[]>([]);
  const [planDistribution, setPlanDistribution] = useState<
    { name: string; value: number }[]
  >([]);
  const [funnel, setFunnel] = useState<{ landing: number; signup: number } | null>(null);
  const [storeStatus, setStoreStatus] = useState<
    { name: string; value: number; fill: string }[]
  >([]);
  const [registrations, setRegistrations] = useState<{ label: string; count: number }[]>([]);

  const todayYmd = useMemo(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }, []);

  const isFutureDate = (value: string) => {
    if (!value) return false;
    return value > todayYmd;
  };

  useEffect(() => {
    // Default last 12 months (best for MRR trend)
    const now = new Date();
    const from = new Date(now);
    from.setFullYear(now.getFullYear() - 1);
    const toYmd = now.toISOString().slice(0, 10);
    const fromYmd = from.toISOString().slice(0, 10);
    setFromDate(fromYmd);
    setToDate(toYmd);
  }, []);

  const query = useMemo(() => {
    const from = toIsoFromDateInput(fromDate, false);
    const to = toIsoFromDateInput(toDate, true);
    return { from, to };
  }, [fromDate, toDate]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [ov, rev, plans, fun, regs] = await Promise.all([
        superAdminDashboardApi.getOverview(query),
        superAdminDashboardApi.getRevenueChart({
          ...query,
          groupBy,
        }),
        superAdminDashboardApi.getPlanDistribution(query),
        superAdminDashboardApi.getFunnelLandingToSignup(query),
        superAdminDashboardApi.getRegistrations(query),
      ]);

      setOverview(ov);
      setRevenuePoints(
        (rev.dataPoints ?? []).map((p) => ({
          label: p.label,
          revenue: p.revenue,
          mrr: p.mrr,
        })),
      );
      setPlanDistribution(
        (plans ?? [])
          .filter((x) => x.planName && x.count > 0)
          .map((x) => ({ name: x.planName, value: x.count })),
      );
      setFunnel({ landing: fun.landing, signup: fun.signup });
      setRegistrations(regs);
      setStoreStatus([
        { name: t("dashboard.storeStatus.active"), value: ov.activeStores, fill: "#22c55e" },
        { name: t("dashboard.storeStatus.trial"), value: ov.trialStores, fill: "#f59e0b" },
        { name: t("dashboard.storeStatus.expired"), value: ov.expiredStores, fill: "#ef4444" },
      ]);
    } catch (err) {
      console.error("Failed to load superadmin dashboard:", err);
      toast.error(t("dashboard.toast.loadError"));
      setOverview(null);
      setRevenuePoints([]);
      setPlanDistribution([]);
      setFunnel(null);
      setRegistrations([]);
      setStoreStatus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fromDate || !toDate) return;
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, groupBy]);

  const kpis = [
    {
      key: "totalRevenue",
      title: t("dashboard.kpis.totalRevenue"),
      icon: TrendingUp,
      value: overview ? formatVnd(overview.totalRevenue) : "—",
      tone: "from-[#FF7B21] to-[#19D6C8]",
    },
    {
      key: "mrr",
      title: t("dashboard.kpis.mrr"),
      icon: Layers,
      value: overview ? formatVnd(overview.mrr) : "—",
      tone: "from-indigo-500 to-purple-500",
    },
    {
      key: "activeStores",
      title: t("dashboard.kpis.activeStores"),
      icon: Store,
      value: overview ? overview.activeStores.toLocaleString() : "—",
      tone: "from-emerald-500 to-teal-500",
    },
    {
      key: "trialStores",
      title: t("dashboard.kpis.trialStores"),
      icon: Store,
      value: overview ? overview.trialStores.toLocaleString() : "—",
      tone: "from-amber-500 to-orange-500",
    },
    {
      key: "expiredStores",
      title: t("dashboard.kpis.expiredStores"),
      icon: Store,
      value: overview ? overview.expiredStores.toLocaleString() : "—",
      tone: "from-rose-500 to-red-500",
    },
    {
      key: "conversionRate",
      title: t("dashboard.kpis.conversionRate"),
      icon: Percent,
      value: overview
        ? `${normalizeConversionRate(overview.conversionRate).toFixed(2)}%`
        : "—",
      tone: "from-fuchsia-500 to-pink-500",
    },
  ] as const;

  const revenueConfig = {
    revenue: { label: t("dashboard.revenueChart.tooltipLabel"), color: "var(--chart-1)" },
  } as const;
  const registrationsConfig = {
    count: { label: t("dashboard.registrations.label"), color: "var(--chart-2)" },
  } as const;
  const planConfig = {
    value: { label: t("dashboard.planDistribution.label"), color: "var(--chart-3)" },
  } as const;
  const storeStatusConfig = {
    value: { label: t("dashboard.storeStatusSection.valueLabel"), color: "var(--chart-4)" },
  } as const;

  const planColors = ["#FF7B21", "#19D6C8", "#0ea5e9", "#a855f7", "#22c55e", "#f59e0b"] as const;
  const planData = planDistribution.map((p, i) => ({
    ...p,
    fill: planColors[i % planColors.length],
  }));

  const latestRevenuePoint = revenuePoints[revenuePoints.length - 1];
  const previousRevenuePoint =
    revenuePoints.length > 1 ? revenuePoints[revenuePoints.length - 2] : undefined;
  const trendPercent =
    latestRevenuePoint && previousRevenuePoint && previousRevenuePoint.revenue > 0
      ? ((latestRevenuePoint.revenue - previousRevenuePoint.revenue) / previousRevenuePoint.revenue) * 100
      : null;

  const last12MonthsPoints = useMemo(() => {
    if (groupBy !== "month") return [];
    return revenuePoints.slice(-12);
  }, [groupBy, revenuePoints]);

  const twelveMonthGrowthPercent = useMemo(() => {
    if (groupBy !== "month") return null;
    const pts = last12MonthsPoints;
    if (pts.length < 2) return null;
    const first = pts[0]?.revenue ?? 0;
    const last = pts[pts.length - 1]?.revenue ?? 0;
    if (first <= 0) return null;
    return ((last - first) / first) * 100;
  }, [groupBy, last12MonthsPoints]);

  return (
    <motion.div
      className="space-y-4"
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/20">
                  {t("dashboard.badge")}
                </Badge>
                <span>{t("header.dashboard.title")}</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.caption")}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  {t("dashboard.filters.from")}
                </div>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (isFutureDate(next)) {
                      toast.error(t("dashboard.validation.fromDateNotAfterToday"));
                      return;
                    }
                    if (toDate && next > toDate) {
                      toast.error(t("dashboard.validation.fromDateNotAfterToDate"));
                      return;
                    }
                    setFromDate(next);
                    setOverview(null);
                    setRevenuePoints([]);
                  }}
                  className="bg-background/80 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  {t("dashboard.filters.to")}
                </div>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (isFutureDate(next)) {
                      toast.error(t("dashboard.validation.toDateNotAfterToday"));
                      return;
                    }
                    if (fromDate && next < fromDate) {
                      toast.error(t("dashboard.validation.toDateNotBeforeFromDate"));
                      return;
                    }
                    setToDate(next);
                    setOverview(null);
                    setRevenuePoints([]);
                  }}
                  className="bg-background/80 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  {t("dashboard.filters.groupBy")}
                </div>
                <Select
                  value={groupBy}
                  onValueChange={(v) => {
                    setGroupBy(v as SuperAdminGroupBy);
                    setRevenuePoints([]);
                  }}
                >
                  <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                    <SelectValue placeholder={t("dashboard.filters.selectPlaceholder")} />
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
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k, index) => (
          <motion.div
            key={k.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <Card className="p-4 h-full hover:shadow-lg transition-all duration-300">
              <div className="h-full flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground leading-snug line-clamp-2 min-h-[2.25rem]">
                    {k.title}
                  </div>
                  <div className="mt-1 text-lg font-semibold truncate">
                    {loading && !overview ? <Skeleton className="h-6 w-24" /> : k.value}
                  </div>
                </div>
                <div
                  className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${k.tone} flex items-center justify-center text-white shadow-lg`}
                >
                  <k.icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 items-stretch">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-semibold">
                  {t(`dashboard.revenueTrend.title.${groupBy}`)}
                </h3>
                {groupBy === "month" && twelveMonthGrowthPercent != null && (
                  <div className="text-xs text-muted-foreground">
                    {twelveMonthGrowthPercent >= 0
                      ? t("dashboard.revenueTrend.growth.upLabel")
                      : t("dashboard.revenueTrend.growth.downLabel")}
                    :{" "}
                    <span className="font-medium text-foreground">
                      {twelveMonthGrowthPercent >= 0 ? "+" : ""}
                      {twelveMonthGrowthPercent.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
                {t(`dashboard.filters.groupByOptions.${groupBy}`)}
              </Badge>
            </div>
            <div className="mt-3 flex-1">
              {loading && revenuePoints.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                  {t("dashboard.states.loading")}
                </div>
              ) : revenuePoints.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                  {t("dashboard.states.noRevenueData")}
                </div>
              ) : (
                <ChartContainer config={revenueConfig} className="h-[260px] w-full">
                  <LineChart
                    data={revenuePoints}
                    margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value: string) => formatRevenueLabel(value, groupBy, tAny)}
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full p-4 hover:shadow-lg transition-shadow duration-300 overflow-visible flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {t("dashboard.planDistribution.title")}
              </h3>
              <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
                {t("dashboard.planDistribution.badge")}
              </Badge>
            </div>
            <div className="mt-3 flex-1">
              {loading && planDistribution.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                  {t("dashboard.states.loading")}
                </div>
              ) : planData.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                  {t("dashboard.planDistribution.empty")}
                </div>
              ) : (
                <ChartContainer config={planConfig} className="h-[260px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={planData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      isAnimationActive
                    >
                      {planData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              )}
            </div>
            {planData.length > 0 && (
              <div className="mt-3 grid gap-2">
                {planData.slice(0, 6).map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
                      <span className="text-muted-foreground truncate">{p.name}</span>
                    </div>
                    <span className="font-medium">{p.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="h-full p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {t("dashboard.funnel.title")}
              </h3>
              <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
                {t("dashboard.funnel.badge")}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 flex-1">
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm text-muted-foreground">
                  {t("dashboard.funnel.landing")}
                </span>
                <span className="text-sm font-semibold">
                  {funnel ? funnel.landing.toLocaleString() : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm text-muted-foreground">
                  {t("dashboard.funnel.signup")}
                </span>
                <span className="text-sm font-semibold">
                  {funnel ? funnel.signup.toLocaleString() : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm text-muted-foreground">
                  {t("dashboard.funnel.conversion")}
                </span>
                <span className="text-sm font-semibold">
                  {funnel && funnel.landing > 0
                    ? `${((funnel.signup / funnel.landing) * 100).toFixed(2)}%`
                    : "—"}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="h-full p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {t("dashboard.registrations.title")}
              </h3>
              <Badge variant="outline" className="gap-1 border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
                <UserPlus className="h-3.5 w-3.5" />
                {t("dashboard.registrations.badge")}
              </Badge>
            </div>
            <div className="mt-3 flex-1">
              {loading && registrations.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                  {t("dashboard.states.loading")}
                </div>
              ) : (
                <ChartContainer config={registrationsConfig} className="h-[260px] w-full">
                  <BarChart data={registrations} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={6} isAnimationActive />
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 items-stretch">
        <motion.div
          className="lg:col-span-2 h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="h-full p-4 hover:shadow-lg transition-shadow duration-300 overflow-visible flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {t("dashboard.monthlyRevenueCard.title")}
              </h3>
              <Badge
                variant="outline"
                className="border-purple-400/40 text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-300"
              >
                {t("dashboard.monthlyRevenueCard.badge")}
              </Badge>
            </div>
            <div className="mt-3 flex-1 grid items-center">
              {loading && !overview ? (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                  {t("dashboard.states.loading")}
                </div>
              ) : (
                <div className="h-[240px] flex flex-col justify-center gap-3">
                  <div className="text-3xl font-semibold tracking-tight">
                    {overview ? formatVnd(overview.mrr) : "—"}
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    <p>{t("dashboard.monthlyRevenueCard.description")}</p>
                    <p>
                      {t("dashboard.monthlyRevenueCard.rangeLabel")}{" "}
                      <span className="font-medium text-foreground">
                        {formatDateFilter(fromDate)} → {formatDateFilter(toDate)}
                      </span>
                    </p>
                    {groupBy === "month" && latestRevenuePoint && (
                      <p>
                        {t("dashboard.monthlyRevenueCard.latestMonthLabel")} (
                        {formatRevenueLabel(latestRevenuePoint.label, "month", tAny)}):{" "}
                        <span className="font-medium text-foreground">
                          {formatVnd(latestRevenuePoint.revenue)}
                        </span>
                        {trendPercent != null && (
                          <>
                            {" "}
                            •{" "}
                            <span className="font-medium text-foreground">
                              {trendPercent >= 0
                                ? t("dashboard.monthlyRevenueCard.momUp")
                                : t("dashboard.monthlyRevenueCard.momDown")}{" "}
                              {trendPercent >= 0 ? "+" : ""}{trendPercent.toFixed(1)}%
                            </span>{" "}
                            {t("dashboard.monthlyRevenueCard.momSuffix")}
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="h-full p-4 hover:shadow-lg transition-shadow duration-300 overflow-visible flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">
                {t("dashboard.storeStatusSection.title")}
              </h3>
              <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
                {t("dashboard.storeStatusSection.badge")}
              </Badge>
            </div>
            {loading && storeStatus.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                {t("dashboard.states.loading")}
              </div>
            ) : storeStatus.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                {t("dashboard.states.noStoreData")}
              </div>
            ) : (
              <>
                <ChartContainer config={storeStatusConfig} className="h-[200px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={storeStatus}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      isAnimationActive
                    />
                  </PieChart>
                </ChartContainer>
                <div className="mt-3 grid gap-2">
                  {storeStatus.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="font-medium">{s.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

