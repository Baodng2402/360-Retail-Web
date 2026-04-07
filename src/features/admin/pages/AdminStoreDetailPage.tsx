import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ArrowLeft, MapPin, Phone, Store, Users, Layers } from "lucide-react";
import toast from "react-hot-toast";
import { storesApi } from "@/shared/lib/storesApi";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import { superAdminSaasApi } from "@/shared/lib/superAdminSaasApi";
import type { Store as StoreType } from "@/shared/types/stores";
import type { SubscriptionStatus } from "@/shared/types/subscription";

export default function AdminStoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<StoreType | null>(null);
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);
  const [dashStore, setDashStore] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const [s, subStatus, dashboardStores] = await Promise.all([
          storesApi.getStoreById(id),
          subscriptionApi.getStoreSubscriptionStatus(id).catch(() => null),
          superAdminSaasApi.listDashboardStores().catch(() => []),
        ]);
        setStore(s);
        setSub(subStatus);
        const found =
          (dashboardStores as Record<string, unknown>[]).find(
            (x) => String(x.id ?? "") === id,
          ) ?? null;
        setDashStore(found);
      } catch (err) {
        console.error("Failed to load store detail:", err);
        toast.error("Không tải được thông tin store.");
        navigate("/admin/stores", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, navigate]);

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

  if (!store) {
    return null;
  }

  const createdDate = store.createdAt
    ? new Date(store.createdAt).toLocaleString("vi-VN")
    : "—";
  const endDate =
    ((dashStore?.subscriptionEndDate ??
      dashStore?.subscription_end_date) as string | null | undefined) ??
    sub?.subscriptionEndDate ??
    (sub as unknown as { endDate?: string | null })?.endDate ??
    sub?.trialEndDate ??
    null;
  const dashOwnerEmail = String(dashStore?.ownerEmail ?? dashStore?.owner_email ?? "").trim();
  const dashPlanName = String(dashStore?.currentPlan ?? dashStore?.planName ?? dashStore?.plan_name ?? "").trim();
  const dashSubStatus = String(dashStore?.subscriptionStatus ?? dashStore?.subscription_status ?? "").trim();

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
          onClick={() => navigate("/admin/stores")}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách stores
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
                <Store className="h-6 w-6" />
              </motion.div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold truncate">{store.storeName}</h1>
                  <Badge
                    variant={store.isActive ? "outline" : "destructive"}
                    className={store.isActive ? "border-emerald-500/50 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : ""}
                  >
                    {store.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  ID: <span className="font-mono break-all">{store.id}</span>
                </p>
              </div>
            </div>

            <div className="relative mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <MapPin className="h-3.5 w-3.5" />
                  Địa chỉ & Liên hệ
                </div>
                <div className="rounded-lg border bg-background/60 px-3 py-2 text-sm space-y-1">
                  {dashOwnerEmail && (
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>Owner</span>
                      <span className="font-mono break-all">{dashOwnerEmail}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span>{store.address || "Chưa có địa chỉ"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{store.phone || "Chưa có số điện thoại"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>GPS:</span>
                    <span className="font-mono">
                      {store.latitude != null && store.longitude != null
                        ? `${store.latitude.toFixed?.(5) ?? store.latitude}, ${
                            store.longitude.toFixed?.(5) ?? store.longitude
                          }`
                        : "Chưa cấu hình"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <Layers className="h-3.5 w-3.5" />
                  Subscription
                </div>
                <div className="rounded-lg border bg-background/60 px-3 py-2 text-sm space-y-1">
                  {sub ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">Gói hiện tại</span>
                        <Badge variant="outline" className="text-xs">
                          {dashPlanName || sub.planName || "Không rõ"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>Trạng thái</span>
                        <span className="font-medium">{dashSubStatus || sub.status}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>Ngày hết hạn</span>
                        <span className="font-mono">
                          {endDate
                            ? new Date(endDate).toLocaleDateString("vi-VN")
                            : "—"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Chưa có dữ liệu subscription cho store này hoặc bạn chưa có quyền xem.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="relative mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Ngày tạo: <span className="font-mono">{createdDate}</span>
              </span>
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
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#FF7B21]" />
                <h2 className="text-sm font-semibold">Nhân sự & quyền</h2>
              </div>
              <Badge variant="outline" className="text-[11px] border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
                SuperAdmin view
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Khu vực này tập trung tóm tắt thông tin nhân sự và quyền truy cập ở cấp cửa hàng để
              hỗ trợ kiểm tra nhanh trong quá trình vận hành.
            </p>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

