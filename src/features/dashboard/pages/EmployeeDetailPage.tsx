import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { employeesApi } from "@/shared/lib/employeesApi";
import type { Employee } from "@/shared/types/employee";
import { useAuthStore } from "@/shared/store/authStore";
import { ArrowLeft, Loader2, User, Mail, Phone, Briefcase, Calendar, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role ?? "";
  const canEdit = role === "StoreOwner" || role === "Manager";

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [positionMode, setPositionMode] = useState<"preset" | "custom">("preset");
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [customPosition, setCustomPosition] = useState("");

  const POSITION_OPTIONS = [
    "StoreOwner",
    "Manager",
    "Staff",
    "Cashier",
    "Sales",
    "Warehouse",
  ] as const;

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const emp = await employeesApi.getEmployeeById(id);
        setEmployee(emp);
        setFullName(emp.fullName);
        setPosition(emp.position);
        const isPreset =
          !!emp.position &&
          (POSITION_OPTIONS as readonly string[]).includes(emp.position);
        setPositionMode(isPreset ? "preset" : "custom");
        setCustomPosition(isPreset ? "" : emp.position || "");
        setBaseSalary(
          typeof emp.baseSalary === "number" ? String(emp.baseSalary) : "",
        );
        setIsActive(emp.isActive);
      } catch (err) {
        console.error("Failed to load employee:", err);
        toast.error("Không thể tải thông tin nhân viên.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleSave = async () => {
    if (!employee || !id || !canEdit) return;
    try {
      setSaving(true);
      const salaryNumber =
        baseSalary.trim() === "" ? undefined : Number(baseSalary.trim());
      if (salaryNumber !== undefined && Number.isNaN(salaryNumber)) {
        toast.error("Lương cơ bản không hợp lệ.");
        setSaving(false);
        return;
      }
      const nextPosition =
        positionMode === "custom"
          ? customPosition.trim()
          : position.trim();
      if (!nextPosition) {
        toast.error("Vui lòng chọn chức danh.");
        setSaving(false);
        return;
      }
      const updated = await employeesApi.updateEmployee(id, {
        fullName: fullName.trim() || employee.fullName,
        position: nextPosition || employee.position,
        baseSalary: salaryNumber,
        isActive,
      });
      setEmployee((prev) => (prev ? { ...prev, ...updated } : updated));
      toast.success("Đã cập nhật thông tin nhân viên.");
    } catch (err) {
      console.error("Failed to update employee:", err);
      toast.error("Không thể cập nhật thông tin nhân viên.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!employee || !id || !canEdit) return;
    try {
      setDeleting(true);
      const updated = await employeesApi.updateEmployee(id, { isActive: false });
      setEmployee((prev) => (prev ? { ...prev, ...updated, isActive: false } : updated));
      setIsActive(false);
      toast.success("Đã ngừng hoạt động nhân viên.");
      setDeleteOpen(false);
    } catch (err) {
      console.error("Failed to deactivate employee:", err);
      toast.error("Không thể xóa/ngừng hoạt động nhân viên. Vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang tải thông tin nhân viên...</span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-muted-foreground">Không tìm thấy nhân viên.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/staff")}>
          Quay lại danh sách nhân viên
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="inline-flex items-center gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/dashboard/staff")}
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách nhân viên
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 md:col-span-1 space-y-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage src={employee.avatarUrl || undefined} alt={employee.fullName} />
              <AvatarFallback>
                {getInitials(employee.fullName || employee.email || "U")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold flex items-center justify-center gap-2">
                <User className="h-4 w-4 text-teal-600" />
                {employee.fullName}
              </p>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Briefcase className="h-3 w-3" />
                {employee.position || "Chưa cập nhật chức danh"}
              </p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span>{employee.email}</span>
              </div>
              {employee.phoneNumber && (
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{employee.phoneNumber}</span>
                </div>
              )}
              {employee.joinDate && (
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Ngày vào làm:{" "}
                    {new Date(employee.joinDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Thông tin & phân quyền nhân viên</h2>
            {canEdit && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteOpen(true)}
                  disabled={saving || deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa nhân viên
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || deleting}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ tên</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={employee.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Chức danh</Label>
              <div className="grid gap-2">
                <Select
                  value={positionMode}
                  onValueChange={(v) => setPositionMode(v as "preset" | "custom")}
                  disabled={!canEdit}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preset">Chọn từ danh sách</SelectItem>
                    <SelectItem value="custom">Nhập thủ công</SelectItem>
                  </SelectContent>
                </Select>

                {positionMode === "preset" ? (
                  <Select
                    value={position}
                    onValueChange={setPosition}
                    disabled={!canEdit}
                  >
                    <SelectTrigger id="position" className="w-full">
                      <SelectValue placeholder="Chọn chức danh" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITION_OPTIONS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="position"
                    value={customPosition}
                    onChange={(e) => setCustomPosition(e.target.value)}
                    disabled={!canEdit}
                    placeholder="VD: Nhân viên bán hàng"
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseSalary">Lương cơ bản (VND)</Label>
              <Input
                id="baseSalary"
                type="number"
                min={0}
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Trạng thái làm việc</p>
              <p className="text-xs text-muted-foreground">
                {isActive
                  ? "Nhân viên đang hoạt động và có thể đăng nhập, chấm công."
                  : "Nhân viên tạm ngưng, không thể thao tác trên hệ thống."}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={!canEdit}
              className="data-[state=checked]:bg-teal-600"
            />
          </div>
        </Card>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Xóa / ngừng hoạt động nhân viên</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn ngừng hoạt động nhân viên{" "}
              <strong>{employee.fullName}</strong>? Nhân viên sẽ không thể đăng nhập và chấm công.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

