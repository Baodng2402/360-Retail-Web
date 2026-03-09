import { Button } from "@/shared/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Users,
  CalendarCheck,
  ListChecks,
  BadgeAlert,
} from "lucide-react";
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import type { StatItem } from "@/features/dashboard/components/DashboardStats";
import DataTable, { type Staff } from "@/shared/components/ui/table-standard-2";
import { SearchInput } from "@/shared/components/ui/input-search";
import StoreSelector from "@/features/dashboard/components/StoreSelector";
import InviteStaffModal from "@/features/dashboard/components/modals/InviteStaffModal";
import CreateTaskModal from "@/features/dashboard/components/modals/CreateTaskModal";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { employeesApi } from "@/shared/lib/employeesApi";
import { tasksApi } from "@/shared/lib/tasksApi";
import type { Employee } from "@/shared/types/employee";
import type { Task } from "@/shared/types/task";
import { useStoreStore } from "@/shared/store/storeStore";
import { useTranslation } from "react-i18next";

const BUTTON_GRADIENT =
  "from-teal-500 to-teal-600 bg-gradient-to-r hover:from-teal-600 hover:to-teal-700 text-white shadow-sm transition-all";

const StaffManagementPage = () => {
  const { t } = useTranslation("staff");
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const navigate = useNavigate();
  const { currentStore } = useStoreStore();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      employeesApi.getEmployees(true),
      // Tasks chỉ là thống kê phụ; với gói không có has_tasks (ví dụ Trial) thì
      // backend trả FeatureNotAvailable. Đánh dấu silentOnFeatureGate để không bật modal nâng cấp.
      tasksApi.getTasks(true, { silentOnFeatureGate: true }),
    ])
      .then(([empRes, taskRes]) => {
        setEmployees(empRes);
        setTasks(taskRes);
      })
      .catch((err) => {
        console.error("Failed to load staff/tasks:", err);
        setEmployees([]);
        setTasks([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Mỗi khi đổi cửa hàng (StoreSelector -> refresh-access thành công),
    // gọi lại API để lấy danh sách nhân viên và task theo chi nhánh mới.
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStore?.id]);

  const taskByAssignee = useMemo(() => {
    const map = new Map<string, Task>();
    for (const t of tasks.filter((x) => x.status !== "Completed" && x.status !== "Cancelled")) {
      if (!map.has(t.assigneeId)) map.set(t.assigneeId, t);
    }
    return map;
  }, [tasks]);

  const staffTableData: Staff[] = useMemo(
    () =>
      employees.map((emp) => {
        const task = taskByAssignee.get(emp.id);
        return {
          id: emp.id,
          avatar: emp.avatarUrl || "",
          name: emp.fullName,
          role: emp.position,
          email: emp.email,
          phone: emp.phoneNumber || "-",
          checkin: null,
          task: task?.title ?? t("list.noTask"),
        };
      }),
    [employees, taskByAssignee, t]
  );

  const filteredStaff = useMemo(() => {
    if (!query.trim()) return staffTableData;
    const q = query.toLowerCase().trim();
    return staffTableData.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [staffTableData, query]);

  const activeCount = employees.filter((e) => e.isActive).length;
  const pendingTasks = tasks.filter(
    (t) => t.status !== "Completed" && t.status !== "Cancelled" && t.isActive
  ).length;

  const stats: StatItem[] = [
    {
      label: t("stats.totalStaff.label"),
      subLabel: t("stats.totalStaff.subLabel"),
      value: employees.length,
      icon: Users,
      color: "bg-teal-50 text-teal-600",
    },
    {
      label: t("stats.activeStaff.label"),
      subLabel: t("stats.activeStaff.subLabel"),
      value: activeCount,
      change: employees.length > 0 ? `${activeCount}/${employees.length}` : null,
      trend: "up",
      icon: CalendarCheck,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: t("stats.activeTasks.label"),
      subLabel: t("stats.activeTasks.subLabel"),
      value: pendingTasks,
      icon: ListChecks,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: t("stats.inactive.label"),
      subLabel: t("stats.inactive.subLabel"),
      value: employees.length - activeCount,
      icon: BadgeAlert,
      trend: employees.length - activeCount > 0 ? "down" : undefined,
      color: "bg-red-50 text-red-600",
    },
  ];

  const handleViewStaff = (staff: Staff) => {
    const employee = employees.find((e) => e.id === staff.id || e.email === staff.email);
    if (employee) {
      navigate(`/dashboard/staff/${employee.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription={t("page.storeSelectorHint")} />
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          variant="outline"
          className="border-teal-600 text-teal-600 hover:bg-teal-50"
          onClick={() => setCreateTaskModalOpen(true)}
        >
          {t("actions.createTask")}
        </Button>
        <Button
          className={BUTTON_GRADIENT}
          onClick={() => setInviteModalOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {t("actions.addStaff")}
        </Button>
      </div>

      <DashboardStats stats={stats} />
      <div className="border pb-10 px-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5">
          <span className="text-md font-bold">
            {t("list.title")}
          </span>
          <div className="relative w-full sm:w-64">
            <SearchInput
              placeholder={t("list.searchPlaceholder")}
              wrapperClassName="w-full sm:w-64"
              className="bg-background"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            {t("list.loading")}
          </div>
        ) : (
          <div className="flex justify-center pt-10 min-w-full">
            <DataTable
              data={filteredStaff}
              onViewStaff={handleViewStaff}
            />
          </div>
        )}
      </div>

      <InviteStaffModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onSuccess={loadData}
      />
      <CreateTaskModal
        open={createTaskModalOpen}
        onOpenChange={setCreateTaskModalOpen}
        onSuccess={loadData}
      />
    </div>
  );
};

export default StaffManagementPage;
