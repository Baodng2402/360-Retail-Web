import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { WowDialogInner } from "@/shared/components/ui/wow-dialog-inner";
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
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-hidden p-0 gap-0 flex flex-col">
        <WowDialogInner className="max-h-[calc(85vh-0.5rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center text-white shadow-lg shadow-[#FF7B21]/30">
              <ListTodo className="h-4 w-4" />
            </div>
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
            tasks.map((task, index) => (
              <motion.div
                key={task.id}
                className="rounded-xl border border-border/70 bg-gradient-to-r from-[#FF7B21]/5 to-[#19D6C8]/5 p-3 space-y-2 hover:shadow-md transition-shadow duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
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
              </motion.div>
            ))
          )}
        </div>
        </WowDialogInner>
      </DialogContent>
    </Dialog>
  );
}
