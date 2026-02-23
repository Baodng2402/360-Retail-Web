import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Store,
  CheckCircle2,
  Loader2,
  Gift,
  Calendar,
} from "lucide-react";
import { authApi } from "@/shared/lib/authApi";
import { UserStatus } from "@/shared/types/jwt-claims";
import toast from "react-hot-toast";

interface StartTrialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
}

export function StartTrialDialog({ open, onOpenChange, userEmail }: StartTrialDialogProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    if (open && userEmail) {
      // Set default store name based on email
      setStoreName(`Cửa hàng của ${userEmail.split("@")[0]}`);
    }
  }, [open, userEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Step 1: Start trial - create store
      await authApi.createStoreTrial({
        storeName: storeName.trim() || `Cửa hàng của ${userEmail}`,
      });

      toast.success("Tạo cửa hàng dùng thử thành công!");

      // Step 2: Refresh token to get store_id in claims
      const refreshRes = await authApi.refreshAccess();
      if (refreshRes.accessToken) {
        localStorage.setItem("token", refreshRes.accessToken);
      }

      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to start trial:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Không thể tạo cửa hàng dùng thử";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    // Redirect to subscription page where they can see plans
    navigate("/dashboard/subscription");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      {/* Dialog */}
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-in fade-in-0 zoom-in-95">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-500 shadow-lg">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Bắt đầu dùng thử miễn phí 7 ngày</CardTitle>
            <CardDescription className="text-base">
              Tạo cửa hàng của bạn để bắt đầu sử dụng 360 Retail
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Benefits */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span>7 ngày dùng thử miễn phí - Không cần thẻ tín dụng</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Store className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Tạo cửa hàng và quản lý sản phẩm ngay lập tức</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span>Truy cập tất cả tính năng cao cấp</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Tên cửa hàng</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="storeName"
                    placeholder="Nhập tên cửa hàng"
                    className="pl-10 h-11"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Nếu để trống, hệ thống sẽ tự động tạo tên: "Cửa hàng của {userEmail?.split("@")[0]}"
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Để sau
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-4 w-4" />
                      Bắt đầu dùng thử
                    </>
                  )}
                </Button>
              </div>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Sau 7 ngày, bạn có thể nâng cấp lên gói trả phí để tiếp tục sử dụng
            </p>
          </CardContent>
        </Card>

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Hook to check if user needs to start trial
 * Returns: { needsTrial, loading, checkStatus }
 */
export function useNeedsTrial() {
  const [needsTrial, setNeedsTrial] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setNeedsTrial(false);
        return false;
      }

      // Decode token to check status
      const userInfo = await authApi.meWithSubscription();
      
      // User needs trial if:
      // 1. Status is "Registered" (new user who hasn't started trial)
      // 2. No storeId
      const needs = userInfo.status === UserStatus.Registered || !userInfo.storeId;
      setNeedsTrial(needs);
      return needs;
    } catch {
      setNeedsTrial(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return { needsTrial, loading, checkStatus };
}

