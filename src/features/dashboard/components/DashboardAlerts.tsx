import { Box, AlertTriangle } from "lucide-react";
import type { Product } from "@/shared/types/products";
import { formatVnd } from "@/shared/utils/formatMoney";
import { motion } from "motion/react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

interface DashboardAlertsProps {
  lowStockProducts: Product[];
  onRestockClick: (product: {
    name: string;
    image: string;
    stock: number;
  }) => void;
}

const DashboardAlerts = ({
  lowStockProducts,
  onRestockClick,
}: DashboardAlertsProps) => {
  return (
    <Card className="p-5 md:p-6 xl:sticky xl:top-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <h3 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
            Alerts & Warnings
          </h3>
          <span className="text-sm text-muted-foreground">
            Cảnh báo cần xử lý
          </span>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Low Stock Section */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FF7B21] to-[#FF9F45] rounded-lg flex items-center justify-center">
            <Box className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm md:text-base">
            Low Stock / Tồn kho thấp
          </span>
        </div>
        {lowStockProducts.length === 0 ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              Tất cả sản phẩm đều có đủ hàng
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {lowStockProducts.slice(0, 5).map((p, index) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-all duration-300 hover:shadow-lg ${
                  p.stockQuantity <= 3
                    ? "bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20 dark:from-red-500/10 dark:to-red-500/20"
                    : "bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20 dark:from-amber-500/10 dark:to-amber-500/20"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">
                    {p.productName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Còn {p.stockQuantity} sản phẩm
                    {p.price ? ` • ${formatVnd(p.price)}` : ""}
                  </span>
                </div>
                <Button
                  onClick={() =>
                    onRestockClick({
                      name: p.productName,
                      image: p.imageUrl || "📦",
                      stock: p.stockQuantity,
                    })
                  }
                  variant="gradient"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  Restock
                </Button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* Feedback Section */}
      <div className="flex flex-col gap-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm md:text-base">
            Negative Feedback / Phản hồi tiêu cực
          </span>
        </div>
        <p className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-4">
          API phản hồi khách hàng chưa có sẵn. Tính năng đang phát triển.
        </p>
      </div>
    </Card>
  );
};

export default DashboardAlerts;
