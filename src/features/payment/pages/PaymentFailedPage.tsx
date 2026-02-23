import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { XCircle, Loader2, Home, CreditCard } from "lucide-react";
import { Globe, FloatingParticles, GradientOrb, GlassCard } from "@/shared/components/ui/Globe3D";

export default function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentId = searchParams.get("paymentId");
  const [status, setStatus] = useState<"loading" | "failed">("loading");
  const [message, setMessage] = useState("Đang xử lý thông tin thanh toán...");

  useEffect(() => {
    setStatus("failed");
    setMessage(
      searchParams.get("message") ||
        "Giao dịch thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."
    );
  }, [searchParams]);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetryPayment = () => {
    navigate("/dashboard/subscription");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <FloatingParticles className="absolute inset-0 -z-10" />
      <GradientOrb className="w-[500px] h-[500px] bg-red-500/10 -top-64 -left-64 blur-[100px]" />
      <GradientOrb className="w-[500px] h-[500px] bg-amber-500/10 -bottom-64 -right-64 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 relative z-10"
      >
        <GlassCard className="max-w-lg mx-auto p-8 text-center">
          {/* Status Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mb-6"
          >
            {status === "loading" && (
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-10 w-10 text-amber-500" />
                </motion.div>
              </div>
            )}

            {status === "failed" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30"
              >
                <XCircle className="h-10 w-10 text-white" />
              </motion.div>
            )}
          </motion.div>

          {/* Payment ID */}
          {paymentId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <Badge variant="outline" className="text-xs">
                Mã giao dịch: {paymentId.slice(0, 8)}...
              </Badge>
            </motion.div>
          )}

          {/* Status Message */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold mb-2 text-red-600 dark:text-red-400"
          >
            {status === "loading" ? "Đang xử lý..." : "Thanh toán thất bại"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground mb-6"
          >
            {message}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleGoToDashboard}
                className="w-full sm:w-auto gap-2 bg-gradient-to-r from-teal-500 to-blue-500"
              >
                <Home className="h-4 w-4" />
                Về trang chủ
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleRetryPayment}
                variant="outline"
                className="w-full sm:w-auto gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Thử thanh toán lại
              </Button>
            </motion.div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 pt-6 border-t"
          >
            <p className="text-xs text-muted-foreground">
              Cần hỗ trợ? Liên hệ{" "}
              <a
                href="mailto:support@360retail.com"
                className="text-primary hover:underline"
              >
                support@360retail.com
              </a>
            </p>
          </motion.div>
        </GlassCard>

        {/* 3D Globe decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute -bottom-32 -right-32 opacity-20 pointer-events-none hidden lg:block"
        >
          <Globe size={400} />
        </motion.div>
      </motion.div>
    </div>
  );
}
