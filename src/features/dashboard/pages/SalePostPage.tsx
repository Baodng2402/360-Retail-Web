import { useState, useEffect, useCallback } from "react";
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
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Package,
  Trash2,
  Edit,
  DollarSign,
  TrendingUp,
  Barcode,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import toast from "react-hot-toast";
import { productsApi } from "@/shared/lib/productsApi";
import { ordersApi } from "@/shared/lib/ordersApi";
import { storesApi } from "@/shared/lib/storesApi";
import { salesDashboardApi } from "@/shared/lib/salesDashboardApi";
import { inventoryApi } from "@/shared/lib/inventoryApi";
import type { TopProduct } from "@/shared/lib/salesDashboardApi";
import { useStoreStore } from "@/shared/store/storeStore";
import type { Product } from "@/shared/types/products";
import AddProductModal from "@/features/dashboard/components/modals/AddProductModal";
import StoreSelector from "@/features/dashboard/components/StoreSelector";
import { useDashboardEventsStore } from "@/shared/store/dashboardEventsStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type ProductVariantDisplay = {
  id?: string;
  variantName?: string;
  size?: string;
  color?: string;
  stockQuantity?: number;
  priceOverride?: number;
};

type ProductDisplay = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode: string;
  image: string;
  hasVariants?: boolean;
  variants?: ProductVariantDisplay[];
};

interface CartItem {
  product: ProductDisplay;
  quantity: number;
  productVariantId?: string;
}

