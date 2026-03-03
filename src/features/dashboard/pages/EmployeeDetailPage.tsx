import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { employeesApi } from "@/shared/lib/employeesApi";
import type { Employee } from "@/shared/types/employee";
import { useAuthStore } from "@/shared/store/authStore";
import { ArrowLeft, Loader2, User, Mail, Phone, Briefcase, Calendar } from "lucide-react";
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

  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const emp = await employeesApi.getEmployeeById(id);
        setEmployee(emp);
        setFullName(emp.fullName);
        setPosition(emp.position);
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
      const updated = await employeesApi.updateEmployee(id, {
        fullName: fullName.trim() || employee.fullName,
        position: position.trim() || employee.position,
        baseSalary: salaryNumber,
        isActive,
      });
      setEmployee(updated);
      toast.success("Đã cập nhật thông tin nhân viên.");
    } catch (err) {
      console.error("Failed to update employee:", err);
      toast.error("Không thể cập nhật thông tin nhân viên.");
    } finally {
      setSaving(false);
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
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
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
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                disabled={!canEdit}
              />
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
    </div>
  );
}

