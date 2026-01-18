import { useState, useEffect } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
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
} from "lucide-react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Switch } from "@/shared/components/ui/switch";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { categoriesApi } from "@/shared/lib/categoriesApi";
import { productsApi } from "@/shared/lib/productsApi";
import { useStoreStore } from "@/shared/store/storeStore";
import type { Category } from "@/shared/types/categories";
import type { Product } from "@/shared/types/products";
import StoreSelector from "@/features/dashboard/components/StoreSelector";

interface ExtendedCategory extends Category {
  color?: string;
  productCount?: number;
}

interface ExtendedProduct extends Product {
  status?: "in-stock" | "low-stock" | "out-of-stock";
}

const generateCategoryColor = (categoryName: string, index: number): string => {
  const colorPalette = [
    "hsl(210, 100%, 50%)",  // Blue
    "hsl(142, 71%, 45%)",   // Green
    "hsl(45, 96%, 53%)",    // Yellow/Amber
    "hsl(199, 89%, 48%)",   // Cyan
    "hsl(0, 84%, 60%)",     // Red
    "hsl(262, 52%, 47%)",   // Purple
    "hsl(25, 95%, 53%)",    // Orange
    "hsl(158, 64%, 52%)",   // Teal
    "hsl(340, 82%, 52%)",   // Pink
    "hsl(217, 91%, 60%)",   // Indigo
  ];
  
  return colorPalette[index % colorPalette.length];
};

