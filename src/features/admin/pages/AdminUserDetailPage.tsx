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
import { ArrowLeft, ShieldCheck } from "lucide-react";
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
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => navigate("/admin/users")}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common:actions.back")}
      </Button>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold break-all">{user.email}</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>ID: {user.id}</span>
              {user.storeId && <span>• StoreId: {user.storeId}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline">{primaryRole}</Badge>
            <div className="flex items-center gap-2">
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
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Store
            </div>
            {user.storeId ? (
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="font-medium text-foreground">
                  {store?.storeName ?? user.storeId}
                </div>
                {store?.address && <div>{store.address}</div>}
                {store?.phone && <div>{store.phone}</div>}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant={store?.isActive ? "outline" : "destructive"}>
                    {store?.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {storeSub && storeSub.planName && (
                    <Badge variant="outline">
                      {storeSub.planName}
                    </Badge>
                  )}
                  {storeSub && typeof storeSub.daysRemaining === "number" && (
                    <span>
                      {storeSub.daysRemaining} days remaining
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">—</div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

