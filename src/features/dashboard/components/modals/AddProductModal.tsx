import { useState, useEffect } from "react";
import { motion } from "motion/react";
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
import { categoriesApi } from "@/shared/lib/categoriesApi";
import { productsApi } from "@/shared/lib/productsApi";
import type { Category } from "@/shared/types/categories";
import { Loader2, Package } from "lucide-react";
import { WowDialogInner } from "@/shared/components/ui/wow-dialog-inner";
import { useTranslation } from "react-i18next";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Store ID to load categories and create product in context of this store */
  storeId?: string | null;
  /** Called after product is created successfully (e.g. refetch product list) */
  onSuccess?: () => void;
}

const AddProductModal = ({
  open,
  onOpenChange,
  storeId,
  onSuccess,
}: AddProductModalProps) => {
  const { t, i18n } = useTranslation(["product", "common"]);
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState("📦");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    if (!open || !storeId) {
      setCategories([]);
      setCategoryId("");
      return;
    }
    let cancelled = false;
    setCategoriesLoading(true);
    categoriesApi
      .getCategories(storeId, true)
      .then((data) => {
        if (!cancelled) {
          setCategories(data);
          setCategoryId(data.length > 0 ? data[0].id : "");
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error(t("product:addModal.toast.loadCategoriesError"));
          setCategories([]);
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, storeId]);

  const handleSubmit = async () => {
    if (!productName?.trim()) {
      toast.error(t("product:addModal.toast.productNameRequired"));
      return;
    }
    if (!categoryId) {
      toast.error(t("product:addModal.toast.categoryRequired"));
      return;
    }
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      toast.error(t("product:addModal.toast.priceInvalid"));
      return;
    }
    const stockNum = parseInt(stock, 10);
    if (!stock || isNaN(stockNum) || stockNum < 0) {
      toast.error(t("product:addModal.toast.stockInvalid"));
      return;
    }

    setIsSubmitting(true);
    try {
      await productsApi.createProduct({
        productName: productName.trim(),
        categoryId,
        price: priceNum,
        stockQuantity: stockNum,
        barCode: barcode.trim() || undefined,
      });
      toast.success(t("product:addModal.toast.success", { name: productName.trim() }));
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t("product:addModal.toast.defaultError");
      const isCategoryError =
        /danh mục|category|không thuộc cửa hàng|chưa có danh mục/i.test(msg);
      toast.error(
        isCategoryError
          ? t("product:addModal.toast.needCategoryFirst")
          : msg,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProductName("");
    setCategoryId(categories.length > 0 ? categories[0].id : "");
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

  const categoryName =
    categories.find((c) => c.id === categoryId)?.categoryName ?? categoryId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-hidden p-0 gap-0">
        <WowDialogInner>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center text-white shadow-lg shadow-[#FF7B21]/30">
              <Package className="h-4 w-4" />
            </div>
            {t("product:addModal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("product:addModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="productName">
              {t("product:addModal.fields.productName")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productName"
              placeholder={t("product:addModal.placeholders.productName")}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="bg-background/80 backdrop-blur-sm"
            />
          </div>

          <div className="grid grid-cols-[minmax(0,1.6fr)_auto] gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="category">
                {t("product:addModal.fields.category")} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={categoriesLoading}
              >
                <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                  <SelectValue
                    placeholder={
                      categoriesLoading
                        ? t("common:states.loading")
                        : categories.length === 0
                          ? t("product:addModal.states.noCategories")
                          : t("product:addModal.placeholders.category")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">{t("product:addModal.fields.icon")}</Label>
              <Select value={image} onValueChange={setImage}>
                <SelectTrigger className="w-16 justify-center">
                  <SelectValue
                    placeholder="📦"
                    className="flex items-center justify-center"
                  />
                </SelectTrigger>
                <SelectContent align="end" className="w-32">
                  {emojiOptions.map((emoji) => (
                    <SelectItem key={emoji} value={emoji}>
                      <span className="text-2xl flex items-center justify-center">
                        {emoji}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                {t("product:addModal.fields.price")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="250000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-background/80 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">
                {t("product:addModal.fields.stock")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                placeholder="50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="bg-background/80 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">
              {t("product:addModal.fields.barcode")}
              <span className="text-xs text-muted-foreground ml-2">
                ({t("product:addModal.hints.barcodeOptional")})
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                placeholder="8934567890123"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="flex-1 bg-background/80 backdrop-blur-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setBarcode(generateBarcode())}
                className="hover:bg-[#FF7B21]/10 hover:text-[#FF7B21] transition-colors"
              >
                {t("product:addModal.actions.generateBarcode")}
              </Button>
            </div>
          </div>

          {productName && (
            <motion.div
              className="p-4 bg-gradient-to-r from-[#FF7B21]/5 to-[#19D6C8]/5 rounded-xl border"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm font-medium text-foreground mb-2">{t("product:addModal.preview.title")}:</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{image}</span>
                <div>
                  <p className="font-semibold">{productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {categoryName}
                  </p>
                  <p className="text-sm font-bold text-[#FF7B21]">
                    {price
                      ? parseInt(price, 10).toLocaleString(i18n.language)
                      : "0"}{" "}
                    ₫
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("common:actions.cancel")}
          </Button>
          <Button
            className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300"
            onClick={() => void handleSubmit()}
            disabled={
              isSubmitting ||
              !storeId ||
              categories.length === 0 ||
              !categoryId
            }
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? t("product:addModal.actions.submitting") : t("product:addModal.actions.submit")}
          </Button>
        </DialogFooter>
        </WowDialogInner>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
