import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Building2,
  Store,
  Calendar,
  User,
  ListChecks,
  CalendarCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { EditProfileForm } from "@/features/dashboard/components/EditProfileForm";
import { useAuthStore } from "@/shared/store/authStore";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import { storesApi } from "@/shared/lib/storesApi";
import { tasksApi } from "@/shared/lib/tasksApi";
import { timekeepingApi } from "@/shared/lib/timekeepingApi";
import type { MySubscription } from "@/shared/types/subscription";
import type { Task } from "@/shared/types/task";
import type { TimekeepingHistoryRecord } from "@/shared/lib/timekeepingApi";
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
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [timeHistory, setTimeHistory] = useState<TimekeepingHistoryRecord[]>([]);
  const [timeLoading, setTimeLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
    loadStoresData();
    loadHrData();
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
      const stores = await storesApi
        .getMyOwnedStores(true)
        .catch(async (err: unknown) => {
          const status = (err as { response?: { status?: number } }).response
            ?.status;
          if (status === 403) {
            try {
              const myStore = await storesApi.getMyStore();
              return myStore ? [myStore] : [];
            } catch {
              return [];
            }
          }
          throw err;
        });
      
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

  const loadHrData = async () => {
    try {
      setTasksLoading(true);
      setTimeLoading(true);
      const [tasks, history] = await Promise.all([
        tasksApi.getMyTasks(true).catch(() => []),
        timekeepingApi.getHistory().catch(() => []),
      ]);
      setMyTasks(tasks);
      setTimeHistory(history);
    } catch (err) {
      console.error("Failed to load HR data:", err);
    } finally {
      setTasksLoading(false);
      setTimeLoading(false);
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

  const activeTasks = useMemo(
    () =>
      myTasks.filter(
        (t) => t.status !== "Completed" && t.status !== "Cancelled" && t.isActive,
      ),
    [myTasks],
  );

  const timeSummary = useMemo(() => {
    if (!timeHistory.length) {
      return { days: 0, hours: 0, late: 0 };
    }
    let days = timeHistory.length;
    let hours = 0;
    let late = 0;
    for (const r of timeHistory) {
      if (typeof r.workHours === "number") {
        hours += r.workHours;
      }
      if (r.isLate) {
        late += 1;
      }
    }
    return { days, hours, late };
  }, [timeHistory]);

  const role = user?.role ?? "";
  const isOwner = role === "StoreOwner";
  const isPotentialOwner = role === "PotentialOwner";
  const isManager = role === "Manager";
  const isStaff = role === "Staff";
  const canManageSubscription = isOwner || isPotentialOwner;
  const shouldShowSubscriptionInfo = isOwner || isManager || isStaff || isPotentialOwner;

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

      {shouldShowSubscriptionInfo && (
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
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-teal-50/80 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-teal-950/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-lg">
                          {subscriptionInfo.planName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Gói cửa hàng hiện đang sử dụng
                        </p>
                      </div>
                    </div>
                    {typeof subscriptionInfo.daysRemaining === "number" && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                        Còn {subscriptionInfo.daysRemaining} ngày
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      Bắt đầu:{" "}
                      <span className="font-medium text-foreground">
                        {formatDateShort(subscriptionInfo.startDate)}
                      </span>
                    </p>
                    <p>
                      Hết hạn:{" "}
                      <span className="font-medium text-foreground">
                        {formatDateShort(subscriptionInfo.endDate)}
                      </span>
                    </p>
                  </div>
                </div>

                {canManageSubscription && (
                  <div className="flex justify-end">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => navigate("/dashboard/subscription")}
                        className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 border-0 gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Quản lý / nâng cấp gói
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            ) : canManageSubscription ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                <p className="text-muted-foreground mb-4">
                  Bạn chưa có gói dịch vụ cho cửa hàng.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => navigate("/dashboard/subscription")}
                    className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 border-0"
                  >
                    Mua gói dịch vụ
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="py-4 text-sm text-muted-foreground">
                <p>
                  Gói dịch vụ được quản lý bởi{" "}
                  <span className="font-semibold">chủ cửa hàng</span>. Bạn vẫn có
                  thể tiếp tục làm việc bình thường theo phân quyền hiện tại.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      )}

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
            {storesLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
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
                    !item.store.isActive && "opacity-60",
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
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-0 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                            >
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
                      <Badge variant="destructive" className="text-xs">
                        Ngừng hoạt động
                      </Badge>
                    )}
                  </div>

                  {item.subscription?.planName && (
                    <div className="pt-3 border-t mt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {item.subscription.planName}
                          </span>
                        </div>
                        {item.subscription.daysRemaining !== null &&
                          item.subscription.daysRemaining > 0 && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                            >
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 bg-gradient-to-br from-white via-blue-50/40 to-teal-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-teal-950/20 border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-teal-600" />
                Công việc của tôi
              </h3>
              {tasksLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {activeTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Hiện tại bạn chưa có công việc nào đang mở.
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg px-3 py-2 bg-white/60 dark:bg-gray-900/40 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{task.title}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px]",
                          task.priority === "High" &&
                            "border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30",
                          task.priority === "Medium" &&
                            "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30",
                          task.priority === "Low" &&
                            "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
                        )}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    {task.deadline && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <CalendarCheck className="h-3 w-3" />
                        Hạn:{" "}
                        {new Date(task.deadline).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        Trạng thái:{" "}
                        <span className="font-medium">{task.status}</span>
                      </span>
                      {task.status !== "Completed" &&
                        task.status !== "Cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[11px]"
                            onClick={async () => {
                              try {
                                const updated = await tasksApi.updateTaskStatus(
                                  task.id,
                                  "Completed",
                                );
                                setMyTasks((prev) =>
                                  prev.map((t) =>
                                    t.id === task.id ? updated : t,
                                  ),
                                );
                              } catch (err) {
                                console.error(
                                  "Failed to update task status:",
                                  err,
                                );
                              }
                            }}
                          >
                            Đánh dấu hoàn thành
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-gradient-to-br from-white via-blue-50/40 to-teal-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-teal-950/20 border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-teal-600" />
                Lịch sử chấm công của tôi
              </h3>
              {timeLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {timeHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có dữ liệu chấm công được ghi nhận.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    Ngày công:{" "}
                    <span className="font-semibold text-foreground">
                      {timeSummary.days}
                    </span>
                  </span>
                  <span>
                    Giờ làm:{" "}
                    <span className="font-semibold text-foreground">
                      {timeSummary.hours.toFixed(1)}
                    </span>
                  </span>
                  <span>
                    Đi trễ:{" "}
                    <span className="font-semibold text-foreground">
                      {timeSummary.late}
                    </span>
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto text-xs space-y-2">
                  {timeHistory.slice(0, 10).map((r) => (
                    <div
                      key={r.id}
                      className="border rounded-lg px-3 py-2 bg-white/60 dark:bg-gray-900/40 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {new Date(r.checkInTime).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                        {r.isLate && (
                          <Badge
                            variant="outline"
                            className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30 text-[10px]"
                          >
                            Đi trễ
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          In:{" "}
                          {new Date(r.checkInTime).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        <span>
                          Out:{" "}
                          {r.checkOutTime
                            ? new Date(r.checkOutTime).toLocaleTimeString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "-"}
                        </span>
                        <span>
                          Giờ:{" "}
                          {typeof r.workHours === "number"
                            ? r.workHours.toFixed(1)
                            : "-"}
                        </span>
                      </div>
                      {r.warning && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-300">
                          {r.warning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
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
