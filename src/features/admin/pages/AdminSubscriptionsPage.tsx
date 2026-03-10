import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { superAdminSaasApi, type SuperAdminPlan } from "@/shared/lib/superAdminSaasApi";
import { Ban, CalendarPlus, Loader2 } from "lucide-react";
import { JsonViewerDialog } from "@/shared/components/JsonViewerDialog";

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

export default function AdminSubscriptionsPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);

  const [plans, setPlans] = useState<SuperAdminPlan[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [planId, setPlanId] = useState<string>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [actionTarget, setActionTarget] = useState<Record<string, unknown> | null>(null);
  const [actionType, setActionType] = useState<"cancel" | "extend" | null>(null);
  const [days, setDays] = useState(30);
  const [acting, setActing] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);
  const [rawTitle, setRawTitle] = useState("Raw JSON");
  const [rawValue, setRawValue] = useState<unknown>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [list, planList] = await Promise.all([
        superAdminSaasApi.listDashboardSubscriptions({
          status: status === "all" ? undefined : status,
          planId: planId === "all" ? undefined : planId,
        }),
        superAdminSaasApi.listPlans().catch(() => []),
      ]);
      setItems(list);
      setPlans(planList);
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
      toast.error("Không tải được danh sách subscriptions.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, planId]);

  const tableRows = useMemo(() => {
    const rows = items.map((x) => {
      const o = x as Record<string, unknown>;
      const id = getStr(o, ["id", "subscriptionId", "subscription_id"]);
      const storeName = getStr(o, ["storeName", "store_name", "store"]);
      const planName = getStr(o, ["planName", "plan_name", "plan"]);
      const st = getStr(o, ["status", "subscriptionStatus"]);
      const startDate = getStr(o, ["startDate", "start_date", "createdAt", "created_at"]);
      const endDate = getStr(o, ["endDate", "end_date", "expiresAt", "expiryDate"]);
      const daysRemaining = getNum(o, ["daysRemaining", "days_remaining"]);
      return { raw: o, id, storeName, planName, status: st, startDate, endDate, daysRemaining };
    });

    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => {
      return (
        r.id.toLowerCase().includes(term) ||
        r.storeName.toLowerCase().includes(term) ||
        r.planName.toLowerCase().includes(term) ||
        (r.status ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, q]);

  const totalPages = Math.max(1, Math.ceil(tableRows.length / pageSize) || 1);
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tableRows.slice(start, start + pageSize);
  }, [tableRows, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [status, planId, q]);

  const openCancel = (o: Record<string, unknown>) => {
    setActionTarget(o);
    setActionType("cancel");
  };

  const openExtend = (o: Record<string, unknown>) => {
    setActionTarget(o);
    setActionType("extend");
    setDays(30);
  };

  const doAction = async () => {
    if (!actionTarget || !actionType) return;
    const id = getStr(actionTarget, ["id", "subscriptionId", "subscription_id"]);
    if (!id) {
      toast.error("Không xác định được subscription id.");
      return;
    }
    try {
      setActing(true);
      if (actionType === "cancel") {
        await superAdminSaasApi.cancelSubscription(id);
        toast.success("Đã huỷ subscription.");
      } else {
        const r = await superAdminSaasApi.extendSubscription(id, Number(days) || 0);
        toast.success(
          r?.newEndDate ? `Đã gia hạn. New end date: ${r.newEndDate}` : "Đã gia hạn subscription.",
        );
      }
      setActionTarget(null);
      setActionType(null);
      await load();
    } catch (err) {
      console.error("Subscription action failed:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        "Thao tác thất bại.";
      toast.error(message);
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                SuperAdmin
              </Badge>
              <span className="text-sm text-muted-foreground">
                Subscriptions (list / cancel / extend)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Status</div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Trial">Trial</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Plan</div>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.planName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Tìm kiếm</div>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo store, plan, id..."
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => void load()}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                disabled={loading}
              >
                {loading ? "Đang tải..." : "Làm mới"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Danh sách subscriptions</h3>
          <Badge variant="outline">{tableRows.length.toLocaleString()}</Badge>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : tableRows.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Không có dữ liệu.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Days left</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((r) => (
                  <TableRow key={r.id || JSON.stringify(r.raw)}>
                    <TableCell className="max-w-[240px] truncate">
                      <div className="font-medium">{r.storeName || "—"}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.id || "—"}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{r.planName || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.status || "—"}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                      {r.startDate || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                      {r.endDate || "—"}
                    </TableCell>
                    <TableCell>{r.daysRemaining ? r.daysRemaining.toLocaleString() : "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => openExtend(r.raw)}
                        >
                          <CalendarPlus className="h-4 w-4" />
                          Extend
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => openCancel(r.raw)}
                        >
                          <Ban className="h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setRawTitle(`Subscription raw: ${r.id || "—"}`);
                            setRawValue(r.raw);
                            setRawOpen(true);
                          }}
                        >
                          Raw
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {!loading && tableRows.length > 0 && (
        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
          <div>
            Hiển thị{" "}
            <span className="font-semibold">
              {pagedRows.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>{" "}
            -{" "}
            <span className="font-semibold">
              {(page - 1) * pageSize + pagedRows.length}
            </span>{" "}
            trong <span className="font-semibold">{tableRows.length}</span> subscriptions
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
        </div>
      )}

      <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setActionTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "cancel" ? "Huỷ subscription" : "Gia hạn subscription"}
            </DialogTitle>
            <DialogDescription>
              Endpoint: <span className="font-mono text-xs">/saas/super-admin/saas/dashboard/subscriptions/{"{id}"}/{actionType}</span>
            </DialogDescription>
          </DialogHeader>

          {actionType === "extend" && (
            <div className="space-y-2 pt-2">
              <Label>Số ngày gia hạn</Label>
              <Input
                inputMode="numeric"
                value={String(days)}
                onChange={(e) => setDays(Number(e.target.value || 0))}
                placeholder="30"
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => { setActionType(null); setActionTarget(null); }} disabled={acting}>
              Huỷ
            </Button>
            <Button
              variant={actionType === "cancel" ? "destructive" : "default"}
              onClick={() => void doAction()}
              disabled={acting || (actionType === "extend" && Number(days) <= 0)}
              className={actionType === "extend" ? "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600" : undefined}
            >
              {acting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <JsonViewerDialog
        open={rawOpen}
        onOpenChange={setRawOpen}
        title={rawTitle}
        value={rawValue}
      />
    </div>
  );
}

