import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { ArrowLeft, Layers, MapPin, Phone, Store, Calendar, BadgeCheck } from "lucide-react";

import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { storesApi } from "@/shared/lib/storesApi";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import type { Store as StoreType } from "@/shared/types/stores";
import type { SubscriptionStatus } from "@/shared/types/subscription";
import { useTranslation } from "react-i18next";

const toDate = (v?: string | null) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function StoreDetailPage() {
  const { t, i18n } = useTranslation(["store", "common"]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<StoreType | null>(null);
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const [s, ss] = await Promise.all([
          storesApi.getStoreById(id),
          subscriptionApi.getStoreSubscriptionStatus(id).catch(() => null),
        ]);
        setStore(s);
        setSub(ss);
      } catch (err) {
        console.error("Failed to load store detail:", err);
        toast.error(t("store:detail.toast.loadError"));
        navigate("/dashboard/stores", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, navigate, t]);

  const endDate = useMemo(() => {
    return (
      sub?.subscriptionEndDate ??
      (sub as unknown as { endDate?: string | null })?.endDate ??
      sub?.trialEndDate ??
      null
    );
  }, [sub]);

  const endDateObj = toDate(endDate);
  const createdDateObj = toDate(store?.createdAt ?? null);

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

  if (!store) return null;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-[#FF7B21]/10 hover:text-[#FF7B21] transition-all duration-200"
          onClick={() => navigate("/dashboard/stores")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("store:detail.backToList")}
        </Button>
        <Badge variant="outline" className="font-mono text-[11px]">
          {store.id}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="relative overflow-hidden p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21]/10 via-transparent to-[#19D6C8]/10 pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/30">
              <Store className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold truncate">{store.storeName}</h1>
                <Badge
                  variant={store.isActive ? "outline" : "destructive"}
                  className={
                    store.isActive
                      ? "border-emerald-500/50 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                      : ""
                  }
                >
                  {store.isActive ? t("store:status.active") : t("store:status.inactive")}
                </Badge>
              </div>
              <div className="mt-2 grid gap-2 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4" />
                  <span className="break-words">{store.address || t("store:detail.address.empty")}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{store.phone || t("store:detail.phone.empty")}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {t("store:detail.createdAt")}:{" "}
                    <span className="font-mono">
                      {createdDateObj ? createdDateObj.toLocaleString(i18n.language) : "—"}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BadgeCheck className="h-4 w-4" />
                  <span className="font-mono">
                    {t("store:detail.gps.label")}:{" "}
                    {store.latitude != null && store.longitude != null
                      ? `${store.latitude.toFixed?.(5) ?? store.latitude}, ${
                          store.longitude.toFixed?.(5) ?? store.longitude
                        }`
                      : t("store:detail.gps.empty")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#FF7B21]" />
              <h2 className="text-sm font-semibold">{t("store:detail.subscription.title")}</h2>
            </div>
            <Badge variant="outline" className="text-[11px] border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
              {t("store:detail.subscription.badge")}
            </Badge>
          </div>

          {sub ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{t("store:detail.subscription.currentPlan")}</span>
                <Badge variant="outline" className="text-xs">
                  {sub.planName || "—"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{t("store:detail.subscription.status")}</span>
                <span className="font-medium">{sub.status || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{t("store:detail.subscription.endDate")}</span>
                <span className="font-mono">
                  {endDateObj ? endDateObj.toLocaleDateString(i18n.language) : "—"}
                </span>
              </div>
              {typeof sub.daysRemaining === "number" && (
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{t("store:detail.subscription.remaining")}</span>
                  <span className="font-medium">{t("store:detail.subscription.remainingDays", { days: sub.daysRemaining })}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              {t("store:detail.subscription.unavailable")}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => navigate("/dashboard/subscription")}
          >
            {t("store:detail.subscription.viewOrUpgrade")}
          </Button>
        </Card>
      </div>
    </motion.div>
  );
}

