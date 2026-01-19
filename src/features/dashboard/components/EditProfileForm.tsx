/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Edit, Save, X } from "lucide-react";

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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    // TODO: Gọi API để update profile
    console.log("Saving profile:", formData);
    alert("Profile updated successfully! / Cập nhật thông tin thành công!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
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
              onClick={handleSave}
              className="gap-2 bg-teal-400 text-white hover:bg-teal-500"
            >
              <Save className="h-4 w-4 " />
              Save / Lưu
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
              value={isEditing ? formData.email : user?.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={!isEditing}
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
