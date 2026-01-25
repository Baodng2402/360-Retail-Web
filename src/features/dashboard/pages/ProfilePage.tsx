import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { CreditCard, CheckCircle, AlertCircle, Clock, Loader2, Building2, Store, Calendar, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { EditProfileForm } from "@/features/dashboard/components/EditProfileForm";
import { useAuthStore } from "@/shared/store/authStore";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import { storesApi } from "@/shared/lib/storesApi";
import type { MySubscription } from "@/shared/types/subscription";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface StoreWithSubscription {
  store: {
    id: string;
    storeName: string;
    address?: string;
    isActive: boolean;
    isDefault?: boolean;
  };
  subscription: {
    planName: string | null;
    price?: number | null;
    startDate: string | null;
    endDate: string | null;
    status: string | null;
    daysRemaining: number | null;
  } | null;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const formatDateShort = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const calculateProgress = (startDate: string | null | undefined, endDate: string | null | undefined) => {
  if (!startDate || !endDate) return 0;
  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  } catch {
    return 0;
  }
};

const formatRole = (role: string | undefined) => {
  if (!role) return "Thành viên";
  const roleMap: Record<string, string> = {
    StoreOwner: "Chủ cửa hàng",
    Manager: "Quản lý",
    Staff: "Nhân viên",
  };
  return roleMap[role] || role;
};

export function ProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [subscriptionInfo, setSubscriptionInfo] = useState<MySubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [storesWithSubscription, setStoresWithSubscription] = useState<StoreWithSubscription[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
    loadStoresData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setSubscriptionLoading(true);
      setSubscriptionError(null);
      const res = await subscriptionApi.getMySubscription();
      setSubscriptionInfo(res);
    } catch (err) {
      console.error("Failed to load subscription:", err);
      setSubscriptionError("Không thể tải thông tin gói dịch vụ");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const loadStoresData = async () => {
    try {
      setStoresLoading(true);
      const stores = await storesApi.getMyOwnedStores(true);
      
      const storesWithSub = await Promise.all(
        stores.map(async (store) => {
          try {
            const subRes = await subscriptionApi.getStoreSubscriptionStatus(store.id);
            return {
              store,
              subscription: {
                planName: subRes.planName,
                price: null,
                startDate: subRes.trialStartDate || null,
                endDate: subRes.trialEndDate || null,
                status: subRes.status || null,
                daysRemaining: subRes.daysRemaining || null,
              },
            };
          } catch {
            return {
              store,
              subscription: null,
            };
          }
        })
      );
      
      setStoresWithSubscription(storesWithSub);
    } catch (err) {
      console.error("Failed to load stores:", err);
    } finally {
      setStoresLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  const progress = calculateProgress(subscriptionInfo?.startDate, subscriptionInfo?.endDate);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-br from-white via-blue-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-teal-950/20 border-blue-100 dark:border-blue-900/30">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-lg">
                <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-teal-400 to-blue-500 text-white text-2xl font-bold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full" title="Online" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">{user?.name || "Người dùng"}</h2>
                <Badge className="bg-gradient-to-r from-teal-500 to-blue-500 text-white border-0">
                  {formatRole(user?.role)}
                </Badge>
                {subscriptionInfo?.planName && (
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                    {subscriptionInfo.planName}
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user?.email || "Chưa có email"}</span>
                </div>
              </div>
            </div>

            {subscriptionInfo?.planName && subscriptionInfo.daysRemaining && subscriptionInfo.daysRemaining > 0 && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => navigate("/dashboard/subscription")} 
                  className="gap-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 border-0"
                >
                  <CreditCard className="h-4 w-4" />
                  Quản lý gói
                </Button>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-br from-white via-blue-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-teal-950/20 border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Thông tin gói dịch vụ
            </h3>
            {subscriptionLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {subscriptionError ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">{subscriptionError}</p>
              <Button variant="outline" size="sm" onClick={loadSubscriptionData}>
                Thử lại
              </Button>
            </div>
          ) : subscriptionInfo?.planName ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-teal-50/80 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-teal-950/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-lg">{subscriptionInfo.planName}</p>
                      <p className="text-sm text-muted-foreground">Gói đang hoạt động</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                    Còn {subscriptionInfo.daysRemaining} ngày
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tiến trình sử dụng</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-blue-100 dark:bg-blue-900/30" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatDateShort(subscriptionInfo.startDate)}</span>
                    <span>{formatDateShort(subscriptionInfo.endDate)}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/30">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
                    <p className="font-medium">{formatDate(subscriptionInfo.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-800/30">
                  <Clock className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày hết hạn</p>
                    <p className="font-medium">{formatDate(subscriptionInfo.endDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
              <p className="text-muted-foreground mb-4">Bạn chưa có gói dịch vụ</p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => navigate("/dashboard/subscription")}
                  className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 border-0"
                >
                  Mua gói dịch vụ
                </Button>
              </motion.div>
            </div>
          )}
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="p-6 bg-gradient-to-br from-white via-blue-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-teal-950/20 border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Cửa hàng của bạn ({storesWithSubscription.length})
            </h3>
            {storesLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {storesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : storesWithSubscription.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {storesWithSubscription.map((item, index) => (
                <motion.div
                  key={item.store.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={cn(
                    "border rounded-lg p-4 transition-all hover:shadow-md bg-white/50 dark:bg-gray-800/30",
                    !item.store.isActive && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-sm">
                        <Store className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{item.store.storeName}</p>
                          {item.store.isDefault && (
                            <Badge variant="outline" className="text-xs px-2 py-0 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                              Mặc định
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.store.address || "Chưa có địa chỉ"}
                        </p>
                      </div>
                    </div>
                    {!item.store.isActive && (
                      <Badge variant="destructive" className="text-xs">Ngừng hoạt động</Badge>
                    )}
                  </div>

                  {item.subscription?.planName && (
                    <div className="pt-3 border-t mt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{item.subscription.planName}</span>
                        </div>
                        {item.subscription.daysRemaining !== null && item.subscription.daysRemaining > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                            {item.subscription.daysRemaining} ngày còn lại
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có cửa hàng nào</p>
            </div>
          )}
        </Card>
      </motion.div>

      <div className="space-y-4">
        <Card className="p-6 bg-gradient-to-br from-white via-blue-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-teal-950/20 border-blue-100 dark:border-blue-900/30">
          <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
          <EditProfileForm user={user} />
        </Card>
      </div>
    </div>
  );
}
