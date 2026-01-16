import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import AddProductModal from "@/features/dashboard/components/modals/AddProductModal";

// Mock Products Data
const mockProducts = [
  {
    id: "1",
    name: "Áo thun nam cổ tròn",
    category: "Apparel",
    price: 250000,
    stock: 45,
    barcode: "8934567890123",
    image: "👕",
  },
  {
    id: "2",
    name: "Quần jean nam slim fit",
    category: "Apparel",
    price: 450000,
    stock: 28,
    barcode: "8934567890124",
    image: "👖",
  },
  {
    id: "3",
    name: "Giày sneaker trắng",
    category: "Footwear",
    price: 680000,
    stock: 15,
    barcode: "8934567890125",
    image: "👟",
  },
  {
    id: "4",
    name: "Áo khoác hoodie",
    category: "Apparel",
    price: 550000,
    stock: 32,
    barcode: "8934567890126",
    image: "🧥",
  },
  {
    id: "5",
    name: "Túi xách nữ",
    category: "Accessories",
    price: 380000,
    stock: 22,
    barcode: "8934567890127",
    image: "👜",
  },
  {
    id: "6",
    name: "Đồng hồ đeo tay",
    category: "Accessories",
    price: 890000,
    stock: 8,
    barcode: "8934567890128",
    image: "⌚",
  },
  {
    id: "7",
    name: "Mũ lưỡi trai",
    category: "Accessories",
    price: 150000,
    stock: 58,
    barcode: "8934567890129",
    image: "🧢",
  },
  {
    id: "8",
    name: "Kính mát",
    category: "Accessories",
    price: 320000,
    stock: 19,
    barcode: "8934567890130",
    image: "🕶️",
  },
];

// Mock Sales Report Data
const salesReportData = [
  { product: "Áo thun", sold: 120, revenue: 30000000 },
  { product: "Quần jean", sold: 98, revenue: 44100000 },
  { product: "Giày sneaker", sold: 85, revenue: 57800000 },
  { product: "Áo khoác", sold: 72, revenue: 39600000 },
  { product: "Túi xách", sold: 55, revenue: 20900000 },
];

interface CartItem {
  product: (typeof mockProducts)[0];
  quantity: number;
}

const SalePostPage = () => {
  const [activeTab, setActiveTab] = useState("pos");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(mockProducts[0]);
  const [stockOperation, setStockOperation] = useState<"in" | "out">("in");
  const [stockAmount, setStockAmount] = useState("");
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: (typeof mockProducts)[0]) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const handleCompleteOrder = () => {
    console.log("Order completed:", {
      cart,
      customer: selectedCustomer,
      total: calculateTotal(),
    });
    setCart([]);
    setSelectedCustomer("");
    alert("Đơn hàng đã được tạo thành công!");
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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Sales & POS</h1>
        <p className="text-muted-foreground">Bán hàng & Quản lý kho</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pos">POS / Bán hàng</TabsTrigger>
          <TabsTrigger value="inventory">Inventory / Kho</TabsTrigger>
          <TabsTrigger value="reports">Reports / Báo cáo</TabsTrigger>
        </TabsList>

        {/* POS Tab */}
        <TabsContent value="pos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Grid */}
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="p-4 hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => addToCart(product)}
                      >
                        <div className="text-4xl mb-3 text-center">
                          {product.image}
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
                </ScrollArea>
              </Card>
            </div>

            {/* Shopping Cart */}
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
                            <div className="text-2xl">{item.product.image}</div>
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

        {/* Inventory Tab */}
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
                  {mockProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{product.image}</span>
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

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-lg font-bold">
                Best Selling Products / Sản phẩm bán chạy
              </h3>
            </div>

            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesReportData}>
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
                  {salesReportData.map((item) => (
                    <TableRow key={item.product}>
                      <TableCell className="font-medium">
                        {item.product}
                      </TableCell>
                      <TableCell className="text-right">{item.sold}</TableCell>
                      <TableCell className="text-right font-medium">
                        {item.revenue.toLocaleString("vi-VN")} ₫
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {Math.round(item.revenue / item.sold).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        ₫
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Operation Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockOperation === "in"
                ? "Stock In / Nhập kho"
                : "Stock Out / Xuất kho"}
            </DialogTitle>
            <DialogDescription>{selectedProduct.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{selectedProduct.image}</span>
              <div className="flex-1">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground">
                  Current stock: {selectedProduct.stock}
                </p>
              </div>
            </div>
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

      {/* Add Product Modal */}
      <AddProductModal
        open={addProductModalOpen}
        onOpenChange={setAddProductModalOpen}
      />
    </div>
  );
};

export default SalePostPage;
