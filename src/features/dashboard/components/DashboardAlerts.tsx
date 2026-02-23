import { Box } from "lucide-react";
import type { Product } from "@/shared/types/products";
import { formatVnd } from "@/shared/utils/formatMoney";

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
    <div className="w-full border border-border rounded-md p-4 md:p-6 bg-card xl:sticky xl:top-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">
            Alerts & Warnings
          </h3>
          <span className="text-sm text-muted-foreground">
            Cảnh báo cần xử lý
          </span>
        </div>
        <div className="p-2 bg-destructive/10 rounded-lg">
          <svg
            className="w-6 h-6 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Box className="w-5 h-5" />
          <span className="text-sm md:text-base">
            Low Stock / Tồn kho thấp
          </span>
        </div>
        {lowStockProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Không có sản phẩm nào tồn kho thấp
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {lowStockProducts.slice(0, 5).map((p) => (
              <li
                key={p.id}
                className={`p-3 md:p-4 rounded-xl border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 ${
                  p.stockQuantity <= 3
                    ? "bg-destructive/10 border-destructive/20"
                    : "bg-yellow-500/10 dark:bg-yellow-500/20 border-yellow-500/30"
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
                <button
                  onClick={() =>
                    onRestockClick({
                      name: p.productName,
                      image: p.imageUrl || "📦",
                      stock: p.stockQuantity,
                    })
                  }
                  className="px-4 md:px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-semibold rounded-full transition-all shadow-sm whitespace-nowrap"
                >
                  Restock
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-4">
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
        <p className="text-sm text-muted-foreground">
          API phản hồi khách hàng chưa có sẵn. Tính năng đang phát triển.
        </p>
      </div>
    </div>
  );
};

export default DashboardAlerts;
