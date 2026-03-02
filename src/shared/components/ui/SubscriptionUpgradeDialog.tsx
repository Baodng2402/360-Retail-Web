import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useFeatureGateStore } from "@/shared/store/featureGateStore";

export function SubscriptionUpgradeDialog() {
  const navigate = useNavigate();
  const {
    isOpen,
    errorType,
    message,
    currentPlan,
    requiredPlan,
    feature,
    closeUpgradeModal,
  } = useFeatureGateStore();

  const handleClose = useCallback(() => {
    closeUpgradeModal();
  }, [closeUpgradeModal]);

  const handleUpgrade = useCallback(() => {
    closeUpgradeModal();
    navigate("/dashboard/subscription");
  }, [closeUpgradeModal, navigate]);

  if (!isOpen) {
    return null;
  }

  const title =
    errorType === "TrialExpired"
      ? "Thời gian dùng thử đã hết"
      : errorType === "SubscriptionExpired"
        ? "Gói dịch vụ đã hết hạn"
        : "Tính năng không khả dụng trong gói hiện tại";

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertCircle className="h-5 w-5" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="mt-2 space-y-2">
            <p>{message}</p>
            {errorType === "FeatureNotAvailable" && requiredPlan && (
              <p className="text-sm text-muted-foreground">
                {currentPlan && (
                  <>
                    Gói hiện tại của bạn:{" "}
                    <span className="font-semibold">{currentPlan}</span>.{" "}
                  </>
                )}
                Để sử dụng
                {feature ? (
                  <>
                    {" "}
                    tính năng <span className="font-semibold">{feature}</span>
                  </>
                ) : (
                  " tính năng này"
                )}
                , vui lòng nâng cấp lên gói{" "}
                <span className="font-semibold">{requiredPlan}</span> hoặc cao
                hơn.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Để sau
          </Button>
          <Button
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
          >
            Nâng cấp gói ngay
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

