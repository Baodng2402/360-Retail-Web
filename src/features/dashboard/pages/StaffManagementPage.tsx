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
import DataTable, {
  type Staff,
} from "@/shared/components/ui/table-standard-2";
import { SearchInput } from "@/shared/components/ui/input-search";
import StoreSelector from "@/features/dashboard/components/StoreSelector";
import InviteStaffModal from "@/features/dashboard/components/modals/InviteStaffModal";
import CreateTaskModal from "@/features/dashboard/components/modals/CreateTaskModal";
import StaffTasksDetailModal from "@/features/dashboard/components/modals/StaffTasksDetailModal";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { employeesApi } from "@/shared/lib/employeesApi";
import { tasksApi } from "@/shared/lib/tasksApi";
import type { Employee } from "@/shared/types/employee";
import type { Task } from "@/shared/types/task";
import { useStoreStore } from "@/shared/store/storeStore";
import { timekeepingApi } from "@/shared/lib/timekeepingApi";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

const BUTTON_GRADIENT =
  "from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white shadow-lg shadow-[#FF7B21]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#FF7B21]/30 hover:-translate-y-0.5";

const StaffManagementPage = () => {
  const { t } = useTranslation("staff");
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staffCheckins, setStaffCheckins] = useState<
    Map<string, Date | null>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [tasksModalStaffName, setTasksModalStaffName] = useState("");
  const [tasksModalTasks, setTasksModalTasks] = useState<Task[]>([]);
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
      .then(async ([empRes, taskRes]) => {
        setEmployees(empRes);
        setTasks(taskRes);

        // Load today's timekeeping to show check-in status per staff.
        try {
          const today = new Date();
          const start = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            0,
            0,
            0,
          );
          const end = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23,
            59,
            59,
          );

          const toIso = (d: Date) => d.toISOString();
          const history = await timekeepingApi.getHistory({
            from: toIso(start),
            to: toIso(end),
            page: 1,
            pageSize: 500,
          });

          const map = new Map<string, Date | null>();
          for (const record of history) {
            if (!record.employeeId || !record.checkInTime) continue;
            const existing = map.get(record.employeeId);
            const currentDate = new Date(record.checkInTime);
            if (!existing || currentDate > existing) {
              map.set(record.employeeId, currentDate);
            }
          }
          setStaffCheckins(map);
        } catch (err) {
          console.error("Failed to load staff check-in summary:", err);
          setStaffCheckins(new Map());
        }
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
    const map = new Map<string, Task[]>();
    for (const t of tasks.filter((x) => x.status !== "Completed" && x.status !== "Cancelled")) {
      if (!map.has(t.assigneeId)) {
        map.set(t.assigneeId, [t]);
      } else {
        map.get(t.assigneeId)!.push(t);
      }
    }
    return map;
  }, [tasks]);

  const staffTableData: Staff[] = useMemo(
    () =>
      employees.map((emp) => {
        const employeeTasks = taskByAssignee.get(emp.id) ?? [];
        const taskLabel =
          employeeTasks.length === 0
            ? t("list.noTask")
            : employeeTasks.length === 1
              ? employeeTasks[0].title
              : `${employeeTasks[0].title} (+${employeeTasks.length - 1})`;
        const checkinDate = staffCheckins.get(emp.id) ?? null;
        return {
          id: emp.id,
          avatar: emp.avatarUrl || "",
          name: emp.fullName,
          role: emp.position,
          email: emp.email,
          phone: emp.phoneNumber || "-",
          checkin: checkinDate,
          task: taskLabel,
        };
      }),
    [employees, taskByAssignee, staffCheckins, t],
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

  const handleViewTasks = (staff: Staff, staffTasks: Task[]) => {
    setTasksModalStaffName(staff.name);
    setTasksModalTasks(staffTasks);
    setTasksModalOpen(true);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StoreSelector pageDescription={t("page.storeSelectorHint")} />
      </motion.div>
      <motion.div
        className="flex flex-wrap items-center justify-end gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Button
          variant="outline"
          className="border-[#FF7B21]/30 text-[#FF7B21] hover:bg-[#FF7B21]/10 hover:border-[#FF7B21] transition-all duration-300"
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DashboardStats stats={stats} />
      </motion.div>
      <motion.div
        className="border bg-card/50 backdrop-blur-sm pb-10 px-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5">
          <span className="text-md font-bold text-foreground">
            {t("list.title")}
          </span>
          <div className="relative w-full sm:w-64">
            <SearchInput
              placeholder={t("list.searchPlaceholder")}
              wrapperClassName="w-full sm:w-64"
              className="bg-background transition-all duration-300 focus:ring-2 focus:ring-[#FF7B21]/20"
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
          <motion.div
            className="flex justify-center pt-10 min-w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DataTable
              data={filteredStaff}
              onViewStaff={handleViewStaff}
              tasksByStaffId={taskByAssignee}
              onViewTasks={handleViewTasks}
            />
          </motion.div>
        )}
      </motion.div>

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
      <StaffTasksDetailModal
        open={tasksModalOpen}
        onOpenChange={setTasksModalOpen}
        staffName={tasksModalStaffName}
        tasks={tasksModalTasks}
      />
    </motion.div>
  );
};

export default StaffManagementPage;