export default function ProductManagementPage() {
  const { currentStore } = useStoreStore();
  const storeId = currentStore?.id;

  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedActiveStatus, setSelectedActiveStatus] = useState<string>("active");
  const [selectedCategoryActiveStatus, setSelectedCategoryActiveStatus] = useState<string>("active");
  const [togglingProductIds, setTogglingProductIds] = useState<Set<string>>(new Set());
  const [togglingCategoryIds, setTogglingCategoryIds] = useState<Set<string>>(new Set());

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ExtendedProduct | null>(null);
  const [productForm, setProductForm] = useState({
    productName: "",
    categoryId: "",
    price: "",
    costPrice: "",
    stockQuantity: "",
    barCode: "",
    description: "",
    imageFile: null as File | null,
    hasVariants: false,
    variantsJson: "",
    isActive: true,
  });
  const [productFormLoading, setProductFormLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExtendedCategory | null>(null);
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
  const [productToToggle, setProductToToggle] = useState<ExtendedProduct | null>(null);
  const [toggleCategoryDialogOpen, setToggleCategoryDialogOpen] = useState(false);
  const [categoryToToggle, setCategoryToToggle] = useState<ExtendedCategory | null>(null);

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
        color: generateCategoryColor(cat.categoryName, index),
        productCount: 0,
        isActive: cat.isActive ?? true,
      }));
      
      let filteredCategoriesWithColors = categoriesWithColors;
      if (selectedCategoryActiveStatus === "active") {
        filteredCategoriesWithColors = categoriesWithColors.filter(cat => cat.isActive !== false);
      } else if (selectedCategoryActiveStatus === "inactive") {
        filteredCategoriesWithColors = categoriesWithColors.filter(cat => cat.isActive === false);
      }
      
      setCategories(filteredCategoriesWithColors);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Không thể tải danh mục. Vui lòng thử lại.");
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
        const hasVariants = product.hasVariants || (product.variants && product.variants.length > 0);
        
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
          isActive: product.isActive ?? (selectedActiveStatus === "active" ? true : false),
        };
      });

      setProducts(productsWithStatus);

      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          productCount: productsWithStatus.filter((p) => p.categoryId === cat.id).length,
        }))
      );
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Không thể tải sản phẩm. Vui lòng thử lại.");
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
      (selectedActiveStatus === "inactive" && (product.isActive === false));

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
      variantsJson: "",
      isActive: true,
    });
    setImagePreview(null);
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: ExtendedProduct) => {
    setEditingProduct(product);
    const hasVariants = product.hasVariants || (product.variants && product.variants.length > 0);
    setProductForm({
      productName: product.productName,
      categoryId: product.categoryId,
      price: product.price.toString(),
      costPrice: (product.costPrice || 0).toString(),
      stockQuantity: hasVariants ? "0" : product.stockQuantity.toString(),
      barCode: product.barCode || "",
      description: product.description || "",
      imageFile: null,
      hasVariants: hasVariants ?? false,
      variantsJson: product.variants ? JSON.stringify(product.variants) : "",
      isActive: product.isActive ?? true,
    });
    setImagePreview(product.imageUrl || null);
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!storeId) {
      toast.error("Vui lòng chọn cửa hàng.");
      return;
    }

    if (!productForm.productName.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!productForm.categoryId) {
      toast.error("Vui lòng chọn danh mục.");
      return;
    }

    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      toast.error("Vui lòng nhập giá bán hợp lệ.");
      return;
    }

    if (!productForm.stockQuantity || parseInt(productForm.stockQuantity) < 0) {
      toast.error("Vui lòng nhập số lượng tồn kho hợp lệ.");
      return;
    }

    try {
      setProductFormLoading(true);

      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, {
          id: editingProduct.id,
          productName: productForm.productName,
          categoryId: productForm.categoryId,
          barCode: productForm.barCode || undefined,
          description: productForm.description || undefined,
          price: parseFloat(productForm.price),
          costPrice: productForm.costPrice ? parseFloat(productForm.costPrice) : undefined,
          stockQuantity: productForm.hasVariants ? 0 : parseInt(productForm.stockQuantity || "0"),
          isActive: productForm.isActive,
          imageFile: productForm.imageFile || undefined,
          variantsJson: productForm.hasVariants && productForm.variantsJson ? productForm.variantsJson : undefined,
        });
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await productsApi.createProduct({
          productName: productForm.productName,
          categoryId: productForm.categoryId,
          barCode: productForm.barCode || undefined,
          description: productForm.description || undefined,
          price: parseFloat(productForm.price),
          costPrice: productForm.costPrice ? parseFloat(productForm.costPrice) : undefined,
          stockQuantity: productForm.hasVariants ? 0 : parseInt(productForm.stockQuantity || "0"),
          isActive: productForm.isActive,
          imageFile: productForm.imageFile || undefined,
          hasVariants: productForm.hasVariants,
          variants: productForm.hasVariants && productForm.variantsJson ? JSON.parse(productForm.variantsJson) : undefined,
        });
        toast.success("Thêm sản phẩm thành công!");
      }

      setProductDialogOpen(false);
      setImagePreview(null);
      await loadProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      const message =
        error?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
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
      ? `Đang kích hoạt sản phẩm "${productToToggle.productName}"...`
      : `Đang tạm ngừng sản phẩm "${productToToggle.productName}"...`;
    
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
            : p
        )
      );

      toast.dismiss(loadingToast);
      toast.success(
        newActiveState
          ? `Sản phẩm "${productToToggle.productName}" đã được kích hoạt`
          : `Sản phẩm "${productToToggle.productName}" đã được tạm ngừng hoạt động`
      );
      
      await loadProducts();
    } catch (error: any) {
      console.error("Failed to toggle product active state:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Không thể cập nhật trạng thái sản phẩm";
      
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
      toast.error("Vui lòng chọn cửa hàng.");
      return;
    }

    if (!categoryForm.categoryName.trim()) {
      toast.error("Vui lòng nhập tên danh mục.");
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
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await categoriesApi.createCategory({
          categoryName: categoryForm.categoryName,
          parentId: categoryForm.parentId || undefined,
        });
        toast.success("Thêm danh mục thành công!");
      }

      setCategoryDialogOpen(false);
      await loadCategories();
      await loadProducts();
    } catch (error: any) {
      console.error("Error saving category:", error);
      const message =
        error?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
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
      ? `Đang kích hoạt danh mục "${categoryToToggle.categoryName}"...`
      : `Đang tạm ngừng danh mục "${categoryToToggle.categoryName}"...`;
    
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
            : c
        )
      );

      toast.dismiss(loadingToast);
      toast.success(
        newActiveState
          ? `Danh mục "${categoryToToggle.categoryName}" đã được kích hoạt`
          : `Danh mục "${categoryToToggle.categoryName}" đã được tạm ngừng hoạt động`
      );
      
      await loadCategories();
    } catch (error: any) {
      console.error("Failed to toggle category active state:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Không thể cập nhật trạng thái danh mục";
      
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
        return <Badge className="bg-green-500">Còn hàng</Badge>;
      case "low-stock":
        return <Badge className="bg-yellow-500">Sắp hết</Badge>;
      case "out-of-stock":
        return <Badge className="bg-red-500">Hết hàng</Badge>;
      default:
        return <Badge>Còn hàng</Badge>;
    }
  };

  const getProfit = (price: number, costPrice?: number) => {
    if (!costPrice) return { profit: 0, margin: 0 };
    const profit = price - costPrice;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    return { profit, margin: Number(margin.toFixed(1)) };
  };

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0);
  const lowStockProducts = products.filter(
    (p) => p.status === "low-stock" || p.status === "out-of-stock"
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
          Vui lòng chọn cửa hàng để quản lý sản phẩm
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription="Chuyển đổi để quản lý sản phẩm và danh mục của cửa hàng khác" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-200 dark:border-blue-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Tổng sản phẩm
              </p>
              <h3 className="text-2xl font-bold text-foreground">{totalProducts}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-200 dark:border-green-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Giá trị kho
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {totalValue.toLocaleString("vi-VN")}đ
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background border-yellow-200 dark:border-yellow-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Cảnh báo tồn kho
              </p>
              <h3 className="text-2xl font-bold text-foreground">{lowStockProducts}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-200 dark:border-purple-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Lợi nhuận trung bình
              </p>
              <h3 className="text-2xl font-bold text-foreground">{averageMargin}%</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Sản phẩm
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderTree className="h-4 w-4" />
            Danh mục
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card className="p-6">
            {/* Filters and Actions */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="in-stock">Còn hàng</SelectItem>
                  <SelectItem value="low-stock">Sắp hết</SelectItem>
                  <SelectItem value="out-of-stock">Hết hàng</SelectItem>
                </SelectContent>
              </Select>

              {/* Active Status Filter */}
              <Select value={selectedActiveStatus} onValueChange={setSelectedActiveStatus}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Tất cả hoạt động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>

              {/* Add Button */}
              <Button onClick={handleAddProduct} className="gap-2 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Thêm sản phẩm
              </Button>
            </div>

            {/* Products Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Mã</TableHead>
                      <TableHead className="w-[100px]">Hình ảnh</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead className="text-right">Giá bán</TableHead>
                      <TableHead className="text-right">Giá vốn</TableHead>
                      <TableHead className="text-right">Lợi nhuận</TableHead>
                      <TableHead className="text-center">Tồn kho</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center text-muted-foreground py-8"
                        >
                          Không tìm thấy sản phẩm
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => {
                        const category = getCategoryById(product.categoryId);
                        const { profit, margin } = getProfit(product.price, product.costPrice || undefined);

                        return (
                          <TableRow key={product.id}>
                            <TableCell className="text-center">
                              {product.barCode ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 mx-auto"
                                  onClick={() => {
                                    setBarCodeToView(product.barCode || "");
                                    setBarCodeViewDialogOpen(true);
                                  }}
                                  title="Xem mã sản phẩm"
                                >
                                  <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </Button>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.productName}
                                  className="w-16 h-16 object-cover rounded-md border"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-muted rounded-md border flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{product.productName}</div>
                            </TableCell>
                            <TableCell>
                              {category && (
                                <Badge
                                  style={{ backgroundColor: category.color }}
                                  className="text-white"
                                >
                                  {category.categoryName}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {product.price.toLocaleString("vi-VN")}đ
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {product.costPrice
                                ? `${product.costPrice.toLocaleString("vi-VN")}đ`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {product.costPrice ? (
                                <div className="flex flex-col items-end">
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    +{profit.toLocaleString("vi-VN")}đ
                                  </span>
                                  <span className="text-xs text-muted-foreground">{margin}%</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">
                                  {product.hasVariants && product.totalStock !== undefined
                                    ? product.totalStock
                                    : product.stockQuantity}
                                </span>
                                {product.hasVariants && product.variants && product.variants.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    ({product.variants.length} variant)
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                {getStatusBadge(product.status)}
                                <Badge
                                  variant={product.isActive ? "default" : "secondary"}
                                  className={product.isActive ? "bg-green-500" : "bg-gray-500"}
                                >
                                  {product.isActive ? (
                                    <><CheckCircle className="h-3 w-3 mr-1" />Hoạt động</>
                                  ) : (
                                    <><XCircle className="h-3 w-3 mr-1" />Ngừng</>
                                  )}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end items-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {product.isActive ? "Hoạt động" : "Tạm dừng"}
                                  </span>
                                  <Switch
                                    checked={product.isActive}
                                    onCheckedChange={() => handleToggleProductActive(product)}
                                    disabled={togglingProductIds.has(product.id)}
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
              </ScrollArea>
            )}
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold">
                  Danh mục sản phẩm
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quản lý danh mục và nhóm sản phẩm
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <Select value={selectedCategoryActiveStatus} onValueChange={setSelectedCategoryActiveStatus}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Tất cả hoạt động" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddCategory} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Thêm danh mục
                </Button>
              </div>
            </div>

            {categoriesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  Chưa có danh mục nào
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Tạo danh mục đầu tiên để bắt đầu quản lý sản phẩm
                </p>
                <Button onClick={handleAddCategory} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Thêm danh mục đầu tiên
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="p-6 hover:shadow-lg transition-shadow"
                    style={{ borderLeftWidth: "4px", borderLeftColor: category.color }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Tag className="h-6 w-6" style={{ color: category.color }} />
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
                            {category.isActive ? "Hoạt động" : "Tạm dừng"}
                          </span>
                          <Switch
                            checked={category.isActive}
                            onCheckedChange={() => handleToggleCategoryActive(category)}
                            disabled={togglingCategoryIds.has(category.id)}
                          />
                        </div>
                      </div>
                    </div>

                    <h4 className="font-semibold text-lg mb-1">{category.categoryName}</h4>
                    {category.parentName && (
                      <p className="text-sm text-muted-foreground mb-3">
                        Danh mục cha: {category.parentName}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                          Sản phẩm
                        </span>
                        <Badge
                          variant={category.isActive ? "default" : "secondary"}
                          className={category.isActive ? "bg-green-500" : "bg-gray-500"}
                        >
                          {category.isActive ? (
                            <><CheckCircle className="h-3 w-3 mr-1" />Hoạt động</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" />Ngừng</>
                          )}
                        </Badge>
                      </div>
                      <Badge variant="secondary">
                        {products.filter((p) => p.categoryId === category.id).length}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin sản phẩm bên dưới
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 min-w-0">
            {/* Product Name */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="product-name">Tên sản phẩm *</Label>
              <Input
                id="product-name"
                value={productForm.productName}
                onChange={(e) =>
                  setProductForm({ ...productForm, productName: e.target.value })
                }
                placeholder="Ví dụ: Coca Cola 330ml"
                className="w-full"
              />
            </div>

            {/* SKU & Category */}
            <div className="grid grid-cols-2 gap-4 min-w-0">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="product-sku">Mã sản phẩm</Label>
                <Input
                  id="product-sku"
                  value={productForm.barCode}
                  onChange={(e) =>
                    setProductForm({ ...productForm, barCode: e.target.value })
                  }
                  placeholder="Ví dụ: BEV-001"
                  className="w-full"
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="product-category">Danh mục *</Label>
                <Select
                  value={productForm.categoryId}
                  onValueChange={(value) =>
                    setProductForm({ ...productForm, categoryId: value })
                  }
                >
                  <SelectTrigger id="product-category" className="w-full">
                    <SelectValue placeholder="Chọn danh mục" />
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

            {/* Price & Cost */}
            <div className="grid grid-cols-2 gap-4 min-w-0">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="product-price">Giá bán (VND) *</Label>
                <Input
                  id="product-price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  placeholder="15000"
                  className="w-full"
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="product-cost">Giá vốn (VND)</Label>
                <Input
                  id="product-cost"
                  type="number"
                  value={productForm.costPrice}
                  onChange={(e) =>
                    setProductForm({ ...productForm, costPrice: e.target.value })
                  }
                  placeholder="12000"
                  className="w-full"
                />
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="product-stock">
                Tồn kho {productForm.hasVariants ? "(nếu không có variant)" : "*"}
              </Label>
              <Input
                id="product-stock"
                type="number"
                value={productForm.stockQuantity}
                onChange={(e) =>
                  setProductForm({ ...productForm, stockQuantity: e.target.value })
                }
                placeholder="100"
                disabled={productForm.hasVariants}
                className="w-full"
              />
              {productForm.hasVariants && (
                <p className="text-xs text-muted-foreground">
                  Sản phẩm có variant sẽ quản lý tồn kho ở từng variant riêng
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="product-description">Mô tả</Label>
              <Textarea
                id="product-description"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({ ...productForm, description: e.target.value })
                }
                placeholder="Mô tả sản phẩm..."
                rows={3}
                className="w-full resize-none"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="product-image">Hình ảnh</Label>
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

            {/* Profit Preview */}
            {productForm.price &&
              productForm.costPrice &&
              parseFloat(productForm.price) > 0 &&
              parseFloat(productForm.costPrice) > 0 && (
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Lợi nhuận:
                    </span>
                    <div className="text-right">
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        +
                        {(
                          parseFloat(productForm.price) - parseFloat(productForm.costPrice)
                        ).toLocaleString("vi-VN")}
                        đ
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          ((parseFloat(productForm.price) - parseFloat(productForm.costPrice)) /
                            parseFloat(productForm.price)) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                </Card>
              )}

            {/* Active Status - Only show when editing */}
            {editingProduct && (
              <div className="space-y-2 min-w-0">
                <Label htmlFor="product-status">Trạng thái</Label>
                <Select
                  value={productForm.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setProductForm({ ...productForm, isActive: value === "active" })
                  }
                >
                  <SelectTrigger id="product-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
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
              Hủy
            </Button>
            <Button onClick={handleSaveProduct} disabled={productFormLoading}>
              {productFormLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editingProduct ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin danh mục bên dưới
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 min-w-0">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-name">Tên danh mục *</Label>
              <Input
                id="category-name"
                value={categoryForm.categoryName}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, categoryName: e.target.value })
                }
                placeholder="Ví dụ: Đồ uống"
                className="w-full"
              />
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="category-parent">Danh mục cha</Label>
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
                  <SelectValue placeholder="Không có (danh mục gốc)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có (danh mục gốc)</SelectItem>
                  {categories
                    .filter(
                      (cat) =>
                        !editingCategory || cat.id !== editingCategory.id
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
              <Label htmlFor="category-color">Màu sắc</Label>
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
                  placeholder="HSL color"
                  className="flex-1 min-w-0"
                />
              </div>
            </div>

            {/* Color Preview */}
            <Card
              className="p-4"
              style={{ borderLeftWidth: "4px", borderLeftColor: categoryForm.color }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${categoryForm.color}20` }}
                >
                  <Tag className="h-5 w-5" style={{ color: categoryForm.color }} />
                </div>
                <div>
                  <div className="font-medium">
                    {categoryForm.categoryName || "Tên danh mục"}
                  </div>
                </div>
              </div>
            </Card>

            {/* Active Status - Only show when editing */}
            {editingCategory && (
              <div className="space-y-2 min-w-0">
                <Label htmlFor="category-status">Trạng thái</Label>
                <Select
                  value={categoryForm.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setCategoryForm({ ...categoryForm, isActive: value === "active" })
                  }
                >
                  <SelectTrigger id="category-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
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
              Hủy
            </Button>
            <Button onClick={handleSaveCategory} disabled={categoryFormLoading}>
              {categoryFormLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editingCategory ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BarCode View Dialog */}
      <Dialog open={barCodeViewDialogOpen} onOpenChange={setBarCodeViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mã sản phẩm</DialogTitle>
            <DialogDescription>
              Mã sản phẩm của bạn
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm font-mono break-all select-all text-foreground">
                {barCodeToView || "Không có mã"}
              </code>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(barCodeToView);
                toast.success("Đã sao chép mã sản phẩm!");
              }}
              variant="outline"
            >
              Sao chép
            </Button>
            <Button onClick={() => setBarCodeViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Product Active Dialog */}
      <Dialog open={toggleProductDialogOpen} onOpenChange={setToggleProductDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {productToToggle?.isActive ? "Tạm ngừng hoạt động sản phẩm" : "Kích hoạt sản phẩm"}
            </DialogTitle>
            <DialogDescription>
              {productToToggle?.isActive ? (
                <>
                  Bạn có chắc chắn muốn tạm ngừng hoạt động sản phẩm <strong>"{productToToggle?.productName}"</strong>? 
                  Sản phẩm sẽ không thể tiếp tục hoạt động sau khi được tạm ngừng.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn kích hoạt sản phẩm <strong>"{productToToggle?.productName}"</strong>? 
                  Sản phẩm sẽ được kích hoạt và có thể tiếp tục hoạt động.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToggleProductDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={confirmToggleProductActive}>
              {productToToggle?.isActive ? "Tạm ngừng" : "Kích hoạt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Category Active Dialog */}
      <Dialog open={toggleCategoryDialogOpen} onOpenChange={setToggleCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {categoryToToggle?.isActive ? "Tạm ngừng hoạt động danh mục" : "Kích hoạt danh mục"}
            </DialogTitle>
            <DialogDescription>
              {categoryToToggle?.isActive ? (
                <>
                  Bạn có chắc chắn muốn tạm ngừng hoạt động danh mục <strong>"{categoryToToggle?.categoryName}"</strong>? 
                  Danh mục sẽ không thể tiếp tục hoạt động sau khi được tạm ngừng.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn kích hoạt danh mục <strong>"{categoryToToggle?.categoryName}"</strong>? 
                  Danh mục sẽ được kích hoạt và có thể tiếp tục hoạt động.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToggleCategoryDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={confirmToggleCategoryActive}>
              {categoryToToggle?.isActive ? "Tạm ngừng" : "Kích hoạt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
