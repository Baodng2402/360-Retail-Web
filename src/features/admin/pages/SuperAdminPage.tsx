import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Users, Shield, Database } from "lucide-react";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import type { Plan } from "@/shared/types/subscription";

const SuperAdminPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await subscriptionApi.getPlans();
        setPlans(res);
      } catch {
        setPlans([]);
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-teal-600" />
            <h2 className="text-base font-semibold">Quản lý người dùng</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Các chức năng chi tiết (user list, phân quyền, khóa tài khoản...) sẽ
            được xây dựng ở bước tiếp theo. Backend đã cung cấp APIs
            `/identity/admin/*`.
          </p>
        </Card>

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
    </div>
  );
};

export default SuperAdminPage;

