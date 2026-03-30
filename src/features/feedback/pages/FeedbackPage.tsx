import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { Star, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { feedbackApi } from "@/shared/lib/feedbackApi";
import { cn } from "@/lib/utils";

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-white to-[#FF7B21]/5 dark:from-gray-900 dark:via-gray-800 dark:to-[#FF7B21]/5 px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg shadow-[#FF7B21]/5 dark:shadow-[#FF7B21]/10 transition-all hover:shadow-xl hover:shadow-[#FF7B21]/10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/20"
          >
            <AlertCircle className="h-7 w-7 text-white" />
          </motion.div>
          <h1 className="mb-2 text-xl font-bold text-foreground bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
            Đường dẫn không hợp lệ
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thiếu thông tin đơn hàng hoặc khách hàng. Vui lòng quét lại QR trên hóa
            đơn để gửi đánh giá.
          </p>
        </motion.div>
      </motion.div>
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-white to-[#19D6C8]/5 dark:from-gray-900 dark:via-gray-800 dark:to-[#19D6C8]/5 px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-xl shadow-emerald-500/10 dark:shadow-emerald-500/5 transition-all hover:shadow-2xl hover:shadow-emerald-500/15"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30"
          >
            <CheckCircle2 className="h-7 w-7 text-white" />
          </motion.div>
          <h1 className="mb-2 text-xl font-bold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
            Cảm ơn bạn đã đánh giá!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Phản hồi của bạn giúp cửa hàng cải thiện dịch vụ ngày càng tốt hơn.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-white to-[#FF7B21]/5 dark:from-gray-900 dark:via-gray-800 dark:to-[#FF7B21]/5 px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl shadow-[#FF7B21]/5 dark:shadow-[#FF7B21]/10 transition-all hover:shadow-2xl hover:shadow-[#FF7B21]/10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] shadow-lg shadow-[#FF7B21]/20"
          >
            <Star className="h-6 w-6 text-white" />
          </motion.div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
            360 Retail Feedback
          </p>
          <h1 className="mt-3 text-2xl font-bold text-foreground tracking-tight">
            Đánh giá trải nghiệm mua hàng
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bạn vui lòng dành vài giây để đánh giá đơn hàng vừa rồi nhé.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <Label className="text-sm font-semibold text-foreground">
              Mức độ hài lòng
            </Label>
            <div className="flex items-center justify-center gap-3">
              {RATINGS.map((value, index) => {
                const active = rating === value;
                return (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + index * 0.05, type: "spring", stiffness: 300 }}
                    whileHover={{ scale: 1.3, y: -4 }}
                    whileTap={{ scale: 0.85 }}
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200",
                      active
                        ? "border-transparent bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] shadow-lg shadow-[#FF7B21]/30"
                        : "border-border bg-background/80 hover:border-[#FF7B21]/50 hover:bg-[#FF7B21]/5"
                    )}
                    aria-label={`${value} sao`}
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-all",
                        active
                          ? "fill-white text-white drop-shadow-md"
                          : "fill-none text-muted-foreground group-hover:text-[#FF7B21]"
                      )}
                    />
                    {active && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-muted-foreground"
            >
              {rating && (
                <span className="font-semibold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
                  {rating}/5 sao
                </span>
              )}
            </motion.p>
          </motion.div>

          {/* Textarea */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="content" className="text-sm font-semibold text-foreground">
              Góp ý của bạn (không bắt buộc)
            </Label>
            <Textarea
              id="content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bạn thích điều gì? Cần cải thiện điều gì?"
              className="resize-none transition-all focus-visible:ring-2 focus-visible:ring-[#FF7B21]/50 focus-visible:border-[#FF7B21] bg-gradient-to-br from-white to-[#FF7B21]/5 dark:from-gray-900 dark:to-[#FF7B21]/10"
            />
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 font-medium"
            >
              {error}
            </motion.p>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full h-12 text-sm font-semibold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF7B21]/90 hover:to-[#19D6C8]/90 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 border-0 transition-all duration-300"
            >
              {submitting ? (
                <>
                  <Star className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi đánh giá...
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  Gửi đánh giá
                </>
              )}
            </Button>
          </motion.div>

          <p className="mt-2 text-center text-[11px] text-muted-foreground leading-relaxed">
            Bằng cách gửi đánh giá, bạn đồng ý cho phép cửa hàng sử dụng feedback này
            để cải thiện chất lượng dịch vụ.
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default FeedbackPage;
