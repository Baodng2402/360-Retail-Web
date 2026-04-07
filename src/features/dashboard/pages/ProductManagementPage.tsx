import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
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
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Search,
  Plus,
  Edit,
  Package,
  Tag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  FolderTree,
  Loader2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { categoriesApi } from "@/shared/lib/categoriesApi";
import { productsApi } from "@/shared/lib/productsApi";
import { useStoreStore } from "@/shared/store/storeStore";
import type { Category } from "@/shared/types/categories";
import type { Product, ProductVariant } from "@/shared/types/products";
import StoreSelector from "@/features/dashboard/components/StoreSelector";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

interface ExtendedCategory extends Category {
  color?: string;
  productCount?: number;
}

interface ExtendedProduct extends Product {
  status?: "in-stock" | "low-stock" | "out-of-stock";
}

type VariantForm = {
  sku: string;
  size: string;
  color: string;
  priceOverride: string;
  stockQuantity: string;
};

type ProductFormState = {
  productName: string;
  categoryId: string;
  price: string;
  costPrice: string;
  stockQuantity: string;
  barCode: string;
  description: string;
  imageFile: File | null;
  hasVariants: boolean;
  variants: VariantForm[];
  isActive: boolean;
};

const CATEGORY_COLOR_STORAGE_KEY = "360retail-category-color-";

const getStoredCategoryColor = (categoryId: string): string | null => {
  try {
    return localStorage.getItem(CATEGORY_COLOR_STORAGE_KEY + categoryId);
  } catch {
    return null;
  }
};

const setStoredCategoryColor = (categoryId: string, color: string): void => {
  try {
    localStorage.setItem(CATEGORY_COLOR_STORAGE_KEY + categoryId, color);
  } catch {
    // ignore
  }
};

const generateCategoryColor = (_categoryName: string, index: number): string => {
  const colorPalette = [
    "hsl(210, 100%, 50%)",
    "hsl(142, 71%, 45%)",
    "hsl(45, 96%, 53%)",
    "hsl(199, 89%, 48%)",
    "hsl(0, 84%, 60%)",
    "hsl(262, 52%, 47%)",
    "hsl(25, 95%, 53%)",
    "hsl(158, 64%, 52%)",
    "hsl(340, 82%, 52%)",
    "hsl(217, 91%, 60%)",
  ];

  return colorPalette[index % colorPalette.length];
};

