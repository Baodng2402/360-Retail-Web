import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    case "return":
      return <ArrowDownLeft className="w-4 h-4 text-orange-600" />;
    case "refund":
      return <RefreshCw className="w-4 h-4 text-red-600" />;
  }
};

const getTransactionBadge = (type: TransactionType) => {
  switch (type) {
    case "sale":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          Sale
        </Badge>
      );
    case "return":
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
          Return
        </Badge>
      );
    case "refund":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          Refund
        </Badge>
      );
  }
};

const RecentTransactions = () => {
  return (
    <div className="w-full border rounded-md p-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold text-stone-900">
            Recent Transactions
          </h3>
          <span className="text-sm text-stone-500">Giao dịch gần đây</span>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all shadow-sm">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {mockTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer border border-stone-200"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 bg-white rounded-lg border border-stone-200">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-stone-900 truncate">
                    {transaction.customer}
                  </span>
                  {getTransactionBadge(transaction.type)}
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span>{transaction.time}</span>
                  <span>•</span>
                  <span>{transaction.items} items</span>
                  <span>•</span>
                  <span className="truncate">By {transaction.staff}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end ml-4">
              <span
                className={`font-bold ${
                  transaction.type === "sale"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {transaction.type === "sale" ? "+" : "-"}
                {transaction.amount.toLocaleString("vi-VN")} ₫
              </span>
              <span className="text-xs text-stone-400">{transaction.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
