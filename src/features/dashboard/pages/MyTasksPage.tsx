import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { tasksApi } from "@/shared/lib/tasksApi";
import type { Task, TaskStatus } from "@/shared/types/task";
import { Loader2, ListChecks } from "lucide-react";
import { useAuthStore } from "@/shared/store/authStore";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

type StatusFilter = TaskStatus | "All";

const TASK_STATUSES = [
  "Pending",
  "InProgress",
  "Completed",
  "Cancelled",
] as const satisfies readonly TaskStatus[];

const STATUS_LABEL_KEYS: Record<
  TaskStatus,
  | "statusLabels.Pending"
  | "statusLabels.InProgress"
  | "statusLabels.Completed"
  | "statusLabels.Cancelled"
> = {
  Pending: "statusLabels.Pending",
  InProgress: "statusLabels.InProgress",
  Completed: "statusLabels.Completed",
  Cancelled: "statusLabels.Cancelled",
};

const MyTasksPage = () => {
  const { t: tTasks, i18n } = useTranslation("tasks");
  const { t: tCommon } = useTranslation("common");
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
      toast.error(tTasks("toasts.loadFailed"));
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
      toast.success(tTasks("toasts.updateSuccess"));
    } catch (err) {
      console.error("Failed to update task status:", err);
      toast.error(tTasks("toasts.updateFailed"));
    } finally {
      setUpdatingId(null);
    }
  };

  const headerTitle = (user?.role === "StoreOwner" || user?.role === "Manager")
    ? tTasks("page.titleOwner")
    : tTasks("page.titleStaff");

  const formatDeadline = (value: string) => {
    const locale = i18n.language.toLowerCase().startsWith("en") ? "en-US" : "vi-VN";
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  };

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
                {tTasks("page.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground">
              {tTasks("filters.label")}
            </span>
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as StatusFilter)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={tTasks("filters.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{tTasks("filters.all")}</SelectItem>
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {tTasks(STATUS_LABEL_KEYS[s])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex items-center justify-center text-muted-foreground text-sm gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{tTasks("states.loading")}</span>
          </div>
        ) : !filteredTasks.length ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            {tTasks("states.empty")}
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
                      {tTasks("priority.label")}{" "}
                      {tTasks(`priority.${task.priority}` as "priority.Low" | "priority.Medium" | "priority.High")}
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
                        {tTasks("meta.deadline")} {formatDeadline(task.deadline)}
                      </span>
                    )}
                    <span>
                      {tTasks("meta.assignedBy")}{" "}
                      {task.assigneeName || tTasks("meta.assignedByFallback")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-teal-500/40 bg-teal-50/70 text-teal-700"
                  >
                    {tTasks(STATUS_LABEL_KEYS[task.status])}
                  </Badge>
                  <Select
                    value={task.status}
                    onValueChange={(val) =>
                      handleChangeStatus(task, val as TaskStatus)
                    }
                    disabled={updatingId === task.id}
                  >
                    <SelectTrigger className="w-[150px] h-8 text-xs">
                      <SelectValue placeholder={tTasks("actions.updateStatusPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {tTasks(STATUS_LABEL_KEYS[s])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {updatingId === task.id && (
                    <span className="text-[11px] text-muted-foreground">
                      {tCommon("states.saving")}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="pt-2 text-[11px] text-muted-foreground">
          {tTasks("helper.note")}
        </div>
      </Card>
    </div>
  );
};

export default MyTasksPage;

