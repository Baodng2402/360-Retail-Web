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
import toast from "react-hot-toast";

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
      const res = await customersApi.getCustomers({ pageSize: 200 });
      setCustomers(res.items);
      if (!selectedCustomer && res.items.length > 0) {
        void handleSelectCustomer(res.items[0]);
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast.error("Không thể tải danh sách khách hàng.");
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
    setEditingCustomer(null);
    setFormState(emptyForm);
    setFormOpen(true);
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
      toast.error("Vui lòng nhập đầy đủ họ tên và số điện thoại.");
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
        setCustomers((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c)),
        );
        if (selectedCustomer?.id === updated.id) {
          setSelectedCustomer(updated);
        }
        toast.success("Cập nhật khách hàng thành công.");
      } else {
        const created = await customersApi.createCustomer({
          fullName: formState.fullName.trim(),
          phoneNumber: formState.phoneNumber.trim(),
          email: formState.email.trim() || undefined,
        });
        setCustomers((prev) => [created, ...prev]);
        toast.success("Thêm khách hàng mới thành công.");
      }
      setFormOpen(false);
    } catch (error) {
      console.error("Failed to save customer:", error);
      toast.error("Không thể lưu khách hàng. Vui lòng thử lại.");
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
      toast.success("Đã xóa khách hàng.");
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error("Không thể xóa khách hàng. Vui lòng thử lại.");
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
      <StoreSelector pageDescription="Chuyển đổi để xem khách hàng của cửa hàng khác" />

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
                  Khách hàng
                </h2>
                <p className="text-xs text-muted-foreground">
                  Quản lý thông tin và lịch sử chăm sóc khách hàng.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, SĐT, email..."
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
                Thêm khách
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-muted-foreground">
              Đang tải danh sách khách hàng...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              Chưa có khách hàng nào. Hãy thêm khách hàng đầu tiên của bạn.
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <div className="max-h-[420px] overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-xs text-muted-foreground">
                        Khách hàng
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-xs text-muted-foreground">
                        Liên hệ
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-xs text-muted-foreground">
                        Tổng đơn / chi tiêu
                      </th>
                      <th className="px-4 py-2 text-right font-medium text-xs text-muted-foreground">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c) => {
                      const isSelected = selectedCustomer?.id === c.id;
                      return (
                        <tr
                          key={c.id}
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
                                ID: {c.id.slice(0, 8)}...
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
                                Đơn:{" "}
                                <strong>
                                  {c.totalOrders ?? 0}
                                </strong>
                              </span>
                              <span className="text-muted-foreground">
                                Chi tiêu:{" "}
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
                                aria-label="Chỉnh sửa"
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
                                  aria-label="Xóa khách hàng"
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
                Loyalty & Feedback
              </h3>
              <p className="text-xs text-muted-foreground">
                Điểm tích lũy và đánh giá của khách.
              </p>
            </div>
          </div>

          {!selectedCustomer ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Chọn một khách hàng ở bảng bên trái để xem chi tiết.
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
                      Tổng điểm tích lũy
                    </span>
                    <span className="text-sm font-semibold">
                      {loyaltySummary.totalPoints.toLocaleString("vi-VN")} điểm
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Hạng hiện tại giúp khách nhận ưu đãi tốt hơn. Bạn có thể cấu
                    hình luật tích điểm trong phần Loyalty Rules.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
                  Khách hàng này chưa có dữ liệu loyalty.
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    Giao dịch điểm gần đây
                  </span>
                  <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Gần nhất</span>
                  </div>
                </div>
                {loyaltyTransactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Chưa có giao dịch tích/đổi điểm nào.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-2 text-xs">
                    {loyaltyTransactions.slice(0, 5).map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-md bg-background border px-2 py-1.5"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {t.points > 0 ? "+" : ""}
                            {t.points} điểm
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {t.description || "Giao dịch loyalty"}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    Feedback gần đây
                  </span>
                  <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Star className="h-3 w-3 text-amber-400" />
                    <span>{feedbacks.length} feedback</span>
                  </div>
                </div>
                {feedbacks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Chưa có feedback nào từ khách hàng này.
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
                            {new Date(f.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {f.content || "Không có nội dung chi tiết."}
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
            </DialogTitle>
            <DialogDescription>
              Lưu thông tin cơ bản để dễ dàng chăm sóc và tra cứu lịch sử mua
              hàng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Họ tên
              </label>
              <Input
                value={formState.fullName}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, fullName: e.target.value }))
                }
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Số điện thoại
              </label>
              <Input
                value={formState.phoneNumber}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, phoneNumber: e.target.value }))
                }
                placeholder="0901234567"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Email (không bắt buộc)
              </label>
              <Input
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, email: e.target.value }))
                }
                placeholder="customer@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
            >
              {saving
                ? "Đang lưu..."
                : editingCustomer
                  ? "Lưu thay đổi"
                  : "Thêm khách hàng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa khách hàng</DialogTitle>
            <DialogDescription>
              Hành động này sẽ xóa khách hàng khỏi hệ thống. Bạn có chắc chắn?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Đang xóa..." : "Xóa khách hàng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerPage;
