import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
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
import { useNavigate } from "react-router-dom";

export default function AdminPlansPage() {
  const { t } = useTranslation(["admin", "common"]);
  const navigate = useNavigate();
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
      toast.error(t("admin:plansPage.toast.loadError"));
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
        toast.success(t("admin:plansPage.toast.createSuccess"));
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
        toast.success(t("admin:plansPage.toast.updateSuccess"));
      }
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to save plan:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        t("admin:plansPage.toast.saveError");
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
      toast.success(t("admin:plansPage.toast.deactivateSuccess"));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to deactivate plan:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        t("admin:plansPage.toast.deactivateError");
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/20">
                  {t("sidebar.brand.title")}
                </Badge>
                <span className="text-sm text-muted-foreground">{t("admin:plansPage.caption")}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("admin:plansPage.searchPlaceholder")}
                className="w-full sm:w-[320px] bg-background/80 backdrop-blur-sm"
              />
              <Button
                onClick={openCreate}
                className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                {t("admin:plansPage.actions.create")}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-[#FF7B21]" />
              {t("admin:plansPage.list.title")}
            </h3>
            <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
              {filtered.length.toLocaleString()}
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
                {t("admin:plansPage.states.noPlans")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#FF7B21]/5 to-[#19D6C8]/5 hover:bg-gradient-to-r">
                      <TableHead
                        className="cursor-pointer select-none"
                        onClick={() => {
                          setSortBy("name");
                          setSortDir((prev) =>
                            sortBy === "name" && prev === "asc" ? "desc" : "asc",
                          );
                        }}
                      >
                        {t("admin:plansPage.columns.name")}
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
                        {t("admin:plansPage.columns.price")}
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
                        {t("admin:plansPage.columns.duration")}
                      </TableHead>
                      <TableHead>{t("admin:plansPage.columns.status")}</TableHead>
                      <TableHead
                        className="cursor-pointer select-none"
                        onClick={() => {
                          setSortBy("subs");
                          setSortDir((prev) =>
                            sortBy === "subs" && prev === "asc" ? "desc" : "asc",
                          );
                        }}
                      >
                        {t("admin:plansPage.columns.activeSubs")}
                      </TableHead>
                      <TableHead className="text-right">{t("admin:plansPage.columns.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((p, index) => (
                      <motion.tr
                        key={p.id}
                        className="cursor-pointer border-b last:border-0 hover:bg-gradient-to-r hover:from-[#FF7B21]/5 hover:to-transparent transition-all duration-200"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        onClick={() => navigate(`/admin/plans/${p.id}`)}
                      >
                        <TableCell className="max-w-[260px] truncate">
                          <div className="font-medium">{p.planName}</div>
                          <div className="text-xs text-muted-foreground truncate">{p.id}</div>
                        </TableCell>
                        <TableCell>{formatVnd(p.price ?? 0)}</TableCell>
                        <TableCell>
                          {t("admin:plansPage.durationDays", {
                            days: (p.durationDays ?? 0).toLocaleString(),
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.isActive ? "outline" : "destructive"} className={p.isActive ? "border-emerald-500/50 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : ""}>
                            {p.isActive
                              ? t("admin:plansPage.status.active")
                              : t("admin:plansPage.status.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>{(p.activeSubscriptions ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                              onClick={() => openEdit(p)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                              onClick={() => setDeleteConfirm(p)}
                              disabled={!p.isActive}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {!loading && filtered.length > 0 && (
        <motion.div
          className="flex items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div>
            {t("admin:plansPage.pagination.summary", {
              from: paged.length > 0 ? (page - 1) * pageSize + 1 : 0,
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
              {t("admin:plansPage.pagination.prev")}
            </Button>
            <span>
              {t("admin:plansPage.pagination.page", { page, totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("admin:plansPage.pagination.next")}
            </Button>
          </div>
        </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("admin:plansPage.dialog.titleEdit") : t("admin:plansPage.dialog.titleCreate")}
            </DialogTitle>
            <DialogDescription>
              {t("admin:plansPage.dialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 pt-2">
            <div className="space-y-1">
              <Label>{t("admin:plansPage.dialog.fields.name")}</Label>
              <Input
                value={form.planName}
                onChange={(e) => setForm((p) => ({ ...p, planName: e.target.value }))}
                placeholder={t("admin:plansPage.dialog.placeholders.name")}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>{t("admin:plansPage.dialog.fields.price")}</Label>
                <Input
                  inputMode="numeric"
                  value={String(form.price)}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, price: Number(e.target.value || 0) }))
                  }
                  placeholder={t("admin:plansPage.dialog.placeholders.price")}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("admin:plansPage.dialog.fields.durationDays")}</Label>
                <Input
                  inputMode="numeric"
                  value={String(form.durationDays)}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, durationDays: Number(e.target.value || 0) }))
                  }
                  placeholder={t("admin:plansPage.dialog.placeholders.durationDays")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("admin:plansPage.dialog.fields.features")}</Label>
              <div className="grid gap-3 rounded-lg border bg-muted/40 p-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t("admin:plansPage.dialog.sections.limits")}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("admin:plansPage.dialog.limits.maxOrders")}</Label>
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
                    <Label className="text-xs">{t("admin:plansPage.dialog.limits.maxProducts")}</Label>
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
                    <Label className="text-xs">{t("admin:plansPage.dialog.limits.maxEmployees")}</Label>
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
                    {t("admin:plansPage.dialog.sections.features")}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      ["has_dashboard", t("admin:plansPage.dialog.featureFlags.has_dashboard")],
                      ["has_tasks", t("admin:plansPage.dialog.featureFlags.has_tasks")],
                      ["has_loyalty", t("admin:plansPage.dialog.featureFlags.has_loyalty")],
                      ["has_variants", t("admin:plansPage.dialog.featureFlags.has_variants")],
                      ["has_feedback_qr", t("admin:plansPage.dialog.featureFlags.has_feedback_qr")],
                      ["has_gps_checkin", t("admin:plansPage.dialog.featureFlags.has_gps_checkin")],
                      ["has_multi_store", t("admin:plansPage.dialog.featureFlags.has_multi_store")],
                      ["has_export_excel", t("admin:plansPage.dialog.featureFlags.has_export_excel")],
                      ["has_invite_staff", t("admin:plansPage.dialog.featureFlags.has_invite_staff")],
                      ["has_inventory_tickets", t("admin:plansPage.dialog.featureFlags.has_inventory_tickets")],
                      ["has_realtime_notifications", t("admin:plansPage.dialog.featureFlags.has_realtime_notifications")],
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
                {t("admin:plansPage.dialog.keepExtrasHint")}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              {t("common:actions.cancel")}
            </Button>
            <Button
              onClick={() => void save()}
              disabled={saving || !form.planName.trim() || Number(form.durationDays) <= 0}
              className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? t("common:actions.save") : t("common:actions.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              {t("admin:plansPage.deactivateDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("admin:plansPage.deactivateDialog.description", {
                name: deleteConfirm?.planName ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
              {t("common:actions.cancel")}
            </Button>
            <Button variant="destructive" onClick={() => void confirmDeactivate()} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("admin:plansPage.deactivateDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

