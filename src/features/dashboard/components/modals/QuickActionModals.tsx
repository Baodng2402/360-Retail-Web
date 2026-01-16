import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShoppingCart, Users, FileText } from "lucide-react";

// New Sale Modal
interface NewSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewSaleModal = ({ open, onOpenChange }: NewSaleModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");

  const handleQuickSale = () => {
    if (!selectedProduct) {
      alert("Vui lòng chọn sản phẩm");
      return;
    }

    console.log("Quick sale:", { product: selectedProduct, quantity });
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-teal-600" />
            New Sale / Tạo đơn mới
          </DialogTitle>
          <DialogDescription>
            Tìm kiếm và thêm sản phẩm vào giỏ hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Search Product / Tìm sản phẩm</Label>
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
            <Label>Product / Sản phẩm</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ao-thun">
                  👕 Áo thun nam cổ tròn - 250,000₫
                </SelectItem>
                <SelectItem value="quan-jean">
                  👖 Quần jean nam slim fit - 450,000₫
                </SelectItem>
                <SelectItem value="giay-sneaker">
                  👟 Giày sneaker trắng - 680,000₫
                </SelectItem>
                <SelectItem value="ao-khoac">
                  🧥 Áo khoác hoodie - 550,000₫
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantity / Số lượng</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
            onClick={handleQuickSale}
          >
            Add to Cart / Thêm vào giỏ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Staff Check-in Modal
interface StaffCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StaffCheckInModal = ({
  open,
  onOpenChange,
}: StaffCheckInModalProps) => {
  const [staffId, setStaffId] = useState("");
  const [action, setAction] = useState<"in" | "out">("in");

  const handleCheckIn = () => {
    if (!staffId) {
      alert("Vui lòng chọn nhân viên");
      return;
    }

    const time = new Date().toLocaleTimeString("vi-VN");
    console.log("Staff check-in:", { staffId, action, time });
    alert(
      `Đã ${action === "in" ? "check-in" : "check-out"} thành công lúc ${time}!`
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Staff Check-in / Chấm công
          </DialogTitle>
          <DialogDescription>
            Chấm công đầu giờ hoặc kết thúc ca làm việc
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Staff / Nhân viên</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff1">
                  Trần Thị B - Nhân viên bán hàng
                </SelectItem>
                <SelectItem value="staff2">Phạm Văn D - Thu ngân</SelectItem>
                <SelectItem value="staff3">Nguyễn Văn G - Quản kho</SelectItem>
                <SelectItem value="staff4">
                  Lê Thị H - Nhân viên bán hàng
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Action / Hành động</Label>
            <Select
              value={action}
              onValueChange={(val) => setAction(val as "in" | "out")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">✅ Check In / Vào ca</SelectItem>
                <SelectItem value="out">🏁 Check Out / Kết thúc ca</SelectItem>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
            onClick={handleCheckIn}
          >
            Confirm / Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Generate Report Modal
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
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    console.log("Generate report:", { reportType, dateFrom, dateTo, format });
    alert("Đang tạo báo cáo... Bạn sẽ nhận được file qua email!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Generate Report / Tạo báo cáo
          </DialogTitle>
          <DialogDescription>
            Chọn loại báo cáo và khoảng thời gian
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Report Type / Loại báo cáo</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại báo cáo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">
                  📊 Sales Report / Báo cáo doanh số
                </SelectItem>
                <SelectItem value="inventory">
                  📦 Inventory Report / Báo cáo tồn kho
                </SelectItem>
                <SelectItem value="staff">
                  👥 Staff Performance / Hiệu suất nhân viên
                </SelectItem>
                <SelectItem value="customer">
                  👤 Customer Report / Báo cáo khách hàng
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Date / Từ ngày</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date / Đến ngày</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Export Format / Định dạng xuất</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">📄 PDF</SelectItem>
                <SelectItem value="excel">📊 Excel</SelectItem>
                <SelectItem value="csv">📋 CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
            onClick={handleGenerate}
          >
            Generate / Tạo báo cáo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
