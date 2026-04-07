import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import {
  Loader2,
  Check,
  CreditCard,
  AlertCircle,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { subscriptionApi } from "@/shared/lib/subscriptionApi";
import { planReviewsApi } from "@/shared/lib/planReviewsApi";
import { authApi, decodeTokenToUser } from "@/shared/lib/authApi";
import { useAuthStore } from "@/shared/store/authStore";
import { formatPriceVnd, type SePayPaymentData } from "@/shared/types/subscription";
import type { Plan, MySubscription, SubscriptionStatus } from "@/shared/types/subscription";
import type { PlanReviewSummary } from "@/shared/lib/planReviewsApi";
import { useStoreStore } from "@/shared/store/storeStore";
import StoreSelector from "@/features/dashboard/components/StoreSelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { WowDialogInner } from "@/shared/components/ui/wow-dialog-inner";
import { Textarea } from "@/shared/components/ui/textarea";
import toast from "react-hot-toast";
import type { TFunction } from "i18next";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const parseFeatures = (
  featuresJson: string | null | undefined | string[],
  t: TFunction<"subscription">,
): string[] => {
  if (!featuresJson) return [];
  if (Array.isArray(featuresJson)) return featuresJson;
  try {
    const parsed = JSON.parse(featuresJson) as Record<string, unknown>;
    const result: string[] = [];

    for (const [key, value] of Object.entries(parsed)) {
      if (key.startsWith("max_") && typeof value === "number") {
        const label = t(`features.capacityLabels.${key}` as never);
        if (value === -1) {
          result.push(t("features.capacity.unlimited", { label }));
        } else {
          result.push(t("features.capacity.max", { value, label }));
        }
        continue;
      }

      if (key.startsWith("has_") && typeof value === "boolean") {
        if (value) {
          result.push(t(`features.featureLabels.${key}` as never));
        }
        continue;
      }
    }

    return result;
  } catch {
    return [];
  }
};

export default function SubscriptionPlansPage() {
  const { t } = useTranslation("subscription");
  const { t: tCommon } = useTranslation("common");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [mySubscription, setMySubscription] = useState<MySubscription | null>(null);
  const [storeStatus, setStoreStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);
  const [reviewSummaries, setReviewSummaries] = useState<PlanReviewSummary[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedPlanForReview, setSelectedPlanForReview] = useState<Plan | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [sepayDialogOpen, setSepayDialogOpen] = useState(false);
  const [sepayData, setSepayData] = useState<SePayPaymentData | null>(null);
  const [refreshingAccess, setRefreshingAccess] = useState(false);
  const [lastPaymentId, setLastPaymentId] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
   const { currentStore } = useStoreStore();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [plansData, mySubData, summaries, statusData] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getMySubscription(),
        planReviewsApi.getSummaries(),
        currentStore?.id
          ? subscriptionApi.getStoreSubscriptionStatus(currentStore.id)
          : Promise.resolve<SubscriptionStatus | null>(null),
      ]);
      setPlans(plansData);
      setMySubscription(mySubData);
      setReviewSummaries(summaries);
      setStoreStatus(statusData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(t("toasts.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStore?.id]);

  const handleRefreshAccess = async () => {
    try {
      setRefreshingAccess(true);
      const refreshRes = await authApi.refreshAccess();
      if (!refreshRes.accessToken) {
        throw new Error(t("toasts.missingAccessToken"));
      }

      localStorage.setItem("token", refreshRes.accessToken);
      // Decode the new token to get updated role, store_id, etc.
      const newUser = decodeTokenToUser(refreshRes.accessToken);
      setAuth(newUser, refreshRes.accessToken);

      toast.success(t("toasts.refreshAccessSuccess"));
      setSepayDialogOpen(false);
      await loadData();
    } catch (err) {
      console.error("Failed to refresh access after payment:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("toasts.refreshAccessError");
      toast.error(message);
    } finally {
      setRefreshingAccess(false);
    }
  };

  const startPayment = async (plan: Plan, provider: "sepay" | "vnpay") => {
    try {
      setPurchasingPlanId(plan.id);
      const purchaseRes = await subscriptionApi.purchasePlan({ planId: plan.id });
      if (!purchaseRes.paymentId) {
        throw new Error(t("toasts.missingPaymentId"));
      }

      const payment = await subscriptionApi.initiatePayment(
        purchaseRes.paymentId,
        provider,
      );

      if (provider === "sepay") {
        setLastPaymentId(purchaseRes.paymentId);
        if (
          typeof payment === "object" &&
          "provider" in payment &&
          payment.provider === "sepay"
        ) {
          setSepayData(payment as SePayPaymentData);
          setSepayDialogOpen(true);
        } else {
          throw new Error(t("toasts.invalidSepayResponse"));
        }
      } else {
        if (
          typeof payment === "object" &&
          "paymentUrl" in payment &&
          payment.paymentUrl
        ) {
          window.open(payment.paymentUrl, "_blank");
          toast.success(t("toasts.openedVnpayDemo"));
        } else {
          throw new Error(t("toasts.invalidVnpayResponse"));
        }
      }
    } catch (err) {
      console.error("Failed to initiate payment:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("toasts.paymentInitError");
      toast.error(message);
    } finally {
      setPurchasingPlanId(null);
    }
  };

  const handleCheckPaymentStatus = async () => {
    if (!lastPaymentId) {
      toast.error(t("toasts.noPaymentId"));
      return;
    }
    try {
      setRefreshingAccess(true);
      const status = await subscriptionApi.getPaymentStatus(lastPaymentId);
      if (status.status === "Completed") {
        toast.success(t("toasts.paymentStatusCompleted"));
        await handleRefreshAccess();
      } else if (status.status === "Failed") {
        toast.error(t("toasts.paymentStatusFailed"));
      } else {
        toast(t("toasts.paymentStatusPending"));
      }
    } catch (err) {
      console.error("Failed to check payment status:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("toasts.paymentStatusCheckError");
      toast.error(message);
    } finally {
      setRefreshingAccess(false);
    }
  };

  const isCurrentPlan = (plan: Plan) => {
    const activePlanName =
      storeStatus?.planName || mySubscription?.planName || null;
    if (!activePlanName) return false;
    return plan.planName.toLowerCase() === activePlanName.toLowerCase();
  };

  const getSummaryForPlan = (plan: Plan) =>
    reviewSummaries.find((s) => s.planId === plan.id);

  const openReviewDialog = (plan: Plan) => {
    setSelectedPlanForReview(plan);
    setReviewRating(5);
    setReviewContent("");
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedPlanForReview) return;
    try {
      setSubmittingReview(true);
      await planReviewsApi.createReview({
        planId: selectedPlanForReview.id,
        rating: reviewRating,
        content: reviewContent.trim() || undefined,
      });
      toast.success(t("toasts.submitReviewSuccess"));
      setReviewDialogOpen(false);
      const summaries = await planReviewsApi.getSummaries();
      setReviewSummaries(summaries);
    } catch (err) {
      console.error("Failed to submit review:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("toasts.submitReviewError");
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
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
          <h1 className="text-3xl font-bold text-foreground">{t("page.loadingTitle")}</h1>
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
          <h1 className="text-3xl font-bold text-foreground">{t("page.errorTitle")}</h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={loadData} variant="outline">
              <Loader2 className="h-4 w-4 mr-2" />
              {tCommon("actions.retry")}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <StoreSelector pageDescription={t("page.storeSelectorDescription")} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {t("page.title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {currentStore ? (
            t("page.heroSubtitle", { storeName: currentStore.storeName })
          ) : (
            t("page.heroSubtitle", { storeName: t("page.heroSubtitleFallbackStore") })
          )}
        </p>
      </motion.div>

      {!storeStatus?.planName && storeStatus?.status === "Inactive" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-dashed border-amber-300 bg-amber-50/60 dark:bg-amber-900/10">
            <CardContent className="p-4 md:p-5">
              <p className="text-sm md:text-base text-amber-900 dark:text-amber-100">
                {t("page.inactiveNotice")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {(storeStatus?.planName || mySubscription?.planName) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-[#FF7B21]/5 via-[#19D6C8]/5 to-[#FF7B21]/5 dark:from-[#FF7B21]/10 dark:via-[#19D6C8]/10 dark:to-[#FF7B21]/10 border-[#FF7B21]/20 dark:border-[#FF7B21]/30 shadow-lg shadow-[#FF7B21]/5 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7B21] to-[#19D6C8]" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20"
                  >
                    <Check className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("page.currentPlanTitle", {
                        storeName: currentStore
                          ? currentStore.storeName
                          : t("page.currentPlanStoreFallback"),
                      })}
                    </p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
                      {storeStatus?.planName || mySubscription?.planName}
                    </p>
                    {storeStatus?.status && (
                      <p className="mt-1 text-xs font-medium">
                        <Badge
                          variant="outline"
                          className={
                            storeStatus.status === "Trial"
                              ? "border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300"
                              : storeStatus.status === "Active"
                              ? "border-[#FF7B21]/40 text-[#FF7B21] bg-[#FF7B21]/5 dark:bg-[#FF7B21]/10"
                              : "border-slate-300 text-slate-700 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-300"
                          }
                        >
                          {storeStatus.status === "Trial"
                            ? t("page.status.trial")
                            : storeStatus.status === "Active"
                            ? t("page.status.active")
                            : storeStatus.status}
                        </Badge>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-1">
                  {typeof storeStatus?.daysRemaining === "number" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    >
                      <Badge className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/20">
                        {t("page.daysRemaining", { days: storeStatus.daysRemaining })}
                      </Badge>
                    </motion.div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t("page.expiresLabel", {
                      date: formatDate(
                        storeStatus?.subscriptionEndDate ?? mySubscription?.endDate,
                      ),
                    })}
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
        className="grid gap-6 sm:gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 max-w-6xl mx-auto items-stretch"
      >
        {plans.map((plan) => (
          <motion.div key={plan.id} variants={itemVariants}>
            <PlanCard
              plan={plan}
              isPopular={plan.isPopular}
              isCurrentPlan={isCurrentPlan(plan)}
              isLoading={purchasingPlanId === plan.id}
              onPaySepay={() => startPayment(plan, "sepay")}
              reviewSummary={getSummaryForPlan(plan)}
              onOpenReview={() => openReviewDialog(plan)}
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
        <Card className="p-8 bg-gradient-to-br from-white via-[#FF7B21]/5 to-[#19D6C8]/5 dark:from-gray-900 dark:via-[#FF7B21]/10 dark:to-[#19D6C8]/10 border border-border/60 dark:border-border/50 shadow-xl shadow-[#FF7B21]/5 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF7B21]/10 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7B21] to-[#19D6C8]" />
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-semibold mb-6 text-center text-xl bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent"
          >
            {t("page.whyUsTitle")}
          </motion.h3>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: Check, text: t("page.whyUs.securePayment"), color: "text-green-500" },
              { icon: Check, text: t("page.whyUs.instantActivation"), color: "text-blue-500" },
              { icon: Check, text: t("page.whyUs.support"), color: "text-purple-500" },
              { icon: Check, text: t("page.whyUs.updates"), color: "text-teal-500" },
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

      <Dialog open={sepayDialogOpen} onOpenChange={setSepayDialogOpen}>
        <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0">
          <WowDialogInner>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center shadow-md shadow-[#FF7B21]/20">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                {t("sepayDialog.title")}
              </DialogTitle>
              <DialogDescription>
                {t("sepayDialog.description")}
              </DialogDescription>
            </DialogHeader>
          {sepayData ? (
            <div className="space-y-4">
              <div className="w-full flex justify-center">
                <img
                  src={sepayData.qrCodeUrl}
                  alt={t("sepayDialog.qrAlt")}
                  className="w-56 h-56 rounded-lg border bg-white object-contain"
                />
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-foreground">
                  {t("sepayDialog.paymentCode")}{" "}
                  <span className="font-mono">{sepayData.paymentCode}</span>
                </p>
                <div className="rounded-md border bg-muted/40 p-3 space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t("sepayDialog.bankInfoTitle")}
                  </p>
                  <p>
                    {t("sepayDialog.bankName")}{" "}
                    <span className="font-medium">
                      {sepayData.bankInfo.bankName}
                    </span>
                  </p>
                  <p>
                    {t("sepayDialog.accountNumber")}{" "}
                    <span className="font-medium">
                      {sepayData.bankInfo.accountNumber}
                    </span>
                  </p>
                  <p>
                    {t("sepayDialog.accountName")}{" "}
                    <span className="font-medium">
                      {sepayData.bankInfo.accountName}
                    </span>
                  </p>
                  <p>
                    {t("sepayDialog.amount")}{" "}
                    <span className="font-medium">
                      {formatPriceVnd(sepayData.bankInfo.amount)}
                    </span>
                  </p>
                  <p>
                    {t("sepayDialog.content")}{" "}
                    <span className="font-medium">
                      {sepayData.bankInfo.content}
                    </span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-line">
                  {sepayData.instruction}
                </p>
                <div className="flex justify-end gap-2 pt-2 flex-wrap">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setSepayDialogOpen(false)}
                    disabled={refreshingAccess}
                  >
                    {t("sepayDialog.close")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCheckPaymentStatus}
                    disabled={refreshingAccess}
                    className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF7B21]/90 hover:to-[#19D6C8]/90 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 border-0 transition-all duration-300"
                  >
                    {refreshingAccess ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("sepayDialog.checkingStatus")}
                      </>
                    ) : (
                      t("sepayDialog.checkStatus")
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-[#FF7B21]" />
            </div>
          )}
          </WowDialogInner>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg overflow-hidden p-0 gap-0">
          <WowDialogInner>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center shadow-md shadow-[#FF7B21]/20">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  {t("reviewDialog.title", { planName: selectedPlanForReview?.planName || "" })}
                </DialogTitle>
                <DialogDescription>
                  {t("reviewDialog.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {t("reviewDialog.ratingLabel")}
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const active = reviewRating === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReviewRating(value)}
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                            active
                              ? "border-amber-400 bg-amber-50 text-amber-500"
                              : "border-border bg-background text-muted-foreground hover:border-amber-300 hover:text-amber-400"
                          }`}
                          aria-label={t("reviewDialog.ratingAria", { value })}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              active ? "fill-amber-400" : "fill-none"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {t("reviewDialog.contentLabel")}
                  </p>
                  <Textarea
                    rows={4}
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder={t("reviewDialog.contentPlaceholder")}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                  disabled={submittingReview}
                >
                  {t("reviewDialog.cancel")}
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF7B21]/90 hover:to-[#19D6C8]/90 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 border-0 transition-all duration-300"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("reviewDialog.submitting")}
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      {t("reviewDialog.submit")}
                    </>
                  )}
                </Button>
              </div>
          </WowDialogInner>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanCard({
  plan,
  isPopular,
  isCurrentPlan,
  isLoading,
  onPaySepay,
  reviewSummary,
  onOpenReview,
}: {
  plan: Plan;
  isPopular?: boolean;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onPaySepay: () => void;
  reviewSummary?: PlanReviewSummary;
  onOpenReview: () => void;
}) {
  const { t } = useTranslation("subscription");
  const features = parseFeatures(plan.features ?? null, t);
  const { currentStore } = useStoreStore();

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full flex flex-col"
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
              {t("planCard.mostPopular")}
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
              {t("planCard.currentPlanBadge")}
            </Badge>
          </motion.div>
        )}

        <CardHeader className="text-center pb-4 pt-6 shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CardTitle className="text-2xl font-bold text-foreground">{plan.planName}</CardTitle>
          </motion.div>
          <CardDescription className="text-base">
            {t("planCard.durationDays", { days: plan.durationDays })}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 pt-0 px-6 min-h-0 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-4"
          >
            <span className="text-4xl font-bold text-foreground">{formatPriceVnd(plan.price)}</span>
            <span className="text-muted-foreground ml-2">{t("planCard.pricePerMonth")}</span>
          </motion.div>

          <div className="mb-4 flex items-center justify-center gap-2 text-sm">
            {reviewSummary ? (
              <>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold">
                    {reviewSummary.avgRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {t("planCard.reviewsSummary", { count: reviewSummary.totalReviews })}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                {t("planCard.noReviews")}
              </span>
            )}
          </div>

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
                    className="h-5 w-5 rounded-full bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-[#FF7B21]/20"
                  >
                    <Check className="h-3 w-3 text-white" />
                  </motion.div>
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </CardContent>

        <CardFooter className="pt-4 px-6 pb-6 shrink-0 mt-auto">
          {isCurrentPlan ? (
            <motion.div whileTap={{ scale: 0.95 }} className="w-full">
              <div className="space-y-2">
              <Button
                  className="w-full h-12 text-base font-medium"
                  disabled
                  variant="outline"
                >
                  <Check className="mr-2 h-4 w-4" />
                  {t("planCard.owningPlan")}
                </Button>
              <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-8 text-xs font-medium text-teal-600 hover:text-teal-700"
                  onClick={onOpenReview}
                >
                  {t("planCard.writeReview")}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div whileTap={{ scale: 0.95 }} className="w-full">
              <Button
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 border-0"
                onClick={onPaySepay}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("planCard.processing")}
                  </>
                ) : currentStore ? (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t("planCard.buyForStore", { storeName: currentStore.storeName })}
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t("planCard.payWithSepay")}
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
