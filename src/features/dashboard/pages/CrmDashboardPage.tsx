import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { feedbackApi } from "@/shared/lib/feedbackApi";
import { loyaltyApi } from "@/shared/lib/loyaltyApi";
import type { Feedback, FeedbackSummary } from "@/shared/lib/feedbackApi";
import type { LoyaltyRule } from "@/shared/types/loyalty";
import { useAuthStore } from "@/shared/store/authStore";
import { Star, MessageSquare, Gift, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import toast from "react-hot-toast";

const CrmDashboardPage = () => {
  const { user } = useAuthStore();
  const canManageRules =
    user?.role === "StoreOwner" || user?.role === "Manager";

  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<string>("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LoyaltyRule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    type: 1,
    earningRate: 1,
    minSpend: 0,
    status: 1,
  });
  const [ruleSaving, setRuleSaving] = useState(false);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setSummaryLoading(true);
        const res = await feedbackApi.getSummary();
        setSummary(res);
      } catch (err) {
        console.error("Failed to load feedback summary:", err);
      } finally {
        setSummaryLoading(false);
      }
    };

    const loadRules = async () => {
      try {
        setRulesLoading(true);
        const res = await loyaltyApi.getRules();
        setRules(res);
      } catch (err) {
        console.error("Failed to load loyalty rules:", err);
      } finally {
        setRulesLoading(false);
      }
    };

    void loadSummary();
    void loadRules();
  }, []);

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        setFeedbackLoading(true);
        const res = await feedbackApi.getFeedback({
          rating: ratingFilter === "All" ? undefined : Number(ratingFilter),
          from: fromDate ? new Date(`${fromDate}T00:00:00.000`).toISOString() : undefined,
          to: toDate ? new Date(`${toDate}T23:59:59.999`).toISOString() : undefined,
          page: 1,
          pageSize: 20,
        });
        setFeedbacks(res.items);
        setFeedbackTotal(res.total);
      } catch (err) {
        console.error("Failed to load feedback list:", err);
        setFeedbacks([]);
        setFeedbackTotal(0);
      } finally {
        setFeedbackLoading(false);
      }
    };

    void loadFeedbacks();
  }, [ratingFilter, fromDate, toDate]);

  const ratingDistribution = useMemo(() => {
    if (!summary) return [];
    const dist: { rating: number; count: number }[] = [];
    for (let i = 5; i >= 1; i -= 1) {
      const key = String(i);
      dist.push({
        rating: i,
        count: summary.distribution?.[key] ?? 0,
      });
    }
    return dist;
  }, [summary]);

  const openCreateRule = () => {
    setEditingRule(null);
    setRuleForm({
      name: "",
      type: 1,
      earningRate: 1,
      minSpend: 0,
      status: 1,
    });
    setRuleDialogOpen(true);
  };

  const openEditRule = (rule: LoyaltyRule) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      type: rule.type,
      earningRate: rule.earningRate,
      minSpend: rule.minSpend,
      status: rule.status,
    });
    setRuleDialogOpen(true);
  };

  const handleSaveRule = async () => {
    if (!canManageRules) return;
    try {
      setRuleSaving(true);
      if (editingRule) {
        const updated = await loyaltyApi.updateRule(editingRule.id, ruleForm);
        setRules((prev) =>
          prev.map((r) => (r.id === editingRule.id ? updated : r)),
        );
        toast.success("Cập nhật luật tích điểm thành công.");
      } else {
        const created = await loyaltyApi.createRule(ruleForm);
        setRules((prev) => [created, ...prev]);
        toast.success("Tạo luật tích điểm mới thành công.");
      }
      setRuleDialogOpen(false);
    } catch (err) {
      console.error("Failed to save loyalty rule:", err);
      toast.error("Không thể lưu luật tích điểm.");
    } finally {
      setRuleSaving(false);
    }
  };

  const handleDeleteRule = async (rule: LoyaltyRule) => {
    if (!canManageRules) return;
    if (!window.confirm(`Bạn có chắc muốn xóa luật "${rule.name}"?`)) {
      return;
    }
    try {
      await loyaltyApi.deleteRule(rule.id);
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      toast.success("Đã xóa luật tích điểm.");
    } catch (err) {
      console.error("Failed to delete loyalty rule:", err);
      toast.error("Không thể xóa luật tích điểm.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-4 md:p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal-600" />
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-foreground">
                  CRM Feedback &amp; Loyalty
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Tổng quan điểm đánh giá khách hàng và cấu hình quy tắc tích điểm.
                </p>
              </div>
            </div>
            {summaryLoading ? null : summary ? (
              <div className="flex flex-col items-end gap-1 text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span className="font-semibold">
                    {summary.avgRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {summary.totalCount} lượt đánh giá
                </span>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4 border-dashed">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold text-foreground">
                    Phân bố điểm đánh giá
                  </span>
                </div>
                {summaryLoading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
              </div>
              {!summary ? (
                <p className="text-xs text-muted-foreground">
                  Chưa có dữ liệu đánh giá.
                </p>
              ) : (
                <div className="space-y-2">
                  {ratingDistribution.map((item) => {
                    const total = summary.totalCount || 1;
                    const percent = (item.count / total) * 100;
                    return (
                      <div
                        key={item.rating}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="w-10 flex items-center gap-0.5 text-amber-500">
                          {item.rating}
                          <Star className="h-3 w-3 fill-amber-400" />
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-muted-foreground">
                          {item.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-4 border-dashed">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-semibold text-foreground">
                    Quy tắc Loyalty hiện tại
                  </span>
                </div>
                {canManageRules && (
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                    onClick={openCreateRule}
                  >
                    Thêm luật
                  </Button>
                )}
              </div>
              {rulesLoading ? (
                <div className="py-4 text-xs text-muted-foreground">
                  Đang tải quy tắc loyalty...
                </div>
              ) : !rules.length ? (
                <div className="py-4 text-xs text-muted-foreground">
                  Chưa có luật tích điểm nào. Bạn có thể cấu hình luật mới để bắt
                  đầu chương trình khách hàng thân thiết.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between gap-2 rounded border px-3 py-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {rule.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-teal-500/40 bg-teal-50/70 text-teal-700"
                          >
                            {rule.earningRate} điểm / 1k
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Đơn tối thiểu:{" "}
                          <span className="font-medium">
                            {rule.minSpend.toLocaleString("vi-VN")}₫
                          </span>
                          {" • "}
                          Trạng thái:{" "}
                          <span className="font-medium">
                            {rule.status === 1 ? "Đang áp dụng" : "Tạm tắt"}
                          </span>
                        </div>
                      </div>
                      {canManageRules && (
                        <div className="flex flex-col items-end gap-1 text-[11px]">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => openEditRule(rule)}
                          >
                            Sửa
                          </Button>
                          <button
                            type="button"
                            className="text-red-500 hover:underline"
                            onClick={() => handleDeleteRule(rule)}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </Card>

        <Card className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Lọc feedback khách hàng
            </h2>
            <span className="text-[11px] text-muted-foreground">
              Tổng: {feedbackTotal} feedback
            </span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label>Điểm đánh giá</Label>
              <Select
                value={ratingFilter}
                onValueChange={(val) => setRatingFilter(val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Tất cả</SelectItem>
                  <SelectItem value="5">5 sao</SelectItem>
                  <SelectItem value="4">4 sao</SelectItem>
                  <SelectItem value="3">3 sao</SelectItem>
                  <SelectItem value="2">2 sao</SelectItem>
                  <SelectItem value="1">1 sao</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Từ ngày</Label>
                <Input
                  type="date"
                  className="h-8"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Đến ngày</Label>
                <Input
                  type="date"
                  className="h-8"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-1 h-8 text-xs"
              onClick={() => {
                setRatingFilter("All");
                setFromDate("");
                setToDate("");
              }}
              disabled={feedbackLoading}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm md:text-base font-semibold text-foreground">
            Feedback gần đây của khách hàng
          </h2>
        </div>
        {feedbackLoading ? (
          <div className="py-6 text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Đang tải danh sách feedback...</span>
          </div>
        ) : !feedbacks.length ? (
          <div className="py-6 text-sm text-muted-foreground">
            Chưa có feedback nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="rounded-lg border px-3 py-2 text-xs md:text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {fb.customerName}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-600">
                      {fb.rating}
                      <Star className="h-3 w-3 fill-amber-400" />
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl">
                    {fb.content || "(Không có nội dung chi tiết)"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span>
                      Nguồn:{" "}
                      <span className="font-medium">
                        {fb.source || "Không rõ"}
                      </span>
                    </span>
                    <span>
                      Thời gian:{" "}
                      {new Date(fb.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-teal-600" />
              {editingRule ? "Cập nhật luật tích điểm" : "Thêm luật tích điểm"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label>Tên luật</Label>
              <Input
                value={ruleForm.name}
                onChange={(e) =>
                  setRuleForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="VD: Tích điểm theo hóa đơn"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Kiểu luật (type)</Label>
                <Input
                  type="number"
                  min={1}
                  max={3}
                  value={ruleForm.type}
                  onChange={(e) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      type: Number(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Tỷ lệ tích điểm (điểm/1k)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={ruleForm.earningRate}
                  onChange={(e) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      earningRate: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Đơn tối thiểu (VNĐ)</Label>
                <Input
                  type="number"
                  min={0}
                  value={ruleForm.minSpend}
                  onChange={(e) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      minSpend: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Trạng thái</Label>
                <Select
                  value={String(ruleForm.status)}
                  onValueChange={(val) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      status: Number(val) || 0,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Đang áp dụng</SelectItem>
                    <SelectItem value="0">Tạm tắt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setRuleDialogOpen(false)}
              disabled={ruleSaving}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveRule}
              disabled={
                ruleSaving ||
                !ruleForm.name.trim() ||
                ruleForm.earningRate <= 0
              }
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              {ruleSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrmDashboardPage;

