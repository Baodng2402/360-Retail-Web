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
  ChevronRight,
  ShoppingBag,
  MessageSquare,
  Award,
} from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
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
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loyaltySummary, setLoyaltySummary] = useState<LoyaltySummary | null>(null);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formState, setFormState] = useState<CustomerFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasLoyaltyFeature, setHasLoyaltyFeature] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "loyalty" | "feedback">("info");

  const canDelete =
    !!user && ["StoreOwner", "Manager"].includes(user.role ?? "");

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const features = await subscriptionApi.getAllowedFeatures();
        setHasLoyaltyFeature(features.includes("has_loyalty"));
      } catch {
        setHasLoyaltyFeature(null);
      }
    };
    void loadFeatures();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const me = await authApi.meWithSubscription().catch(() => null);
      if (!me?.storeId?.trim()) {
        setCustomers([]);
        toast.error(tCustomer("toasts.missingStoreInSession"));
        return;
      }
      const res = await customersApi.getCustomers({ pageSize: 200 });
      setCustomers(res.items);
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
  }, []);

  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setActiveTab("info");
    if (hasLoyaltyFeature) {
      await loadCustomerInsights(customer);
    }
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
        setCustomers((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c)),
        );
        if (selectedCustomer?.id === updated.id) {
          setSelectedCustomer(updated);
        }
        void loadCustomers();
        toast.success(tCustomer("toasts.updateSuccess"));
      } else {
        const created = await customersApi.createCustomer({
          fullName: formState.fullName.trim(),
          phoneNumber: formState.phoneNumber.trim(),
          email: formState.email.trim() || undefined,
        });
        if (created?.id) {
          setCustomers((prev) => [created, ...prev]);
          void handleSelectCustomer(created);
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

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription={tCustomer("page.storeSelectorHint")} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/20 dark:to-background border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng khách hàng</p>
              <h3 className="text-2xl font-bold text-foreground">{totalCustomers}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
              <h3 className="text-2xl font-bold text-foreground">{totalRevenue.toLocaleString("vi-VN")}đ</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Khách VIP</p>
              <h3 className="text-2xl font-bold text-foreground">
                {customers.filter((c) => (c.totalSpend || 0) > 5000000).length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Crown className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Customer List */}
        <Card className="lg:col-span-1 p-0 overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b bg-gradient-to-r from-teal-500/10 to-blue-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-500 text-white">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {tCustomer("header.title")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {filteredCustomers.length} khách hàng
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              className="w-full mt-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
              onClick={openCreateForm}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm khách hàng
            </Button>
          </div>

          {/* Customer List */}
          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Đang tải...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {tCustomer("states.emptyList")}
              </div>
            ) : (
              <div className="divide-y">
                {filteredCustomers.map((c, index) => {
                  const isSelected = selectedCustomer?.id === c.id;
                  return (
                    <div
                      key={c.id || `${c.fullName}-${index}`}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-teal-50 dark:bg-teal-950/30 border-l-4 border-l-teal-500"
                          : "hover:bg-muted/50 border-l-4 border-l-transparent"
                      }`}
                      onClick={() => void handleSelectCustomer(c)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          (c.totalSpend || 0) > 5000000
                            ? "bg-gradient-to-br from-amber-400 to-amber-600"
                            : "bg-gradient-to-br from-teal-500 to-blue-500"
                        }`}>
                          {c.fullName[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {c.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.phoneNumber}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {isSelected && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <Badge variant="secondary" className="gap-1">
                            <ShoppingBag className="h-3 w-3" />
                            {c.totalOrders ?? 0} đơn
                          </Badge>
                          <Badge variant="outline" className="gap-1 text-teal-600 border-teal-200">
                            {(c.totalSpend || 0).toLocaleString("vi-VN")}đ
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Customer Detail */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          {!selectedCustomer ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
              <Users className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Chọn khách hàng để xem chi tiết</p>
              <p className="text-sm">Click vào khách hàng bên trái để xem thông tin</p>
            </div>
          ) : (
            <>
              {/* Customer Header */}
              <div className="p-6 border-b bg-gradient-to-r from-teal-500/10 to-blue-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                      (selectedCustomer.totalSpend || 0) > 5000000
                        ? "bg-gradient-to-br from-amber-400 to-amber-600"
                        : "bg-gradient-to-br from-teal-500 to-blue-500"
                    }`}>
                      {selectedCustomer.fullName[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedCustomer.fullName}</h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {selectedCustomer.phoneNumber}
                        {selectedCustomer.email && (
                          <>
                            <Mail className="h-4 w-4 ml-2" />
                            {selectedCustomer.email}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditForm(selectedCustomer)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Sửa
                    </Button>
                    {canDelete && (
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => confirmDelete(selectedCustomer)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1">
                <TabsList className="w-full justify-start rounded-none border-b px-4">
                  <TabsTrigger value="info" className="gap-2">
                    <Users className="h-4 w-4" />
                    Thông tin
                  </TabsTrigger>
                  <TabsTrigger value="loyalty" className="gap-2">
                    <Award className="h-4 w-4" />
                    Tích điểm
                  </TabsTrigger>
                  <TabsTrigger value="feedback" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Phản hồi
                  </TabsTrigger>
                </TabsList>

                <div className="p-6 max-h-[400px] overflow-y-auto">
                  {/* Info Tab */}
                  <TabsContent value="info" className="m-0 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                            <p className="text-xl font-bold">{selectedCustomer.totalOrders ?? 0}</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-green-50 to-white border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Crown className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
                            <p className="text-xl font-bold text-green-600">
                              {(selectedCustomer.totalSpend || 0).toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <Card className="p-4">
                      <h3 className="font-semibold mb-4">Thông tin chi tiết</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Họ và tên</span>
                          <span className="font-medium">{selectedCustomer.fullName}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Số điện thoại</span>
                          <span className="font-medium">{selectedCustomer.phoneNumber}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Email</span>
                          <span className="font-medium">{selectedCustomer.email || "-"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Ngày tham gia</span>
                          <span className="font-medium">
                            {selectedCustomer.createdAt
                              ? new Date(selectedCustomer.createdAt).toLocaleDateString("vi-VN")
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">Trạng thái</span>
                          <Badge className={selectedCustomer.isActive !== false ? "bg-green-500" : "bg-gray-500"}>
                            {selectedCustomer.isActive !== false ? "Hoạt động" : "Ngừng"}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Loyalty Tab */}
                  <TabsContent value="loyalty" className="m-0 space-y-6">
                    {!hasLoyaltyFeature ? (
                      <Card className="p-6 text-center">
                        <Award className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">
                          Tính năng "Tích điểm Loyalty" không khả dụng trong gói hiện tại của bạn.
                        </p>
                      </Card>
                    ) : loyaltySummary ? (
                      <>
                        <Card className="p-6 bg-gradient-to-br from-amber-50 to-white border-amber-200">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Điểm tích lũy</p>
                              <p className="text-3xl font-bold text-amber-600">
                                {(loyaltySummary.totalPoints ?? 0).toLocaleString()}
                              </p>
                            </div>
                            <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                              <Crown className="h-4 w-4" />
                              {loyaltySummary.rank}
                            </Badge>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            Lịch sử tích điểm
                          </h3>
                          {loyaltyTransactions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Chưa có giao dịch tích điểm
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {loyaltyTransactions.map((txn) => (
                                <div
                                  key={txn.id}
                                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                                >
                                  <div>
                                    <p className="font-medium text-sm">
                                      {txn.points > 0 ? "+" : ""}
                                      {txn.points} điểm
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {txn.description || "Tích điểm"}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(txn.createdAt).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      </>
                    ) : (
                      <Card className="p-6 text-center">
                        <p className="text-sm text-muted-foreground">Đang tải dữ liệu loyalty...</p>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Feedback Tab */}
                  <TabsContent value="feedback" className="m-0 space-y-4">
                    {feedbacks.length === 0 ? (
                      <Card className="p-6 text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">
                          Chưa có phản hồi nào từ khách hàng này
                        </p>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {feedbacks.map((f) => (
                          <Card key={f.id} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < f.rating ? "text-amber-400 fill-amber-400" : "text-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(f.createdAt).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                            <p className="text-sm">{f.content || "Khách hàng không có nội dung phản hồi"}</p>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </>
          )}
        </Card>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => setFormOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? tCustomer("form.editTitle") : tCustomer("form.createTitle")}
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tCustomer("delete.title")}</DialogTitle>
            <DialogDescription>
              {tCustomer("delete.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
