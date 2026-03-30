import { useState, useEffect } from "react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { employeesApi } from "@/shared/lib/employeesApi";
import { tasksApi } from "@/shared/lib/tasksApi";
import type { Employee } from "@/shared/types/employee";
import { Loader2, ClipboardList } from "lucide-react";
import { WowDialogInner } from "@/shared/components/ui/wow-dialog-inner";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedbackData?: {
    customer: string;
    issue: string;
  };
  onSuccess?: () => void;
}

const CreateTaskModal = ({
  open,
  onOpenChange,
  feedbackData,
  onSuccess,
}: CreateTaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (feedbackData?.issue) setTitle(feedbackData.issue);
  }, [feedbackData?.issue]);

  useEffect(() => {
    if (open) {
      employeesApi
        .getEmployees(true)
        .then(setEmployees)
        .catch(() => setEmployees([]));
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!title.trim() || !assigneeId || !dueDate) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsSubmitting(true);
    try {
      await tasksApi.createTask({
        title: title.trim(),
        assigneeId,
        priority,
        description: description.trim() || undefined,
        deadline: new Date(dueDate).toISOString(),
      });
      toast.success("Đã tạo task thành công!");
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setPriority("Medium");
      setDueDate("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Create task failed:", err);
      toast.error("Không thể tạo task. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-hidden p-0 gap-0">
        <WowDialogInner>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center text-white shadow-lg shadow-[#FF7B21]/30">
              <ClipboardList className="h-4 w-4" />
            </div>
            Create Task / Tạo nhiệm vụ
          </DialogTitle>
          <DialogDescription>
            Tạo nhiệm vụ mới và giao cho nhân viên
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {feedbackData && (
            <motion.div
              className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Related to feedback from: {feedbackData.customer}
              </p>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">
              Task Title / Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ví dụ: Kiểm kê hàng tồn kho..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description / Mô tả chi tiết</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả chi tiết về nhiệm vụ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-background/80 backdrop-blur-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">
                Assignee / Người thực hiện{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority / Độ ưu tiên</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as "Low" | "Medium" | "High")}
              >
                <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">🟢 Low / Thấp</SelectItem>
                  <SelectItem value="Medium">🟡 Medium / Trung bình</SelectItem>
                  <SelectItem value="High">🔴 High / Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">
              Due Date / Hạn hoàn thành <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-background/80 backdrop-blur-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel / Hủy
          </Button>
          <Button
            className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Đang tạo..." : "Create Task / Tạo nhiệm vụ"}
          </Button>
        </DialogFooter>
        </WowDialogInner>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
