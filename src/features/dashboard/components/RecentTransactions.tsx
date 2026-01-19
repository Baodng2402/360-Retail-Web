import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

type TransactionType = "sale" | "return" | "refund";

interface Transaction {
  id: string;
  type: TransactionType;
  customer: string;
  amount: number;
  time: string;
  staff: string;
  items: number;
}

const mockTransactions: Transaction[] = [
  {
    id: "TXN-001",
    type: "sale",
    customer: "Nguyễn Văn A",
    amount: 450000,
    time: "10 phút trước",
    staff: "Trần Thị B",
    items: 3,
  },
  {
    id: "TXN-002",
    type: "sale",
    customer: "Lê Thị C",
    amount: 890000,
    time: "25 phút trước",
    staff: "Phạm Văn D",
    items: 2,
  },
  {
    id: "TXN-003",
    type: "return",
    customer: "Hoàng Văn E",
    amount: 250000,
    time: "1 giờ trước",
    staff: "Trần Thị B",
    items: 1,
  },
  {
    id: "TXN-004",
    type: "sale",
    customer: "Vũ Thị F",
    amount: 1250000,
    time: "2 giờ trước",
    staff: "Nguyễn Văn G",
    items: 5,
  },
  {
    id: "TXN-005",
    type: "refund",
    customer: "Đinh Văn H",
    amount: 180000,
    time: "3 giờ trước",
    staff: "Phạm Văn D",
    items: 1,
  },
];

const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case "sale":
      return (
        <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
      );
    case "return":
      return (
        <ArrowDownLeft className="w-4 h-4 text-orange-600 dark:text-orange-400" />
      );
    case "refund":
      return <RefreshCw className="w-4 h-4 text-red-600 dark:text-red-400" />;
  }
};

const getTransactionBadge = (type: TransactionType) => {
  switch (type) {
    case "sale":
      return (
        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-green-500/20">
          Sale
        </Badge>
      );
    case "return":
      return (
        <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 border-orange-500/20">
          Return
        </Badge>
      );
    case "refund":
      return (
        <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border-red-500/20">
          Refund
        </Badge>
      );
  }
};

const RecentTransactions = () => {
  return (
    <div className="w-full border border-border rounded-md p-4 md:p-6 bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex flex-col">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">
            Recent Transactions
          </h3>
          <span className="text-sm text-muted-foreground">
            Giao dịch gần đây
          </span>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all shadow-sm text-sm">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {mockTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 rounded-xl bg-accent/50 hover:bg-accent transition-colors cursor-pointer border border-border"
          >
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <div className="p-2 bg-background rounded-lg border border-border flex-shrink-0">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-foreground truncate">
                    {transaction.customer}
                  </span>
                  {getTransactionBadge(transaction.type)}
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-xs text-muted-foreground flex-wrap">
                  <span>{transaction.time}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    {transaction.items} items
                  </span>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline truncate">
                    By {transaction.staff}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`font-bold text-sm md:text-base ${
                  transaction.type === "sale"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {transaction.type === "sale" ? "+" : "-"}
                {transaction.amount.toLocaleString("vi-VN")} ₫
              </span>
              <span className="text-xs text-muted-foreground">
                {transaction.id}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
