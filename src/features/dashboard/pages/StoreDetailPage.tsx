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

const toDate = (v?: string | null) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function StoreDetailPage() {
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
        toast.error("Không tải được chi tiết cửa hàng.");
        navigate("/dashboard/stores", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, navigate]);

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
          Quay lại quản lý cửa hàng
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
                  {store.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="mt-2 grid gap-2 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4" />
                  <span className="break-words">{store.address || "Chưa có địa chỉ"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{store.phone || "Chưa có số điện thoại"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Ngày tạo:{" "}
                    <span className="font-mono">
                      {createdDateObj ? createdDateObj.toLocaleString("vi-VN") : "—"}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BadgeCheck className="h-4 w-4" />
                  <span className="font-mono">
                    GPS:{" "}
                    {store.latitude != null && store.longitude != null
                      ? `${store.latitude.toFixed?.(5) ?? store.latitude}, ${
                          store.longitude.toFixed?.(5) ?? store.longitude
                        }`
                      : "Chưa cấu hình"}
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
              <h2 className="text-sm font-semibold">Gói dịch vụ</h2>
            </div>
            <Badge variant="outline" className="text-[11px] border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
              Subscription
            </Badge>
          </div>

          {sub ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Gói hiện tại</span>
                <Badge variant="outline" className="text-xs">
                  {sub.planName || "—"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Trạng thái</span>
                <span className="font-medium">{sub.status || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Ngày hết hạn</span>
                <span className="font-mono">
                  {endDateObj ? endDateObj.toLocaleDateString("vi-VN") : "—"}
                </span>
              </div>
              {typeof sub.daysRemaining === "number" && (
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Còn lại</span>
                  <span className="font-medium">{sub.daysRemaining.toLocaleString("vi-VN")} ngày</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Chưa lấy được subscription status cho cửa hàng này.
            </div>
          )}

          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => navigate("/dashboard/subscription")}
          >
            Xem / nâng cấp gói
          </Button>
        </Card>
      </div>
    </motion.div>
  );
}