// Helper function to add opacity to any color format
const addOpacityToColor = (color: string | undefined, opacity: number): string => {
  if (!color) return "transparent";
  
  // Handle HSL format: hsl(h, s%, l%)
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
  if (hslMatch) {
    const h = hslMatch[1];
    const s = hslMatch[2];
    const l = hslMatch[3];
    return `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
  }
  
  // Handle RGB format: rgb(r, g, b)
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const r = rgbMatch[1];
    const g = rgbMatch[2];
    const b = rgbMatch[3];
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Handle Hex format: #RRGGBB
  const hexMatch = color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
  if (hexMatch) {
    let hex = color.replace("#", "");
    if (hex.length === 3) {
      hex = hex.split("").map(c => c + c).join("");
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Return original color if format not recognized
  return color;
};

export default function ProductManagementPage() {
  const { t, i18n } = useTranslation(["product", "common"]);
  const { currentStore } = useStoreStore();
  const storeId = currentStore?.id;
  const navigate = useNavigate();

  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedActiveStatus, setSelectedActiveStatus] =
    useState<string>("active");
  const [selectedCategoryActiveStatus, setSelectedCategoryActiveStatus] =
    useState<string>("active");
  const [togglingProductIds, setTogglingProductIds] = useState<Set<string>>(
    new Set(),
  );
  const [togglingCategoryIds, setTogglingCategoryIds] = useState<Set<string>>(
    new Set(),
  );

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ExtendedProduct | null>(
    null,
  );
  const emptyVariant: VariantForm = {
    sku: "",
    size: "",
    color: "",
    priceOverride: "",
    stockQuantity: "",
  };

  const [productForm, setProductForm] = useState<ProductFormState>({
    productName: "",
    categoryId: "",
    price: "",
    costPrice: "",
    stockQuantity: "",
    barCode: "",
    description: "",
    imageFile: null,
    hasVariants: false,
    variants: [],
    isActive: true,
  });
  const [productFormLoading, setProductFormLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ExtendedCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
    description: "",
    color: generateCategoryColor("", 0),
    parentId: "",
    isActive: true,
  });
  const [categoryFormLoading, setCategoryFormLoading] = useState(false);

  const [barCodeViewDialogOpen, setBarCodeViewDialogOpen] = useState(false);
  const [barCodeToView, setBarCodeToView] = useState<string>("");

  const [toggleProductDialogOpen, setToggleProductDialogOpen] = useState(false);
  const [productToToggle, setProductToToggle] =
    useState<ExtendedProduct | null>(null);
  const [toggleCategoryDialogOpen, setToggleCategoryDialogOpen] =
    useState(false);
  const [categoryToToggle, setCategoryToToggle] =
    useState<ExtendedCategory | null>(null);

  const ensureAtLeastOneVariant = (variants: VariantForm[]) =>
    variants.length > 0 ? variants : [emptyVariant];

  const toggleVariants = (checked: boolean) => {
    setProductForm((prev) => ({
      ...prev,
      hasVariants: checked,
      stockQuantity: checked ? "0" : prev.stockQuantity,
      variants: checked ? ensureAtLeastOneVariant(prev.variants) : [],
    }));
  };

  const updateVariantField = (
    index: number,
    field: keyof VariantForm,
    value: string,
  ) => {
    setProductForm((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });
  };

  const addVariantRow = () => {
    setProductForm((prev) => ({
      ...prev,
      variants: [...prev.variants, emptyVariant],
    }));
  };

  const removeVariantRow = (index: number) => {
    setProductForm((prev) => {
      const variants = prev.variants.filter((_, i) => i !== index);
      return {
        ...prev,
        variants: ensureAtLeastOneVariant(variants),
      };
    });
  };

  useEffect(() => {
    if (storeId) {
      loadCategories();
      loadProducts();
    } else {
      setProducts([]);
      setCategories([]);
    }
  }, [storeId, selectedCategoryActiveStatus, selectedActiveStatus]);

  const loadCategories = async () => {
    if (!storeId) {
      setCategories([]);
      return;
    }
    try {
      setCategoriesLoading(true);
      const includeInactive = selectedCategoryActiveStatus !== "active";
      const data = await categoriesApi.getCategories(storeId, includeInactive);
      const categoriesWithColors = data.map((cat, index) => ({
        ...cat,
        color:
          getStoredCategoryColor(cat.id) ||
          generateCategoryColor(cat.categoryName, index),
        productCount: 0,
        isActive: cat.isActive ?? true,
      }));

      let filteredCategoriesWithColors = categoriesWithColors;
      if (selectedCategoryActiveStatus === "active") {
        filteredCategoriesWithColors = categoriesWithColors.filter(
          (cat) => cat.isActive !== false,
        );
      } else if (selectedCategoryActiveStatus === "inactive") {
        filteredCategoriesWithColors = categoriesWithColors.filter(
          (cat) => cat.isActive === false,
        );
      }

      setCategories(filteredCategoriesWithColors);
    } catch (error) {
      const err = error as {
        response?: { status?: number; data?: { message?: string; code?: string } };
        message?: string;
      };
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "";
      const isStoreError =
        status === 400 ||
        /store|store_id|cửa hàng|StoreIdRequired/i.test(msg);
      if (isStoreError) {
        toast.error(
          t("product:errors.storeRequired"),
        );
      } else {
        toast.error(t("product:errors.loadCategoriesFailed"));
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!storeId) return;
    try {
      setLoading(true);
      const includeInactive = selectedActiveStatus !== "active";
      const data = await productsApi.getProducts({ storeId, includeInactive });

      const productsWithStatus: ExtendedProduct[] = data.map((product) => {
        const hasVariants =
          product.hasVariants ||
          (product.variants && product.variants.length > 0);

        let status: ExtendedProduct["status"] = "in-stock";

        if (product.isInStock !== undefined) {
          if (!product.isInStock) {
            status = "out-of-stock";
          } else if (hasVariants) {
            status = "in-stock";
          } else if (product.stockQuantity > 0 && product.stockQuantity <= 10) {
            status = "low-stock";
          } else {
            status = "in-stock";
          }
        } else {
          if (hasVariants) {
            status = "in-stock";
          } else if (product.stockQuantity === 0) {
            status = "out-of-stock";
          } else if (product.stockQuantity <= 10) {
            status = "low-stock";
          } else {
            status = "in-stock";
          }
        }

        return {
          ...product,
          status,
          isActive:
            product.isActive ??
            (selectedActiveStatus === "active" ? true : false),
        };
      });

      setProducts(productsWithStatus);

      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          productCount: productsWithStatus.filter(
            (p) => p.categoryId === cat.id,
          ).length,
        })),
      );
    } catch (error) {
      const err = error as {
        response?: { status?: number; data?: { message?: string; code?: string } };
        message?: string;
      };
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "";
      const isStoreError =
        status === 400 ||
        /store|store_id|cửa hàng|StoreIdRequired/i.test(msg);
      const isCategoryError =
        /danh mục|category|không thuộc cửa hàng|chưa có danh mục/i.test(msg);
      if (isStoreError) {
        toast.error(
          t("product:errors.storeRequired"),
        );
      } else if (isCategoryError) {
        toast.error(t("product:addModal.toast.needCategoryFirst"));
      } else {
        toast.error(t("product:errors.loadProductsFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      "";

    const matchesCategory =
      selectedCategory === "all" || product.categoryId === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || product.status === selectedStatus;
    const matchesActive =
      selectedActiveStatus === "all" ||
      (selectedActiveStatus === "active" && (product.isActive ?? true)) ||
      (selectedActiveStatus === "inactive" && product.isActive === false);

    return matchesSearch && matchesCategory && matchesStatus && matchesActive;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      productName: "",
      categoryId: categories.length > 0 ? categories[0].id : "",
      price: "",
      costPrice: "",
      stockQuantity: "",
      barCode: "",
      description: "",
      imageFile: null,
      hasVariants: false,
      variants: [],
      isActive: true,
    });
    setImagePreview(null);
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: ExtendedProduct) => {
    setEditingProduct(product);
    const hasVariants =
      product.hasVariants || (product.variants && product.variants.length > 0);
    const variantsForForm: VariantForm[] = hasVariants
      ? (product.variants || []).map((variant) => ({
          sku: variant.sku || "",
          size: variant.size || "",
          color: variant.color || "",
          priceOverride:
            variant.priceOverride !== undefined &&
            variant.priceOverride !== null
              ? variant.priceOverride.toString()
              : "",
          stockQuantity:
            variant.stockQuantity !== undefined &&
            variant.stockQuantity !== null
              ? variant.stockQuantity.toString()
              : "",
        }))
      : [];
    setProductForm({
      productName: product.productName,
      categoryId: product.categoryId,
      price: product.price.toString(),
      costPrice:
        product.costPrice !== undefined && product.costPrice !== null
          ? product.costPrice.toString()
          : "",
      stockQuantity: hasVariants ? "0" : product.stockQuantity.toString(),
      barCode: product.barCode || "",
      description: product.description || "",
      imageFile: null,
      hasVariants: hasVariants ?? false,
      variants: hasVariants ? ensureAtLeastOneVariant(variantsForForm) : [],
      isActive: product.isActive ?? true,
    });
    setImagePreview(product.imageUrl || null);
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!storeId) {
      toast.error(t("product:errors.selectStoreFirst"));
      return;
    }

    if (!productForm.productName.trim()) {
      toast.error(t("product:addModal.toast.productNameRequired"));
      return;
    }

    if (!productForm.categoryId) {
      toast.error(t("product:addModal.toast.categoryRequired"));
      return;
    }

    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      toast.error(t("product:addModal.toast.priceInvalid"));
      return;
    }

    if (!productForm.hasVariants) {
      if (
        productForm.stockQuantity === "" ||
        parseInt(productForm.stockQuantity || "0", 10) < 0
      ) {
        toast.error(t("product:addModal.toast.stockInvalid"));
        return;
      }
    } else {
      if (productForm.variants.length === 0) {
        toast.error(t("product:productForm.toast.variantRequired"));
        return;
      }

      const hasInvalidVariant = productForm.variants.some(
        (variant) =>
          !variant.sku.trim() ||
          variant.stockQuantity === "" ||
          parseInt(variant.stockQuantity || "0", 10) < 0 ||
          (variant.priceOverride !== "" &&
            parseFloat(variant.priceOverride) <= 0),
      );

      if (hasInvalidVariant) {
        toast.error(
          t("product:productForm.toast.variantInvalid"),
        );
        return;
      }
    }

    try {
      setProductFormLoading(true);

      const payloadStockQuantity = productForm.hasVariants
        ? 0
        : parseInt(productForm.stockQuantity || "0", 10);

      const variantsPayload: ProductVariant[] | undefined =
        productForm.hasVariants
          ? productForm.variants.map((variant) => ({
              sku: variant.sku.trim(),
              size: variant.size.trim() || undefined,
              color: variant.color.trim() || undefined,
              priceOverride:
                variant.priceOverride !== ""
                  ? parseFloat(variant.priceOverride)
                  : undefined,
              stockQuantity:
                variant.stockQuantity !== ""
                  ? parseInt(variant.stockQuantity, 10)
                  : 0,
            }))
          : undefined;

      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, {
          id: editingProduct.id,
          productName: productForm.productName,
          categoryId: productForm.categoryId,
          barCode: productForm.barCode || undefined,
          description: productForm.description || undefined,
          price: parseFloat(productForm.price),
          costPrice: productForm.costPrice
            ? parseFloat(productForm.costPrice)
            : undefined,
          stockQuantity: payloadStockQuantity,
          isActive: productForm.isActive,
          imageFile: productForm.imageFile || undefined,
          hasVariants: productForm.hasVariants,
          variantsJson:
            productForm.hasVariants && variantsPayload
              ? JSON.stringify(variantsPayload)
              : undefined,
        });
        toast.success(t("product:toast.updateProductSuccess"));
      } else {
        await productsApi.createProduct({
          productName: productForm.productName,
          categoryId: productForm.categoryId,
          barCode: productForm.barCode || undefined,
          description: productForm.description || undefined,
          price: parseFloat(productForm.price),
          costPrice: productForm.costPrice
            ? parseFloat(productForm.costPrice)
            : undefined,
          stockQuantity: payloadStockQuantity,
          isActive: productForm.isActive,
          imageFile: productForm.imageFile || undefined,
          hasVariants: productForm.hasVariants,
          variants: variantsPayload,
        });
        toast.success(t("product:toast.createProductSuccess"));
      }

      setProductDialogOpen(false);
      setImagePreview(null);
      await loadProducts();
    } catch (error: unknown) {
      console.error("Error saving product:", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (error instanceof Error ? error.message : undefined) ||
        t("common:states.error");
      toast.error(message);
    } finally {
      setProductFormLoading(false);
    }
  };

  const handleToggleProductActive = (product: ExtendedProduct) => {
    setProductToToggle(product);
    setToggleProductDialogOpen(true);
  };

  const confirmToggleProductActive = async () => {
    if (!productToToggle) return;

    const newActiveState = !productToToggle.isActive;

    setTogglingProductIds((prev) => new Set(prev).add(productToToggle.id));
    setToggleProductDialogOpen(false);

    const confirmMessage = newActiveState
      ? t("product:toast.activatingProduct", { name: productToToggle.productName })
      : t("product:toast.deactivatingProduct", { name: productToToggle.productName });

    const loadingToast = toast.loading(confirmMessage);

    try {
      await productsApi.updateProduct(productToToggle.id, {
        id: productToToggle.id,
        productName: productToToggle.productName,
        categoryId: productToToggle.categoryId,
        barCode: productToToggle.barCode || undefined,
        description: productToToggle.description || undefined,
        price: productToToggle.price,
        costPrice: productToToggle.costPrice || undefined,
        stockQuantity: productToToggle.stockQuantity,
        isActive: newActiveState,
      });

      setProducts(
        products.map((p) =>
          p.id === productToToggle.id
            ? {
                ...p,
                isActive: newActiveState,
              }
            : p,
        ),
      );

      toast.dismiss(loadingToast);
      toast.success(
        newActiveState
          ? t("product:toast.productActivated", { name: productToToggle.productName })
          : t("product:toast.productDeactivated", { name: productToToggle.productName }),
      );

      await loadProducts();
    } catch (error: unknown) {
      console.error("Failed to toggle product active state:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (error instanceof Error ? error.message : undefined) ||
        t("product:errors.updateProductStatusFailed");

      toast.dismiss(loadingToast);
      toast.error(errorMessage);
    } finally {
      setTogglingProductIds((prev) => {
        const next = new Set(prev);
        next.delete(productToToggle.id);
        return next;
      });
      setProductToToggle(null);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      categoryName: "",
      description: "",
      color: generateCategoryColor("", categories.length),
      parentId: "",
      isActive: true,
    });
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: ExtendedCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      categoryName: category.categoryName,
      description: "",
      color: category.color || generateCategoryColor(category.categoryName, 0),
      parentId: category.parentId || "",
      isActive: category.isActive,
    });
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!storeId) {
      toast.error(t("product:errors.selectStoreFirst"));
      return;
    }

    if (!categoryForm.categoryName.trim()) {
      toast.error(t("product:categoryForm.toast.nameRequired"));
      return;
    }

    try {
      setCategoryFormLoading(true);

      if (editingCategory) {
        await categoriesApi.updateCategory(editingCategory.id, {
          id: editingCategory.id,
          categoryName: categoryForm.categoryName,
          parentId: categoryForm.parentId || undefined,
          isActive: categoryForm.isActive,
        });
        setStoredCategoryColor(editingCategory.id, categoryForm.color);
        toast.success(t("product:toast.updateCategorySuccess"));
      } else {
        const created = await categoriesApi.createCategory({
          categoryName: categoryForm.categoryName,
          parentId: categoryForm.parentId || undefined,
        });
        setStoredCategoryColor(created.id, categoryForm.color);
        toast.success(t("product:toast.createCategorySuccess"));
      }

      setCategoryDialogOpen(false);
      await loadCategories();
      await loadProducts();
    } catch (error: unknown) {
      console.error("Error saving category:", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (error instanceof Error ? error.message : undefined) ||
        t("common:states.error");
      toast.error(message);
    } finally {
      setCategoryFormLoading(false);
    }
  };

  const handleToggleCategoryActive = (category: ExtendedCategory) => {
    setCategoryToToggle(category);
    setToggleCategoryDialogOpen(true);
  };

  const confirmToggleCategoryActive = async () => {
    if (!categoryToToggle) return;

    const newActiveState = !categoryToToggle.isActive;

    setTogglingCategoryIds((prev) => new Set(prev).add(categoryToToggle.id));
    setToggleCategoryDialogOpen(false);

    const confirmMessage = newActiveState
      ? t("product:toast.activatingCategory", { name: categoryToToggle.categoryName })
      : t("product:toast.deactivatingCategory", { name: categoryToToggle.categoryName });

    const loadingToast = toast.loading(confirmMessage);

    try {
      await categoriesApi.updateCategory(categoryToToggle.id, {
        id: categoryToToggle.id,
        categoryName: categoryToToggle.categoryName,
        parentId: categoryToToggle.parentId || undefined,
        isActive: newActiveState,
      });

      setCategories(
        categories.map((c) =>
          c.id === categoryToToggle.id
            ? {
                ...c,
                isActive: newActiveState,
              }
            : c,
        ),
      );

      toast.dismiss(loadingToast);
      toast.success(
        newActiveState
          ? t("product:toast.categoryActivated", { name: categoryToToggle.categoryName })
          : t("product:toast.categoryDeactivated", { name: categoryToToggle.categoryName }),
      );

      await loadCategories();
    } catch (error: unknown) {
      console.error("Failed to toggle category active state:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (error instanceof Error ? error.message : undefined) ||
        t("product:errors.updateCategoryStatusFailed");

      toast.dismiss(loadingToast);
      toast.error(errorMessage);
    } finally {
      setTogglingCategoryIds((prev) => {
        const next = new Set(prev);
        next.delete(categoryToToggle.id);
        return next;
      });
      setCategoryToToggle(null);
    }
  };

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const getStatusBadge = (status?: ExtendedProduct["status"]) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-green-500">{t("product:status.inStock")}</Badge>;
      case "low-stock":
        return <Badge className="bg-yellow-500">{t("product:status.lowStock")}</Badge>;
      case "out-of-stock":
        return <Badge className="bg-red-500">{t("product:status.outOfStock")}</Badge>;
      default:
        return <Badge>{t("product:status.inStock")}</Badge>;
    }
  };

  const getProfit = (price: number, costPrice?: number) => {
    if (!costPrice) return { profit: 0, margin: 0 };
    const profit = price - costPrice;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    return { profit, margin: Number(margin.toFixed(1)) };
  };

  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum, p) => sum + p.price * p.stockQuantity,
    0,
  );
  const lowStockProducts = products.filter(
    (p) => p.status === "low-stock" || p.status === "out-of-stock",
  ).length;
  const averageMargin =
    products.length > 0
      ? (
          products.reduce((sum, p) => {
            const margin = p.costPrice
              ? ((p.price - p.costPrice) / p.price) * 100
              : 0;
            return sum + margin;
          }, 0) / products.length
        ).toFixed(1)
      : "0";

  if (!currentStore) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <p className="text-lg font-medium text-muted-foreground mb-2">
          {t("page.selectStoreFirst")}
        </p>
      </div>
    );
  }

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
        <StoreSelector pageDescription={t("page.storeSelectorHint")} />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.div
          className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border border-blue-200 dark:border-blue-900 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t("stats.totalProducts")}
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {totalProducts}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-inner">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-6 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background border border-emerald-200 dark:border-emerald-900 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("stats.inventoryValue")}</p>
              <h3 className="text-2xl font-bold text-foreground">
                {totalValue.toLocaleString(i18n.language)}đ
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-inner">
              <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-6 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border border-amber-200 dark:border-amber-900 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t("stats.lowStockAlerts")}
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {lowStockProducts}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-inner">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-6 bg-gradient-to-br from-[#FF7B21]/10 to-white dark:from-[#FF7B21]/5 dark:to-background border border-[#FF7B21]/20 dark:border-[#FF7B21]/10 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t("stats.avgMargin")}
              </p>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
                {averageMargin}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF7B21]/20 to-[#19D6C8]/20 flex items-center justify-center shadow-inner">
              <TrendingUp className="h-6 w-6 text-[#FF7B21]" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full max-w-xl grid-cols-2 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger
              value="products"
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF7B21] data-[state=active]:to-[#19D6C8] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Package className="h-4 w-4" />
              {t("tabs.products")}
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF7B21] data-[state=active]:to-[#19D6C8] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <FolderTree className="h-4 w-4" />
              {t("tabs.categories")}
            </TabsTrigger>
          </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="p-4 sm:p-6 backdrop-blur-sm rounded-xl border bg-card">
            <div className="flex flex-col gap-4 mb-6">
              <div className="w-full relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("search.productsPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 bg-background/80 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-[#FF7B21]/20 focus:border-[#FF7B21]/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full bg-background/80 backdrop-blur-sm">
                    <SelectValue placeholder={t("product:filters.category.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("product:filters.category.all")}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full bg-background/80 backdrop-blur-sm">
                    <SelectValue placeholder={t("product:filters.stockStatus.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("product:filters.stockStatus.all")}</SelectItem>
                    <SelectItem value="in-stock">{t("product:status.inStock")}</SelectItem>
                    <SelectItem value="low-stock">{t("product:status.lowStock")}</SelectItem>
                    <SelectItem value="out-of-stock">{t("product:status.outOfStock")}</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedActiveStatus}
                  onValueChange={setSelectedActiveStatus}
                >
                  <SelectTrigger className="w-full bg-background/80 backdrop-blur-sm">
                    <SelectValue placeholder={t("product:filters.active.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("product:filters.active.all")}</SelectItem>
                    <SelectItem value="active">{t("product:active.active")}</SelectItem>
                    <SelectItem value="inactive">{t("product:active.inactive")}</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleAddProduct}
                  className="gap-2 whitespace-nowrap bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("product:actions.addProduct")}</span>
                  <span className="sm:hidden">{t("common:actions.create")}</span>
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF7B21]" />
              </div>
            ) : (
              <div className="w-full overflow-x-auto rounded-lg border bg-card">
                <Table className="table-fixed min-w-[900px] w-full md:min-w-[1100px]">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#FF7B21]/5 to-[#19D6C8]/5 hover:from-[#FF7B21]/10 hover:to-[#19D6C8]/10">
                      <TableHead className="w-[52px] text-center font-semibold px-2">
                        {t("product:table.code")}
                      </TableHead>
                      <TableHead className="w-[76px] text-center font-semibold px-2">
                        {t("product:table.image")}
                      </TableHead>
                      <TableHead className="w-[18%] font-semibold px-2">
                        {t("product:table.product")}
                      </TableHead>
                      <TableHead className="w-[11%] font-semibold px-2">
                        {t("product:table.category")}
                      </TableHead>
                      <TableHead className="w-[9%] text-right font-semibold px-2">
                        {t("product:table.price")}
                      </TableHead>
                      <TableHead className="w-[8%] text-right font-semibold px-2">
                        {t("product:table.costPrice")}
                      </TableHead>
                      <TableHead className="w-[9%] text-right font-semibold px-2">
                        {t("product:table.profit")}
                      </TableHead>
                      <TableHead className="w-[7%] text-center font-semibold px-2">
                        {t("product:table.stock")}
                      </TableHead>
                      <TableHead className="w-[12%] text-center font-semibold px-2">
                        {t("product:table.status")}
                      </TableHead>
                      <TableHead className="w-[160px] text-right font-semibold px-2">
                        {t("product:table.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center text-muted-foreground py-8"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Package className="h-12 w-12 text-muted-foreground/50" />
                            <p>{t("product:states.noProducts")}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => {
                        const category = getCategoryById(product.categoryId);
                        const { profit, margin } = getProfit(
                          product.price,
                          product.costPrice || undefined,
                        );

                        return (
                          <TableRow
                            key={product.id}
                            className="hover:bg-gradient-to-r hover:from-[#FF7B21]/5 hover:to-transparent transition-all duration-200"
                          >
                            <TableCell className="text-center px-2 py-2 align-middle">
                              {product.barCode ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 mx-auto"
                                  onClick={() => {
                                    setBarCodeToView(product.barCode || "");
                                    setBarCodeViewDialogOpen(true);
                                  }}
                                  title={t("product:actions.viewBarcode")}
                                >
                                  <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </Button>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center px-2 py-2 align-middle w-[76px]">
                              <div className="flex justify-center">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.productName}
                                    className="h-14 w-14 shrink-0 object-cover rounded-md border"
                                  />
                                ) : (
                                  <div className="h-14 w-14 shrink-0 bg-muted rounded-md border flex items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-2 align-middle whitespace-normal break-words max-w-0">
                              <div className="flex items-center gap-1 min-w-0">
                                <span
                                  className="font-medium cursor-pointer hover:text-teal-600 transition-colors truncate"
                                  onClick={() =>
                                    navigate(`/dashboard/products/${product.id}`)
                                  }
                                >
                                  {product.productName}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() =>
                                    navigate(`/dashboard/products/${product.id}`)
                                  }
                                >
                                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-2 align-middle whitespace-normal">
                              {category && (
                                <Badge
                                  style={{ backgroundColor: category.color }}
                                  className="text-white max-w-full truncate"
                                >
                                  {category.categoryName}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right px-2 py-2 align-middle tabular-nums">
                              {product.price.toLocaleString(i18n.language)}đ
                            </TableCell>
                            <TableCell className="text-right px-2 py-2 align-middle tabular-nums text-muted-foreground">
                              {product.costPrice
                                ? `${product.costPrice.toLocaleString(i18n.language)}đ`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right px-2 py-2 align-middle tabular-nums">
                              {product.costPrice ? (
                                <div className="flex flex-col items-end gap-0.5">
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    +{profit.toLocaleString(i18n.language)}đ
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {margin}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center px-2 py-2 align-middle">
                              <div className="flex flex-col items-center">
                                <span className="font-medium tabular-nums">
                                  {product.hasVariants &&
                                  product.totalStock !== undefined
                                    ? product.totalStock
                                    : product.stockQuantity}
                                </span>
                                {product.hasVariants &&
                                  product.variants &&
                                  product.variants.length > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      {t("product:productForm.variantCount", { count: product.variants.length })}
                                    </span>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center px-2 py-2 align-middle">
                              <div className="flex flex-col items-center gap-1">
                                {getStatusBadge(product.status)}
                                <Badge
                                  variant={
                                    product.isActive ? "default" : "secondary"
                                  }
                                  className={
                                    product.isActive
                                      ? "bg-green-500"
                                      : "bg-gray-500"
                                  }
                                >
                                  {product.isActive ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      {t("product:active.active")}
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-3 w-3 mr-1" />
                                      {t("product:active.inactiveShort")}
                                    </>
                                  )}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right px-2 py-2 align-middle w-[160px]">
                              <div className="flex gap-1 justify-end items-center flex-wrap">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditProduct(product)}
                                  className="hover:bg-[#FF7B21]/10 hover:text-[#FF7B21] transition-all duration-200 shrink-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:inline">
                                    {product.isActive
                                      ? t("product:active.active")
                                      : t("product:active.paused")}
                                  </span>
                                  <Switch
                                    checked={product.isActive}
                                    onCheckedChange={() =>
                                      handleToggleProductActive(product)
                                    }
                                    disabled={togglingProductIds.has(
                                      product.id,
                                    )}
                                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FF7B21] data-[state=checked]:to-[#19D6C8]"
                                  />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="backdrop-blur-sm rounded-xl border bg-card p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-[#FF7B21]" />
                  {t("product:categories.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("product:categories.subtitle")}
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <Select
                  value={selectedCategoryActiveStatus}
                  onValueChange={setSelectedCategoryActiveStatus}
                >
                  <SelectTrigger className="w-full lg:w-[200px] bg-background/80 backdrop-blur-sm">
                    <SelectValue placeholder={t("product:filters.active.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("product:filters.active.all")}</SelectItem>
                    <SelectItem value="active">{t("product:active.active")}</SelectItem>
                    <SelectItem value="inactive">{t("product:active.inactive")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddCategory}
                  className="gap-2 bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  {t("product:actions.addCategory")}
                </Button>
              </div>
            </div>

            {categoriesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF7B21]" />
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border-2 border-dashed border-[#FF7B21]/20 bg-[#FF7B21]/5">
                <Package className="h-16 w-16 text-[#FF7B21]/50 mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  {t("product:categories.states.emptyTitle")}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("product:categories.states.emptySubtitle")}
                </p>
                <Button
                  onClick={handleAddCategory}
                  className="gap-2 bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white shadow-lg shadow-[#FF7B21]/20 transition-all duration-300"
                >
                  <Plus className="h-4 w-4" />
                  {t("product:actions.addFirstCategory")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card
                      className="p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: category.color,
                      }}
                    >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: addOpacityToColor(category.color, 0.15) }}
                      >
                        <Tag
                          className="h-6 w-6"
                          style={{ color: category.color }}
                        />
                      </div>
                      <div className="flex gap-1 items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {category.isActive ? t("product:active.active") : t("product:active.paused")}
                          </span>
                          <Switch
                            checked={category.isActive}
                            onCheckedChange={() =>
                              handleToggleCategoryActive(category)
                            }
                            disabled={togglingCategoryIds.has(category.id)}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FF7B21] data-[state=checked]:to-[#19D6C8]"
                          />
                        </div>
                      </div>
                    </div>

                    <h4 className="font-semibold text-lg mb-1">
                      {category.categoryName}
                    </h4>
                    {category.parentName && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {t("product:categories.parentLabel")}: {category.parentName}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                          {t("product:categories.productLabel")}
                        </span>
                        <Badge
                          variant={category.isActive ? "default" : "secondary"}
                          className={
                            category.isActive ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gray-500"
                          }
                        >
                          {category.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t("product:active.active")}
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              {t("product:active.inactiveShort")}
                            </>
                          )}
                        </Badge>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5 hover:bg-[#FF7B21]/10 transition-all duration-200"
                      >
                        {products.filter((p) => p.categoryId === category.id).length}
                      </Badge>
                    </div>
                  </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      </motion.div>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? t("product:productForm.titleEdit") : t("product:productForm.titleCreate")}
            </DialogTitle>
            <DialogDescription>
              {t("product:productForm.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 min-w-0">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="product-name">{t("product:addModal.fields.productName")} *</Label>
              <Input
                id="product-name"
                value={productForm.productName}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    productName: e.target.value,
                  })
                }
                placeholder={t("product:productForm.placeholders.productName")}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 min-w-0">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="product-sku">{t("product:addModal.fields.barcode")}</Label>
                <Input
                  id="product-sku"
                  value={productForm.barCode}
                  onChange={(e) =>
                    setProductForm({ ...productForm, barCode: e.target.value })
                  }
                  placeholder={t("product:productForm.placeholders.barcode")}
                  className="w-full"
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="product-category">{t("product:addModal.fields.category")} *</Label>
                <Select
                  value={productForm.categoryId}
                  onValueChange={(value) =>
                    setProductForm({ ...productForm, categoryId: value })
                  }
                >
                  <SelectTrigger id="product-category" className="w-full">
                    <SelectValue placeholder={t("product:addModal.placeholders.category")} />
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
            </div>

            <div className="grid grid-cols-2 gap-4 min-w-0">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="product-price">{t("product:productForm.fields.price")} *</Label>
                <Input
                  id="product-price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  placeholder={t("product:productForm.placeholders.price")}
                  className="w-full"
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="product-cost">{t("product:productForm.fields.costPrice")}</Label>
                <Input
                  id="product-cost"
                  type="number"
                  value={productForm.costPrice}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      costPrice: e.target.value,
                    })
                  }
                  placeholder={t("product:productForm.placeholders.costPrice")}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="product-stock">
                {t("product:productForm.fields.stock")}{" "}
                {productForm.hasVariants ? `(${t("product:productForm.stockWhenNoVariants")})` : "*"}
              </Label>
              <Input
                id="product-stock"
                type="number"
                value={productForm.stockQuantity}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    stockQuantity: e.target.value,
                  })
                }
                placeholder={t("product:productForm.placeholders.stock")}
                disabled={productForm.hasVariants}
                className="w-full"
              />
              {productForm.hasVariants && (
                <p className="text-xs text-muted-foreground">
                  {t("product:productForm.variantStockHint")}
                </p>
              )}
            </div>

            <div className="space-y-3 min-w-0 rounded-md border border-dashed p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label>{t("product:productForm.fields.variants")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("product:productForm.variantHint")}
                  </p>
                </div>
                <Switch
                  checked={productForm.hasVariants}
                  onCheckedChange={toggleVariants}
                />
              </div>

              {productForm.hasVariants && (
                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <div className="min-w-[860px] space-y-2">
                      <div className="grid grid-cols-12 gap-3 px-3">
                        <div className="col-span-4 text-xs font-medium text-muted-foreground">
                          {t("product:productForm.variantColumns.sku")} *
                        </div>
                        <div className="col-span-2 text-xs font-medium text-muted-foreground">
                          {t("product:productForm.variantColumns.size")}
                        </div>
                        <div className="col-span-2 text-xs font-medium text-muted-foreground">
                          {t("product:productForm.variantColumns.color")}
                        </div>
                        <div className="col-span-2 text-xs font-medium text-muted-foreground">
                          {t("product:productForm.variantColumns.priceOverride")}
                        </div>
                        <div className="col-span-2 text-xs font-medium text-muted-foreground">
                          {t("product:productForm.variantColumns.stock")} *
                        </div>
                      </div>

                      {productForm.variants.map((variant, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 items-center gap-3 rounded-lg border bg-muted/20 p-3"
                        >
                          <div className="col-span-4 min-w-0">
                            <Input
                              className="h-10"
                              value={variant.sku}
                              onChange={(e) =>
                                updateVariantField(index, "sku", e.target.value)
                              }
                              placeholder={t("product:productForm.placeholders.variantSku")}
                              
                            />
                          </div>
                          <div className="col-span-2 min-w-0">
                            <Input
                              className="h-10"
                              value={variant.size}
                              onChange={(e) =>
                                updateVariantField(
                                  index,
                                  "size",
                                  e.target.value,
                                )
                              }
                              placeholder={t("product:productForm.placeholders.variantSize")}
                            />
                          </div>
                          <div className="col-span-2 min-w-0">
                            <Input
                              className="h-10"
                              value={variant.color}
                              onChange={(e) =>
                                updateVariantField(
                                  index,
                                  "color",
                                  e.target.value,
                                )
                              }
                              placeholder={t("product:productForm.placeholders.variantColor")}
                            />
                          </div>
                          <div className="col-span-2 min-w-0">
                            <Input
                              className="h-10"
                              type="number"
                              value={variant.priceOverride}
                              onChange={(e) =>
                                updateVariantField(
                                  index,
                                  "priceOverride",
                                  e.target.value,
                                )
                              }
                              placeholder={t("product:productForm.placeholders.variantPriceOverride")}
                            />
                          </div>
                          <div className="col-span-2 min-w-0 flex items-center gap-2">
                            <Input
                              className="h-10"
                              type="number"
                              value={variant.stockQuantity}
                              onChange={(e) =>
                                updateVariantField(
                                  index,
                                  "stockQuantity",
                                  e.target.value,
                                )
                              }
                              placeholder={t("product:productForm.placeholders.variantStock")}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => removeVariantRow(index)}
                              title={t("product:productForm.actions.removeVariant", { index: index + 1 })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={addVariantRow}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("product:productForm.actions.addVariant")}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="product-description">{t("product:productForm.fields.description")}</Label>
              <Textarea
                id="product-description"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
                placeholder={t("product:productForm.placeholders.description")}
                rows={3}
                className="w-full resize-none"
              />
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="product-image">{t("product:productForm.fields.image")}</Label>
              <Input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setProductForm({ ...productForm, imageFile: file });
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImagePreview(editingProduct?.imageUrl || null);
                  }
                }}
                className="w-full"
              />
              {(imagePreview || editingProduct?.imageUrl) && (
                <div className="mt-2">
                  <img
                    src={imagePreview || editingProduct?.imageUrl || ""}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            {productForm.price &&
              productForm.costPrice &&
              parseFloat(productForm.price) > 0 &&
              parseFloat(productForm.costPrice) > 0 && (
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("product:productForm.profitLabel")}:
                    </span>
                    <div className="text-right">
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        +
                        {(
                          parseFloat(productForm.price) -
                          parseFloat(productForm.costPrice)
                        ).toLocaleString(i18n.language)}
                        đ
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          ((parseFloat(productForm.price) -
                            parseFloat(productForm.costPrice)) /
                            parseFloat(productForm.price)) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                </Card>
              )}

            {editingProduct && (
              <div className="space-y-2 min-w-0">
                <Label htmlFor="product-status">{t("product:productForm.fields.status")}</Label>
                <Select
                  value={productForm.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setProductForm({
                      ...productForm,
                      isActive: value === "active",
                    })
                  }
                >
                  <SelectTrigger id="product-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("product:active.active")}</SelectItem>
                    <SelectItem value="inactive">{t("product:active.inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductDialogOpen(false)}
              disabled={productFormLoading}
            >
              {t("common:actions.cancel")}
            </Button>
            <Button onClick={handleSaveProduct} disabled={productFormLoading}>
              {productFormLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editingProduct ? t("common:actions.saveChanges") : t("common:actions.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? t("product:categoryForm.titleEdit") : t("product:categoryForm.titleCreate")}
            </DialogTitle>
            <DialogDescription>
              {t("product:categoryForm.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 min-w-0">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-name">{t("product:categoryForm.fields.name")} *</Label>
              <Input
                id="category-name"
                value={categoryForm.categoryName}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    categoryName: e.target.value,
                  })
                }
                placeholder={t("product:categoryForm.placeholders.name")}
                className="w-full"
              />
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-parent">{t("product:categoryForm.fields.parent")}</Label>
              <Select
                value={categoryForm.parentId || "none"}
                onValueChange={(value) =>
                  setCategoryForm({
                    ...categoryForm,
                    parentId: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="category-parent" className="w-full">
                  <SelectValue placeholder={t("product:categoryForm.placeholders.parent")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("product:categoryForm.noneParent")}</SelectItem>
                  {categories
                    .filter(
                      (cat) =>
                        !editingCategory || cat.id !== editingCategory.id,
                    )
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-color">{t("product:categoryForm.fields.color")}</Label>
              <div className="flex gap-2 min-w-0">
                <Input
                  id="category-color"
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, color: e.target.value })
                  }
                  className="w-20 h-10 cursor-pointer shrink-0"
                />
                <Input
                  value={categoryForm.color}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, color: e.target.value })
                  }
                  placeholder={t("product:categoryForm.placeholders.color")}
                  className="flex-1 min-w-0"
                />
              </div>
            </div>

            <Card
              className="p-4"
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: categoryForm.color,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: addOpacityToColor(categoryForm.color, 0.15) }}
                >
                  <Tag
                    className="h-5 w-5"
                    style={{ color: categoryForm.color }}
                  />
                </div>
                <div>
                  <div className="font-medium">
                    {categoryForm.categoryName || t("product:categoryForm.nameFallback")}
                  </div>
                </div>
              </div>
            </Card>

            {editingCategory && (
              <div className="space-y-2 min-w-0">
                <Label htmlFor="category-status">{t("product:categoryForm.fields.status")}</Label>
                <Select
                  value={categoryForm.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setCategoryForm({
                      ...categoryForm,
                      isActive: value === "active",
                    })
                  }
                >
                  <SelectTrigger id="category-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("product:active.active")}</SelectItem>
                    <SelectItem value="inactive">{t("product:active.inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryDialogOpen(false)}
              disabled={categoryFormLoading}
            >
              {t("common:actions.cancel")}
            </Button>
            <Button onClick={handleSaveCategory} disabled={categoryFormLoading}>
              {categoryFormLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editingCategory ? t("common:actions.saveChanges") : t("common:actions.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={barCodeViewDialogOpen}
        onOpenChange={setBarCodeViewDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("product:barcodeDialog.title")}</DialogTitle>
            <DialogDescription>{t("product:barcodeDialog.description")}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm font-mono break-all select-all text-foreground">
                {barCodeToView || t("product:barcodeDialog.empty")}
              </code>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(barCodeToView);
                toast.success(t("product:barcodeDialog.toast.copied"));
              }}
              variant="outline"
            >
              {t("common:actions.copyJson")}
            </Button>
            <Button onClick={() => setBarCodeViewDialogOpen(false)}>
              {t("common:actions.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={toggleProductDialogOpen}
        onOpenChange={setToggleProductDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {productToToggle?.isActive
                ? t("product:toggleProductDialog.titleDeactivate")
                : t("product:toggleProductDialog.titleActivate")}
            </DialogTitle>
            <DialogDescription>
              {productToToggle?.isActive ? (
                <>
                  {t("product:toggleProductDialog.descriptionDeactivate", { name: productToToggle?.productName })}
                </>
              ) : (
                <>
                  {t("product:toggleProductDialog.descriptionActivate", { name: productToToggle?.productName })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setToggleProductDialogOpen(false)}
            >
              {t("common:actions.cancel")}
            </Button>
            <Button onClick={confirmToggleProductActive}>
              {productToToggle?.isActive ? t("product:toggle.deactivate") : t("product:toggle.activate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={toggleCategoryDialogOpen}
        onOpenChange={setToggleCategoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {categoryToToggle?.isActive ? (
                <>
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  {t("product:toggleCategoryDialog.titleDeactivate")}
                </>
              ) : (
                <>
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  {t("product:toggleCategoryDialog.titleActivate")}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {categoryToToggle?.isActive ? (
                <>
                  {t("product:toggleCategoryDialog.descriptionDeactivate", { name: categoryToToggle?.categoryName })}
                </>
              ) : (
                <>
                  {t("product:toggleCategoryDialog.descriptionActivate", { name: categoryToToggle?.categoryName })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setToggleCategoryDialogOpen(false)}
            >
              {t("common:actions.cancel")}
            </Button>
            <Button
              onClick={confirmToggleCategoryActive}
              className={categoryToToggle?.isActive ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:opacity-90"}
            >
              {categoryToToggle?.isActive ? t("product:toggle.deactivate") : t("product:toggle.activate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
