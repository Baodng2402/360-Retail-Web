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
import { employeesApi } from "@/shared/lib/employeesApi";
import { tasksApi } from "@/shared/lib/tasksApi";
import type { Employee } from "@/shared/types/employee";
import type { Task } from "@/shared/types/task";

const BUTTON_GRADIENT =
  "from-teal-500 to-teal-600 bg-gradient-to-r hover:from-teal-600 hover:to-teal-700 text-white shadow-sm transition-all";

const StaffManagementPage = () => {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      employeesApi.getEmployees(true),
      tasksApi.getTasks(true),
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
    loadData();
  }, []);

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
          avatar: emp.avatarUrl || "",
          name: emp.fullName,
          role: emp.position,
          email: emp.email,
          phone: emp.phoneNumber || "-",
          checkin: null,
          task: task?.title ?? "Không có",
        };
      }),
    [employees, taskByAssignee]
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
      label: "Total Staff",
      subLabel: "Tổng nhân viên",
      value: employees.length,
      icon: Users,
      color: "bg-teal-50 text-teal-600",
    },
    {
      label: "Active Staff",
      subLabel: "Đang hoạt động",
      value: activeCount,
      change: employees.length > 0 ? `${activeCount}/${employees.length}` : null,
      trend: "up",
      icon: CalendarCheck,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Active Tasks",
      subLabel: "Công việc đang làm",
      value: pendingTasks,
      icon: ListChecks,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Inactive",
      subLabel: "Tạm ngừng",
      value: employees.length - activeCount,
      icon: BadgeAlert,
      trend: employees.length - activeCount > 0 ? "down" : undefined,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription="Chuyển đổi để quản lý nhân viên của cửa hàng khác" />
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          variant="outline"
          className="border-teal-600 text-teal-600 hover:bg-teal-50"
          onClick={() => setCreateTaskModalOpen(true)}
        >
          Create Task / Tạo công việc
        </Button>
        <Button
          className={BUTTON_GRADIENT}
          onClick={() => setInviteModalOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add staff / Thêm nhân viên
        </Button>
      </div>

      <DashboardStats stats={stats} />
      <div className="border pb-10 px-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5">
          <span className="text-md font-bold">
            Staff List / Danh sách nhân viên
          </span>
          <div className="relative w-full sm:w-64">
            <SearchInput
              placeholder="Search staff / Tìm kiếm..."
              wrapperClassName="w-full sm:w-64"
              className="from-gray-50 to-gray-100 bg-gradient-to-r"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Đang tải...
          </div>
        ) : (
          <div className="flex justify-center pt-10 min-w-full">
            <DataTable data={filteredStaff} />
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
