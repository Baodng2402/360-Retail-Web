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
import { useTranslation } from "react-i18next";

const SuperAdminPage = () => {
  const { t, i18n } = useTranslation(["admin", "common"]);
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
        toast.success(t("admin:superAdminLegacy.toast.updateUserSuccess"));
      } else {
        const created = await adminUsersApi.createUser(userForm);
        setUsers((prev) => (prev ? [created, ...prev] : [created]));
        toast.success(t("admin:superAdminLegacy.toast.createUserSuccess"));
      }
      setUserDialogOpen(false);
    } catch (err) {
      console.error("Failed to save user:", err);
      toast.error(t("admin:superAdminLegacy.toast.saveUserError"));
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
      toast.success(t("admin:superAdminLegacy.toast.deleteUserSuccess"));
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error(t("admin:superAdminLegacy.toast.deleteUserError"));
    } finally {
      setDeleting(false);
    }
  };

  const handleCheckExpiry = async () => {
    try {
      setCheckingExpiry(true);
      await subscriptionApi.checkExpiry(7);
      toast.success(t("admin:superAdminLegacy.toast.checkExpirySuccess"));
    } catch (err) {
      console.error("Failed to check expiry:", err);
      toast.error(t("admin:superAdminLegacy.toast.checkExpiryError"));
    } finally {
      setCheckingExpiry(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-semibold text-foreground">
              {t("admin:superAdminLegacy.header.title")}
            </h1>
            <p className="text-[11px] md:text-xs text-muted-foreground">
              {t("admin:superAdminLegacy.header.subtitle")}
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
            {t("admin:superAdminLegacy.actions.checkExpiry")}
          </Button>
          <Badge className="bg-purple-600 text-white">{t("admin:sidebar.brand.title")}</Badge>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Users section */}
        <Card className="p-5 space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              <h2 className="text-base font-semibold">{t("admin:superAdminLegacy.users.title")}</h2>
            </div>
            <Button
              size="sm"
              className="h-8 gap-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
              onClick={openCreateUser}
            >
              <Plus className="h-3 w-3" />
              {t("common:actions.create")}
            </Button>
          </div>
          {users === null ? (
            <p className="text-xs text-muted-foreground">
              {t("admin:superAdminLegacy.users.states.loading")}
            </p>
          ) : users.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {t("admin:superAdminLegacy.users.states.empty")}
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
                          {t("admin:plansPage.status.inactive")}
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
        <Card className="p-5 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-teal-600" />
              <h2 className="text-base font-semibold">{t("admin:superAdminLegacy.reviews.title")}</h2>
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
              {t("admin:superAdminLegacy.reviews.states.empty")}
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
                    {new Date(r.createdAt).toLocaleString(i18n.language)}
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
          <h2 className="text-base font-semibold">{t("admin:superAdminLegacy.plans.title")}</h2>
        </div>
        {plans.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {t("admin:superAdminLegacy.plans.states.empty")}
          </p>
        ) : (
          <ul className="space-y-1 text-xs">
            {plans.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span className="font-medium">{p.planName}</span>
                <span className="text-muted-foreground text-[11px]">
                  {t("admin:superAdminLegacy.plans.durationDays", { days: p.durationDays })}
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
              {editingUser ? t("admin:superAdminLegacy.userDialog.titleEdit") : t("admin:superAdminLegacy.userDialog.titleCreate")}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? t("admin:superAdminLegacy.userDialog.descriptionEdit") : t("admin:superAdminLegacy.userDialog.descriptionCreate")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label>{t("admin:superAdminLegacy.userDialog.fields.email")}</Label>
              <Input
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder={t("admin:superAdminLegacy.userDialog.placeholders.email")}
                disabled={!!editingUser}
              />
            </div>
            {!editingUser && (
              <div className="space-y-1">
                <Label>{t("admin:superAdminLegacy.userDialog.fields.password")}</Label>
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder={t("admin:superAdminLegacy.userDialog.placeholders.password")}
                />
              </div>
            )}
            <div className="space-y-1">
              <Label>{t("admin:superAdminLegacy.userDialog.fields.fullName")}</Label>
              <Input
                value={userForm.fullName}
                onChange={(e) =>
                  setUserForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                placeholder={t("admin:superAdminLegacy.userDialog.placeholders.fullName")}
              />
            </div>
            <div className="space-y-1">
              <Label>{t("admin:superAdminLegacy.userDialog.fields.phoneNumber")}</Label>
              <Input
                value={userForm.phoneNumber}
                onChange={(e) =>
                  setUserForm((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                placeholder={t("admin:superAdminLegacy.userDialog.placeholders.phoneNumber")}
              />
            </div>
            <div className="space-y-1">
              <Label>{t("admin:superAdminLegacy.userDialog.fields.role")}</Label>
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
                  <SelectItem value="StoreOwner">{t("admin:roles.storeOwner")}</SelectItem>
                  <SelectItem value="Manager">{t("admin:roles.manager")}</SelectItem>
                  <SelectItem value="Staff">{t("admin:roles.staff")}</SelectItem>
                  <SelectItem value="Customer">{t("admin:roles.customer")}</SelectItem>
                  <SelectItem value="PotentialOwner">{t("admin:roles.potentialOwner")}</SelectItem>
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
              {t("common:actions.cancel")}
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
              {editingUser ? t("common:actions.saveChanges") : t("common:actions.create")}
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
            <DialogTitle>{t("admin:superAdminLegacy.deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("admin:superAdminLegacy.deleteDialog.description", { name: deleteConfirm?.fullName || deleteConfirm?.email })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleting}
            >
              {t("common:actions.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDeleteUser()}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common:actions.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminPage;
