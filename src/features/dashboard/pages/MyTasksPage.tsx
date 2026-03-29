import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { tasksApi } from "@/shared/lib/tasksApi";
import type { Task, TaskStatus } from "@/shared/types/task";
import { Loader2, ListChecks, CheckCircle2 } from "lucide-react";
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
        <Card className="p-4 md:p-6 space-y-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center text-white shadow-lg shadow-[#FF7B21]/20">
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-foreground">
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
                <SelectTrigger className="w-[140px] bg-background/80 backdrop-blur-sm">
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
          </motion.div>

          {loading ? (
            <motion.div
              className="py-10 flex items-center justify-center text-muted-foreground text-sm gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="h-4 w-4 animate-spin text-[#FF7B21]" />
              <span>{tTasks("states.loading")}</span>
            </motion.div>
          ) : !filteredTasks.length ? (
            <motion.div
              className="py-10 text-center text-muted-foreground text-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-[#FF7B21]/30" />
              {tTasks("states.empty")}
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-border/50 hover:border-[#FF7B21]/30 hover:shadow-md transition-all duration-300">
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
                        className="text-xs border-[#FF7B21]/30 bg-[#FF7B21]/5 text-[#FF7B21]"
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
                        <SelectTrigger className="w-[150px] h-8 text-xs bg-background/80">
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
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin text-[#FF7B21]" />
                          {tCommon("states.saving")}
                        </span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            className="pt-2 text-[11px] text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            {tTasks("helper.note")}
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default MyTasksPage;
