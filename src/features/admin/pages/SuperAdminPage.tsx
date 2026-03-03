import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Users, Shield, Database, Star, Trash2 } from "lucide-react";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import type { Plan } from "@/shared/types/subscription";
import { adminUsersApi } from "@/shared/lib/adminUsersApi";
import {
  planReviewsApi,
  type PlanReview,
  type PlanReviewsAdminDashboard,
} from "@/shared/lib/planReviewsApi";

const SuperAdminPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<Awaited<
    ReturnType<typeof adminUsersApi.getUsers>
  > | null>(null);
  const [reviews, setReviews] = useState<PlanReview[]>([]);
  const [reviewDashboard, setReviewDashboard] =
    useState<PlanReviewsAdminDashboard | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, usersRes, reviewDash, reviewList] = await Promise.all([
          subscriptionApi.getPlans(),
          adminUsersApi.getUsers().catch(() => []),
          planReviewsApi.getAdminDashboard().catch(() => null),
          planReviewsApi
            .getAdminReviews({ page: 1, pageSize: 20 })
            .then((r) => r.items)
            .catch(() => []),
        ]);
        setPlans(plansRes);
        setUsers(usersRes);
        setReviewDashboard(reviewDash);
        setReviews(reviewList);
      } catch {
        setPlans([]);
        setUsers([]);
        setReviews([]);
        setReviewDashboard(null);
      }
    };
    void load();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card className="p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              SuperAdmin Console
            </h1>
            <p className="text-xs text-muted-foreground">
              Khu vực quản trị hệ thống: gói dịch vụ, stores và users.
            </p>
          </div>
        </div>
        <Badge className="bg-purple-600 text-white">SuperAdmin</Badge>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 space-y-3 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-teal-600" />
            <h2 className="text-base font-semibold">Người dùng hệ thống</h2>
          </div>
          {users === null ? (
            <p className="text-xs text-muted-foreground">
              Đang tải danh sách users...
            </p>
          ) : users.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Chưa có dữ liệu người dùng (hoặc bạn không có quyền).
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto text-xs space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between border rounded-md px-2 py-1.5 bg-card"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {u.fullName || u.email}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {u.email}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {u.role}
                    </Badge>
                    {!u.isActive && (
                      <Badge variant="destructive" className="text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-teal-600" />
              <h2 className="text-base font-semibold">Đánh giá gói SaaS</h2>
            </div>
            {reviewDashboard && (
              <Badge className="gap-1 bg-amber-500 text-white">
                <Star className="h-3 w-3" />
                {reviewDashboard.overallAvgRating.toFixed(1)}/5 (
                {reviewDashboard.totalReviews})
              </Badge>
            )}
          </div>
          {reviews.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Chưa có review nào hoặc bạn không có quyền xem.
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto text-xs space-y-2">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="border rounded-md px-2.5 py-2 bg-card flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {r.storeName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {r.planName} • {r.rating}/5
                      </span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                      onClick={async () => {
                        try {
                          await planReviewsApi.deleteReview(r.id);
                          setReviews((prev) =>
                            prev.filter((rev) => rev.id !== r.id),
                          );
                        } catch {
                          // ignore for now
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {r.content && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {r.content}
                    </p>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-5 w-5 text-teal-600" />
          <h2 className="text-base font-semibold">Gói SaaS hiện có</h2>
        </div>
        {plans.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Chưa tải được danh sách gói.
          </p>
        ) : (
          <ul className="space-y-1 text-xs">
            {plans.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span className="font-medium">{p.planName}</span>
                <span className="text-muted-foreground text-[11px]">
                  {p.billingPeriod}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default SuperAdminPage;

