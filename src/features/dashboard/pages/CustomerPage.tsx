import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Search,
  Crown,
  Clock,
  Star,
  Trash2,
  Edit2,
} from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import StoreSelector from "@/features/dashboard/components/StoreSelector";
import { customersApi } from "@/shared/lib/customersApi";
import type { Customer } from "@/shared/types/customers";
import type {
  LoyaltySummary,
  LoyaltyTransaction,
} from "@/shared/types/loyalty";
import type { Feedback } from "@/shared/lib/feedbackApi";
import { useAuthStore } from "@/shared/store/authStore";
import { authApi } from "@/shared/lib/authApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

type CustomerFormState = {
  fullName: string;
  phoneNumber: string;
  email: string;
};

const emptyForm: CustomerFormState = {
  fullName: "",
  phoneNumber: "",
  email: "",
};

const CustomerPage = () => {
  const { t: tCustomer } = useTranslation("customer");
  const { t: tCommon } = useTranslation("common");
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [loyaltySummary, setLoyaltySummary] = useState<LoyaltySummary | null>(
    null,
  );
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<
    LoyaltyTransaction[]
  >([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formState, setFormState] = useState<CustomerFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canDelete =
    !!user && ["StoreOwner", "Manager"].includes(user.role ?? "");

  const loadCustomers = async () => {
    try {
      setLoading(true);
      // Backend GET crm/customers lấy storeId từ JWT (claim store_id). Token thiếu/sai store_id → 500.
      const me = await authApi.meWithSubscription().catch(() => null);
      if (!me?.storeId?.trim()) {
        setCustomers([]);
        toast.error(
          tCustomer("toasts.missingStoreInSession"),
        );
        return;
      }
      const res = await customersApi.getCustomers({ pageSize: 200 });
      setCustomers(res.items);
      if (!selectedCustomer && res.items.length > 0) {
        void handleSelectCustomer(res.items[0]);
      }
    } catch (error: unknown) {
      const res = (error as { response?: { status?: number; data?: { code?: string; message?: string } } })?.response;
      const status = res?.status;
      const code = res?.data?.code;
      const serverMsg = res?.data?.message ?? "";

      let message: string;
      if (status === 400 && (code === "StoreIdRequired" || /store|store_id|cửa hàng/i.test(serverMsg))) {
        message = tCustomer("errors.noStoreAssigned");
      } else if (status === 500) {
        message = tCustomer("errors.server500");
      } else {
        message = tCustomer("errors.loadCustomersFailed");
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerInsights = async (customer: Customer) => {
    try {
      const [summary, transactions, fb] = await Promise.all([
        customersApi.getLoyaltySummary(customer.id).catch(() => null),
        customersApi.getLoyaltyTransactions(customer.id).catch(() => []),
        customersApi.getFeedbackByCustomer(customer.id).catch(() => []),
      ]);
      setLoyaltySummary(summary);
      setLoyaltyTransactions(transactions);
      setFeedbacks(fb);
    } catch {
      setLoyaltySummary(null);
      setLoyaltyTransactions([]);
      setFeedbacks([]);
    }
  };

  useEffect(() => {
    void loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLoyaltySummary(null);
    setLoyaltyTransactions([]);
    setFeedbacks([]);
    await loadCustomerInsights(customer);
  };

  const openCreateForm = () => {
    try {
      setEditingCustomer(null);
      setFormState({ ...emptyForm });
      setFormOpen(true);
    } catch (e) {
      console.error("Open create customer form error:", e);
      toast.error(tCustomer("errors.loadFormFailed", { defaultValue: "Không mở được form. Vui lòng thử lại." }));
    }
  };

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormState({
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      email: customer.email ?? "",
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formState.fullName.trim() || !formState.phoneNumber.trim()) {
      toast.error(tCustomer("toasts.validationMissingNamePhone"));
      return;
    }
    try {
      setSaving(true);
      if (editingCustomer) {
        const updated = await customersApi.updateCustomer(editingCustomer.id, {
          fullName: formState.fullName.trim(),
          phoneNumber: formState.phoneNumber.trim(),
          email: formState.email.trim() || undefined,
        });
        await loadCustomers();
        if (selectedCustomer?.id === updated.id) {
          setSelectedCustomer(updated);
        }
        toast.success(tCustomer("toasts.updateSuccess"));
      } else {
        const created = await customersApi.createCustomer({
          fullName: formState.fullName.trim(),
          phoneNumber: formState.phoneNumber.trim(),
          email: formState.email.trim() || undefined,
        });
        if (created?.id) {
          await loadCustomers();
        }
        toast.success(tCustomer("toasts.createSuccess"));
      }
      setFormOpen(false);
    } catch (error: unknown) {
      console.error("Failed to save customer:", error);
      const res = (error as { response?: { status?: number; data?: { error?: string; message?: string } } })?.response;
      const status = res?.status;
      const serverMsg = res?.data?.error || res?.data?.message || "";

      if (status === 409) {
        toast.error(
          serverMsg ||
            tCustomer("errors.customerPhoneExists", {
              defaultValue: "Số điện thoại này đã tồn tại trong cửa hàng.",
            }),
        );
        return;
      }

      toast.error(serverMsg || tCustomer("errors.saveCustomerFailed"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (customer: Customer) => {
    setEditingCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!editingCustomer) return;
    try {
      setDeleting(true);
      await customersApi.deleteCustomer(editingCustomer.id);
      setCustomers((prev) =>
        prev.filter((c) => c.id !== editingCustomer.id),
      );
      if (selectedCustomer?.id === editingCustomer.id) {
        setSelectedCustomer(null);
        setLoyaltySummary(null);
        setLoyaltyTransactions([]);
        setFeedbacks([]);
      }
      toast.success(tCustomer("toasts.deleteSuccess"));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error(tCustomer("errors.deleteCustomerFailed"));
    } finally {
      setDeleting(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.phoneNumber.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [customers, search]);

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription={tCustomer("page.storeSelectorHint")} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Card className="lg:col-span-2 p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-500 text-white">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {tCustomer("header.title")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {tCustomer("header.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={tCustomer("search.placeholder")}
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white whitespace-nowrap"
                onClick={openCreateForm}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {tCustomer("actions.addCustomer")}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-muted-foreground">
              {tCustomer("states.loadingList")}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              {tCustomer("states.emptyList")}
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <div className="max-h-[420px] overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-xs text-muted-foreground">
                        {tCustomer("table.customer")}
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-xs text-muted-foreground">
                        {tCustomer("table.contact")}
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-xs text-muted-foreground">
                        {tCustomer("table.ordersSpend")}
                      </th>
                      <th className="px-4 py-2 text-right font-medium text-xs text-muted-foreground">
                        {tCustomer("table.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c, index) => {
                      const isSelected = selectedCustomer?.id === c.id;
                      const shortId = (c.id || "").slice(0, 8);
                      const rowKey = c.id || `${c.fullName}-${index}`;
                      return (
                        <tr
                          key={rowKey}
                          className={`cursor-pointer border-t text-sm transition-colors ${
                            isSelected
                              ? "bg-teal-50/70 dark:bg-teal-950/30"
                              : "hover:bg-muted/60"
                          }`}
                          onClick={() => void handleSelectCustomer(c)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {c.fullName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {tCustomer("table.idPrefix")}{" "}
                                {shortId ? `${shortId}...` : "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{c.phoneNumber}</span>
                              </div>
                              {c.email && (
                                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span>{c.email}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className="flex flex-col gap-1">
                              <span>
                                {tCustomer("table.ordersLabel")}{" "}
                                <strong>
                                  {c.totalOrders ?? 0}
                                </strong>
                              </span>
                              <span className="text-muted-foreground">
                                {tCustomer("table.spendLabel")}{" "}
                                <strong>
                                  {c.totalSpend
                                    ? `${c.totalSpend.toLocaleString("vi-VN")}₫`
                                    : "-"}
                                </strong>
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditForm(c);
                                }}
                                aria-label={tCustomer("aria.edit")}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              {canDelete && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(c);
                                  }}
                                  aria-label={tCustomer("aria.deleteCustomer")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {tCustomer("insights.title")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {tCustomer("insights.subtitle")}
              </p>
            </div>
          </div>

          {!selectedCustomer ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              {tCustomer("insights.selectCustomerHint")}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {selectedCustomer.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedCustomer.phoneNumber}
                  </p>
                </div>
                {loyaltySummary && (
                  <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                    <Crown className="h-3 w-3" />
                    {loyaltySummary.rank}
                  </Badge>
                )}
              </div>

              {loyaltySummary ? (
                <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {tCustomer("loyalty.totalPointsLabel")}
                    </span>
                    <span className="text-sm font-semibold">
                      {tCustomer("loyalty.totalPointsValue", {
                        points: loyaltySummary.totalPoints,
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {tCustomer("loyalty.rankHint")}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
                  {tCustomer("loyalty.empty")}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    {tCustomer("loyalty.recentTransactions.title")}
                  </span>
                  <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{tCustomer("loyalty.recentTransactions.latest")}</span>
                  </div>
                </div>
                {loyaltyTransactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {tCustomer("loyalty.recentTransactions.empty")}
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-2 text-xs">
                    {loyaltyTransactions.slice(0, 5).map((txn) => (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between rounded-md bg-background border px-2 py-1.5"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {txn.points > 0 ? "+" : ""}
                            {tCustomer("loyalty.pointsValue", { points: txn.points })}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {txn.description || tCustomer("loyalty.transactionFallback")}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {tCommon("formats.date", {
                            value: new Date(txn.createdAt),
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    {tCustomer("feedback.title")}
                  </span>
                  <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Star className="h-3 w-3 text-amber-400" />
                    <span>{tCustomer("feedback.count", { count: feedbacks.length })}</span>
                  </div>
                </div>
                {feedbacks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {tCustomer("feedback.empty")}
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-2 text-xs">
                    {feedbacks.slice(0, 3).map((f) => (
                      <div
                        key={f.id}
                        className="rounded-md bg-background border px-2 py-1.5 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="inline-flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400" />
                            <span>{f.rating}/5</span>
                          </div>
                          <span className="text-muted-foreground">
                            {tCommon("formats.date", { value: new Date(f.createdAt) })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {f.content || tCustomer("feedback.contentFallback")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingCustomer(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer
                ? tCustomer("form.editTitle")
                : tCustomer("form.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {tCustomer("form.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {tCustomer("form.fullNameLabel")}
              </label>
              <Input
                value={formState.fullName}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, fullName: e.target.value }))
                }
                placeholder={tCustomer("form.fullNamePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {tCustomer("form.phoneLabel")}
              </label>
              <Input
                value={formState.phoneNumber}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, phoneNumber: e.target.value }))
                }
                placeholder={tCustomer("form.phonePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {tCustomer("form.emailLabel")}
              </label>
              <Input
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, email: e.target.value }))
                }
                placeholder={tCustomer("form.emailPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {tCommon("actions.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
            >
              {saving
                ? tCommon("states.saving")
                : editingCustomer
                  ? tCommon("actions.saveChanges")
                  : tCustomer("actions.addCustomer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tCustomer("delete.title")}</DialogTitle>
            <DialogDescription>
              {tCustomer("delete.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {tCommon("actions.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? tCommon("states.deleting") : tCustomer("delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerPage;
