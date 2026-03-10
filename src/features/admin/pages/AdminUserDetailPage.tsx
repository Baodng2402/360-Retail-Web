import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { superAdminUsersApi, type SuperAdminUserDto } from "@/shared/lib/superAdminUsersApi";
import { storesApi } from "@/shared/lib/storesApi";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import type { Store } from "@/shared/types/stores";
import type { SubscriptionStatus } from "@/shared/types/subscription";
import { ArrowLeft, ShieldCheck, Store as StoreIcon, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function AdminUserDetailPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SuperAdminUserDto | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [storeSub, setStoreSub] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const u = await superAdminUsersApi.get(id);
        if (!u) {
          toast.error(t("common:states.error"));
          navigate("/admin/users", { replace: true });
          return;
        }
        setUser(u);
        if (u.storeId) {
          try {
            const [s, sub] = await Promise.all([
              storesApi.getStoreById(u.storeId),
              subscriptionApi
                .getStoreSubscriptionStatus(u.storeId)
                .catch(() => null),
            ]);
            setStore(s);
            setStoreSub(sub);
          } catch {
            setStore(null);
            setStoreSub(null);
          }
        } else {
          setStore(null);
          setStoreSub(null);
        }
      } catch (err) {
        console.error("Failed to load user detail:", err);
        toast.error(t("common:states.error"));
        navigate("/admin/users", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, navigate, t]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Card className="p-4 space-y-3">
          <Skeleton className="h-6 w-60" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const primaryRole = user.roles?.[0] ?? "—";

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => navigate("/admin/users")}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common:actions.back")}
      </Button>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <Card className="relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-blue-500/10 pointer-events-none" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-lg">
              <User className="h-6 w-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg md:text-xl font-semibold break-all">
                  {user.email}
                </h1>
                <Badge variant="outline" className="text-xs">
                  {primaryRole}
                </Badge>
                {user.status && (
                  <Badge variant="outline" className="text-xs">
                    {user.status}
                  </Badge>
                )}
                {user.isActivated ? (
                  <Badge className="bg-emerald-600 text-white gap-1 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t("users.activated.yes")}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    {t("users.activated.no")}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                ID: <span className="font-mono break-all">{user.id}</span>
              </p>
            </div>
          </div>

          <div className="relative mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Roles
              </div>
              <div className="flex flex-wrap gap-1">
                {(user.roles ?? []).length === 0 ? (
                  <span className="text-sm text-muted-foreground">—</span>
                ) : (
                  (user.roles ?? []).map((r) => (
                    <Badge key={r} variant="outline" className="text-xs">
                      {r}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <StoreIcon className="h-3.5 w-3.5" />
                Store gắn với user
              </div>
              {user.storeId ? (
                <div className="space-y-1 text-sm text-muted-foreground rounded-lg border bg-background/60 px-3 py-2">
                  <div className="font-medium text-foreground">
                    {store?.storeName ?? user.storeId}
                  </div>
                  {store?.address && <div>{store.address}</div>}
                  {store?.phone && <div>{store.phone}</div>}
                  <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
                    <Badge variant={store?.isActive ? "outline" : "destructive"}>
                      {store?.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {storeSub?.planName && (
                      <Badge variant="outline">{storeSub.planName}</Badge>
                    )}
                    {typeof storeSub?.daysRemaining === "number" && (
                      <span>{storeSub.daysRemaining} ngày còn lại</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Không gắn với store nào.</div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Ghi chú cho SuperAdmin</h2>
            <Badge variant="outline" className="text-[11px]">
              System view
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Khi backend bổ sung nhiều metadata hơn (số lần đăng nhập, thời gian tạo, lịch sử
            subscription theo user, v.v.) card này có thể mở rộng để hiển thị thêm insight về
            tài khoản. Hiện tại trang này tập trung giúp bạn xem nhanh roles, trạng thái kích
            hoạt và store/gói dịch vụ mà user đang gắn với.
          </p>
        </Card>
      </div>
    </div>
  );
}

