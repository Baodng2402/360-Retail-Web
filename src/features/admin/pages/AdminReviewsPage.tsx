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
import { planReviewsApi, type PlanReview } from "@/shared/lib/planReviewsApi";
import { Star, Trash2, BarChart3, RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

type RatingFilter = "all" | "1" | "2" | "3" | "4" | "5";

export default function AdminReviewsPage() {
  const { t } = useTranslation(["admin", "common"]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [items, setItems] = useState<PlanReview[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [rating, setRating] = useState<RatingFilter>("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [dash, setDash] = useState<{
    overallAvgRating: number;
    totalReviews: number;
    reviewsThisMonth: number;
  } | null>(null);

  const loadDashboard = async () => {
    try {
      setDashboardLoading(true);
      const d = await planReviewsApi.getAdminDashboard();
      if (!d) {
        setDash(null);
        return;
      }
      setDash({
        overallAvgRating: d.overallAvgRating,
        totalReviews: d.totalReviews,
        reviewsThisMonth: d.reviewsThisMonth,
      });
    } catch (err) {
      console.error("Failed to load admin review dashboard:", err);
      setDash(null);
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadList = async () => {
    try {
      setLoading(true);
      const res = await planReviewsApi.getAdminReviews({
        rating: rating === "all" ? undefined : Number(rating),
        page,
        pageSize,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to load admin reviews:", err);
      toast.error(t("common:states.error"));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rating, page]);

  useEffect(() => {
    setPage(1);
  }, [rating]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((r) => {
      return (
        r.id.toLowerCase().includes(term) ||
        r.planName.toLowerCase().includes(term) ||
        r.storeName.toLowerCase().includes(term) ||
        (r.content ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, q]);

  const totalPages = Math.max(1, Math.ceil((total || filtered.length) / pageSize) || 1);

  const onDelete = async (reviewId: string) => {
    try {
      await planReviewsApi.deleteReview(reviewId);
      toast.success("Đã xoá review.");
      // optimistic remove
      setItems((prev) => prev.filter((x) => x.id !== reviewId));
      setTotal((prev) => (prev > 0 ? prev - 1 : 0));
      void loadDashboard();
    } catch (err) {
      console.error("Failed to delete review:", err);
      toast.error("Xoá review thất bại.");
    }
  };

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
                  {t("sidebar.nav.reviews.label")}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {t("sidebar.nav.reviews.subLabel")}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Endpoint: <span className="font-mono">/saas/plan-reviews/admin</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Rating</div>
                <Select value={rating} onValueChange={(v) => setRating(v as RatingFilter)}>
                  <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                    <SelectValue placeholder="Chọn..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Tìm kiếm</div>
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo store, plan, nội dung..."
                  className="bg-background/80 backdrop-blur-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => void loadList()}
                  className="w-full bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : "Làm mới"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 hover:shadow-lg transition-shadow duration-300 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#FF7B21]" />
              Review dashboard
            </h3>
            <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
              /saas/plan-reviews/admin/dashboard
            </Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(dashboardLoading && !dash) ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : (
              <>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Total reviews</div>
                  <div className="mt-1 text-lg font-semibold">{dash ? dash.totalReviews.toLocaleString() : "—"}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Avg rating</div>
                  <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
                    <Star className="h-4 w-4 text-amber-500" />
                    {dash ? dash.overallAvgRating.toFixed(2) : "—"}
                  </div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">This month</div>
                  <div className="mt-1 text-lg font-semibold">{dash ? dash.reviewsThisMonth.toLocaleString() : "—"}</div>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="text-xs text-muted-foreground">Pagination</div>
          <div className="mt-2 text-sm">
            Page <span className="font-semibold">{page}</span> /{" "}
            <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </Button>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Total: <span className="font-semibold">{(total || filtered.length).toLocaleString()}</span>
          </div>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-[#FF7B21]" />
              Reviews list
            </h3>
            <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
              {filtered.length.toLocaleString()} items (page)
            </Badge>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filtered.length === 0 ? (
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
                      <TableHead>Rating</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow
                        key={r.id}
                        className="cursor-pointer border-b last:border-0 hover:bg-gradient-to-r hover:from-[#FF7B21]/5 hover:to-transparent transition-all duration-200"
                        onClick={() => navigate(`/admin/reviews/${r.id}`)}
                      >
                        <TableCell className="max-w-[220px] truncate">
                          <div className="font-medium">{r.storeName}</div>
                          <div className="text-xs text-muted-foreground truncate">{r.storeId}</div>
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate">
                          <div className="font-medium">{r.planName}</div>
                          <div className="text-xs text-muted-foreground truncate">{r.planId}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-500" />
                            {r.rating}/5
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[420px]">
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {r.content || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {new Date(r.createdAt).toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                            onClick={() => void onDelete(r.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
