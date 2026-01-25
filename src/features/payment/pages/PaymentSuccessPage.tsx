import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { CheckCircle, XCircle, Loader2, ArrowRight, Home, CreditCard } from "lucide-react";
import { authApi } from "@/shared/lib/authApi";
import { useAuthStore } from "@/shared/store/authStore";
import { Globe, GradientOrb, FloatingParticles, GlassCard } from "@/shared/components/ui/Globe3D";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  
  const paymentId = searchParams.get("paymentId");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác nhận thanh toán...");
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setStatus("error");
      setMessage("Không tìm thấy mã thanh toán");
      return;
    }

    verifyPayment();
  }, [paymentId]);

  const verifyPayment = async () => {
    try {
      // 1. Verify payment với backend
      // Có thể gọi API verify nếu có, hoặc dùng redirectUrl từ response trước đó
      
      // 2. Refresh token để cập nhật subscription status
      await refreshUserData();
      
      // 3. Lấy thông tin subscription mới
      const subscriptionStatus = await authApi.checkStoreTrial();
      setPlanName(subscriptionStatus.planName);
      
      setStatus("success");
      setMessage("Thanh toán thành công! Gói dịch vụ đã được kích hoạt.");
    } catch (error) {
      console.error("Payment verification failed:", error);
      setStatus("error");
      setMessage("Xác nhận thanh toán thất bại. Vui lòng liên hệ hỗ trợ.");
    }
  };

  const refreshUserData = async () => {
    try {
      // Gọi refresh access để lấy token mới với subscription đã update
      await authApi.refreshAccess();
      
      // Cập nhật user store
      const userData = await authApi.meWithSubscription();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      // Vẫn tiếp tục vì payment có thể đã thành công
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToSubscription = () => {
    navigate("/dashboard/subscription");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <FloatingParticles className="absolute inset-0 -z-10" />
      <GradientOrb className="w-[500px] h-[500px] bg-green-500/10 -top-64 -left-64 blur-[100px]" />
      <GradientOrb className="w-[500px] h-[500px] bg-teal-500/10 -bottom-64 -right-64 blur-[100px]" />

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
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-10 w-10 text-blue-500" />
                </motion.div>
              </div>
            )}

            {status === "success" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30"
              >
                <CheckCircle className="h-10 w-10 text-white" />
              </motion.div>
            )}

            {status === "error" && (
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
                Mã thanh toán: {paymentId.slice(0, 8)}...
              </Badge>
            </motion.div>
          )}

          {/* Status Message */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-2xl font-bold mb-2 ${
              status === "success" 
                ? "text-green-600 dark:text-green-400" 
                : status === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-blue-600 dark:text-blue-400"
            }`}
          >
            {status === "loading" && "Đang xác nhận"}
            {status === "success" && "Thanh toán thành công!"}
            {status === "error" && "Có lỗi xảy ra"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground mb-6"
          >
            {message}
          </motion.p>

          {/* Plan Info - Only show on success */}
          {status === "success" && planName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Gói dịch vụ của bạn</span>
              </div>
              <p className="text-xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
                {planName}
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
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

            {status === "success" && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleGoToSubscription}
                  variant="outline"
                  className="w-full sm:w-auto gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Xem gói dịch vụ
                </Button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => navigate("/dashboard/subscription")}
                  variant="outline"
                  className="w-full sm:w-auto gap-2"
                >
                  Thử lại
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-6 border-t"
          >
            <p className="text-xs text-muted-foreground">
              Cần hỗ trợ? Liên hệ <a href="mailto:support@360retail.com" className="text-primary hover:underline">support@360retail.com</a>
            </p>
          </motion.div>
        </GlassCard>

        {/* 3D Globe decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute -bottom-32 -right-32 opacity-20 pointer-events-none hidden lg:block"
        >
          <Globe size={400} />
        </motion.div>
      </motion.div>
    </div>
  );
}

