import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Switch } from "@/shared/components/ui/switch";
import { superAdminSaasApi, type SuperAdminCreatePlanDto, type SuperAdminPlan, type SuperAdminUpdatePlanDto } from "@/shared/lib/superAdminSaasApi";
import { Loader2, Plus, Trash2, Pencil, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatVnd } from "@/shared/utils/formatMoney";

export default function AdminPlansPage() {
  const { t } = useTranslation("admin");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SuperAdminPlan[]>([]);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "duration" | "subs">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SuperAdminPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SuperAdminCreatePlanDto>({
    planName: "",
    price: 0,
    durationDays: 30,
    features: "",
  });

  type FeatureConfig = {
    has_tasks: boolean;
    max_orders: number;
    has_loyalty: boolean;
    has_variants: boolean;
    max_products: number;
    has_dashboard: boolean;
    max_employees: number;
    has_feedback_qr: boolean;
    has_gps_checkin: boolean;
    has_multi_store: boolean;
    has_export_excel: boolean;
    has_invite_staff: boolean;
    has_inventory_tickets: boolean;
    has_realtime_notifications: boolean;
  };

  const defaultFeatures: FeatureConfig = {
    has_tasks: true,
    max_orders: 500,
    has_loyalty: true,
    has_variants: true,
    max_products: 200,
    has_dashboard: true,
    max_employees: 10,
    has_feedback_qr: true,
    has_gps_checkin: false,
    has_multi_store: false,
    has_export_excel: true,
    has_invite_staff: true,
    has_inventory_tickets: true,
    has_realtime_notifications: true,
  };

  const [featureConfig, setFeatureConfig] = useState<FeatureConfig>(defaultFeatures);
  const [featureExtras, setFeatureExtras] = useState<Record<string, unknown>>({});

  const [deleteConfirm, setDeleteConfirm] = useState<SuperAdminPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await superAdminSaasApi.listPlans();
      setItems(res);
    } catch (err) {
      console.error("Failed to load plans:", err);
      toast.error("Không tải được danh sách gói dịch vụ.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let next = items;
    if (term) {
      next = next.filter(
        (p) =>
          (p.planName ?? "").toLowerCase().includes(term) ||
          (p.id ?? "").toLowerCase().includes(term),
      );
    }

    const sorted = [...next].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") {
        return ((a.planName ?? "") || "").localeCompare((b.planName ?? "") || "") * dir;
      }
      if (sortBy === "price") {
        return ((a.price ?? 0) - (b.price ?? 0)) * dir;
      }
      if (sortBy === "duration") {
        return ((a.durationDays ?? 0) - (b.durationDays ?? 0)) * dir;
      }
      if (sortBy === "subs") {
        return ((a.activeSubscriptions ?? 0) - (b.activeSubscriptions ?? 0)) * dir;
      }
      return 0;
    });

    return sorted;
  }, [items, q, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [q, sortBy, sortDir]);

  const openCreate = () => {
    setEditing(null);
    setForm({ planName: "", price: 0, durationDays: 30, features: "" });
    setFeatureConfig(defaultFeatures);
    setFeatureExtras({});
    setDialogOpen(true);
  };

  const openEdit = (p: SuperAdminPlan) => {
    setEditing(p);
    setForm({
      planName: p.planName ?? "",
      price: p.price ?? 0,
      durationDays: p.durationDays ?? 30,
      features: p.features ?? "",
    });
    // Parse JSON features → featureConfig + extras
    if (p.features && p.features.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(p.features) as Record<string, unknown>;
        const nextCfg: FeatureConfig = { ...defaultFeatures };
        const extras: Record<string, unknown> = {};
        Object.entries(parsed).forEach(([key, value]) => {
          if (key in nextCfg) {
            if (typeof nextCfg[key as keyof FeatureConfig] === "boolean") {
              (nextCfg as Record<string, unknown>)[key] = Boolean(value);
            } else if (typeof nextCfg[key as keyof FeatureConfig] === "number") {
              const num =
                typeof value === "number"
                  ? value
                  : typeof value === "string" && value.trim() !== ""
                    ? Number(value)
                    : 0;
              (nextCfg as Record<string, unknown>)[key] = Number.isFinite(num) ? num : 0;
            }
          } else {
            extras[key] = value;
          }
        });
        setFeatureConfig(nextCfg);
        setFeatureExtras(extras);
      } catch {
        setFeatureConfig(defaultFeatures);
        setFeatureExtras({});
      }
    } else {
      setFeatureConfig(defaultFeatures);
      setFeatureExtras({});
    }
    setDialogOpen(true);
  };

  const save = async () => {
    try {
      setSaving(true);
      const featuresObject: Record<string, unknown> = {
        ...featureExtras,
        ...featureConfig,
      };
      const featuresString = JSON.stringify(featuresObject);

      if (!editing) {
        const created = await superAdminSaasApi.createPlan({
          planName: form.planName.trim(),
          price: Number(form.price),
          durationDays: Number(form.durationDays),
          features: featuresString,
        });
        setItems((prev) => [created, ...prev]);
        toast.success("Đã tạo gói dịch vụ.");
      } else {
        const payload: SuperAdminUpdatePlanDto = {
          planName: form.planName.trim(),
          price: Number(form.price),
          durationDays: Number(form.durationDays),
          features: featuresString,
        };
        const updated = await superAdminSaasApi.updatePlan(editing.id, payload);
        if (updated) {
          setItems((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...updated } : x)));
        } else {
          await load();
        }
        toast.success("Đã cập nhật gói dịch vụ.");
      }
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to save plan:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        "Lưu gói thất bại.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      await superAdminSaasApi.deactivatePlan(deleteConfirm.id);
      setItems((prev) => prev.map((p) => (p.id === deleteConfirm.id ? { ...p, isActive: false } : p)));
      toast.success("Đã vô hiệu hóa gói.");
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to deactivate plan:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        "Vô hiệu hóa thất bại.";
      toast.error(message);
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
                {t("sidebar.brand.title")}
              </Badge>
              <span className="text-sm text-muted-foreground">CRUD gói dịch vụ (Plans)</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên hoặc id..."
              className="w-full sm:w-[320px]"
            />
            <Button
              onClick={openCreate}
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 gap-2"
            >
              <Plus className="h-4 w-4" />
              Tạo gói
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-teal-600" />
            Danh sách Plans
          </h3>
          <Badge variant="outline">{filtered.length.toLocaleString()}</Badge>
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
              Chưa có plan nào.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => {
                      setSortBy("name");
                      setSortDir((prev) =>
                        sortBy === "name" && prev === "asc" ? "desc" : "asc",
                      );
                    }}
                  >
                    Tên
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => {
                      setSortBy("price");
                      setSortDir((prev) =>
                        sortBy === "price" && prev === "asc" ? "desc" : "asc",
                      );
                    }}
                  >
                    Giá
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => {
                      setSortBy("duration");
                      setSortDir((prev) =>
                        sortBy === "duration" && prev === "asc" ? "desc" : "asc",
                      );
                    }}
                  >
                    Thời hạn
                  </TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => {
                      setSortBy("subs");
                      setSortDir((prev) =>
                        sortBy === "subs" && prev === "asc" ? "desc" : "asc",
                      );
                    }}
                  >
                    Active subs
                  </TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-[260px] truncate">
                      <div className="font-medium">{p.planName}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.id}</div>
                    </TableCell>
                    <TableCell>{formatVnd(p.price ?? 0)}</TableCell>
                    <TableCell>{(p.durationDays ?? 0).toLocaleString()} ngày</TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? "outline" : "destructive"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{(p.activeSubscriptions ?? 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => setDeleteConfirm(p)}
                          disabled={!p.isActive}
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
      </Card>

      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
          <div>
            Hiển thị{" "}
            <span className="font-semibold">
              {paged.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>{" "}
            -{" "}
            <span className="font-semibold">
              {(page - 1) * pageSize + paged.length}
            </span>{" "}
            trong <span className="font-semibold">{filtered.length}</span> plans
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trang trước
            </Button>
            <span>
              Trang <span className="font-semibold">{page}</span> /{" "}
              <span className="font-semibold">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Cập nhật Plan" : "Tạo Plan mới"}</DialogTitle>
            <DialogDescription>
              Endpoint: <span className="font-mono text-xs">/saas/super-admin/saas/plans</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 pt-2">
            <div className="space-y-1">
              <Label>Tên gói</Label>
              <Input
                value={form.planName}
                onChange={(e) => setForm((p) => ({ ...p, planName: e.target.value }))}
                placeholder="Pro"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Giá (VND)</Label>
                <Input
                  inputMode="numeric"
                  value={String(form.price)}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, price: Number(e.target.value || 0) }))
                  }
                  placeholder="199000"
                />
              </div>
              <div className="space-y-1">
                <Label>Thời hạn (ngày)</Label>
                <Input
                  inputMode="numeric"
                  value={String(form.durationDays)}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, durationDays: Number(e.target.value || 0) }))
                  }
                  placeholder="30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cấu hình tính năng (feature flags)</Label>
              <div className="grid gap-3 rounded-lg border bg-muted/40 p-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Giới hạn
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max orders</Label>
                    <Input
                      inputMode="numeric"
                      value={String(featureConfig.max_orders)}
                      onChange={(e) =>
                        setFeatureConfig((p) => ({
                          ...p,
                          max_orders: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max products</Label>
                    <Input
                      inputMode="numeric"
                      value={String(featureConfig.max_products)}
                      onChange={(e) =>
                        setFeatureConfig((p) => ({
                          ...p,
                          max_products: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max employees</Label>
                    <Input
                      inputMode="numeric"
                      value={String(featureConfig.max_employees)}
                      onChange={(e) =>
                        setFeatureConfig((p) => ({
                          ...p,
                          max_employees: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Tính năng
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      ["has_dashboard", "Dashboard tổng quan"],
                      ["has_tasks", "Quản lý tasks"],
                      ["has_loyalty", "Loyalty/điểm tích lũy"],
                      ["has_variants", "Sản phẩm có variants"],
                      ["has_feedback_qr", "Feedback QR"],
                      ["has_gps_checkin", "GPS check-in"],
                      ["has_multi_store", "Multi-store"],
                      ["has_export_excel", "Export Excel"],
                      ["has_invite_staff", "Mời nhân viên"],
                      ["has_inventory_tickets", "Phiếu kho"],
                      ["has_realtime_notifications", "Realtime notifications"],
                    ].map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] text-muted-foreground">{label}</span>
                        <Switch
                          checked={featureConfig[key as keyof FeatureConfig] as boolean}
                          onCheckedChange={(checked) =>
                            setFeatureConfig((p) => ({
                              ...p,
                              [key]: checked,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Các trường khác không hiển thị ở đây (nếu có trong JSON cũ) vẫn được giữ nguyên
                khi lưu để đảm bảo tương thích backend.
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Huỷ
            </Button>
            <Button
              onClick={() => void save()}
              disabled={saving || !form.planName.trim() || Number(form.durationDays) <= 0}
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Lưu" : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Vô hiệu hoá plan</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn vô hiệu hoá{" "}
              <strong>{deleteConfirm?.planName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={() => void confirmDeactivate()} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vô hiệu hoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

