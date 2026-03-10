import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { superAdminUsersApi, type SuperAdminUserDto } from "@/shared/lib/superAdminUsersApi";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2, Pencil, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const ROLE_OPTIONS = ["StoreOwner", "Manager", "Staff", "Customer", "PotentialOwner"] as const;
const STATUS_OPTIONS = ["Active", "Inactive", "Suspended", "Pending"] as const;

export default function AdminUsersPage() {
  const { t } = useTranslation(["admin", "common"]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SuperAdminUserDto[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SuperAdminUserDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    email: string;
    password: string;
    roleName: string;
    isActivated: boolean;
    status: string;
  }>({
    email: "",
    password: "",
    roleName: "Staff",
    isActivated: true,
    status: "Active",
  });

  const [deleteConfirm, setDeleteConfirm] = useState<SuperAdminUserDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((u) => u.email.toLowerCase().includes(term) || u.id.toLowerCase().includes(term));
  }, [items, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  useEffect(() => {
    const nextTotalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
    if (page > nextTotalPages) {
      setPage(nextTotalPages);
    }
  }, [filtered.length, page, pageSize]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await superAdminUsersApi.list();
      setItems(res);
    } catch (err) {
      console.error("Failed to load super-admin users:", err);
      toast.error("Không tải được danh sách users (SuperAdmin).");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      email: "",
      password: "",
      roleName: "Staff",
      isActivated: true,
      status: "Active",
    });
    setDialogOpen(true);
  };

  const openEdit = (u: SuperAdminUserDto) => {
    setEditing(u);
    setForm({
      email: u.email,
      password: "",
      roleName: u.roles?.[0] ?? "Staff",
      isActivated: u.isActivated,
      status: u.status ?? "Active",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    try {
      setSaving(true);
      if (!editing) {
        const id = await superAdminUsersApi.create({
          email: form.email.trim(),
          password: form.password,
          roleName: form.roleName,
        });
        setItems((prev) => [
          {
            id,
            email: form.email.trim(),
            isActivated: true,
            status: "Active",
            storeId: null,
            roles: [form.roleName],
          },
          ...prev,
        ]);
        toast.success("Đã tạo user.");
      } else {
        await superAdminUsersApi.update(editing.id, {
          isActivated: form.isActivated,
          status: form.status,
        });
        setItems((prev) =>
          prev.map((u) =>
            u.id === editing.id
              ? {
                  ...u,
                  isActivated: form.isActivated,
                  status: form.status,
                }
              : u,
          ),
        );
        toast.success("Đã cập nhật user.");
      }
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to save user:", err);
      toast.error("Lưu user thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      await superAdminUsersApi.remove(deleteConfirm.id);
      setItems((prev) =>
        prev.map((u) =>
          u.id === deleteConfirm.id
            ? {
                ...u,
                isActivated: false,
                status: u.status ?? "Inactive",
              }
            : u,
        ),
      );
      toast.success("Đã vô hiệu hóa user (soft delete).");
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error("Xoá user thất bại.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                {t("users.badge")}
              </Badge>
              <span className="text-sm text-muted-foreground">Quản lý Users</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {t("users.description")}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("users.searchPlaceholder")}
                className="w-full sm:w-[320px]"
              />
            </div>
            <Button
              onClick={openCreate}
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("users.create")}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {t("users.listTitle")}
          </h3>
          <Badge variant="outline">
            {filtered.length.toLocaleString()} user
          </Badge>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {t("users.noData")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("users.columns.email")}</TableHead>
                  <TableHead>{t("users.columns.roles")}</TableHead>
                  <TableHead>{t("users.columns.status")}</TableHead>
                  <TableHead>{t("users.columns.activated")}</TableHead>
                  <TableHead>{t("users.columns.storeId")}</TableHead>
                  <TableHead className="text-right">
                    {t("users.columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((u) => (
                  <TableRow
                    key={u.id}
                    className="cursor-pointer hover:bg-muted/60"
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                  >
                    <TableCell className="max-w-[260px] truncate">{u.email}</TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      {(u.roles ?? []).join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.status ?? "—"}</Badge>
                    </TableCell>
                    <TableCell>
                      {u.isActivated ? (
                        <Badge className="bg-emerald-600 text-white gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {t("users.activated.yes")}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          {t("users.activated.no")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      {u.storeId ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700"
                          onClick={() => openEdit(u)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => setDeleteConfirm(u)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
            <div>
              {t("users.pagination.summary", {
                from:
                  paged.length > 0
                    ? (page - 1) * pageSize + 1
                    : 0,
                to: (page - 1) * pageSize + paged.length,
                total: filtered.length,
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t("users.pagination.prev")}
              </Button>
              <span>
                Trang{" "}
                <span className="font-semibold">{page}</span> /{" "}
                <span className="font-semibold">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {t("users.pagination.next")}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Cập nhật user" : "Tạo user"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Chỉnh trạng thái/kích hoạt. (Role/email hiện tại không đổi theo API này)"
                : "Tạo user mới (không cho tạo role SuperAdmin)."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 pt-2">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="new@example.com"
                disabled={!!editing}
              />
            </div>

            {!editing && (
              <>
                <div className="space-y-1">
                  <Label>Mật khẩu</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Password123!"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Role</Label>
                  <Select
                    value={form.roleName}
                    onValueChange={(v) => setForm((p) => ({ ...p, roleName: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {editing && (
              <>
                <div className="space-y-1">
                  <Label>Trạng thái</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Kích hoạt</Label>
                  <Select
                    value={form.isActivated ? "true" : "false"}
                    onValueChange={(v) => setForm((p) => ({ ...p, isActivated: v === "true" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              {t("users.dialog.cancel")}
            </Button>
            <Button
              onClick={() => void save()}
              disabled={
                saving ||
                !form.email.trim() ||
                (!editing && !form.password.trim()) ||
                (!editing && form.roleName.toLowerCase() === "superadmin")
              }
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? t("users.dialog.save") : t("users.dialog.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("users.deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("users.deleteDialog.description", {
                email: deleteConfirm?.email ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
              {t("users.deleteDialog.cancel")}
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("users.deleteDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

