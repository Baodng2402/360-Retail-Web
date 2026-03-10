import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ArrowLeft, MapPin, Phone, Store, Users, Layers } from "lucide-react";
import toast from "react-hot-toast";
import { storesApi } from "@/shared/lib/storesApi";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import type { Store as StoreType } from "@/shared/types/stores";
import type { SubscriptionStatus } from "@/shared/types/subscription";

export default function AdminStoreDetailPage() {
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
        const [s, subStatus] = await Promise.all([
          storesApi.getStoreById(id),
          subscriptionApi.getStoreSubscriptionStatus(id).catch(() => null),
        ]);
        setStore(s);
        setSub(subStatus);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/admin/stores")}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách stores
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-blue-500/10 pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-lg">
              <Store className="h-6 w-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold truncate">{store.storeName}</h1>
                <Badge
                  variant={store.isActive ? "outline" : "destructive"}
                  className="text-xs"
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
                        {sub.planName || "Không rõ"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>Trạng thái</span>
                      <span className="font-medium">{sub.status}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>Ngày hết hạn</span>
                      <span className="font-mono">
                        {sub.subscriptionEndDate
                          ? new Date(sub.subscriptionEndDate).toLocaleDateString("vi-VN")
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

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              <h2 className="text-sm font-semibold">Nhân sự & quyền</h2>
            </div>
            <Badge variant="outline" className="text-[11px]">
              SuperAdmin view
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Danh sách nhân viên theo từng store hiện chưa được expose qua API cho SuperAdmin.
            Khi backend bổ sung endpoint, màn hình này có thể mở rộng để hiển thị đầy đủ nhân viên
            và role chi tiết.
          </p>
        </Card>
      </div>
    </div>
  );
}

