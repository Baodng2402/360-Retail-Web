import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Search, ShoppingCart, Users, FileText } from "lucide-react";
import { productsApi } from "@/shared/lib/productsApi";
import { ordersApi } from "@/shared/lib/ordersApi";
import { storesApi } from "@/shared/lib/storesApi";
import { timekeepingApi } from "@/shared/lib/timekeepingApi";
import { feedbackApi } from "@/shared/lib/feedbackApi";
import { useStoreStore } from "@/shared/store/storeStore";
import type { Product } from "@/shared/types/products";
import type { Staff } from "@/shared/types/staff";
import { useDashboardEventsStore } from "@/shared/store/dashboardEventsStore";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/lib/utils";
import { WowDialogInner } from "@/shared/components/ui/wow-dialog-inner";
import { useTranslation } from "react-i18next";

interface NewSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewSaleModal = ({ open, onOpenChange }: NewSaleModalProps) => {
  const { t, i18n } = useTranslation(["dashboard", "common"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { currentStore } = useStoreStore();
  const emitOrderCreated = useDashboardEventsStore(
    (state) => state.emitOrderCreated,
  );

  useEffect(() => {
    if (!open) return;
    setSelectedVariantId("");
    setQuantity("1");
    const loadProducts = async () => {
      try {
        setLoading(true);
        let storeId = currentStore?.id;
        if (!storeId) {
          try {
            const myStore = await storesApi.getMyStore();
            storeId = myStore.id;
          } catch {
            toast.error(t("dashboard:quickModals.newSale.toast.currentStoreError"));
            return;
          }
        }
        const list = await productsApi.getProducts({
          storeId,
          includeInactive: false,
          page: 1,
          pageSize: 200,
        });
        setProducts(list);
        if (list.length > 0) {
          setSelectedProductId(list[0].id);
          setSelectedVariantId("");
        }
      } catch (err) {
        console.error("Failed to load products for quick sale:", err);
        toast.error(t("dashboard:quickModals.newSale.toast.loadProductsError"));
      } finally {
        setLoading(false);
      }
    };
    void loadProducts();
  }, [open, currentStore?.id, t]);

  const filteredProducts = products.filter(
    (p) =>
      p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barCode?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const hasVariants = selectedProduct?.hasVariants && (selectedProduct.variants?.length ?? 0) > 0;

  const handleQuickSale = () => {
    void (async () => {
      if (!selectedProductId) {
        toast.error(t("dashboard:quickModals.newSale.toast.productRequired"));
        return;
      }
      if (hasVariants && !selectedVariantId) {
        toast.error(t("dashboard:quickModals.newSale.toast.variantRequired"));
        return;
      }
      const qty = Number(quantity) || 1;
      if (qty <= 0) {
        toast.error(t("dashboard:quickModals.newSale.toast.quantityInvalid"));
        return;
      }
      try {
        setCreating(true);
        const orderId = await ordersApi.createOrder({
          customerId: undefined,
          paymentMethod: "Cash",
          discountAmount: 0,
          items: [
            {
              productId: selectedProductId,
              quantity: qty,
              productVariantId: hasVariants ? selectedVariantId : undefined,
            },
          ],
        });
        emitOrderCreated(orderId);
        toast.success(t("dashboard:quickModals.newSale.toast.createSuccess"));
        onOpenChange(false);
      } catch (err) {
        console.error("Quick sale failed:", err);
        toast.error(t("dashboard:quickModals.newSale.toast.createError"));
      } finally {
        setCreating(false);
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 gap-0">
        <WowDialogInner>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center shadow-md shadow-[#FF7B21]/20">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              {t("dashboard:quickModals.newSale.title")}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard:quickModals.newSale.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("dashboard:quickModals.newSale.fields.search")}</Label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-[#FF7B21]" />
                <Input
                  placeholder={t("dashboard:quickModals.newSale.placeholders.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-all focus-visible:ring-2 focus-visible:ring-[#FF7B21]/50 focus-visible:border-[#FF7B21]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("dashboard:quickModals.newSale.fields.product")}</Label>
              <Select
                value={selectedProductId}
                onValueChange={(v) => {
                  setSelectedProductId(v);
                  setSelectedVariantId("");
                }}
                disabled={loading || filteredProducts.length === 0}
              >
                <SelectTrigger className={cn(
                  "transition-all",
                  "focus:ring-2 focus:ring-[#FF7B21]/50 focus:border-[#FF7B21]"
                )}>
                  <SelectValue
                    placeholder={
                      loading
                        ? t("dashboard:quickModals.newSale.states.loadingProducts")
                        : filteredProducts.length === 0
                        ? t("dashboard:quickModals.newSale.states.noProducts")
                        : t("dashboard:quickModals.newSale.placeholders.product")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.productName}{" "}
                      {p.hasVariants && t("dashboard:quickModals.newSale.badges.hasVariants")}
                      {typeof p.price === "number"
                        ? `- ${p.price.toLocaleString(i18n.language)}₫`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasVariants && selectedProduct?.variants && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("dashboard:quickModals.newSale.fields.variant")}</Label>
                <Select
                  value={selectedVariantId}
                  onValueChange={setSelectedVariantId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("dashboard:quickModals.newSale.placeholders.variant")} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct.variants.map((v) => (
                      <SelectItem key={v.id} value={v.id!}>
                        {[v.size, v.color, v.sku].filter(Boolean).join(" • ")} - {t("dashboard:quickModals.newSale.variantStock", { stock: v.stockQuantity ?? 0 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("dashboard:quickModals.newSale.fields.quantity")}</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="transition-all focus-visible:ring-2 focus-visible:ring-[#FF7B21]/50 focus-visible:border-[#FF7B21]"
              />
            </div>

            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-br from-[#FF7B21]/5 to-[#19D6C8]/5 dark:from-[#FF7B21]/10 dark:to-[#19D6C8]/10 rounded-xl border border-[#FF7B21]/20 dark:border-[#FF7B21]/30"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("dashboard:quickModals.newSale.summary.price")}:</span>
                  <span className="font-medium">
                    {selectedProduct.price.toLocaleString(i18n.language)}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">{t("dashboard:quickModals.newSale.summary.total")}:</span>
                  <span className="font-bold text-lg bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
                    {(selectedProduct.price * (Number(quantity) || 1)).toLocaleString(i18n.language)}đ
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
              className="transition-all hover:bg-muted/80"
            >
              {t("common:actions.cancel")}
            </Button>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                className="w-full bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF7B21]/90 hover:to-[#19D6C8]/90 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 border-0 transition-all"
                onClick={handleQuickSale}
                disabled={creating || !selectedProductId || (hasVariants && !selectedVariantId)}
              >
                {creating ? (
                  <>
                    <Search className="mr-2 h-4 w-4 animate-spin" />
                    {t("dashboard:quickModals.newSale.actions.creating")}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {t("dashboard:quickModals.newSale.actions.submit")}
                  </>
                )}
              </Button>
            </motion.div>
          </DialogFooter>
        </WowDialogInner>
      </DialogContent>
    </Dialog>
  );
};

interface StaffCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StaffCheckInModal = ({ open, onOpenChange }: StaffCheckInModalProps) => {
  const { t, i18n } = useTranslation(["dashboard", "common"]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffId, setStaffId] = useState("");
  const [action, setAction] = useState<"in" | "out">("in");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { currentStore } = useStoreStore();

  useEffect(() => {
    if (!open) return;
    setStaffId("");
    setAction("in");
    const loadStaff = async () => {
      try {
        setLoading(true);
        let storeId = currentStore?.id;
        if (!storeId) {
          try {
            const myStore = await storesApi.getMyStore();
            storeId = myStore.id;
          } catch {
            toast.error(t("dashboard:quickModals.staffCheckIn.toast.currentStoreError"));
            return;
          }
        }
        const list = await timekeepingApi.getStaffInStore(storeId);
        setStaffList(list);
      } catch (err) {
        console.error("Failed to load staff:", err);
        toast.error(t("dashboard:quickModals.staffCheckIn.toast.loadStaffError"));
      } finally {
        setLoading(false);
      }
    };
    void loadStaff();
  }, [open, currentStore?.id, t]);

  const handleCheckIn = () => {
    void (async () => {
      if (!staffId) {
        toast.error(t("dashboard:quickModals.staffCheckIn.toast.staffRequired"));
        return;
      }
      try {
        setSubmitting(true);
        await timekeepingApi.checkIn({ locationGps: "" });
        toast.success(
          t("dashboard:quickModals.staffCheckIn.toast.success", {
            action: action === "in"
              ? t("dashboard:quickModals.staffCheckIn.actions.checkIn")
              : t("dashboard:quickModals.staffCheckIn.actions.checkOut"),
            time: new Date().toLocaleTimeString(i18n.language),
          }),
        );
        onOpenChange(false);
      } catch (err) {
        console.error("Check-in failed:", err);
        toast.error(t("dashboard:quickModals.staffCheckIn.toast.error"));
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] overflow-hidden p-0 gap-0">
        <WowDialogInner>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center shadow-md shadow-[#FF7B21]/20">
                <Users className="h-4 w-4 text-white" />
              </div>
              {t("dashboard:quickModals.staffCheckIn.title")}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard:quickModals.staffCheckIn.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("dashboard:quickModals.staffCheckIn.fields.staff")}</Label>
              <Select value={staffId} onValueChange={setStaffId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={loading
                      ? t("common:states.loading")
                      : t("dashboard:quickModals.staffCheckIn.placeholders.staff")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name || s.email || s.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("dashboard:quickModals.staffCheckIn.fields.action")}</Label>
              <Select
                value={action}
                onValueChange={(val) => setAction(val as "in" | "out")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">{t("dashboard:quickModals.staffCheckIn.actionOptions.in")}</SelectItem>
                  <SelectItem value="out">{t("dashboard:quickModals.staffCheckIn.actionOptions.out")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-br from-[#FF7B21]/5 to-[#19D6C8]/5 dark:from-[#FF7B21]/10 dark:to-[#19D6C8]/10 rounded-xl border border-[#FF7B21]/20 dark:border-[#FF7B21]/30"
            >
              <p className="text-sm text-foreground">
                {t("dashboard:quickModals.staffCheckIn.currentTime")}:{" "}
                <span className="font-bold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
                  {new Date().toLocaleString(i18n.language)}
                </span>
              </p>
            </motion.div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="transition-all hover:bg-muted/80"
            >
              {t("common:actions.cancel")}
            </Button>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF7B21]/90 hover:to-[#19D6C8]/90 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 border-0 transition-all"
                onClick={handleCheckIn}
                disabled={submitting || !staffId}
              >
                {submitting ? (
                  <>
                    <Search className="mr-2 h-4 w-4 animate-spin" />
                    {t("common:states.saving")}
                  </>
                ) : (
                  t("common:actions.confirm")
                )}
              </Button>
            </motion.div>
          </DialogFooter>
        </WowDialogInner>
      </DialogContent>
    </Dialog>
  );
};

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FeedbackModal = ({ open, onOpenChange }: FeedbackModalProps) => {
  const { t } = useTranslation(["dashboard", "common"]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitFeedback = () => {
    void (async () => {
      if (!content.trim()) {
        toast.error(t("dashboard:quickModals.feedback.toast.contentRequired"));
        return;
      }
      try {
        setSubmitting(true);
        await feedbackApi.createStaffFeedback({ customerId: "", content, rating });
        toast.success(t("dashboard:quickModals.feedback.toast.success"));
        setContent("");
        setRating(5);
        onOpenChange(false);
      } catch (err) {
        console.error("Submit feedback failed:", err);
        toast.error(t("dashboard:quickModals.feedback.toast.error"));
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 gap-0">
        <WowDialogInner>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center shadow-md shadow-[#FF7B21]/20">
                <FileText className="h-4 w-4 text-white" />
              </div>
              {t("dashboard:quickModals.feedback.title")}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard:quickModals.feedback.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("dashboard:quickModals.feedback.fields.rating")}</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "text-2xl transition-all duration-200",
                      star <= rating
                        ? "text-transparent bg-gradient-to-br from-amber-400 to-orange-500 bg-clip-text drop-shadow-md"
                        : "text-muted hover:text-amber-400"
                    )}
                  >
                    ★
                  </motion.button>
                ))}
                <span className="text-sm text-muted-foreground ml-2 font-medium">
                  {t("dashboard:quickModals.feedback.ratingSummary", { rating })}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("dashboard:quickModals.feedback.fields.content")}</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("dashboard:quickModals.feedback.placeholders.content")}
                rows={5}
                className="resize-none transition-all focus-visible:ring-2 focus-visible:ring-[#FF7B21]/50 focus-visible:border-[#FF7B21] bg-gradient-to-br from-white to-[#FF7B21]/5 dark:from-gray-900 dark:to-[#FF7B21]/10"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="transition-all hover:bg-muted/80"
            >
              {t("common:actions.cancel")}
            </Button>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF7B21]/90 hover:to-[#19D6C8]/90 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 border-0 transition-all"
                onClick={handleSubmitFeedback}
                disabled={submitting || !content.trim()}
              >
                {submitting ? (
                  <>
                    <Search className="mr-2 h-4 w-4 animate-spin" />
                    {t("dashboard:quickModals.feedback.actions.submitting")}
                  </>
                ) : (
                  t("dashboard:quickModals.feedback.actions.submit")
                )}
              </Button>
            </motion.div>
          </DialogFooter>
        </WowDialogInner>
      </DialogContent>
    </Dialog>
  );
};

interface GenerateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GenerateReportModal = ({
  open,
  onOpenChange,
}: GenerateReportModalProps) => {
  const { t } = useTranslation(["dashboard", "common"]);
  const [reportType, setReportType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [format, setFormat] = useState("pdf");

  const handleGenerate = () => {
    if (!reportType || !dateFrom || !dateTo) {
      toast.error(t("dashboard:quickModals.report.toast.required"));
      return;
    }

    console.log("Generate report:", { reportType, dateFrom, dateTo, format });
    toast.success(t("dashboard:quickModals.report.toast.generating"));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 gap-0">
        <WowDialogInner>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center shadow-md shadow-[#FF7B21]/20">
                <FileText className="h-4 w-4 text-white" />
              </div>
              {t("dashboard:quickModals.report.title")}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard:quickModals.report.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("dashboard:quickModals.report.fields.type")}</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder={t("dashboard:quickModals.report.placeholders.type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">{t("dashboard:quickModals.report.types.sales")}</SelectItem>
                  <SelectItem value="inventory">{t("dashboard:quickModals.report.types.inventory")}</SelectItem>
                  <SelectItem value="staff">{t("dashboard:quickModals.report.types.staff")}</SelectItem>
                  <SelectItem value="customer">{t("dashboard:quickModals.report.types.customer")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("dashboard:quickModals.report.fields.from")}</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="transition-all focus-visible:ring-2 focus-visible:ring-[#FF7B21]/50 focus-visible:border-[#FF7B21]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("dashboard:quickModals.report.fields.to")}</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="transition-all focus-visible:ring-2 focus-visible:ring-[#FF7B21]/50 focus-visible:border-[#FF7B21]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("dashboard:quickModals.report.fields.format")}</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="transition-all hover:bg-muted/80"
            >
              {t("common:actions.cancel")}
            </Button>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF7B21]/90 hover:to-[#19D6C8]/90 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 border-0 transition-all"
                onClick={handleGenerate}
              >
                <FileText className="mr-2 h-4 w-4" />
                {t("dashboard:quickModals.report.actions.submit")}
              </Button>
            </motion.div>
          </DialogFooter>
        </WowDialogInner>
      </DialogContent>
    </Dialog>
  );
};
