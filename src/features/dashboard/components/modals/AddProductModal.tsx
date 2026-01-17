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

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddProductModal = ({ open, onOpenChange }: AddProductModalProps) => {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState("📦");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!productName || !category || !price || !stock) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      console.log("Product added:", {
        name: productName,
        category,
        price: parseInt(price),
        stock: parseInt(stock),
        barcode: barcode || generateBarcode(),
        image,
      });

      alert(`Đã thêm sản phẩm "${productName}" thành công!`);

      setIsSubmitting(false);
      resetForm();
      onOpenChange(false);
    }, 1000);
  };

  const resetForm = () => {
    setProductName("");
    setCategory("");
    setPrice("");
    setStock("");
    setBarcode("");
    setImage("📦");
  };

  const generateBarcode = () => {
    return (
      "8934567" +
      Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")
    );
  };

  const emojiOptions = [
    "👕",
    "👖",
    "👟",
    "🧥",
    "👜",
    "⌚",
    "🧢",
    "🕶️",
    "👗",
    "👠",
    "🎒",
    "📦",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Product / Thêm sản phẩm mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin sản phẩm để thêm vào kho
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="productName">
              Product Name / Tên sản phẩm{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productName"
              placeholder="Ví dụ: Áo thun nam cổ tròn..."
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Category / Danh mục <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apparel">👕 Apparel / Quần áo</SelectItem>
                  <SelectItem value="Footwear">
                    👟 Footwear / Giày dép
                  </SelectItem>
                  <SelectItem value="Accessories">
                    👜 Accessories / Phụ kiện
                  </SelectItem>
                  <SelectItem value="Others">📦 Others / Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Icon / Biểu tượng</Label>
              <Select value={image} onValueChange={setImage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emojiOptions.map((emoji) => (
                    <SelectItem key={emoji} value={emoji}>
                      <span className="text-2xl">{emoji}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Price / Giá bán (₫) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="250000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">
                Stock / Tồn kho <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                placeholder="50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">
              Barcode / Mã vạch
              <span className="text-xs text-muted-foreground ml-2">
                (Để trống để tự động tạo)
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                placeholder="8934567890123"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setBarcode(generateBarcode())}
              >
                Generate
              </Button>
            </div>
          </div>

          {productName && (
            <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
              <p className="text-sm font-medium text-teal-900 mb-2">Preview:</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{image}</span>
                <div>
                  <p className="font-semibold">{productName}</p>
                  <p className="text-sm text-muted-foreground">{category}</p>
                  <p className="text-sm font-bold text-teal-600">
                    {price ? parseInt(price).toLocaleString("vi-VN") : "0"} ₫
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel / Hủy
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang thêm..." : "Add Product / Thêm sản phẩm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
