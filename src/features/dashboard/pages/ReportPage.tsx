import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  FileText,
  Star,
  Frown,
  Smile,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import StoreSelector from "@/features/dashboard/components/StoreSelector";
import { feedbackApi } from "@/shared/lib/feedbackApi";
import type {
  FeedbackPagedResult,
  FeedbackSummary,
} from "@/shared/lib/feedbackApi";
import { useTranslation } from "react-i18next";

const ReportPage = () => {
  const { t } = useTranslation("reports");
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [feedbackPaged, setFeedbackPaged] = useState<FeedbackPagedResult>({
    items: [],
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [s, list] = await Promise.all([
          feedbackApi.getSummary(),
          feedbackApi.getFeedback({ page: 1, pageSize: 10 }),
        ]);
        setSummary(s);
        setFeedbackPaged(list);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const distributionData = useMemo(() => {
    if (!summary) return [];
    const entries = Object.entries(summary.distribution ?? {}).sort(
      (a, b) => Number(a[0]) - Number(b[0]),
    );
    return entries.map(([rating, count]) => ({
      rating: Number(rating),
      count,
      percentage:
        summary.totalCount > 0 ? (count / summary.totalCount) * 100 : 0,
    }));
  }, [summary]);

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription={t("page.storeSelectorHint")} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {t("overview.title")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("overview.subtitle")}
                </p>
              </div>
            </div>
            {summary && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-xs gap-1">
                <Smile className="h-3 w-3" />
                {summary.avgRating.toFixed(1)}/5
              </Badge>
            )}
          </div>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-52" />
            </div>
          ) : summary ? (
            <div className="space-y-2">
              <p className="text-3xl font-bold text-foreground">
                {summary.avgRating.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("overview.basedOnCount", { count: summary.totalCount })}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("overview.noData")}
            </p>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {t("distribution.title")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("distribution.subtitle")}
              </p>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : distributionData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("distribution.noData")}
            </p>
          ) : (
            <div className="space-y-2">
              {distributionData.map((item) => (
                <div
                  key={item.rating}
                  className="flex items-center gap-2 text-xs"
                >
                  <div className="w-10 flex items-center gap-1">
                    <span className="font-medium">{item.rating}</span>
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-400"
                      style={{ width: `${item.percentage.toFixed(1)}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-muted-foreground">
                    {item.count} ({item.percentage.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white">
              <Frown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {t("recent.title")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("recent.subtitle")}
              </p>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : feedbackPaged.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("recent.empty")}
            </p>
          ) : (
            <div className="space-y-2 text-xs">
              {feedbackPaged.items.slice(0, 4).map((f) => (
                <div
                  key={f.id}
                  className="border rounded-lg px-2.5 py-2 bg-background space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{f.customerName}</span>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span>{f.rating}/5</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {f.content || t("recent.contentFallback")}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{f.source}</span>
                    <span>
                      {new Date(f.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              {t("advanced.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("advanced.subtitle")}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
        >
          <MessageSquare className="h-3 w-3" />
          {t("actions.exportComingSoon")}
        </button>
      </Card>
    </div>
  );
};

export default ReportPage;
