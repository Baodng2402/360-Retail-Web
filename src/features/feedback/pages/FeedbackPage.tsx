import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Star, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { feedbackApi } from "@/shared/lib/feedbackApi";

const RATINGS = [1, 2, 3, 4, 5] as const;

const FeedbackPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId") ?? "";
  const storeId = searchParams.get("storeId") ?? "";

  const [rating, setRating] = useState<number | null>(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!orderId || !customerId || !storeId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-lg font-semibold text-foreground">
            Đường dẫn không hợp lệ
          </h1>
          <p className="text-sm text-muted-foreground">
            Thiếu thông tin đơn hàng hoặc khách hàng. Vui lòng quét lại QR trên hóa
            đơn để gửi đánh giá.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!rating) {
      setError("Vui lòng chọn số sao đánh giá.");
      return;
    }

    try {
      setSubmitting(true);
      await feedbackApi.submitPublicFeedback(orderId, {
        customerId,
        storeId,
        rating,
        content: content.trim() || undefined,
      });
      setSubmitted(true);
      toast.success("Cảm ơn bạn đã đánh giá!");
    } catch (err: unknown) {
      console.error("Submit feedback error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Không thể gửi đánh giá. Vui lòng thử lại sau.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-lg font-semibold text-foreground">
            Cảm ơn bạn đã đánh giá!
          </h1>
          <p className="text-sm text-muted-foreground">
            Phản hồi của bạn giúp cửa hàng cải thiện dịch vụ ngày càng tốt hơn.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-500">
            360 Retail Feedback
          </p>
          <h1 className="mt-2 text-xl font-bold text-foreground">
            Đánh giá trải nghiệm mua hàng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bạn vui lòng dành vài giây để đánh giá đơn hàng vừa rồi nhé.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Mức độ hài lòng
            </Label>
            <div className="flex items-center justify-center gap-2">
              {RATINGS.map((value) => {
                const active = rating === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                      active
                        ? "border-amber-400 bg-amber-50 text-amber-500"
                        : "border-border bg-background text-muted-foreground hover:border-amber-300 hover:text-amber-400"
                    }`}
                    aria-label={`${value} sao`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        active ? "fill-amber-400" : "fill-none"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-foreground">
              Góp ý của bạn (không bắt buộc)
            </Label>
            <Textarea
              id="content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bạn thích điều gì? Cần cải thiện điều gì?"
              className="resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full h-11 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-sm font-semibold"
          >
            {submitting ? "Đang gửi đánh giá..." : "Gửi đánh giá"}
          </Button>

          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Bằng cách gửi đánh giá, bạn đồng ý cho phép cửa hàng sử dụng feedback này
            để cải thiện chất lượng dịch vụ.
          </p>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;

