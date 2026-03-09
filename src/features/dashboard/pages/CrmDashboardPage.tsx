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
import { customersApi } from "@/shared/lib/customersApi";
import type { Feedback, FeedbackSummary } from "@/shared/lib/feedbackApi";
import type { LoyaltyRule } from "@/shared/types/loyalty";
import type { Customer } from "@/shared/types/customers";
import { useAuthStore } from "@/shared/store/authStore";
import { Star, MessageSquare, Gift, Loader2, Coins, PenLine, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import toast from "react-hot-toast";
import { useStoreStore } from "@/shared/store/storeStore";
import StoreSelector from "@/features/dashboard/components/StoreSelector";
import { useTranslation } from "react-i18next";

const CrmDashboardPage = () => {
  const { t: tCrm, i18n } = useTranslation("crm");
  const { t: tCommon } = useTranslation("common");
  const { user } = useAuthStore();
  const { currentStore } = useStoreStore();
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

  // Redeem points state
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemCustomerId, setRedeemCustomerId] = useState("");
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [redeemDesc, setRedeemDesc] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemSearch, setRedeemSearch] = useState("");
  const [redeemSearchLoading, setRedeemSearchLoading] = useState(false);
  const [redeemSearchResults, setRedeemSearchResults] = useState<Customer[]>([]);

  // Staff feedback state
  const [staffFbOpen, setStaffFbOpen] = useState(false);
  const [staffFbCustomerId, setStaffFbCustomerId] = useState("");
  const [staffFbRating, setStaffFbRating] = useState(5);
  const [staffFbContent, setStaffFbContent] = useState("");
  const [staffFbLoading, setStaffFbLoading] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [staffSearchLoading, setStaffSearchLoading] = useState(false);
  const [staffSearchResults, setStaffSearchResults] = useState<Customer[]>([]);

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
        toast.success(tCrm("toasts.ruleUpdateSuccess"));
      } else {
        const created = await loyaltyApi.createRule(ruleForm);
        setRules((prev) => [created, ...prev]);
        toast.success(tCrm("toasts.ruleCreateSuccess"));
      }
      setRuleDialogOpen(false);
    } catch (err) {
      console.error("Failed to save loyalty rule:", err);
      toast.error(tCrm("toasts.ruleSaveFailed"));
    } finally {
      setRuleSaving(false);
    }
  };

  const handleDeleteRule = async (rule: LoyaltyRule) => {
    if (!canManageRules) return;
    if (!window.confirm(tCrm("loyalty.confirmDelete", { name: rule.name }))) {
      return;
    }
    try {
      await loyaltyApi.deleteRule(rule.id);
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      toast.success(tCrm("toasts.ruleDeleteSuccess"));
    } catch (err) {
      console.error("Failed to delete loyalty rule:", err);
      toast.error(tCrm("toasts.ruleDeleteFailed"));
    }
  };

  const handleRedeemPoints = async () => {
    if (!redeemCustomerId.trim() || redeemPoints <= 0) return;
    try {
      setRedeemLoading(true);
      await customersApi.redeemPoints(redeemCustomerId.trim(), {
        points: redeemPoints,
        description: redeemDesc || undefined,
      });
      toast.success(tCrm("toasts.redeemSuccess", { points: redeemPoints }));
      setRedeemOpen(false);
      setRedeemCustomerId("");
      setRedeemPoints(0);
      setRedeemDesc("");
    } catch (err) {
      console.error("Failed to redeem points:", err);
      toast.error(tCrm("toasts.redeemFailed"));
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleRedeemSearchCustomers = async () => {
    if (!redeemSearch.trim()) return;
    try {
      setRedeemSearchLoading(true);
      const res = await customersApi.getCustomers({
        keyword: redeemSearch.trim(),
        page: 1,
        pageSize: 8,
      });
      setRedeemSearchResults(res.items);
    } catch (err) {
      console.error("Failed to search customers for redeem:", err);
      toast.error(tCrm("toasts.searchCustomerFailed"));
    } finally {
      setRedeemSearchLoading(false);
    }
  };

  const handleStaffFeedback = async () => {
    if (!staffFbCustomerId.trim()) return;
    try {
      setStaffFbLoading(true);
      await feedbackApi.createStaffFeedback({
        customerId: staffFbCustomerId.trim(),
        rating: staffFbRating,
        content: staffFbContent || undefined,
      });
      toast.success(tCrm("toasts.staffFeedbackSuccess"));
      setStaffFbOpen(false);
      setStaffFbCustomerId("");
      setStaffFbRating(5);
      setStaffFbContent("");
    } catch (err) {
      console.error("Failed to create staff feedback:", err);
      toast.error(tCrm("toasts.staffFeedbackFailed"));
    } finally {
      setStaffFbLoading(false);
    }
  };

  const handleStaffSearchCustomers = async () => {
    if (!staffSearch.trim()) return;
    try {
      setStaffSearchLoading(true);
      const res = await customersApi.getCustomers({
        keyword: staffSearch.trim(),
        page: 1,
        pageSize: 8,
      });
      setStaffSearchResults(res.items);
    } catch (err) {
      console.error("Failed to search customers for staff feedback:", err);
      toast.error(tCrm("toasts.searchCustomerFailed"));
    } finally {
      setStaffSearchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription={tCrm("page.storeSelectorHint")} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-4 md:p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal-600" />
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-foreground">
                  {tCrm("header.title")}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {tCrm("header.subtitle", {
                    storeSuffix: currentStore
                      ? tCrm("header.storeSuffix", {
                          storeName: currentStore.storeName,
                        })
                      : "",
                  })}
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
                  {tCrm("header.totalRatings", { count: summary.totalCount })}
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
                    {tCrm("distribution.title")}
                  </span>
                </div>
                {summaryLoading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
              </div>
              {!summary ? (
                <p className="text-xs text-muted-foreground">
                  {tCrm("distribution.empty")}
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
                    {tCrm("loyalty.title")}
                  </span>
                </div>
                {canManageRules && (
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                    onClick={openCreateRule}
                  >
                    {tCrm("loyalty.addRule")}
                  </Button>
                )}
              </div>
              {rulesLoading ? (
                <div className="py-4 text-xs text-muted-foreground">
                  {tCrm("loyalty.loading")}
                </div>
              ) : !rules.length ? (
                <div className="py-4 text-xs text-muted-foreground">
                  {tCrm("loyalty.empty")}
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
                            {tCrm("loyalty.earningRateBadge", {
                              rate: rule.earningRate,
                            })}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {tCrm("loyalty.minOrderLabel")}{" "}
                          <span className="font-medium">
                            {rule.minSpend.toLocaleString("vi-VN")}₫
                          </span>
                          {" • "}
                          {tCrm("loyalty.statusLabel")}{" "}
                          <span className="font-medium">
                            {rule.status === 1
                              ? tCrm("loyalty.statusActive")
                              : tCrm("loyalty.statusInactive")}
                          </span>
                        </div>
                      </div>
                      {canManageRules && (
                        <div className="flex flex-col items-end gap-1 text-[11px]">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => openEditRule(rule)}
                          >
                            {tCrm("loyalty.edit")}
                          </Button>
                          <button
                            type="button"
                            className="text-red-500 hover:underline"
                            onClick={() => handleDeleteRule(rule)}
                          >
                            {tCrm("loyalty.delete")}
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

        {/* Quick Actions: Redeem Points & Staff Feedback */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm md:text-base font-semibold text-foreground">
              {tCrm("quickActions.title")}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {canManageRules && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setRedeemOpen(true)}
              >
                <Coins className="h-4 w-4 text-amber-500" />
                {tCrm("quickActions.redeemPoints")}
              </Button>
            )}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setStaffFbOpen(true)}
            >
              <PenLine className="h-4 w-4 text-teal-500" />
              {tCrm("quickActions.createStaffFeedback")}
            </Button>
          </div>
        </Card>

        <Card className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              {tCrm("filters.title")}
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {tCrm("filters.total", { count: feedbackTotal })}
            </span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label>{tCrm("filters.ratingLabel")}</Label>
              <Select
                value={ratingFilter}
                onValueChange={(val) => setRatingFilter(val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={tCrm("filters.ratingPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{tCrm("filters.all")}</SelectItem>
                  <SelectItem value="5">{tCrm("filters.stars5")}</SelectItem>
                  <SelectItem value="4">{tCrm("filters.stars4")}</SelectItem>
                  <SelectItem value="3">{tCrm("filters.stars3")}</SelectItem>
                  <SelectItem value="2">{tCrm("filters.stars2")}</SelectItem>
                  <SelectItem value="1">{tCrm("filters.stars1")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{tCrm("filters.fromDate")}</Label>
                <Input
                  type="date"
                  className="h-8"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>{tCrm("filters.toDate")}</Label>
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
              {tCrm("filters.reset")}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm md:text-base font-semibold text-foreground">
            {tCrm("recentFeedback.title")}
          </h2>
        </div>
        {feedbackLoading ? (
          <div className="py-6 text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{tCrm("recentFeedback.loading")}</span>
          </div>
        ) : !feedbacks.length ? (
          <div className="py-6 text-sm text-muted-foreground">
            {tCrm("recentFeedback.empty")}
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
                    {fb.content || tCrm("recentFeedback.contentFallback")}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span>
                      {tCrm("recentFeedback.sourceLabel")}{" "}
                      <span className="font-medium">
                        {fb.source || tCrm("recentFeedback.sourceUnknown")}
                      </span>
                    </span>
                    <span>
                      {tCrm("recentFeedback.timeLabel")}{" "}
                      {new Intl.DateTimeFormat(
                        i18n.language.toLowerCase().startsWith("en") ? "en-US" : "vi-VN",
                        { dateStyle: "short", timeStyle: "short" },
                      ).format(new Date(fb.createdAt))}
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
              {editingRule
                ? tCrm("dialogs.rule.editTitle")
                : tCrm("dialogs.rule.createTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label>{tCrm("dialogs.rule.nameLabel")}</Label>
              <Input
                value={ruleForm.name}
                onChange={(e) =>
                  setRuleForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={tCrm("dialogs.rule.namePlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{tCrm("dialogs.rule.typeLabel")}</Label>
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
                <Label>{tCrm("dialogs.rule.earningRateLabel")}</Label>
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
                <Label>{tCrm("dialogs.rule.minSpendLabel")}</Label>
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
                <Label>{tCrm("dialogs.rule.statusLabel")}</Label>
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
                    <SelectItem value="1">{tCrm("dialogs.rule.statusActive")}</SelectItem>
                    <SelectItem value="0">{tCrm("dialogs.rule.statusInactive")}</SelectItem>
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
              {tCommon("actions.cancel")}
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
              {tCommon("actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redeem Points Dialog */}
      <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              {tCrm("dialogs.redeem.title")}
            </DialogTitle>
            <DialogDescription>
              {tCrm("dialogs.redeem.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label>{tCrm("dialogs.redeem.customerIdLabel")}</Label>
              <Input
                value={redeemCustomerId}
                onChange={(e) => setRedeemCustomerId(e.target.value)}
                placeholder={tCrm("dialogs.redeem.customerIdPlaceholder")}
              />
            </div>
            <div className="space-y-1 rounded-md border bg-muted/40 p-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-[11px] flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  {tCrm("dialogs.redeem.quickSearchLabel")}
                </Label>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  value={redeemSearch}
                  onChange={(e) => setRedeemSearch(e.target.value)}
                  placeholder={tCrm("dialogs.redeem.searchPlaceholder")}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-xs"
                  disabled={redeemSearchLoading}
                  onClick={() => void handleRedeemSearchCustomers()}
                >
                  {redeemSearchLoading
                    ? tCrm("dialogs.redeem.searching")
                    : tCrm("dialogs.redeem.search")}
                </Button>
              </div>
              {redeemSearchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto rounded-md border bg-background">
                  {redeemSearchResults.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className="w-full px-2 py-1.5 text-left text-xs hover:bg-muted"
                      onClick={() => {
                        setRedeemCustomerId(c.id);
                        setRedeemSearchResults([]);
                        toast.success(
                          tCrm("dialogs.redeem.selectedCustomerToast", {
                            name: c.fullName,
                          }),
                        );
                      }}
                    >
                      <span className="font-medium">{c.fullName}</span>
                      {(c.phoneNumber || c.email) && (
                        <span className="ml-1 text-[11px] text-muted-foreground">
                          {c.phoneNumber || c.email || ""}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label>{tCrm("dialogs.redeem.pointsLabel")}</Label>
              <Input
                type="number"
                min={1}
                value={redeemPoints || ""}
                onChange={(e) => setRedeemPoints(Number(e.target.value) || 0)}
                placeholder={tCrm("dialogs.redeem.pointsPlaceholder")}
              />
            </div>
            <div className="space-y-1">
              <Label>{tCrm("dialogs.redeem.descLabel")}</Label>
              <Input
                value={redeemDesc}
                onChange={(e) => setRedeemDesc(e.target.value)}
                placeholder={tCrm("dialogs.redeem.descPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setRedeemOpen(false)} disabled={redeemLoading}>
              {tCommon("actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleRedeemPoints()}
              disabled={redeemLoading || !redeemCustomerId.trim() || redeemPoints <= 0}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {redeemLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tCrm("dialogs.redeem.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Feedback Dialog */}
      <Dialog open={staffFbOpen} onOpenChange={setStaffFbOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-teal-500" />
              {tCrm("dialogs.staffFeedback.title")}
            </DialogTitle>
            <DialogDescription>
              {tCrm("dialogs.staffFeedback.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label>{tCrm("dialogs.staffFeedback.customerIdLabel")}</Label>
              <Input
                value={staffFbCustomerId}
                onChange={(e) => setStaffFbCustomerId(e.target.value)}
                placeholder={tCrm("dialogs.staffFeedback.customerIdPlaceholder")}
              />
            </div>
            <div className="space-y-1 rounded-md border bg-muted/40 p-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-[11px] flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  {tCrm("dialogs.staffFeedback.quickSearchLabel")}
                </Label>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  placeholder={tCrm("dialogs.staffFeedback.searchPlaceholder")}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-xs"
                  disabled={staffSearchLoading}
                  onClick={() => void handleStaffSearchCustomers()}
                >
                  {staffSearchLoading
                    ? tCrm("dialogs.staffFeedback.searching")
                    : tCrm("dialogs.staffFeedback.search")}
                </Button>
              </div>
              {staffSearchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto rounded-md border bg-background">
                  {staffSearchResults.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className="w-full px-2 py-1.5 text-left text-xs hover:bg-muted"
                      onClick={() => {
                        setStaffFbCustomerId(c.id);
                        setStaffSearchResults([]);
                        toast.success(
                          tCrm("dialogs.staffFeedback.selectedCustomerToast", {
                            name: c.fullName,
                          }),
                        );
                      }}
                    >
                      <span className="font-medium">{c.fullName}</span>
                      {(c.phoneNumber || c.email) && (
                        <span className="ml-1 text-[11px] text-muted-foreground">
                          {c.phoneNumber || c.email || ""}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label>{tCrm("dialogs.staffFeedback.ratingLabel")}</Label>
              <Select
                value={String(staffFbRating)}
                onValueChange={(v) => setStaffFbRating(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 5 sao</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4 sao</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 3 sao</SelectItem>
                  <SelectItem value="2">⭐⭐ 2 sao</SelectItem>
                  <SelectItem value="1">⭐ 1 sao</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{tCrm("dialogs.staffFeedback.contentLabel")}</Label>
              <textarea
                className="flex w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                value={staffFbContent}
                onChange={(e) => setStaffFbContent(e.target.value)}
                placeholder={tCrm("dialogs.staffFeedback.contentPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setStaffFbOpen(false)} disabled={staffFbLoading}>
              {tCommon("actions.cancel")}
            </Button>
            <Button
              onClick={() => void handleStaffFeedback()}
              disabled={staffFbLoading || !staffFbCustomerId.trim()}
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
            >
              {staffFbLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tCrm("dialogs.staffFeedback.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrmDashboardPage;

