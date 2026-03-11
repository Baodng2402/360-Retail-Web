/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Edit, Save, X, Loader2 } from "lucide-react";
import { employeesApi } from "@/shared/lib/employeesApi";
import { useAuthStore } from "@/shared/store/authStore";
import toast from "react-hot-toast";

// Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface EditProfileFormProps {
  user: any; // Type from useAuthStore
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const setUser = useAuthStore((s) => s.setUser);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "",
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "",
    });
  }, [user?.name, user?.email, user?.phone, user?.role]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await employeesApi.updateMe({
        fullName: formData.name.trim(),
        phoneNumber: formData.phone.trim() || undefined,
        userName: formData.name.trim() || undefined,
      });
      setUser({
        ...user,
        name: updated.fullName,
      });
      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Cập nhật thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button
              onClick={() => void handleSave()}
              disabled={saving}
              className="gap-2 bg-teal-400 text-white hover:bg-teal-500"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Đang lưu..." : "Save / Lưu"}
            </Button>
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancel / Hủy
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            className="gap-2 bg-teal-400 text-white hover:bg-teal-500"
          >
            <Edit className="h-4 w-4" />
            Edit Profile / Sửa thông tin
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name / Họ và tên</Label>
          <Input
            id="name"
            value={isEditing ? formData.name : user?.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={!isEditing}
          />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              readOnly
              className="bg-muted cursor-not-allowed"
              title="Email không thể thay đổi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone / Điện thoại</Label>
            <Input
              id="phone"
              value={isEditing ? formData.phone : user?.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Role - Read only */}
        <div className="space-y-2">
          <Label htmlFor="role">Role / Vai trò</Label>
          <Input
            id="role"
            value={user?.role}
            disabled={true}
            className="bg-muted"
          />
        </div>
      </div>
    </div>
  );
}
