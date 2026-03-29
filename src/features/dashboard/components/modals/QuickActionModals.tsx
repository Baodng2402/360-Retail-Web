import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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

interface NewSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewSaleModal = ({ open, onOpenChange }: NewSaleModalProps) => {
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
            toast.error("Không thể lấy thông tin cửa hàng hiện tại.");
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
        toast.error("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    void loadProducts();
  }, [open, currentStore?.id]);

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
        toast.error("Vui lòng chọn sản phẩm");
        return;
      }
      if (hasVariants && !selectedVariantId) {
        toast.error("Vui lòng chọn biến thể cụ thể");
        return;
      }
      const qty = Number(quantity) || 1;
      if (qty <= 0) {
        toast.error("Số lượng phải lớn hơn 0");
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
        toast.success("Đã tạo đơn hàng nhanh thành công!");
        onOpenChange(false);
      } catch (err) {
        console.error("Quick sale failed:", err);
        toast.error("Không thể tạo đơn hàng nhanh. Vui lòng thử lại.");
      } finally {
        setCreating(false);
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-teal-600" />
            Tạo đơn hàng nhanh
          </DialogTitle>
          <DialogDescription>
            Tìm kiếm và chọn sản phẩm để tạo đơn hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tìm sản phẩm</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên hoặc mã sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sản phẩm</Label>
            <Select
              value={selectedProductId}
              onValueChange={(v) => {
                setSelectedProductId(v);
                setSelectedVariantId("");
              }}
              disabled={loading || filteredProducts.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loading
                      ? "Đang tải sản phẩm..."
                      : filteredProducts.length === 0
                      ? "Không có sản phẩm"
                      : "Chọn sản phẩm"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.productName}{" "}
                    {p.hasVariants && "(có biến thể)"}
                    {typeof p.price === "number" ? `- ${p.price.toLocaleString("vi-VN")}₫` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Variant selection for products with variants */}
          {hasVariants && selectedProduct?.variants && (
            <div className="space-y-2">
              <Label>Biến thể (Size/Màu)</Label>
              <Select
                value={selectedVariantId}
                onValueChange={setSelectedVariantId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn biến thể" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct.variants.map((v) => (
                    <SelectItem key={v.id} value={v.id!}>
                      {[v.size, v.color, v.sku].filter(Boolean).join(" • ")} - Tồn: {v.stockQuantity ?? 0}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Số lượng</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Show total */}
          {selectedProduct && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Giá bán:</span>
                <span className="font-medium">
                  {selectedProduct.price.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Tổng tiền:</span>
                <span className="font-bold text-teal-600">
                  {(selectedProduct.price * (Number(quantity) || 1)).toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
            Hủy
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            onClick={handleQuickSale}
            disabled={creating || !selectedProductId || (hasVariants && !selectedVariantId)}
          >
            {creating ? "Đang tạo..." : "Tạo đơn hàng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface StaffCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StaffCheckInModal = ({ open, onOpenChange }: StaffCheckInModalProps) => {
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
            toast.error("Không thể lấy thông tin cửa hàng.");
            return;
          }
        }
        const list = await timekeepingApi.getStaffInStore(storeId);
        setStaffList(list);
      } catch (err) {
        console.error("Failed to load staff:", err);
        toast.error("Không thể tải danh sách nhân viên.");
      } finally {
        setLoading(false);
      }
    };
    void loadStaff();
  }, [open, currentStore?.id]);

  const handleCheckIn = () => {
    void (async () => {
      if (!staffId) {
        toast.error("Vui lòng chọn nhân viên");
        return;
      }
      try {
        setSubmitting(true);
        await timekeepingApi.checkIn({ locationGps: "" });
        toast.success(
          `Đã ${action === "in" ? "check-in" : "check-out"} thành công lúc ${new Date().toLocaleTimeString("vi-VN")}!`,
        );
        onOpenChange(false);
      } catch (err) {
        console.error("Check-in failed:", err);
        toast.error("Không thể chấm công. Vui lòng thử lại.");
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Chấm công nhân viên
          </DialogTitle>
          <DialogDescription>
            Chấm công đầu giờ hoặc kết thúc ca làm việc
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nhân viên</Label>
            <Select value={staffId} onValueChange={setStaffId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Đang tải..." : "Chọn nhân viên"} />
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
            <Label>Hành động</Label>
            <Select
              value={action}
              onValueChange={(val) => setAction(val as "in" | "out")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Check In / Vào ca</SelectItem>
                <SelectItem value="out">Check Out / Kết thúc ca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-sm text-teal-900">
              Thời gian hiện tại:{" "}
              <span className="font-bold">
                {new Date().toLocaleString("vi-VN")}
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            onClick={handleCheckIn}
            disabled={submitting || !staffId}
          >
            {submitting ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FeedbackModal = ({ open, onOpenChange }: FeedbackModalProps) => {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitFeedback = () => {
    void (async () => {
      if (!content.trim()) {
        toast.error("Vui lòng nhập nội dung phản hồi");
        return;
      }
      try {
        setSubmitting(true);
        await feedbackApi.createStaffFeedback({ customerId: "", content, rating });
        toast.success("Gửi phản hồi thành công!");
        setContent("");
        setRating(5);
        onOpenChange(false);
      } catch (err) {
        console.error("Submit feedback failed:", err);
        toast.error("Không thể gửi phản hồi. Vui lòng thử lại.");
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Gửi phản hồi
          </DialogTitle>
          <DialogDescription>
            Chia sẻ ý kiến của bạn để chúng tôi cải thiện dịch vụ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Đánh giá</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= rating ? "text-amber-400" : "text-muted"
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                {rating}/5 sao
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nội dung phản hồi</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung phản hồi của bạn..."
              rows={5}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            onClick={handleSubmitFeedback}
            disabled={submitting || !content.trim()}
          >
            {submitting ? "Đang gửi..." : "Gửi phản hồi"}
          </Button>
        </DialogFooter>
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
  const [reportType, setReportType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [format, setFormat] = useState("pdf");

  const handleGenerate = () => {
    if (!reportType || !dateFrom || !dateTo) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    console.log("Generate report:", { reportType, dateFrom, dateTo, format });
    toast.success("Đang tạo báo cáo... Bạn sẽ nhận được file qua email!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Tạo báo cáo
          </DialogTitle>
          <DialogDescription>
            Chọn loại báo cáo và khoảng thời gian
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Loại báo cáo</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại báo cáo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Báo cáo doanh số</SelectItem>
                <SelectItem value="inventory">Báo cáo tồn kho</SelectItem>
                <SelectItem value="staff">Hiệu suất nhân viên</SelectItem>
                <SelectItem value="customer">Báo cáo khách hàng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Định dạng xuất</Label>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            onClick={handleGenerate}
          >
            Tạo báo cáo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
