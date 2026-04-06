import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Package, Tag, Calendar, ToggleLeft, ToggleRight, Braces } from "lucide-react";

import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { JsonViewerDialog } from "@/shared/components/JsonViewerDialog";
import { formatVnd } from "@/shared/utils/formatMoney";
import { superAdminSaasApi, type SuperAdminPlan } from "@/shared/lib/superAdminSaasApi";

const tryParseJson = (raw: string | null | undefined): unknown => {
  if (!raw) return null;
  const s = raw.trim();
  if (!s.startsWith("{") && !s.startsWith("[")) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

export default function AdminPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<SuperAdminPlan | null>(null);
  const [rawOpen, setRawOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const p = await superAdminSaasApi.getPlan(id);
        if (!p) {
          toast.error("Không tải được chi tiết plan.");
          navigate("/admin/plans", { replace: true });
          return;
        }
        setPlan(p);
      } catch (err) {
        console.error("Failed to load plan detail:", err);
        toast.error("Không tải được chi tiết plan.");
        navigate("/admin/plans", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, navigate]);

  const featuresJson = useMemo(() => tryParseJson(plan?.features ?? null), [plan?.features]);
  const createdAt = plan?.createdAt ? new Date(plan.createdAt).toLocaleString("vi-VN") : "—";

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

  if (!plan) return null;

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
          onClick={() => navigate("/admin/plans")}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách plans
        </Button>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21]/10 via-transparent to-[#19D6C8]/10 pointer-events-none" />

            <div className="relative flex items-start gap-4">
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/30"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Package className="h-6 w-6" />
              </motion.div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold truncate">{plan.planName}</h1>
                  <Badge
                    variant={plan.isActive ? "outline" : "destructive"}
                    className={plan.isActive ? "border-emerald-500/50 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : ""}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {plan.activeSubscriptions != null && (
                    <Badge variant="outline">
                      Active subs: {plan.activeSubscriptions.toLocaleString()}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  ID: <span className="font-mono break-all">{plan.id}</span>
                </p>
              </div>
            </div>

            <div className="relative mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <Tag className="h-3.5 w-3.5" />
                  Pricing
                </div>
                <div className="rounded-lg border bg-background/60 px-3 py-2 text-sm space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Price</span>
                    <span className="font-semibold">{formatVnd(plan.price ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Duration</span>
                    <span className="font-medium">{(plan.durationDays ?? 0).toLocaleString()} days</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <Calendar className="h-3.5 w-3.5" />
                  Metadata
                </div>
                <div className="rounded-lg border bg-background/60 px-3 py-2 text-sm space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Created</span>
                    <span className="font-mono text-xs">{createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Is active</span>
                    <span className="inline-flex items-center gap-2 font-medium">
                      {plan.isActive ? (
                        <>
                          <ToggleRight className="h-4 w-4 text-emerald-600" /> true
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4 text-red-600" /> false
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Endpoint: <span className="font-mono">/saas/super-admin/saas/plans/{plan.id}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setRawOpen(true)}
              >
                <Braces className="h-4 w-4" />
                Features JSON
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-5 space-y-3 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Features (preview)</h2>
              <Badge variant="outline" className="text-[11px] border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
                Read-only
              </Badge>
            </div>
            {typeof plan.features === "string" && plan.features.trim() !== "" ? (
              <>
                {featuresJson ? (
                  <div className="text-xs text-muted-foreground space-y-1">
                    {Object.entries(featuresJson as Record<string, unknown>)
                      .slice(0, 12)
                      .map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3">
                          <span className="font-mono">{k}</span>
                          <span className="truncate">{String(v)}</span>
                        </div>
                      ))}
                    <div className="pt-2 text-[11px]">
                      Xem đầy đủ trong “Features JSON”.
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                    {plan.features}
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-muted-foreground">Không có dữ liệu features.</div>
            )}
          </Card>
        </motion.div>
      </div>

      <JsonViewerDialog
        open={rawOpen}
        onOpenChange={setRawOpen}
        title={`Plan features: ${plan.planName}`}
        value={featuresJson ?? plan.features ?? null}
      />
    </motion.div>
  );
}