const SalePostPage = () => {
  const { t } = useTranslation(["sale"]);
  const { currentStore } = useStoreStore();
  const navigate = useNavigate();
  const emitOrderCreated = useDashboardEventsStore(
    (state) => state.emitOrderCreated,
  );
  const [activeTab, setActiveTab] = useState("pos");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [showStockModal, setShowStockModal] = useState(false);
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDisplay | null>(
    null,
  );
  const [stockOperation, setStockOperation] = useState<"in" | "out">("in");
  const [stockAmount, setStockAmount] = useState("");
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [reportProducts, setReportProducts] = useState<
    { product: string; sold: number; revenue: number }[]
  >([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [removeLastConfirmOpen, setRemoveLastConfirmOpen] = useState(false);
  const [pendingRemoveProductId, setPendingRemoveProductId] = useState<string | null>(null);
  const [variantPickerProduct, setVariantPickerProduct] = useState<ProductDisplay | null>(null);
  const [variantQuantity, setVariantQuantity] = useState(1);
  const pendingRemoveProductName =
    pendingRemoveProductId
      ? cart.find((c) => cartItemKey(c) === pendingRemoveProductId)?.product
          .name
      : null;

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      let storeId = currentStore?.id;

      if (!storeId) {
        try {
          const myStore = await storesApi.getMyStore();
          storeId = myStore.id;
        } catch {
          setProducts([]);
          toast.error(
            t("sale:toasts.noStore"),
          );
          return;
        }
      }

      const allProducts = await productsApi.getProducts({
        storeId,
        includeInactive: false,
      });
      const transformed = transformProducts(allProducts);
      setProducts(transformed);
      if (transformed.length > 0) {
        setSelectedProduct(transformed[0]);
      } else {
        setSelectedProduct(null);
      }
    } catch (error: unknown) {
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
          t("sale:toasts.noStore"),
        );
      } else if (isCategoryError) {
        toast.error(
          t("sale:toasts.needCategoryFirst"),
        );
      } else {
        toast.error(
          msg || t("sale:toasts.loadProductsError"),
        );
      }
      setProducts([]);
      setSelectedProduct(null);
    } finally {
      setLoading(false);
    }
  }, [currentStore?.id]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setReportLoading(true);
        // Với Trial, endpoint dashboard/top-products có thể trả FeatureNotAvailable.
        // Đánh dấu silentOnFeatureGate để không bật modal nâng cấp khi chỉ đang ở trang Sales & POS.
        const top = await salesDashboardApi.getTopProducts(
          { top: 10 },
          { silentOnFeatureGate: true },
        );
        const mapped = top.map((p: TopProduct) => ({
          product: p.productName,
          sold: p.quantitySold,
          revenue: p.revenue,
        }));
        setReportProducts(mapped);
      } catch (err) {
        console.error("Failed to load top products for reports tab:", err);
        setReportProducts([]);
      } finally {
        setReportLoading(false);
      }
    };
    void loadReports();
  }, []);

  const transformProducts = (apiProducts: Product[]): ProductDisplay[] => {
    return apiProducts.map((p) => {
      const hasVariants = p.hasVariants || (p.variants && p.variants.length > 0);
      const variantStock = (p.variants ?? []).reduce(
        (sum, v) => sum + (v.stockQuantity ?? 0),
        0,
      );
      const stock =
        p.totalStock ??
        (hasVariants ? variantStock : undefined) ??
        p.stockQuantity ??
        0;
      return {
        id: p.id,
        name: p.productName,
        category: p.categoryName || t("sale:misc.uncategorized"),
        price: p.price,
        stock,
        barcode: p.barCode || "",
        image: p.imageUrl || "📦",
        hasVariants: hasVariants || undefined,
        variants: p.variants?.map((v) => ({
          id: v.id,
          variantName: v.variantName,
          size: v.size,
          color: v.color,
          stockQuantity: v.stockQuantity,
          priceOverride: v.priceOverride,
        })),
      };
    });
  };

  const isImageUrl = (str: string): boolean => {
    if (!str || typeof str !== "string") return false;
    return (
      str.startsWith("http://") ||
      str.startsWith("https://") ||
      str.startsWith("/")
    );
  };

  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => new Set(prev).add(productId));
  };

  const renderProductImage = (
    productId: string,
    image: string,
    size: "sm" | "md" | "lg" = "md",
  ) => {
    const hasError = imageErrors.has(productId);
    const isUrl = isImageUrl(image);

    const imageClasses = {
      sm: "w-10 h-10 object-cover rounded",
      md: "w-full h-32 object-cover rounded-md",
      lg: "w-16 h-16 object-cover rounded",
    };

    const emojiClasses = {
      sm: "w-10 h-10 text-2xl flex items-center justify-center",
      md: "w-full h-32 text-4xl flex items-center justify-center",
      lg: "w-16 h-16 text-4xl flex items-center justify-center",
    };

    if (isUrl && !hasError) {
      return (
        <img
          src={image}
          alt={t("sale:misc.productAlt")}
          className={imageClasses[size]}
          onError={() => handleImageError(productId)}
        />
      );
    }
    return (
      <span className={emojiClasses[size]}>
        {hasError || !isUrl ? image : "📦"}
      </span>
    );
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const addToCart = (product: ProductDisplay, productVariantId?: string) => {
    const existingItem = cart.find(
      (item) =>
        item.product.id === product.id &&
        (item.productVariantId ?? "") === (productVariantId ?? ""),
    );
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id &&
          (item.productVariantId ?? "") === (productVariantId ?? "")
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        { product, quantity: 1, productVariantId: productVariantId ?? undefined },
      ]);
    }
  };

  const handleProductClick = (product: ProductDisplay) => {
    if (product.stock === 0) return;
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      setVariantPickerProduct(product);
      setVariantQuantity(1);
      return;
    }
    addToCart(product);
  };

  const cartItemKey = (item: CartItem) =>
    `${item.product.id}-${item.productVariantId ?? "base"}`;

  const updateQuantity = (
    productId: string,
    delta: number,
    productVariantId?: string,
  ) => {
    const target = cart.find(
      (i) =>
        i.product.id === productId &&
        (i.productVariantId ?? "") === (productVariantId ?? ""),
    );
    if (!target) return;

    if (delta < 0 && target.quantity <= 1 && cart.length === 1) {
      setPendingRemoveProductId(cartItemKey(target));
      setRemoveLastConfirmOpen(true);
      return;
    }

    setCart(
      cart
        .map((item) =>
          item.product.id === productId &&
          (item.productVariantId ?? "") === (productVariantId ?? "")
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId: string, productVariantId?: string) => {
    const target = cart.find(
      (i) =>
        i.product.id === productId &&
        (i.productVariantId ?? "") === (productVariantId ?? ""),
    );
    if (!target) return;
    if (cart.length === 1) {
      setPendingRemoveProductId(cartItemKey(target));
      setRemoveLastConfirmOpen(true);
      return;
    }
    setCart(
      cart.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (item.productVariantId ?? "") === (productVariantId ?? "")
          ),
      ),
    );
  };

  const getItemUnitPrice = (item: CartItem): number => {
    const v = item.productVariantId
      ? item.product.variants?.find((x) => x.id === item.productVariantId)
      : undefined;
    return v?.priceOverride ?? item.product.price;
  };

  const calculateTotal = () => {
    return cart.reduce(
      (sum, item) => sum + getItemUnitPrice(item) * item.quantity,
      0,
    );
  };

  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      toast.error(t("sale:toasts.cartEmpty"));
      return;
    }

    try {
      const _storeId =
        currentStore?.id || (await storesApi.getMyOwnedStores())[0]?.id;
      void _storeId;

      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        productVariantId: item.productVariantId,
      }));

      const orderId = await ordersApi.createOrder({
        customerId: selectedCustomer || undefined,
        paymentMethod: "Cash",
        discountAmount: 0,
        items: orderItems,
      });

      emitOrderCreated(orderId);
      toast.success(t("sale:toasts.orderCreated"));
      setCart([]);
      setSelectedCustomer("");
      if (orderId) {
        navigate(`/dashboard/orders/${orderId}`);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error(t("sale:toasts.orderCreateFailed"));
    }
  };

  const handleStockOperation = async () => {
    if (!selectedProduct || !stockAmount || Number(stockAmount) <= 0) {
      toast.error(t("sale:toasts.invalidQuantity"));
      return;
    }

    try {
      // Tạo phiếu kho
      const ticketId = await inventoryApi.createTicket({
        type: stockOperation === "in" ? "Import" : "Export",
        note: `${stockOperation === "in" ? "Nhập" : "Xuất"} kho: ${selectedProduct.name}`,
        items: [
          {
            productId: selectedProduct.id,
            quantity: Number(stockAmount),
            productVariantId: undefined,
          },
        ],
      });

      // Confirm phiếu kho để cập nhật tồn kho
      await inventoryApi.confirmTicket(ticketId);

      toast.success(
        stockOperation === "in"
          ? t("sale:toasts.stockInSuccess")
          : t("sale:toasts.stockOutSuccess"),
      );

      // Reload products để cập nhật số tồn
      await loadProducts();

      setShowStockModal(false);
      setStockAmount("");
      setSelectedProduct(null);
    } catch (error) {
      console.error("Stock operation failed:", error);
      toast.error(
        t("sale:toasts.stockOperationFailed") ||
          "Không thể thực hiện thao tác kho",
      );
    }
  };

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription={t("sale:page.storeSelectorHint")} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pos">{t("sale:tabs.pos")}</TabsTrigger>
          <TabsTrigger value="inventory">
            {t("sale:tabs.inventory")}
          </TabsTrigger>
          <TabsTrigger value="reports">{t("sale:tabs.reports")}</TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("sale:search.placeholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Barcode className="h-4 w-4 mr-2" />
                    {t("sale:actions.scan")}
                  </Button>
                </div>

                <ScrollArea className="h-[600px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                      {t("sale:states.loadingProducts")}
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <Package className="h-14 w-14 text-muted-foreground mb-4" />
                      <p className="font-medium text-foreground mb-1">
                        {t("sale:states.noProductsTitle")}
                      </p>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        {t("sale:states.noProductsBody")}
                      </p>
                      <Button
                        className="mt-4"
                        variant="outline"
                        onClick={() => setAddProductModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("sale:actions.addProduct")}
                      </Button>
                    </div>
                  ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className={`p-4 transition-all group ${
                          product.stock === 0
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:shadow-lg cursor-pointer"
                        }`}
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="mb-3 text-center min-h-[128px] flex items-center justify-center">
                          {renderProductImage(product.id, product.image, "md")}
                        </div>
                        <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                          {product.name}
                        </h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">
                            {product.category}
                          </span>
                          <Badge
                            variant={
                              product.stock === 0
                                ? "destructive"
                                : product.stock < 10
                                  ? "secondary"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {product.stock === 0
                              ? t("sale:misc.outOfStock", { defaultValue: "Hết hàng" })
                              : t("sale:misc.left", { count: product.stock })}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">
                            {product.price.toLocaleString("vi-VN")} ₫
                          </span>
                          <Button
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  )}
                </ScrollArea>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-20">
                <div className="flex items-center gap-2 mb-6">
                  <ShoppingCart className="h-5 w-5" />
                  <h3 className="text-lg font-bold">{t("sale:cart.title")}</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {t("sale:cart.itemsCount", { count: cart.length })}
                  </Badge>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {t("sale:cart.empty")}
                    </p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[300px] mb-4">
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div
                            key={cartItemKey(item)}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                          >
                            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                              {renderProductImage(
                                item.product.id,
                                item.product.image,
                                "sm",
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {item.product.name}
                                {item.productVariantId &&
                                  (() => {
                                    const v = item.product.variants?.find(
                                      (x) => x.id === item.productVariantId,
                                    );
                                    return v
                                      ? ` (${[v.size, v.color]
                                          .filter(Boolean)
                                          .join(" / ") || v.variantName || "Biến thể"})`
                                      : "";
                                  })()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(item.product.variants?.find(
                                  (x) => x.id === item.productVariantId,
                                )?.priceOverride ?? item.product.price).toLocaleString(
                                  "vi-VN",
                                )}{" "}
                                ₫
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    -1,
                                    item.productVariantId,
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-6 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    1,
                                    item.productVariantId,
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() =>
                                removeFromCart(
                                  item.product.id,
                                  item.productVariantId,
                                )
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-xs">{t("sale:cart.customerLabel")}</Label>
                        <Input
                          placeholder={t("sale:cart.customerPlaceholder")}
                          value={selectedCustomer}
                          onChange={(e) => setSelectedCustomer(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>{t("sale:cart.total")}:</span>
                        <span className="text-primary">
                          {calculateTotal().toLocaleString("vi-VN")} ₫
                        </span>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCompleteOrder}
                      >
                        <DollarSign className="h-5 w-5 mr-2" />
                        {t("sale:actions.completeOrder")}
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                {t("sale:inventory.title")}
              </h3>
              <Button
                onClick={() => setAddProductModalOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("sale:actions.addProduct")}
              </Button>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("sale:table.product")}</TableHead>
                    <TableHead>{t("sale:table.category")}</TableHead>
                    <TableHead>{t("sale:table.price")}</TableHead>
                    <TableHead className="text-center">
                      {t("sale:table.stock")}
                    </TableHead>
                    <TableHead>{t("sale:table.barcode")}</TableHead>
                    <TableHead className="text-right">{t("sale:table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                            {renderProductImage(
                              product.id,
                              product.image,
                              "sm",
                            )}
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="font-medium">
                        {product.price.toLocaleString("vi-VN")} ₫
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            product.stock < 10 ? "destructive" : "secondary"
                          }
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.barcode}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product);
                              setStockOperation("in");
                              setShowStockModal(true);
                            }}
                          >
                            {t("sale:actions.stockIn")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product);
                              setStockOperation("out");
                              setShowStockModal(true);
                            }}
                          >
                            {t("sale:actions.stockOut")}
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-lg font-bold">
                {t("sale:reports.title")}
              </h3>
            </div>

            {reportLoading ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                {t("sale:states.loadingBestSelling")}
              </div>
            ) : reportProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("sale:states.noReportData")}
              </p>
            ) : (
              <>
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="product" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number, name: string) =>
                          name === "sold"
                            ? [value, t("sale:reports.sold")]
                            : [`${value.toLocaleString("vi-VN")} ₫`, t("sale:reports.revenue")]
                        }
                      />
                      <Legend />
                      <Bar dataKey="sold" fill="#007BFF" name={t("sale:reports.quantityLegend")} />
                      <Bar dataKey="revenue" fill="#28a745" name={t("sale:reports.revenueLegend")} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("sale:table.product")}</TableHead>
                        <TableHead className="text-right">
                          {t("sale:reports.quantitySold")}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("sale:reports.revenue")}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("sale:reports.avgPrice")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportProducts.map((item) => (
                        <TableRow key={item.product}>
                          <TableCell className="font-medium">
                            {item.product}
                          </TableCell>
                          <TableCell className="text-right">{item.sold}</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.revenue.toLocaleString("vi-VN")} ₫
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.sold > 0
                              ? Math.round(item.revenue / item.sold).toLocaleString(
                                  "vi-VN",
                                )
                              : "-"}{" "}
                            ₫
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockOperation === "in"
                ? t("sale:stock.stockInTitle")
                : t("sale:stock.stockOutTitle")}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct ? selectedProduct.name : t("sale:stock.noProductSelected")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedProduct && (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                  {renderProductImage(
                    selectedProduct.id,
                    selectedProduct.image,
                    "lg",
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("sale:stock.currentStock", { stock: selectedProduct.stock })}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="stock-amount">
                {t("sale:stock.amountLabel", {
                  mode: stockOperation === "in" ? t("sale:actions.stockIn") : t("sale:actions.stockOut"),
                })}
              </Label>
              <Input
                id="stock-amount"
                type="number"
                placeholder={t("sale:stock.amountPlaceholder")}
                value={stockAmount}
                onChange={(e) => setStockAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockModal(false)}>
              {t("sale:actions.cancel")}
            </Button>
            <Button onClick={handleStockOperation}>
              <Package className="h-4 w-4 mr-2" />
              {t("sale:actions.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddProductModal
        open={addProductModalOpen}
        onOpenChange={setAddProductModalOpen}
        storeId={currentStore?.id}
        onSuccess={() => void loadProducts()}
      />

      <Dialog
        open={!!variantPickerProduct}
        onOpenChange={(open) => !open && setVariantPickerProduct(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {variantPickerProduct?.name} – {t("sale:misc.chooseVariant", { defaultValue: "Chọn biến thể" })}
            </DialogTitle>
            <DialogDescription>
              {t("sale:misc.chooseVariantHint", {
                defaultValue: "Chọn một biến thể để thêm vào giỏ.",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-xs">
                  {t("sale:misc.quantity", { defaultValue: "Số lượng" })}
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={variantQuantity}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setVariantQuantity(Number.isFinite(n) ? Math.max(1, n) : 1);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setVariantQuantity(1)}
              >
                Reset
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
            {variantPickerProduct?.variants?.map((v) => {
              const inStock = (v.stockQuantity ?? 0) > 0;
              return (
                <Button
                  key={v.id ?? `${v.size}-${v.color}`}
                  variant="outline"
                  className="w-full justify-between h-auto py-3"
                  disabled={!inStock}
                  onClick={() => {
                    if (!variantPickerProduct || !v.id) return;
                    for (let i = 0; i < Math.max(1, variantQuantity); i += 1) {
                      addToCart(variantPickerProduct, v.id);
                    }
                    setVariantPickerProduct(null);
                  }}
                >
                  <span>
                    {[v.variantName, v.size, v.color].filter(Boolean).join(" / ") || "Biến thể"}
                    {v.priceOverride != null && (
                      <span className="ml-2 text-muted-foreground">
                        {v.priceOverride.toLocaleString("vi-VN")} ₫
                      </span>
                    )}
                  </span>
                  <Badge variant={inStock ? "secondary" : "destructive"}>
                    {inStock
                      ? t("sale:misc.left", { count: v.stockQuantity ?? 0 })
                      : t("sale:misc.outOfStock", { defaultValue: "Hết" })}
                  </Badge>
                </Button>
              );
            })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={removeLastConfirmOpen}
        onOpenChange={(open) => {
          setRemoveLastConfirmOpen(open);
          if (!open) setPendingRemoveProductId(null);
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t("sale:confirmRemoveLast.title")}</DialogTitle>
            <DialogDescription>
              {t("sale:confirmRemoveLast.description", {
                name: pendingRemoveProductName ? `(${pendingRemoveProductName})` : "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRemoveLastConfirmOpen(false);
                setPendingRemoveProductId(null);
              }}
            >
              {t("sale:confirmRemoveLast.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingRemoveProductId) {
                  setCart((prev) =>
                    prev.filter(
                      (i) => cartItemKey(i) !== pendingRemoveProductId,
                    ),
                  );
                }
                setRemoveLastConfirmOpen(false);
                setPendingRemoveProductId(null);
              }}
            >
              {t("sale:confirmRemoveLast.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalePostPage;
