import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Star, Trash2, Braces, RefreshCcw } from "lucide-react";

import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { JsonViewerDialog } from "@/shared/components/JsonViewerDialog";
import { planReviewsApi, type PlanReview } from "@/shared/lib/planReviewsApi";
import { useTranslation } from "react-i18next";

export default function AdminReviewDetailPage() {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<PlanReview | null>(null);
  const [rawOpen, setRawOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await planReviewsApi.getAdminReviews({ page: 1, pageSize: 200 });
      const found = res.items.find((x) => x.id === id) ?? null;
      if (!found) {
        toast.error(t("admin:reviewDetail.toast.notFound"));
        navigate("/admin/reviews", { replace: true });
        return;
      }
      setReview(found);
    } catch (err) {
      console.error("Failed to load review detail:", err);
      toast.error(t("admin:reviewDetail.toast.loadError"));
      navigate("/admin/reviews", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const createdAt = useMemo(() => {
    if (!review?.createdAt) return "—";
    return new Date(review.createdAt).toLocaleString(i18n.language);
  }, [i18n.language, review?.createdAt]);

  const onDelete = async () => {
    if (!review) return;
    try {
      setDeleting(true);
      await planReviewsApi.deleteReview(review.id);
      toast.success(t("admin:reviewsPage.toast.deleteSuccess"));
      navigate("/admin/reviews", { replace: true });
    } catch (err) {
      console.error("Failed to delete review:", err);
      toast.error(t("admin:reviewsPage.toast.deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-40" />
        <Card className="p-6 space-y-3">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      </div>
    );
  }

  if (!review) return null;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-[#FF7B21]/10 hover:text-[#FF7B21] transition-all duration-200"
          onClick={() => navigate("/admin/reviews")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("admin:reviewDetail.backToList")}
        </Button>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="relative overflow-hidden p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21]/10 via-transparent to-[#19D6C8]/10 pointer-events-none" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/30">
              <Star className="h-6 w-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold truncate">{review.storeName}</h1>
                <Badge variant="outline">{review.planName}</Badge>
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  {review.rating}/5
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("admin:reviewDetail.reviewId")}: <span className="font-mono break-all">{review.id}</span>
              </p>
            </div>
          </div>

          <div className="relative mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-background/60 px-3 py-2 text-sm space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{t("admin:reviewDetail.fields.storeId")}</span>
                <span className="font-mono text-xs truncate">{review.storeId}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{t("admin:reviewDetail.fields.planId")}</span>
                <span className="font-mono text-xs truncate">{review.planId}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{t("admin:reviewDetail.fields.userId")}</span>
                <span className="font-mono text-xs truncate">{review.userId}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{t("admin:reviewDetail.fields.created")}</span>
                <span className="font-mono text-xs">{createdAt}</span>
              </div>
            </div>

            <div className="rounded-lg border bg-background/60 px-3 py-2 text-sm space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t("admin:reviewDetail.fields.content")}
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {review.content || "—"}
              </div>
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => void load()} disabled={deleting}>
                <RefreshCcw className="h-4 w-4" />
                {t("common:actions.reload")}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setRawOpen(true)}>
                <Braces className="h-4 w-4" />
                {t("common:actions.rawJson")}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3 hover:shadow-lg transition-shadow duration-300">
          <div className="text-sm font-semibold">{t("admin:reviewDetail.moderation.title")}</div>
          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            onClick={() => void onDelete()}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? t("admin:reviewDetail.moderation.deleting") : t("admin:reviewDetail.moderation.delete")}
          </Button>
        </Card>
      </div>

      <JsonViewerDialog
        open={rawOpen}
        onOpenChange={setRawOpen}
        title={t("admin:reviewDetail.rawTitle", { id: review.id })}
        value={review}
      />
    </motion.div>
  );
}

