import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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
import {
  Users,
  Shield,
  Database,
  Star,
  Trash2,
  Plus,
  Pencil,
  Loader2,
  Bell,
} from "lucide-react";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import type { Plan } from "@/shared/types/subscription";
import {
  adminUsersApi,
  type AdminUser,
  type CreateAdminUserDto,
  type UpdateAdminUserDto,
} from "@/shared/lib/adminUsersApi";
import {
  planReviewsApi,
  type PlanReview,
  type PlanReviewsAdminDashboard,
} from "@/shared/lib/planReviewsApi";
import toast from "react-hot-toast";

const SuperAdminPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [reviews, setReviews] = useState<PlanReview[]>([]);
  const [reviewDashboard, setReviewDashboard] =
    useState<PlanReviewsAdminDashboard | null>(null);

  // User CRUD state
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState<CreateAdminUserDto>({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    role: "Staff",
  });
  const [userSaving, setUserSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Check expiry state
  const [checkingExpiry, setCheckingExpiry] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, usersRes, reviewDash, reviewList] = await Promise.all([
          subscriptionApi.getPlans(),
          adminUsersApi.getUsers().catch(() => []),
          planReviewsApi.getAdminDashboard().catch(() => null),
          planReviewsApi
            .getAdminReviews({ page: 1, pageSize: 20 })
            .then((r) => r.items)
            .catch(() => []),
        ]);
        setPlans(plansRes);
        setUsers(usersRes);
        setReviewDashboard(reviewDash);
        setReviews(reviewList);
      } catch {
        setPlans([]);
        setUsers([]);
        setReviews([]);
        setReviewDashboard(null);
      }
    };
    void load();
  }, []);

  // User CRUD handlers
  const openCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      role: "Staff",
    });
    setUserDialogOpen(true);
  };

  const openEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      password: "",
      fullName: user.fullName || "",
      phoneNumber: "",
      role: user.role,
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      setUserSaving(true);
      if (editingUser) {
        const payload: UpdateAdminUserDto = {
          fullName: userForm.fullName || undefined,
          phoneNumber: userForm.phoneNumber || undefined,
          role: userForm.role,
        };
        const updated = await adminUsersApi.updateUser(editingUser.id, payload);
        setUsers((prev) =>
          prev?.map((u) => (u.id === editingUser.id ? updated : u)) ?? null,
        );
        toast.success("Cập nhật user thành công.");
      } else {
        const created = await adminUsersApi.createUser(userForm);
        setUsers((prev) => (prev ? [created, ...prev] : [created]));
        toast.success("Tạo user mới thành công.");
      }
      setUserDialogOpen(false);
    } catch (err) {
      console.error("Failed to save user:", err);
      toast.error("Lưu user thất bại.");
    } finally {
      setUserSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      await adminUsersApi.deleteUser(deleteConfirm.id);
      setUsers((prev) =>
        prev?.filter((u) => u.id !== deleteConfirm.id) ?? null,
      );
      setDeleteConfirm(null);
      toast.success("Đã xóa user.");
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error("Xóa user thất bại.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCheckExpiry = async () => {
    try {
      setCheckingExpiry(true);
      await subscriptionApi.checkExpiry(7);
      toast.success("Đã gửi email cảnh báo cho các subscription sắp hết hạn.");
    } catch (err) {
      console.error("Failed to check expiry:", err);
      toast.error("Kiểm tra hết hạn thất bại.");
    } finally {
      setCheckingExpiry(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card className="p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              SuperAdmin Console
            </h1>
            <p className="text-xs text-muted-foreground">
              Khu vực quản trị hệ thống: users, gói dịch vụ, stores và reviews.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => void handleCheckExpiry()}
            disabled={checkingExpiry}
          >
            {checkingExpiry ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            Check Expiry
          </Button>
          <Badge className="bg-purple-600 text-white">SuperAdmin</Badge>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Users section */}
        <Card className="p-6 space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              <h2 className="text-base font-semibold">Người dùng hệ thống</h2>
            </div>
            <Button
              size="sm"
              className="h-8 gap-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
              onClick={openCreateUser}
            >
              <Plus className="h-3 w-3" />
              Thêm
            </Button>
          </div>
          {users === null ? (
            <p className="text-xs text-muted-foreground">
              Đang tải danh sách users...
            </p>
          ) : users.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Chưa có dữ liệu người dùng (hoặc bạn không có quyền).
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto text-xs space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between border rounded-md px-2 py-1.5 bg-card"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {u.fullName || u.email}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {u.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        {u.role}
                      </Badge>
                      {!u.isActive && (
                        <Badge variant="destructive" className="text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-blue-500 hover:text-blue-600"
                      onClick={() => openEditUser(u)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                      onClick={() => setDeleteConfirm(u)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Reviews section */}
        <Card className="p-6 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-teal-600" />
              <h2 className="text-base font-semibold">Đánh giá gói SaaS</h2>
            </div>
            {reviewDashboard && (
              <Badge className="gap-1 bg-amber-500 text-white">
                <Star className="h-3 w-3" />
                {reviewDashboard.overallAvgRating.toFixed(1)}/5 (
                {reviewDashboard.totalReviews})
              </Badge>
            )}
          </div>
          {reviews.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Chưa có review nào hoặc bạn không có quyền xem.
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto text-xs space-y-2">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="border rounded-md px-2.5 py-2 bg-card flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {r.storeName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {r.planName} • {r.rating}/5
                      </span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                      onClick={async () => {
                        try {
                          await planReviewsApi.deleteReview(r.id);
                          setReviews((prev) =>
                            prev.filter((rev) => rev.id !== r.id),
                          );
                        } catch {
                          // ignore for now
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {r.content && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {r.content}
                    </p>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Plans section */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-5 w-5 text-teal-600" />
          <h2 className="text-base font-semibold">Gói SaaS hiện có</h2>
        </div>
        {plans.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Chưa tải được danh sách gói.
          </p>
        ) : (
          <ul className="space-y-1 text-xs">
            {plans.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span className="font-medium">{p.planName}</span>
                <span className="text-muted-foreground text-[11px]">
                  {p.durationDays} ngày
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              {editingUser ? "Chỉnh sửa User" : "Tạo User mới"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Cập nhật thông tin người dùng."
                : "Tạo tài khoản mới với role được chỉ định."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@example.com"
                disabled={!!editingUser}
              />
            </div>
            {!editingUser && (
              <div className="space-y-1">
                <Label>Mật khẩu</Label>
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Mật khẩu..."
                />
              </div>
            )}
            <div className="space-y-1">
              <Label>Họ tên</Label>
              <Input
                value={userForm.fullName}
                onChange={(e) =>
                  setUserForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="space-y-1">
              <Label>Số điện thoại</Label>
              <Input
                value={userForm.phoneNumber}
                onChange={(e) =>
                  setUserForm((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                placeholder="0912345678"
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select
                value={userForm.role}
                onValueChange={(v) =>
                  setUserForm((prev) => ({ ...prev, role: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="StoreOwner">StoreOwner</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="PotentialOwner">PotentialOwner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setUserDialogOpen(false)}
              disabled={userSaving}
            >
              Hủy
            </Button>
            <Button
              onClick={() => void handleSaveUser()}
              disabled={
                userSaving ||
                !userForm.email.trim() ||
                (!editingUser && !userForm.password.trim())
              }
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              {userSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingUser ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa user</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa{" "}
              <strong>
                {deleteConfirm?.fullName || deleteConfirm?.email}
              </strong>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDeleteUser()}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminPage;
