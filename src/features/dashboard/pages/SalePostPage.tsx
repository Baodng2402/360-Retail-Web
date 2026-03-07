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
import type { TopProduct } from "@/shared/lib/salesDashboardApi";
import { useStoreStore } from "@/shared/store/storeStore";
import type { Product } from "@/shared/types/products";
import AddProductModal from "@/features/dashboard/components/modals/AddProductModal";
import StoreSelector from "@/features/dashboard/components/StoreSelector";
import { useDashboardEventsStore } from "@/shared/store/dashboardEventsStore";
import { useNavigate } from "react-router-dom";

type ProductDisplay = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode: string;
  image: string;
};

interface CartItem {
  product: ProductDisplay;
  quantity: number;
}

const SalePostPage = () => {
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
  const pendingRemoveProductName =
    pendingRemoveProductId
      ? cart.find((c) => c.product.id === pendingRemoveProductId)?.product.name
      : null;

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      let storeId = currentStore?.id;

      if (!storeId) {
        try {
          const myStore = await storesApi.getMyStore();
          storeId = myStore.id;
        } catch (storeError) {
          setProducts([]);
          toast.error(
            "Chưa có cửa hàng. Vui lòng đăng nhập lại hoặc bắt đầu dùng thử để gán store.",
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
          "Chưa có cửa hàng. Vui lòng đăng nhập lại hoặc bắt đầu dùng thử để gán store.",
        );
      } else if (isCategoryError) {
        toast.error(
          "Vui lòng tạo ít nhất một danh mục trước khi thêm sản phẩm.",
        );
      } else {
        toast.error(
          msg || "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.",
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
    return apiProducts.map((p) => ({
      id: p.id,
      name: p.productName,
      category: p.categoryName || "Uncategorized",
      price: p.price,
      stock: p.stockQuantity,
      barcode: p.barCode || "",
      image: p.imageUrl || "📦",
    }));
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
          alt="Product"
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

  const addToCart = (product: ProductDisplay) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const target = cart.find((i) => i.product.id === productId);
    if (!target) return;

    // Nếu user giảm về 0 và đây là sản phẩm cuối cùng trong giỏ -> hỏi xác nhận
    if (delta < 0 && target.quantity <= 1 && cart.length === 1) {
      setPendingRemoveProductId(productId);
      setRemoveLastConfirmOpen(true);
      return;
    }

    setCart(
      cart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    if (cart.length === 1) {
      setPendingRemoveProductId(productId);
      setRemoveLastConfirmOpen(true);
      return;
    }
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  };

  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    try {
      const _storeId =
        currentStore?.id || (await storesApi.getMyOwnedStores())[0]?.id;
      void _storeId;

      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        productVariantId: undefined as string | undefined,
      }));

      const orderId = await ordersApi.createOrder({
        customerId: selectedCustomer || undefined,
        paymentMethod: "Cash",
        discountAmount: 0,
        items: orderItems,
      });

      emitOrderCreated(orderId);
      toast.success("Đơn hàng đã được tạo thành công!");
      setCart([]);
      setSelectedCustomer("");
      if (orderId) {
        navigate(`/dashboard/orders/${orderId}`);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("Không thể tạo đơn hàng. Vui lòng thử lại!");
    }
  };

  const handleStockOperation = () => {
    console.log("Stock operation:", {
      product: selectedProduct,
      operation: stockOperation,
      amount: stockAmount,
    });
    setShowStockModal(false);
    setStockAmount("");
  };

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription="Chuyển đổi để bán hàng cho cửa hàng khác" />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pos">POS / Bán hàng</TabsTrigger>
          <TabsTrigger value="inventory">Inventory / Kho</TabsTrigger>
          <TabsTrigger value="reports">Reports / Báo cáo</TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, barcode / Tìm theo tên, mã vạch..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Barcode className="h-4 w-4 mr-2" />
                    Scan
                  </Button>
                </div>

                <ScrollArea className="h-[600px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                      Đang tải sản phẩm...
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <Package className="h-14 w-14 text-muted-foreground mb-4" />
                      <p className="font-medium text-foreground mb-1">
                        Chưa có sản phẩm
                      </p>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Tạo danh mục (Sản phẩm → Danh mục) rồi thêm sản phẩm để bán hàng.
                      </p>
                      <Button
                        className="mt-4"
                        variant="outline"
                        onClick={() => setAddProductModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm sản phẩm
                      </Button>
                    </div>
                  ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="p-4 hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => addToCart(product)}
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
                              product.stock < 10 ? "destructive" : "secondary"
                            }
                            className="text-xs"
                          >
                            {product.stock} left
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
                  <h3 className="text-lg font-bold">Cart / Giỏ hàng</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {cart.length} items
                  </Badge>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Cart is empty / Giỏ hàng trống
                    </p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[300px] mb-4">
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div
                            key={item.product.id}
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
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.product.price.toLocaleString("vi-VN")} ₫
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6"
                                onClick={() =>
                                  updateQuantity(item.product.id, -1)
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
                                  updateQuantity(item.product.id, 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-xs">Customer / Khách hàng</Label>
                        <Input
                          placeholder="Search customer / Tìm khách..."
                          value={selectedCustomer}
                          onChange={(e) => setSelectedCustomer(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total / Tổng:</span>
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
                        Complete Order / Hoàn tất
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
                Product Inventory / Danh sách sản phẩm
              </h3>
              <Button
                onClick={() => setAddProductModalOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product / Thêm sản phẩm
              </Button>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product / Sản phẩm</TableHead>
                    <TableHead>Category / Danh mục</TableHead>
                    <TableHead>Price / Giá</TableHead>
                    <TableHead className="text-center">
                      Stock / Tồn kho
                    </TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                            Stock In / Nhập
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
                            Stock Out / Xuất
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
                Best Selling Products / Sản phẩm bán chạy
              </h3>
            </div>

            {reportLoading ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Đang tải báo cáo bán chạy...
              </div>
            ) : reportProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có dữ liệu bán hàng đủ để hiển thị báo cáo.
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
                            ? [value, "Sold"]
                            : [`${value.toLocaleString("vi-VN")} ₫`, "Revenue"]
                        }
                      />
                      <Legend />
                      <Bar dataKey="sold" fill="#007BFF" name="Quantity" />
                      <Bar dataKey="revenue" fill="#28a745" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product / Sản phẩm</TableHead>
                        <TableHead className="text-right">
                          Quantity Sold / Số lượng
                        </TableHead>
                        <TableHead className="text-right">
                          Revenue / Doanh thu
                        </TableHead>
                        <TableHead className="text-right">
                          Avg Price / Giá TB
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
                ? "Stock In / Nhập kho"
                : "Stock Out / Xuất kho"}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct ? selectedProduct.name : "No product selected"}
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
                    Current stock: {selectedProduct.stock}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="stock-amount">
                Amount / Số lượng {stockOperation === "in" ? "nhập" : "xuất"}
              </Label>
              <Input
                id="stock-amount"
                type="number"
                placeholder="Enter amount..."
                value={stockAmount}
                onChange={(e) => setStockAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockOperation}>
              <Package className="h-4 w-4 mr-2" />
              Confirm / Xác nhận
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
        open={removeLastConfirmOpen}
        onOpenChange={(open) => {
          setRemoveLastConfirmOpen(open);
          if (!open) setPendingRemoveProductId(null);
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Xóa sản phẩm cuối cùng</DialogTitle>
            <DialogDescription>
              Bạn đang xóa sản phẩm cuối cùng trong giỏ{" "}
              {pendingRemoveProductName ? (
                <>
                  (<strong>{pendingRemoveProductName}</strong>)
                </>
              ) : null}
              . Bạn có chắc muốn tiếp tục?
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
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingRemoveProductId) {
                  setCart((prev) =>
                    prev.filter((i) => i.product.id !== pendingRemoveProductId),
                  );
                }
                setRemoveLastConfirmOpen(false);
                setPendingRemoveProductId(null);
              }}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalePostPage;
