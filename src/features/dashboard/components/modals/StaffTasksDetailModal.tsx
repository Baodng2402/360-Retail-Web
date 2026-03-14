import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import type { Task } from "@/shared/types/task";
import { useTranslation } from "react-i18next";
import { ListTodo, Calendar, User } from "lucide-react";

interface StaffTasksDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffName: string;
  tasks: Task[];
}

const STATUS_LABEL_KEYS: Record<
  Task["status"],
  "statusLabels.Pending" | "statusLabels.InProgress" | "statusLabels.Completed" | "statusLabels.Cancelled"
> = {
  Pending: "statusLabels.Pending",
  InProgress: "statusLabels.InProgress",
  Completed: "statusLabels.Completed",
  Cancelled: "statusLabels.Cancelled",
};

export default function StaffTasksDetailModal({
  open,
  onOpenChange,
  staffName,
  tasks,
}: StaffTasksDetailModalProps) {
  const { t: tTasks, i18n } = useTranslation("tasks");

  const formatDeadline = (value: string | null | undefined) => {
    if (!value) return null;
    const locale = i18n.language.toLowerCase().startsWith("en") ? "en-US" : "vi-VN";
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-teal-600" />
            {tasks.length > 0
              ? `${staffName} – ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`
              : "Tasks"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {tTasks("states.empty")}
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-border/70 bg-muted/30 p-3 space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    {task.title}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs border-teal-500/40 bg-teal-50/70 text-teal-700"
                  >
                    {tTasks(STATUS_LABEL_KEYS[task.status])}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-slate-300 bg-slate-50 dark:bg-slate-900/40"
                  >
                    {tTasks("priority.label")}{" "}
                    {tTasks(
                      `priority.${task.priority}` as
                        | "priority.Low"
                        | "priority.Medium"
                        | "priority.High"
                    )}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  {task.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {tTasks("meta.deadline")} {formatDeadline(task.deadline)}
                    </span>
                  )}
                  {task.assigneeName && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.assigneeName}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
