import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedbackData?: {
    customer: string;
    issue: string;
  };
}

const CreateTaskModal = ({
  open,
  onOpenChange,
  feedbackData,
}: CreateTaskModalProps) => {
  const [title, setTitle] = useState(feedbackData?.issue || "");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!title || !assignee || !dueDate) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      console.log("Task created:", {
        title,
        description,
        assignee,
        priority,
        dueDate,
        relatedCustomer: feedbackData?.customer,
      });

      alert("Đã tạo task thành công!");

      setIsSubmitting(false);
      setTitle("");
      setDescription("");
      setAssignee("");
      setPriority("medium");
      setDueDate("");
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Task / Tạo nhiệm vụ</DialogTitle>
          <DialogDescription>
            Tạo nhiệm vụ mới để xử lý vấn đề khách hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {feedbackData && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-orange-900">
                Related to feedback from: {feedbackData.customer}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">
              Task Title / Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ví dụ: Xử lý khiếu nại sản phẩm..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">
                Assignee / Người thực hiện{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tran_thi_b">Trần Thị B</SelectItem>
                  <SelectItem value="pham_van_d">Phạm Văn D</SelectItem>
                  <SelectItem value="nguyen_van_g">Nguyễn Văn G</SelectItem>
                  <SelectItem value="le_thi_h">Lê Thị H</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority / Độ ưu tiên</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low / Thấp</SelectItem>
                  <SelectItem value="medium">🟡 Medium / Trung bình</SelectItem>
                  <SelectItem value="high">🔴 High / Cao</SelectItem>
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
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang tạo..." : "Create Task / Tạo nhiệm vụ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
