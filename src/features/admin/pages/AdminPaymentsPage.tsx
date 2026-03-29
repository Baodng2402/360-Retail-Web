import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { superAdminSaasApi } from "@/shared/lib/superAdminSaasApi";
import { formatVnd } from "@/shared/utils/formatMoney";
import { JsonViewerDialog } from "@/shared/components/JsonViewerDialog";
import { Loader2, Receipt } from "lucide-react";

const getStr = (o: Record<string, unknown>, keys: string[]) => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim() !== "") return v;
  }
  return "";
};

const getNum = (o: Record<string, unknown>, keys: string[]) => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  }
  return 0;
};

const toIsoFromDateInput = (date: string, endOfDay = false) => {
  if (!date) return undefined;
  const time = endOfDay ? "T23:59:59.999" : "T00:00:00.000";
  return new Date(`${date}${time}`).toISOString();
};

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);

  const [status, setStatus] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
   const [q, setQ] = useState("");
   const [page, setPage] = useState(1);
   const pageSize = 10;
  const [rawOpen, setRawOpen] = useState(false);
  const [rawTitle, setRawTitle] = useState("Raw JSON");
  const [rawValue, setRawValue] = useState<unknown>(null);

  const query = useMemo(() => {
    const from = toIsoFromDateInput(fromDate, false);
    const to = toIsoFromDateInput(toDate, true);
    return { from, to };
  }, [fromDate, toDate]);

  const load = async () => {
    try {
      setLoading(true);
      const list = await superAdminSaasApi.listDashboardPayments({
        status: status === "all" ? undefined : status,
        from: query.from,
        to: query.to,
      });
      setItems(list);
    } catch (err) {
      console.error("Failed to load payments:", err);
      toast.error("Không tải được danh sách payments.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 30);
    setFromDate(from.toISOString().slice(0, 10));
    setToDate(now.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (!fromDate || !toDate) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, fromDate, toDate]);

  const rows = useMemo(() => {
    const base = items.map((x) => {
      const o = x as Record<string, unknown>;
      const id = getStr(o, ["id", "paymentId", "payment_id"]);
      const storeName = getStr(o, ["storeName", "store_name", "store"]);
      const planName = getStr(o, ["planName", "plan_name", "plan"]);
      const st = getStr(o, ["status"]);
      const amount = getNum(o, ["amount", "totalAmount", "total_amount"]);
      const createdAt = getStr(o, ["createdAt", "created_at", "paymentDate", "paidAt"]);
      return { raw: o, id, storeName, planName, status: st, amount, createdAt };
    });

    const term = q.trim().toLowerCase();
    if (!term) return base;
    return base.filter((r) => {
      return (
        r.id.toLowerCase().includes(term) ||
        r.storeName.toLowerCase().includes(term) ||
        r.planName.toLowerCase().includes(term) ||
        (r.status ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, q]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize) || 1);
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [status, fromDate, toDate, q]);

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
        <Card className="p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/20">
                  SuperAdmin
                </Badge>
                <span className="text-sm text-muted-foreground">Payments (list)</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">From</div>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-background/80 backdrop-blur-sm" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">To</div>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-background/80 backdrop-blur-sm" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Status</div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                    <SelectValue placeholder="Chọn..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Tìm kiếm</div>
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo store, plan, id..."
                  className="bg-background/80 backdrop-blur-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => void load()}
                  className="w-full bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Làm mới"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#FF7B21]" />
              Danh sách payments
            </h3>
            <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
              {rows.length.toLocaleString()}
            </Badge>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : rows.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Không có dữ liệu.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#FF7B21]/5 to-[#19D6C8]/5">
                      <TableHead>Store</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Created/Paid</TableHead>
                      <TableHead className="text-right">Raw</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedRows.map((r, index) => (
                      <motion.tr
                        key={r.id || JSON.stringify(r.raw)}
                        className="border-b last:border-0 hover:bg-gradient-to-r hover:from-[#FF7B21]/5 hover:to-transparent transition-all duration-200"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                      >
                        <TableCell className="max-w-[240px] truncate">
                          <div className="font-medium">{r.storeName || "—"}</div>
                          <div className="text-xs text-muted-foreground truncate">{r.id || "—"}</div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{r.planName || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={r.status === "Completed" ? "border-emerald-500/50 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : r.status === "Failed" ? "border-red-500/50 text-red-600 bg-red-50 dark:bg-red-950/30" : ""}>
                            {r.status || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatVnd(r.amount ?? 0)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {r.createdAt || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                            onClick={() => {
                              setRawTitle(`Payment raw: ${r.id || "—"}`);
                              setRawValue(r.raw);
                              setRawOpen(true);
                            }}
                          >
                            Raw
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {!loading && rows.length > 0 && (
        <motion.div
          className="flex items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div>
            Hiển thị{" "}
            <span className="font-semibold">
              {pagedRows.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>{" "}
            -{" "}
            <span className="font-semibold">
              {(page - 1) * pageSize + pagedRows.length}
            </span>{" "}
            trong <span className="font-semibold">{rows.length}</span> payments
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trang trước
            </Button>
            <span>
              Trang <span className="font-semibold">{page}</span> /{" "}
              <span className="font-semibold">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Trang sau
            </Button>
          </div>
        </motion.div>
      )}

      <JsonViewerDialog
        open={rawOpen}
        onOpenChange={setRawOpen}
        title={rawTitle}
        value={rawValue}
      />
    </motion.div>
  );
}

