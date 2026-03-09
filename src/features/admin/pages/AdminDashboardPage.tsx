import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { TrendingUp, Store, UserPlus, Layers, Percent, Loader2 } from "lucide-react";
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

export default function AdminDashboardPage() {
  const { t } = useTranslation("admin");
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
  const [revenuePoints, setRevenuePoints] = useState<{ label: string; revenue: number }[]>([]);
  const [planDistribution, setPlanDistribution] = useState<
    { name: string; value: number }[]
  >([]);
  const [funnel, setFunnel] = useState<{ landing: number; signup: number } | null>(null);
  const [registrations, setRegistrations] = useState<{ label: string; count: number }[]>([]);

  useEffect(() => {
    // Default last 30 days
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 30);
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
        superAdminDashboardApi.getFunnelLandingToSignup(),
        superAdminDashboardApi.getRegistrations(query),
      ]);

      setOverview(ov);
      setRevenuePoints(
        (rev.dataPoints ?? []).map((p) => ({
          label: p.label,
          revenue: p.revenue,
        })),
      );
      setPlanDistribution(
        (plans ?? [])
          .filter((x) => x.planName && x.count > 0)
          .map((x) => ({ name: x.planName, value: x.count })),
      );
      setFunnel({ landing: fun.landing, signup: fun.signup });
      setRegistrations(regs);
    } catch (err) {
      console.error("Failed to load superadmin dashboard:", err);
      toast.error("Không tải được dữ liệu dashboard SuperAdmin.");
      setOverview(null);
      setRevenuePoints([]);
      setPlanDistribution([]);
      setFunnel(null);
      setRegistrations([]);
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
      tone: "from-emerald-500 to-teal-500",
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
      tone: "from-blue-500 to-cyan-500",
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

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                {t("dashboard.badge")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {t("dashboard.caption")}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("dashboard.filters.from")}
              </div>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("dashboard.filters.to")}
              </div>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("dashboard.filters.groupBy")}
              </div>
              <Select value={groupBy} onValueChange={(v) => setGroupBy(v as SuperAdminGroupBy)}>
                <SelectTrigger>
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
            <div className="flex items-end">
              <Button
                onClick={() => void loadAll()}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("dashboard.filters.refreshLoading")}
                  </>
                ) : (
                  t("dashboard.filters.refresh")
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.key} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{k.title}</div>
                <div className="mt-1 text-lg font-semibold truncate">
                  {loading && !overview ? <Skeleton className="h-6 w-24" /> : k.value}
                </div>
              </div>
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${k.tone} flex items-center justify-center text-white`}>
                <k.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">
              {t("dashboard.revenueChart.title")}
            </h3>
            <Badge variant="outline">{groupBy}</Badge>
          </div>
          <div className="mt-3">
            {loading && revenuePoints.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                {t("dashboard.states.loading")}
              </div>
            ) : (
              <ChartContainer config={revenueConfig} className="h-[260px] w-full">
                <LineChart data={revenuePoints} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">
              {t("dashboard.planDistribution.title")}
            </h3>
            <Badge variant="outline">
              {t("dashboard.planDistribution.badge")}
            </Badge>
          </div>
          <div className="mt-3">
            {loading && planDistribution.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                {t("dashboard.states.loading")}
              </div>
            ) : planDistribution.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                {t("dashboard.planDistribution.empty")}
              </div>
            ) : (
              <ChartContainer config={planConfig} className="h-[260px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={planDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  />
                </PieChart>
              </ChartContainer>
            )}
          </div>
          {planDistribution.length > 0 && (
            <div className="mt-3 grid gap-2">
              {planDistribution.slice(0, 6).map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{p.name}</span>
                  <span className="font-medium">{p.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">
              {t("dashboard.funnel.title")}
            </h3>
            <Badge variant="outline">
              {t("dashboard.funnel.badge")}
            </Badge>
          </div>
          <div className="mt-4 grid gap-3">
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

        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">
              {t("dashboard.registrations.title")}
            </h3>
            <Badge variant="outline" className="gap-1">
              <UserPlus className="h-3.5 w-3.5" />
              {t("dashboard.registrations.badge")}
            </Badge>
          </div>
          <div className="mt-3">
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
                  <Bar dataKey="count" fill="var(--color-count)" radius={6} />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

