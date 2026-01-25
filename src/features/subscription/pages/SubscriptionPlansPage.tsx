import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Loader2, Check, CreditCard, AlertCircle, Star } from "lucide-react";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import { formatPriceVnd } from "@/shared/types/subscription";
import type { Plan, MySubscription } from "@/shared/types/subscription";
import toast from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const parseFeatures = (featuresJson: string | null | undefined | string[]): string[] => {
  if (!featuresJson) return [];
  if (Array.isArray(featuresJson)) return featuresJson;
  try {
    const parsed = JSON.parse(featuresJson);
    return Object.entries(parsed).map(([key, value]) => {
      const labels: Record<string, string> = {
        max_orders: "Đơn hàng",
        max_products: "Sản phẩm",
        max_employees: "Nhân viên",
      };
      const label = labels[key] || key;
      const val = value as number;
      if (val === -1) return `Không giới hạn ${label.toLowerCase()}`;
      return `Tối đa ${val.toLocaleString()} ${label.toLowerCase()}`;
    });
  } catch {
    return [];
  }
};

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [mySubscription, setMySubscription] = useState<MySubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [plansData, mySubData] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getMySubscription(),
      ]);
      setPlans(plansData);
      setMySubscription(mySubData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handlePurchase = async (plan: Plan) => {
    try {
      setPurchasingPlanId(plan.id);
      const response = await subscriptionApi.purchasePlan({ planId: plan.id });
      if (response.paymentUrl) {
        window.open(response.paymentUrl, "_blank");
        toast.success("Đã mở trang thanh toán");
      }
    } catch (err) {
      console.error("Failed to purchase:", err);
      toast.error("Không thể khởi tạo thanh toán");
    } finally {
      setPurchasingPlanId(null);
    }
  };

  const isCurrentPlan = (plan: Plan) => {
    if (!mySubscription?.planName) return false;
    return plan.planName.toLowerCase() === mySubscription.planName.toLowerCase();
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="container mx-auto py-12 px-4"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground">Chọn gói dịch vụ</h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Loader2 className="h-10 w-10 text-primary" />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="container mx-auto py-12 px-4"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground">Chọn gói dịch vụ</h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={loadData} variant="outline">
              <Loader2 className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Chọn gói dịch vụ
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Nâng cấp để mở khóa đầy đủ tính năng cho doanh nghiệp của bạn
        </p>
      </motion.div>

      {mySubscription?.planName && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-teal-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-teal-950/20 border-blue-200 dark:border-blue-800/30">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gói dịch vụ hiện tại</p>
                    <p className="text-2xl font-bold text-foreground">{mySubscription.planName}</p>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-1">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                    Còn {mySubscription.daysRemaining} ngày
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Hết hạn: {formatDate(mySubscription.endDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Separator />

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible"
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
      >
        {plans.map((plan) => (
          <motion.div key={plan.id} variants={itemVariants}>
            <PlanCard 
              plan={plan} 
              isPopular={plan.isPopular} 
              isCurrentPlan={isCurrentPlan(plan)} 
              isLoading={purchasingPlanId === plan.id} 
              onPurchase={() => handlePurchase(plan)} 
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="p-8 bg-gradient-to-br from-white via-blue-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-teal-950/20 border-blue-100 dark:border-blue-900/30">
          <h3 className="font-semibold mb-6 text-center text-xl text-foreground">Tại sao chọn chúng tôi?</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: Check, text: "Thanh toán an toàn qua VNPay", color: "text-green-500" },
              { icon: Check, text: "Kích hoạt tài khoản ngay lập tức", color: "text-blue-500" },
              { icon: Check, text: "Hỗ trợ khách hàng 24/7", color: "text-purple-500" },
              { icon: Check, text: "Cập nhật tính năng miễn phí", color: "text-teal-500" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`p-2 rounded-full bg-muted ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function PlanCard({ plan, isPopular, isCurrentPlan, isLoading, onPurchase }: { plan: Plan; isPopular?: boolean; isCurrentPlan: boolean; isLoading: boolean; onPurchase: () => void }) {
  const features = parseFeatures(plan.features ?? null);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={`relative flex flex-col h-full transition-all duration-300 ${isPopular ? "border-primary shadow-lg" : "shadow-md hover:shadow-lg"} ${isCurrentPlan ? "bg-muted/50" : ""}`}>
        {isPopular && !isCurrentPlan && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
          >
            <Badge className="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md px-3 py-1 flex items-center gap-1">
              <Star className="h-3 w-3" />
              Phổ biến nhất
            </Badge>
          </motion.div>
        )}

        {isCurrentPlan && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 right-4 z-10"
          >
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md gap-1 px-3 py-1 flex items-center">
              <Check className="h-3 w-3" />
              Đang sử dụng
            </Badge>
          </motion.div>
        )}

        <CardHeader className="text-center pb-4 pt-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CardTitle className="text-2xl font-bold text-foreground">{plan.planName}</CardTitle>
          </motion.div>
          <CardDescription className="text-base">{plan.durationDays} ngày sử dụng</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 pt-0 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            <span className="text-4xl font-bold text-foreground">{formatPriceVnd(plan.price)}</span>
            <span className="text-muted-foreground ml-2">/tháng</span>
          </motion.div>

          {features.length > 0 && (
            <ul className="space-y-3">
              {features.map((feature, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex items-start gap-3 text-sm"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-5 w-5 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5"
                  >
                    <Check className="h-3 w-3 text-white" />
                  </motion.div>
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </CardContent>

        <CardFooter className="pt-4 px-6 pb-6">
          {isCurrentPlan ? (
            <motion.div whileTap={{ scale: 0.95 }} className="w-full">
              <Button 
                className="w-full h-12 text-base font-medium" 
                disabled 
                variant="outline"
              >
                <Check className="mr-2 h-4 w-4" />
                Bạn đang sở hữu gói này
              </Button>
            </motion.div>
          ) : (
            <motion.div whileTap={{ scale: 0.95 }} className="w-full">
              <Button
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 border-0"
                onClick={onPurchase}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Mua gói ngay
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
