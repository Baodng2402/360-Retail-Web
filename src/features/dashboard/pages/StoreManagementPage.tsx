import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
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
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Switch } from "@/shared/components/ui/switch";
import {
  Search,
  Plus,
  Edit,
  Store as StoreIcon,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { storesApi } from "@/shared/lib/storesApi";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import type { Store } from "@/shared/types/stores";
import {
  formatPriceVnd,
  type SePayPaymentData,
} from "@/shared/types/subscription";
import toast from "react-hot-toast";
import { StoreFormDialog } from "../components/StoreFormDialog";

interface StoreData extends Store {
  status?: "active" | "inactive";
}

const STORE_PENDING_PAYMENT_KEY = "360retail-pending-store-payments";

type PendingStorePayments = Record<string, string>; // storeId -> paymentId

const loadPendingPayments = (): PendingStorePayments => {
  try {
    const raw = localStorage.getItem(STORE_PENDING_PAYMENT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PendingStorePayments;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const savePendingPayments = (next: PendingStorePayments) => {
  try {
    localStorage.setItem(STORE_PENDING_PAYMENT_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
};

const StoreManagementPage = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [selectedView, setSelectedView] = useState<"grid" | "list">("grid");
  const [togglingStoreIds, setTogglingStoreIds] = useState<Set<string>>(
    new Set(),
  );

  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [storeToToggle, setStoreToToggle] = useState<StoreData | null>(null);
  const [savingStore, setSavingStore] = useState(false);
  const [storeForm, setStoreForm] = useState({
    storeName: "",
    address: "",
    phone: "",
    isActive: true,
    planId: "",
  });
  const [sepayDialogOpen, setSepayDialogOpen] = useState(false);
  const [sepayData, setSepayData] = useState<SePayPaymentData | null>(null);
  const [lastPaymentId, setLastPaymentId] = useState<string | null>(null);
  const [pendingPayments, setPendingPayments] = useState<PendingStorePayments>(
    loadPendingPayments(),
  );

  const setPendingPaymentForStore = (storeId: string, paymentId: string) => {
    setPendingPayments((prev) => {
      const next = { ...prev, [storeId]: paymentId };
      savePendingPayments(next);
      return next;
    });
  };

  const clearPendingPaymentForStore = (storeId: string) => {
    setPendingPayments((prev) => {
      if (!prev[storeId]) return prev;
      const next = { ...prev };
      delete next[storeId];
      savePendingPayments(next);
      return next;
    });
  };

  const retryPaymentForStore = async (storeId: string) => {
    const paymentId = pendingPayments[storeId];
    if (!paymentId) return;
    try {
      const payment = await subscriptionApi.initiatePayment(paymentId, "sepay");
      if (
        typeof payment === "object" &&
        payment !== null &&
        "provider" in payment &&
        (payment as { provider?: string }).provider === "sepay"
      ) {
        setLastPaymentId(paymentId);
        setSepayData(payment as SePayPaymentData);
        setSepayDialogOpen(true);
        return;
      }
      if (
        typeof payment === "object" &&
        payment !== null &&
        "paymentUrl" in payment &&
        (payment as { paymentUrl?: string }).paymentUrl
      ) {
        window.open((payment as { paymentUrl: string }).paymentUrl, "_blank");
        return;
      }
      toast.error("Không khởi tạo được thanh toán. Vui lòng thử lại sau.");
    } catch (e) {
      console.error("Retry store payment failed:", e);
      toast.error("Không khởi tạo được thanh toán. Vui lòng thử lại sau.");
    }
  };

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const includeInactive = selectedStatus !== "active";
      let fetchedStores: Store[] = [];

      try {
        fetchedStores = await storesApi.getMyOwnedStores(includeInactive);
      } catch (err) {
        const status = (err as { response?: { status?: number } }).response
          ?.status;
        // Nếu không phải Owner (403), fallback: chỉ lấy store hiện tại
        if (status === 403) {
          try {
            const myStore = await storesApi.getMyStore();
            fetchedStores = myStore ? [myStore] : [];
          } catch {
            fetchedStores = [];
          }
        } else {
          throw err;
        }
      }

      const mappedStores: StoreData[] = fetchedStores.map((store) => ({
        ...store,
        status: store.isActive ? "active" : "inactive",
      }));

      setStores(mappedStores);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Không thể tải danh sách cửa hàng";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.address &&
        store.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (store.phone &&
        store.phone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && store.isActive) ||
      (selectedStatus === "inactive" && !store.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleAddStore = () => {
    setEditingStore(null);
    setStoreForm({
      storeName: "",
      address: "",
      phone: "",
      isActive: true,
      planId: "",
    });
    setStoreDialogOpen(true);
  };

  const handleEditStore = (store: StoreData) => {
    setEditingStore(store);
    setStoreForm({
      storeName: store.storeName,
      address: store.address || "",
      phone: store.phone || "",
      isActive: store.isActive,
      planId: "",
    });
    setStoreDialogOpen(true);
  };

  const handleSaveStore = async () => {
    if (!storeForm.storeName.trim()) {
      toast.error("Vui lòng nhập tên cửa hàng");
      return;
    }

    if (savingStore) {
      return;
    }

    try {
      setSavingStore(true);
      if (editingStore) {
        const updatedStore = await storesApi.updateStore(editingStore.id, {
          storeName: storeForm.storeName,
          address: storeForm.address || undefined,
          phone: storeForm.phone || undefined,
          isActive: storeForm.isActive,
        });

        setStores(
          stores.map((s) =>
            s.id === editingStore.id
              ? {
                  ...updatedStore,
                  status: updatedStore.isActive ? "active" : "inactive",
                }
              : s,
          ),
        );
        toast.success("Cập nhật cửa hàng thành công!");
      } else {
        if (!storeForm.planId.trim()) {
          toast.error("Vui lòng chọn gói (plan) để tạo cửa hàng.");
          return;
        }
        const createResult = await storesApi.createStore({
          storeName: storeForm.storeName,
          address: storeForm.address || undefined,
          phone: storeForm.phone || undefined,
          planId: storeForm.planId,
        });

        await fetchStores();
        const createdStoreId = createResult.store?.id;
        const paymentId = createResult.payment?.paymentId;

        if (paymentId) {
          if (createdStoreId) {
            setPendingPaymentForStore(createdStoreId, paymentId);
          }
          try {
            // Khởi tạo thanh toán qua Gateway đúng chuẩn backend:
            // GET /saas/payments/initiate?paymentId=...&provider=sepay
            const payment = await subscriptionApi.initiatePayment(
              paymentId,
              "sepay",
            );

            if (
              typeof payment === "object" &&
              payment !== null &&
              "provider" in payment &&
              (payment as { provider?: string }).provider === "sepay"
            ) {
              setLastPaymentId(paymentId);
              setSepayData(payment as SePayPaymentData);
              setSepayDialogOpen(true);
              toast.success(
                `Tạo cửa hàng "${storeForm.storeName}" thành công. Vui lòng thanh toán theo thông tin bên dưới.`,
                { duration: 6000 },
              );
            } else if (
              typeof payment === "object" &&
              payment !== null &&
              "paymentUrl" in payment &&
              (payment as { paymentUrl?: string }).paymentUrl
            ) {
              const { paymentUrl } = payment as { paymentUrl: string };
              toast.success(
                `Tạo cửa hàng "${storeForm.storeName}" thành công. Đang mở trang thanh toán.`,
                { duration: 8000 },
              );
              window.open(paymentUrl, "_blank");
            } else {
              toast.error(
                "Tạo cửa hàng thành công nhưng không khởi tạo được thanh toán. Vui lòng thử lại từ trang Gói dịch vụ.",
              );
            }
          } catch (err) {
            console.error(
              "Failed to initiate payment for new store subscription:",
              err,
            );
            const message =
              (err as {
                response?: { data?: { message?: string } };
              })?.response?.data?.message ||
              "Không thể khởi tạo thanh toán cho cửa hàng mới. Vui lòng thử lại từ trang Gói dịch vụ.";
            toast.error(message);
          }
        } else {
          toast.success(
            `Tạo cửa hàng "${storeForm.storeName}" thành công. Để sử dụng, hãy mua gói dịch vụ cho cửa hàng này trong trang Gói dịch vụ.`,
            { duration: 5000 },
          );
        }
      }

      setStoreDialogOpen(false);
    } catch (error) {
      console.error("Failed to save store:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || editingStore
          ? "Không thể cập nhật cửa hàng"
          : "Không thể tạo cửa hàng";
      toast.error(errorMessage);
    } finally {
      setSavingStore(false);
    }
  };

  const handleToggleStoreActive = (store: StoreData) => {
    setStoreToToggle(store);
    setToggleDialogOpen(true);
  };

  const confirmToggleStoreActive = async () => {
    if (!storeToToggle) return;

    const newActiveState = !storeToToggle.isActive;

    setTogglingStoreIds((prev) => new Set(prev).add(storeToToggle.id));
    setToggleDialogOpen(false);

    const confirmMessage = newActiveState
      ? `Đang kích hoạt cửa hàng "${storeToToggle.storeName}"...`
      : `Đang tạm ngừng cửa hàng "${storeToToggle.storeName}"...`;

    const loadingToast = toast.loading(confirmMessage);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      await storesApi.updateStore(storeToToggle.id, {
        storeName: storeToToggle.storeName,
        address: storeToToggle.address || "",
        phone: storeToToggle.phone || "",
        isActive: newActiveState,
      });

      setStores(
        stores.map((s) =>
          s.id === storeToToggle.id
            ? {
                ...s,
                isActive: newActiveState,
                status: newActiveState ? "active" : "inactive",
              }
            : s,
        ),
      );

      toast.dismiss(loadingToast);
      toast.success(
        newActiveState
          ? `Cửa hàng "${storeToToggle.storeName}" đã được kích hoạt`
          : `Cửa hàng "${storeToToggle.storeName}" đã được tạm ngừng hoạt động`,
      );
    } catch (error) {
      console.error("Failed to toggle store active state:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Không thể cập nhật trạng thái cửa hàng";

      toast.dismiss(loadingToast);
      toast.error(errorMessage);
    } finally {
      setTogglingStoreIds((prev) => {
        const next = new Set(prev);
        next.delete(storeToToggle.id);
        return next;
      });
      setStoreToToggle(null);
    }
  };

  const getStatusBadge = (status: StoreData["status"] | boolean) => {
    const isActive = typeof status === "boolean" ? status : status === "active";

    if (isActive) {
      return (
        <Badge className="bg-green-500 gap-1 min-w-fit flex-shrink-0">
          <CheckCircle className="h-3 w-3" />
          Hoạt động
        </Badge>
      );
    }

    return (
      <Badge className="bg-gray-500 gap-1 min-w-fit flex-shrink-0">
        <XCircle className="h-3 w-3" />
        Ngừng hoạt động
      </Badge>
    );
  };

  const getStatusIcon = (status: StoreData["status"] | boolean) => {
    const isActive = typeof status === "boolean" ? status : status === "active";

    if (isActive) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    return <XCircle className="h-5 w-5 text-gray-500" />;
  };

  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.isActive).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-200 dark:border-blue-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Tổng cửa hàng
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {totalStores}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {activeStores} đang hoạt động
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <StoreIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-200 dark:border-green-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Cửa hàng đang hoạt động
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {activeStores}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {stores.length - activeStores} đã tạm ngừng
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm cửa hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleAddStore} className="gap-2 whitespace-nowrap">
            <Plus className="h-4 w-4" />
            Thêm cửa hàng
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedView === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedView("grid")}
          >
            Lưới
          </Button>
          <Button
            variant={selectedView === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedView("list")}
          >
            Danh sách
          </Button>
        </div>

        {selectedView === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-12">
                Không tìm thấy cửa hàng
              </div>
            ) : (
              filteredStores.map((store) => (
                <Card
                  key={store.id}
                  className="p-6 hover:shadow-lg transition-all relative overflow-hidden"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/dashboard/stores/${store.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/dashboard/stores/${store.id}`);
                    }
                  }}
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary/50 to-transparent" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <StoreIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">
                          {store.storeName}
                        </h4>
                      </div>
                    </div>
                    {getStatusIcon(store.status || store.isActive)}
                  </div>

                  <div className="space-y-3 mb-4">
                    {store.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {store.address}
                        </span>
                      </div>
                    )}
                    {store.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {store.phone}
                        </span>
                      </div>
                    )}
                    {store.createdAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Tạo:{" "}
                          {new Date(store.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    {getStatusBadge(store.status || store.isActive)}
                    <div className="flex items-center gap-3">
                      {pendingPayments[store.id] && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => void retryPaymentForStore(store.id)}
                        >
                          Thanh toán
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStore(store);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {store.isActive ? "Hoạt động" : "Tạm dừng"}
                        </span>
                        <Switch
                          checked={store.isActive}
                          onCheckedChange={() => handleToggleStoreActive(store)}
                          disabled={togglingStoreIds.has(store.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredStores.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  Không tìm thấy cửa hàng
                </div>
              ) : (
                filteredStores.map((store) => (
                  <Card
                    key={store.id}
                    className="p-6 hover:shadow-md transition-shadow"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/dashboard/stores/${store.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/dashboard/stores/${store.id}`);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <StoreIcon className="h-8 w-8 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">
                              {store.storeName}
                            </h4>
                            {getStatusBadge(store.status || store.isActive)}
                            {store.isDefault && (
                              <Badge variant="secondary">Mặc định</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                            {store.address && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground truncate">
                                  {store.address}
                                </span>
                              </div>
                            )}
                            {store.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {store.phone}
                                </span>
                              </div>
                            )}
                            {store.createdAt && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Tạo:{" "}
                                  {new Date(store.createdAt).toLocaleDateString(
                                    "vi-VN",
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        {pendingPayments[store.id] && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => void retryPaymentForStore(store.id)}
                          >
                            Thanh toán
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStore(store);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {store.isActive ? "Hoạt động" : "Tạm dừng"}
                          </span>
                          <Switch
                            checked={store.isActive}
                            onCheckedChange={() =>
                              handleToggleStoreActive(store)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </Card>

      <StoreFormDialog
        open={storeDialogOpen}
        onOpenChange={setStoreDialogOpen}
        isEditing={!!editingStore}
        formData={storeForm}
        onFormChange={setStoreForm}
        onSave={handleSaveStore}
        isSaving={savingStore}
      />

      <Dialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {storeToToggle?.isActive
                ? "Tạm ngừng hoạt động cửa hàng"
                : "Kích hoạt cửa hàng"}
            </DialogTitle>
            <DialogDescription>
              {storeToToggle?.isActive ? (
                <>
                  Bạn có chắc chắn muốn tạm ngừng hoạt động cửa hàng{" "}
                  <strong>"{storeToToggle?.storeName}"</strong>? Cửa hàng sẽ
                  không thể tiếp tục hoạt động sau khi được tạm ngừng.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn kích hoạt cửa hàng{" "}
                  <strong>"{storeToToggle?.storeName}"</strong>? Cửa hàng sẽ
                  được kích hoạt và có thể tiếp tục hoạt động.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setToggleDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={confirmToggleStoreActive}>
              {storeToToggle?.isActive ? "Tạm ngừng" : "Kích hoạt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sepayDialogOpen} onOpenChange={setSepayDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thanh toán QR (SePay)</DialogTitle>
            <DialogDescription>
              Quét mã hoặc chuyển khoản theo thông tin bên dưới để kích hoạt cửa hàng.
            </DialogDescription>
          </DialogHeader>
          {sepayData ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={sepayData.qrCodeUrl}
                  alt="QR thanh toán SePay"
                  className="w-48 h-48 object-contain border rounded-lg"
                />
              </div>
              <div className="rounded-lg border bg-muted/50 p-3 space-y-1 text-sm">
                <p className="font-mono text-xs text-muted-foreground">Mã GD</p>
                <span className="font-mono">{sepayData.paymentCode}</span>
              </div>
              <div className="rounded-lg border p-3 space-y-2 text-sm">
                <p className="font-medium">Chuyển khoản</p>
                <p>{sepayData.bankInfo.bankName}</p>
                <p>STK: {sepayData.bankInfo.accountNumber}</p>
                <p>Chủ TK: {sepayData.bankInfo.accountName}</p>
                <p>Số tiền: {formatPriceVnd(sepayData.bankInfo.amount)}</p>
                <p>Nội dung: {sepayData.bankInfo.content}</p>
              </div>
              {sepayData.instruction && (
                <p className="text-xs text-muted-foreground">
                  {sepayData.instruction}
                </p>
              )}
              <Button
                className="w-full"
                onClick={async () => {
                  if (!lastPaymentId) return;
                  try {
                    const status = await subscriptionApi.getPaymentStatus(lastPaymentId);
                    if (status.status === "Completed" || status.status === "Paid") {
                      toast.success("Thanh toán thành công!");
                      setSepayDialogOpen(false);
                      setSepayData(null);
                      // Xóa pending payment nếu tìm được storeId tương ứng
                      const matchStoreId = Object.entries(pendingPayments).find(
                        ([, pid]) => pid === lastPaymentId,
                      )?.[0];
                      if (matchStoreId) clearPendingPaymentForStore(matchStoreId);
                      setLastPaymentId(null);
                      await fetchStores();
                    } else {
                      toast("Chưa ghi nhận thanh toán. Vui lòng thử lại sau.");
                    }
                  } catch {
                    toast.error("Không kiểm tra được trạng thái. Thử lại sau.");
                  }
                }}
              >
                Đã thanh toán / Kiểm tra
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Đang tải thông tin...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreManagementPage;
