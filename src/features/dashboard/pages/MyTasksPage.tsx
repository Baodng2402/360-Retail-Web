import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { tasksApi } from "@/shared/lib/tasksApi";
import type { Task, TaskStatus } from "@/shared/types/task";
import { Loader2, ListChecks } from "lucide-react";
import { useAuthStore } from "@/shared/store/authStore";
import toast from "react-hot-toast";

type StatusFilter = TaskStatus | "All";

const statusLabels: Record<TaskStatus, string> = {
  Pending: "Chờ xử lý",
  InProgress: "Đang làm",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

const priorityLabels = {
  Low: "Thấp",
  Medium: "Trung bình",
  High: "Cao",
} as const;

const MyTasksPage = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await tasksApi.getMyTasks(true);
      setTasks(res);
    } catch (err) {
      console.error("Failed to load my tasks:", err);
      toast.error("Không thể tải danh sách công việc của bạn.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    if (statusFilter === "All") return tasks;
    return tasks.filter((t) => t.status === statusFilter);
  }, [tasks, statusFilter]);

  const handleChangeStatus = async (task: Task, newStatus: TaskStatus) => {
    if (task.status === newStatus) return;
    try {
      setUpdatingId(task.id);
      const updated = await tasksApi.updateTaskStatus(task.id, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t)),
      );
      toast.success("Cập nhật trạng thái công việc thành công.");
    } catch (err) {
      console.error("Failed to update task status:", err);
      toast.error("Không thể cập nhật trạng thái công việc.");
    } finally {
      setUpdatingId(null);
    }
  };

  const headerTitle =
    user?.role === "StoreOwner" || user?.role === "Manager"
      ? "My Tasks / Công việc của tôi"
      : "Công việc được giao cho bạn";

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-teal-600" />
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                {headerTitle}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Xem và cập nhật tiến độ các công việc HR được giao cho bạn.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground">
              Lọc theo trạng thái:
            </span>
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as StatusFilter)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Tất cả</SelectItem>
                <SelectItem value="Pending">{statusLabels.Pending}</SelectItem>
                <SelectItem value="InProgress">
                  {statusLabels.InProgress}
                </SelectItem>
                <SelectItem value="Completed">
                  {statusLabels.Completed}
                </SelectItem>
                <SelectItem value="Cancelled">
                  {statusLabels.Cancelled}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex items-center justify-center text-muted-foreground text-sm gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Đang tải công việc...</span>
          </div>
        ) : !filteredTasks.length ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            Hiện tại bạn chưa có công việc nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-border/70"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {task.title}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-300 bg-slate-50 dark:bg-slate-900/40"
                    >
                      Ưu tiên:{" "}
                      {priorityLabels[task.priority] ?? task.priority}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    {task.deadline && (
                      <span>
                        Hạn:{" "}
                        {new Date(task.deadline).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    <span>
                      Người giao:{" "}
                      {task.assigneeName || "Quản lý / Chủ cửa hàng"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-teal-500/40 bg-teal-50/70 text-teal-700"
                  >
                    {statusLabels[task.status]}
                  </Badge>
                  <Select
                    value={task.status}
                    onValueChange={(val) =>
                      handleChangeStatus(task, val as TaskStatus)
                    }
                    disabled={updatingId === task.id}
                  >
                    <SelectTrigger className="w-[150px] h-8 text-xs">
                      <SelectValue placeholder="Cập nhật trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">
                        {statusLabels.Pending}
                      </SelectItem>
                      <SelectItem value="InProgress">
                        {statusLabels.InProgress}
                      </SelectItem>
                      <SelectItem value="Completed">
                        {statusLabels.Completed}
                      </SelectItem>
                      <SelectItem value="Cancelled">
                        {statusLabels.Cancelled}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {updatingId === task.id && (
                    <span className="text-[11px] text-muted-foreground">
                      Đang lưu...
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="pt-2 text-[11px] text-muted-foreground">
          Lưu ý: Bạn chỉ có thể cập nhật trạng thái cho các công việc được giao
          cho tài khoản hiện tại.
        </div>
      </Card>
    </div>
  );
};

export default MyTasksPage;

